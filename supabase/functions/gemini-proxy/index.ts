/**
 * Gemini API Proxy - multi-key rotation
 *
 * Klientas niekada tiesiogiai nekvieciasi Google Gemini API.
 * Sio Edge Function tikslas:
 *  1. Slepti GEMINI_API_KEY serverio puseje (ne kliente)
 *  2. Tikrinti auth.uid() - tik autentifikuoti vartotojai
 *  3. Keliu API key'u rotation + fallback kai 429/503
 *
 * Env variables:
 *   GEMINI_API_KEY     - pagrindinis raktas (privalomas)
 *   GEMINI_API_KEY_1..10 - papildomi raktai (neprivalomi, kiek nori)
 *
 * Klientas kvieciasi:
 *   POST /functions/v1/gemini-proxy
 *   Authorization: Bearer <supabase-access-token>
 *   Body: { model: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.5-flash-lite', payload: {...} }
 *
 * Grazina: Gemini API response as-is (JSON)
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const API_KEYS: string[] = [
  Deno.env.get('GEMINI_API_KEY'),
  ...Array.from({ length: 15 }, (_, i) => Deno.env.get(`GEMINI_API_KEY_${i + 1}`)),
].filter((k): k is string => !!k?.trim()).map(k => k.trim());

let roundRobinIndex = 0;

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3-flash',
]);

const RETRYABLE_STATUSES = new Set([429, 503]);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProxyRequest {
  model: string;
  payload: Record<string, unknown>;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function verifyUser(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: SUPABASE_ANON_KEY,
      },
    });
    if (!res.ok) return null;
    const user = await res.json() as { id?: string };
    return user.id ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (API_KEYS.length === 0) {
    return jsonResponse({ error: 'Server misconfigured: no GEMINI_API_KEY found' }, 500);
  }

  const userId = await verifyUser(req.headers.get('authorization'));
  if (!userId) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: ProxyRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.model || !ALLOWED_MODELS.has(body.model)) {
    return jsonResponse({ error: `Model not allowed: ${body.model}` }, 400);
  }

  if (!body.payload || typeof body.payload !== 'object') {
    return jsonResponse({ error: 'payload required' }, 400);
  }

  const payloadJson = JSON.stringify(body.payload);

  // Round-robin pradinis key + bandyti VISUS turimus raktus.
  // Skirtingi Gemini API raktai priklauso skirtingoms Google paskyroms su
  // nepriklausomomis kvotomis - todel jei vienas key'as 429, kiti gali veikti.
  // Anksciau buvo Math.min(API_KEYS.length, 3) - bandydavom tik 3 is 16,
  // todel naudotojas matydavo „kvota virsyta" kai realiai dar 13 key'u veike.
  const startIdx = roundRobinIndex % API_KEYS.length;
  roundRobinIndex++;
  const maxAttempts = API_KEYS.length;

  let lastStatus = 500;
  let lastBody = '';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const keyIdx = (startIdx + attempt) % API_KEYS.length;
    const key = API_KEYS[keyIdx];
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${body.model}:generateContent?key=${key}`;

    try {
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadJson,
      });

      lastStatus = geminiRes.status;
      lastBody = await geminiRes.text();

      if (!RETRYABLE_STATUSES.has(geminiRes.status)) {
        return new Response(lastBody, {
          status: geminiRes.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      // 429/503 - bandyti kita key'a
      console.warn(`Key #${keyIdx + 1} got ${geminiRes.status}, trying next...`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      console.error(`Key #${keyIdx + 1} fetch failed: ${msg}`);
      lastBody = JSON.stringify({ error: `Gemini fetch failed: ${msg}` });
      lastStatus = 502;
    }
  }

  // Visi key'ai issemti - grazinam paskutini atsakyma
  return new Response(lastBody, {
    status: lastStatus,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
});
