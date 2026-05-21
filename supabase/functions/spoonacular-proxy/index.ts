/**
 * Spoonacular API Proxy
 *
 * Klientas niekada tiesiogiai nekvieciasi Spoonacular API.
 *
 * Klientas kvieciasi:
 *   POST /functions/v1/spoonacular-proxy
 *   Authorization: Bearer <supabase-access-token>
 *   Body: {
 *     path: '/recipes/complexSearch' | '/recipes/findByIngredients' | '/recipes/informationBulk' | '/recipes/{id}/information',
 *     params?: Record<string, string | number>,
 *     method?: 'GET' | 'POST'
 *   }
 *
 * Grazina: Spoonacular response as-is
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SPOONACULAR_API_KEY = Deno.env.get('SPOONACULAR_API_KEY')?.trim() ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SPOONACULAR_BASE = 'https://api.spoonacular.com';

// Whitelist - tik sie path'ai leidziami, kad neleistume abuse
const ALLOWED_PATH_PATTERNS: RegExp[] = [
  /^\/recipes\/complexSearch$/,
  /^\/recipes\/findByIngredients$/,
  /^\/recipes\/informationBulk$/,
  /^\/recipes\/\d+\/information$/,
  /^\/recipes\/\d+\/analyzedInstructions$/,
  /^\/food\/ingredients\/search$/,
  /^\/food\/ingredients\/\d+\/information$/,
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProxyRequest {
  path: string;
  params?: Record<string, string | number | boolean>;
  method?: 'GET' | 'POST';
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

function isPathAllowed(path: string): boolean {
  return ALLOWED_PATH_PATTERNS.some((re) => re.test(path));
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!SPOONACULAR_API_KEY) {
    return jsonResponse({ error: 'Server misconfigured: SPOONACULAR_API_KEY missing' }, 500);
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

  if (!body.path || !isPathAllowed(body.path)) {
    return jsonResponse({ error: `Path not allowed: ${body.path}` }, 400);
  }

  const method = body.method ?? 'GET';
  const url = new URL(`${SPOONACULAR_BASE}${body.path}`);
  url.searchParams.set('apiKey', SPOONACULAR_API_KEY);
  if (body.params) {
    for (const [k, v] of Object.entries(body.params)) {
      url.searchParams.set(k, String(v));
    }
  }

  try {
    const res = await fetch(url.toString(), { method });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ error: `Spoonacular fetch failed: ${msg}` }, 502);
  }
});
