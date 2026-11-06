// Security Gate: secret -> origin -> rate limit -> JSON parse -> honeypot.
// Output: { _respond: true, status, body } to answer early, or
//         { _respond: false, body: <parsed>, client: { ipHash } } to continue.
const item = $input.first();
const headers = item.json.headers || {};
const respond = (status, body) => [{ json: { _respond: true, status, body } }];

function safeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
function fnv1a(s) { // non-reversible key so raw IPs are never stored
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16);
}
function uuid() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// 1. Shared secret header
const expected = $vars.SOLARFI_FORM_KEY;
if (!expected) throw new Error('n8n variable SOLARFI_FORM_KEY is not set');
const given = headers['x-solarfi-key'];
if (!given || !safeEqual(given, expected)) return respond(401, { ok: false, error: 'unauthorized' });

// 2. Origin allowlist (browser requests always send Origin)
const allowed = String($vars.SOLARFI_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const origin = headers.origin || '';
if (!allowed.includes(origin)) return respond(403, { ok: false, error: 'origin_not_allowed' });

// 3. Rate limit per IP per rolling hour (workflow static data; production runs only)
const ip = String(headers['cf-connecting-ip'] || headers['x-real-ip'] || String(headers['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
const limit = Number($vars.SOLARFI_RATE_LIMIT_PER_HOUR || 5);
const HOUR = 3600 * 1000;
const now = Date.now();
const store = $getWorkflowStaticData('global');
store.rl = store.rl || {};
for (const k of Object.keys(store.rl)) {
  store.rl[k] = store.rl[k].filter(t => now - t < HOUR);
  if (!store.rl[k].length) delete store.rl[k];
}
const ipHash = fnv1a(ip);
const hits = store.rl[ipHash] || [];
if (hits.length >= limit) {
  return respond(429, { ok: false, error: 'rate_limited', message: 'You’ve sent several requests in the last hour. Please wait a little and try again, or call us on +91 73582 58385.' });
}
hits.push(now);
store.rl[ipHash] = hits;

// 4. Parse JSON (webhook is set to keep the raw body)
let body = item.json.body;
if (!body || typeof body !== 'object' || Array.isArray(body) || !Object.keys(body).length) {
  let raw = '';
  try {
    if (item.binary && item.binary.data) raw = (await this.helpers.getBinaryDataBuffer(0, 'data')).toString('utf8');
    else if (typeof item.json.body === 'string') raw = item.json.body;
  } catch (e) { raw = ''; }
  try { body = JSON.parse(raw); } catch (e) { return respond(400, { ok: false, error: 'malformed_json' }); }
}
if (!body || typeof body !== 'object' || Array.isArray(body)) return respond(400, { ok: false, error: 'malformed_json' });

// 5. Honeypot: pretend success, write nothing
if (body.honeypot !== undefined && body.honeypot !== null && String(body.honeypot).trim() !== '') {
  return respond(200, { ok: true, lead_id: uuid() });
}

return [{ json: { _respond: false, body, client: { ipHash } } }];
