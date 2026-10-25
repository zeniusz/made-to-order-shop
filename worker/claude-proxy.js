/* Cloudflare Worker that lets the stylist use Claude without any visitor ever seeing a key.
   The key lives only here, as a secret named ANTHROPIC_API_KEY.

   Deploy (about 5 minutes):
     1. npm create cloudflare@latest custom-made-stylist  (choose "Hello World" Worker), then replace src/index.js with this file
     2. npx wrangler secret put ANTHROPIC_API_KEY          (paste your key when asked)
     3. npx wrangler deploy
     4. Put the worker address in js/config.js as CM_AI_ENDPOINT
   Set ALLOWED_ORIGINS below to your site address so other sites cannot spend your credit.
   Add a Cloudflare rate-limiting rule on this route before sharing the site widely. This file is untested against a live key. */

const ALLOWED_ORIGINS = ['https://zeniusz.github.io', 'http://localhost:8770'];
const MODEL = 'claude-haiku-5-5';

const SYSTEM = 'You are a calm, concise stylist helping a customer configure a made-to-measure suit. ' +
  'Reply with ONLY a JSON object with two keys. "reply": one to three short plain sentences to the customer, no markdown. ' +
  '"brief": an object with keys "occasion" (one of "int","off","wed","eve","trv" or null), "season" ("summer","winter" or null), ' +
  '"colour_hex" (#rrggbb suit cloth colour or null), "colour_name" (short name or null), "height_cm", "weight_kg", "usual_size" (EU 44-58), ' +
  '"fit" ("Slim","Regular","Relaxed" or null), "budget_eur", "keywords" (array from "flannel","herring","check","stripe","tropical","cashmere","wrinkle"). ' +
  'Use null for anything the customer did not say. Never invent measurements. If the customer only asks a question, answer it in "reply" and leave "brief" values null. ' +
  'Facts you may use: delivery about 2 to 3 weeks; free delivery or store pick-up; in-store alterations take 30 minutes to 3 days; returns within 30 days if unworn and unaltered.';

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return { 'access-control-allow-origin': allowed, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'vary': 'origin' };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== 'POST' || !ALLOWED_ORIGINS.includes(origin)) return new Response('Not allowed', { status: 403, headers: cors(origin) });

    let body;
    try { body = await request.json(); } catch (e) { return new Response('Bad request', { status: 400, headers: cors(origin) }); }
    const message = String(body.message || '').slice(0, 400);
    if (!message) return new Response('Empty', { status: 400, headers: cors(origin) });

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: 400, system: SYSTEM,
        messages: [{ role: 'user', content: 'Current choices: ' + JSON.stringify(body.context || {}).slice(0, 600) + '\nCustomer: ' + message }]
      })
    });
    if (!res.ok) return new Response('Upstream error', { status: 502, headers: cors(origin) });
    const data = await res.json();
    const raw = (data.content && data.content[0] && data.content[0].text) || '';
    let out;
    try { out = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)); } catch (e) { out = { reply: raw.slice(0, 300), brief: {} }; }
    return new Response(JSON.stringify({ reply: out.reply || '', brief: out.brief || {} }), { headers: { ...cors(origin), 'content-type': 'application/json' } });
  }
};
