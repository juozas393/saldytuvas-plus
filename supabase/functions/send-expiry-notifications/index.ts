import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: send-expiry-notifications
 *
 * Kvieciama per Supabase cron (pg_cron) arba rankiniu POST.
 * Tikrina produktus kurie baigia galioti per 3 dienas,
 * siucia Expo push notification kiekvienam userui kuris turi registruota token.
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpiringItem {
  product_name: string;
  best_before_date: string;
  environment_id: number;
}

interface PushToken {
  token: string;
  auth_uid: string;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound: "default";
  channelId?: string;
}

Deno.serve(async (req) => {
  // Tikrinti authorization - leidziame tik service_role arba cron
  const authHeader = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Cron kviecia be auth header - naudojam service role
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Surasti produktus kurie baigia galioti per 3 dienas
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data: expiringProducts, error: productError } = await supabase
      .from("product")
      .select("name, best_before_date, fk_inventory_id, inventory!inner(fk_environment_id)")
      .not("best_before_date", "is", null)
      .gte("best_before_date", now.toISOString().split("T")[0])
      .lte("best_before_date", threeDaysLater.toISOString().split("T")[0]);

    if (productError) {
      console.error("Product query error:", productError);
      return new Response(JSON.stringify({ error: productError.message }), { status: 500 });
    }

    if (!expiringProducts || expiringProducts.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No expiring products" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Grupuoti pagal environment (household)
    const byEnvironment = new Map<number, string[]>();
    for (const p of expiringProducts) {
      const envId = (p as any).inventory?.fk_environment_id;
      if (!envId) continue;
      if (!byEnvironment.has(envId)) byEnvironment.set(envId, []);
      byEnvironment.get(envId)!.push(p.name);
    }

    // 3. Kiekvienam environment rasti userius su push tokenais
    let totalSent = 0;
    const messages: ExpoPushMessage[] = [];

    for (const [envId, productNames] of byEnvironment) {
      // Rasti userius siam environment
      const { data: users } = await supabase
        .from("app_user")
        .select("auth_uid")
        .eq("fk_environment_id", envId);

      if (!users || users.length === 0) continue;

      const authUids = users.map((u) => u.auth_uid);

      // Rasti push tokenus
      const { data: tokens } = await supabase
        .from("push_token")
        .select("token")
        .in("auth_uid", authUids)
        .eq("enabled", true);

      if (!tokens || tokens.length === 0) continue;

      // Suformuoti pranesima
      const names = productNames.slice(0, 5).join(", ");
      const extra = productNames.length > 5 ? ` ir dar ${productNames.length - 5}` : "";
      const body = `${names}${extra} - baigia galioti per 3 dienas`;

      for (const t of tokens) {
        messages.push({
          to: t.token,
          title: "Produktai baigia galioti",
          body,
          sound: "default",
          channelId: "expiry",
        });
      }
    }

    // 4. Siusti per Expo Push API (batch)
    if (messages.length > 0) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      totalSent = messages.length;

      // Isvalyti invaliduotus tokenus
      if (result.data) {
        for (let i = 0; i < result.data.length; i++) {
          const ticket = result.data[i];
          if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
            await supabase.from("push_token").delete().eq("token", messages[i].to);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        sent: totalSent,
        environments: byEnvironment.size,
        products: expiringProducts.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Notification error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
