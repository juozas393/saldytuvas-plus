import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: send-suggestion-notification (PAA11)
 *
 * Po administratoriaus patvirtinimo/atmetimo nario pasiūlymo, siunčia push
 * pranešimą nariui per Expo Push API. Nariui rodoma jo pasiūlymo būsena.
 *
 * Body: { suggestion_id: number, decision: 'approved' | 'rejected' }
 *
 * Reikalavimai:
 *  - Kviečiantis admin turi būti to paties household nario kaip pasiūlymą
 *    pateikęs narys (cross-household apsauga).
 *  - Narys turi turėti registruotą push_token (jei ne - tyliai praleidžiam,
 *    nes pasiūlymo statuso atnaujinimas vis tiek vyksta).
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  suggestion_id: number;
  decision: "approved" | "rejected";
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound: "default";
  channelId?: string;
  data?: Record<string, unknown>;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // 1. Patikrinti autentifikaciją - kviečiantis admin turi būti autentifikuotas
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { Authorization: authHeader, apikey: anonKey },
    });
    if (!verifyRes.ok) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }
    const adminUser = await verifyRes.json() as { id?: string };
    if (!adminUser.id) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // 2. Parse body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    if (!body.suggestion_id || !body.decision) {
      return jsonResponse({ error: "suggestion_id ir decision privalomi" }, 400);
    }
    if (body.decision !== "approved" && body.decision !== "rejected") {
      return jsonResponse({ error: "decision turi būti 'approved' arba 'rejected'" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. Surasti pasiūlymą ir nario auth_uid
    const { data: suggestion, error: sErr } = await supabase
      .from("product_suggestion")
      .select("id, user_id, product_name")
      .eq("id", body.suggestion_id)
      .maybeSingle();

    if (sErr || !suggestion) {
      return jsonResponse({ error: "Pasiūlymas nerastas" }, 404);
    }

    // 4. Cross-household apsauga - patikrinti, ar admin ir narys yra to paties household
    const { data: adminRow } = await supabase
      .from("app_user")
      .select("fk_environment_id")
      .eq("auth_uid", adminUser.id)
      .maybeSingle();
    const { data: memberRow } = await supabase
      .from("app_user")
      .select("fk_environment_id, username")
      .eq("auth_uid", suggestion.user_id)
      .maybeSingle();

    if (!adminRow?.fk_environment_id || !memberRow?.fk_environment_id ||
        adminRow.fk_environment_id !== memberRow.fk_environment_id) {
      return jsonResponse({ error: "Cross-household veiksmas blokuotas" }, 403);
    }

    // 5. Surasti nario push tokenus (jis gali turėti kelis - telefonas + tabletas)
    const { data: tokens, error: tErr } = await supabase
      .from("push_token")
      .select("token")
      .eq("auth_uid", suggestion.user_id)
      .eq("enabled", true);

    if (tErr) {
      console.error("Failed to fetch push tokens:", tErr);
      return jsonResponse({ error: "Tokens fetch error" }, 500);
    }

    if (!tokens || tokens.length === 0) {
      // Narys nesutiko gauti pranešimų arba neturi įdiegtos programėlės -
      // tai NĖRA klaida, tiesiog praleidžiame. Statusas DB pakeistas.
      return jsonResponse({ sent: 0, skipped: "no_tokens" });
    }

    // 6. Sukurti pranešimo turinį
    const isApproved = body.decision === "approved";
    const title = isApproved ? "Pasiūlymas patvirtintas" : "Pasiūlymas atmestas";
    const message = isApproved
      ? `Jūsų pasiūlytas produktas „${suggestion.product_name}" pridėtas į pirkinių sąrašą.`
      : `Jūsų pasiūlytas produktas „${suggestion.product_name}" buvo atmestas.`;

    // 7. Siųsti per Expo Push API (batch)
    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.token,
      title,
      body: message,
      sound: "default",
      channelId: "suggestions",
      data: {
        type: "suggestion_decision",
        suggestion_id: suggestion.id,
        decision: body.decision,
      },
    }));

    const expoRes = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!expoRes.ok) {
      const errText = await expoRes.text();
      console.error("Expo push failed:", errText);
      return jsonResponse({ error: "Push API klaida", details: errText }, 502);
    }

    return jsonResponse({ sent: messages.length, member: memberRow.username });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("send-suggestion-notification error:", msg);
    return jsonResponse({ error: msg }, 500);
  }
});
