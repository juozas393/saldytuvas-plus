import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function cleanKey(v: string | undefined): string {
  if (!v) return '';
  return v.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

const GROQ_API_KEY = cleanKey(Deno.env.get('GROQ_API_KEY'));
const MODEL = cleanKey(Deno.env.get('GROQ_MODEL')) || 'llama-3.3-70b-versatile';

Deno.serve(async () => {
  const result: any = { model: MODEL };

  // Test 1: simple call
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Say ok' }],
        max_tokens: 10,
      }),
    });
    result.test1_simple = { status: r.status, body: (await r.text()).slice(0, 300) };
  } catch (e) {
    result.test1_simple = { error: String(e) };
  }

  // Test 2: with response_format json_object
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Return JSON: {\"ok\":true}' }],
        max_tokens: 100,
        response_format: { type: 'json_object' },
      }),
    });
    result.test2_json = { status: r.status, body: (await r.text()).slice(0, 400) };
  } catch (e) {
    result.test2_json = { error: String(e) };
  }

  // Test 3: with max_tokens 8000 (same as real function)
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'Return ONLY JSON with slots array' },
          { role: 'user', content: 'Return {\"slots\":[{\"name\":\"test\"}]}' },
        ],
        temperature: 0.65,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      }),
    });
    result.test3_full_params = { status: r.status, body: (await r.text()).slice(0, 500) };
  } catch (e) {
    result.test3_full_params = { error: String(e) };
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});
