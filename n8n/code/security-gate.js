// Security Gate: secret -> origin -> rate limit -> JSON parse -> honeypot.
// Output: { _respond: true, status, body } to answer early, or
//         { _respond: false, body: <parsed>, client: { ipHash } } to continue.
const item = $input.first();
const cfg = $('Intake Config').first().json;
const headers = item.json.headers || {};
const respond = (status, body) => [{ json: { _respond: true, status, body } }];

function safeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
// Pure-JS SHA-256 (hex): the workflow stores only the hash of the form key.
function sha256(ascii) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a));
  const K = [], H = [];
  let n = 2, c = 0;
  const isPrime = (x) => { for (let f = 2; f * f <= x; f++) if (x % f === 0) return false; return true; };
  while (c < 64) { if (isPrime(n)) { if (c < 8) H[c] = (Math.pow(n, 1 / 2) * 4294967296) | 0; K[c++] = (Math.pow(n, 1 / 3) * 4294967296) | 0; } n++; }
  const bytes = [];
  const str = unescape(encodeURIComponent(ascii));
  for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
  for (let j = 0; j < bytes.length; j += 64) {
    const w = [];
    for (let i = 0; i < 16; i++) w[i] = (bytes[j + i * 4] << 24) | (bytes[j + i * 4 + 1] << 16) | (bytes[j + i * 4 + 2] << 8) | bytes[j + i * 4 + 3];
    let [a, b, cc, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & cc) ^ (b & cc))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = cc; cc = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + cc) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map((x) => ('00000000' + (x >>> 0).toString(16)).slice(-8)).join('');
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

// 1. Shared key header (compared by SHA-256, so the key itself is not stored in n8n)
const expectedHash = String(cfg.FORM_KEY_SHA256 || '').toLowerCase();
if (!/^[0-9a-f]{64}$/.test(expectedHash)) throw new Error('Intake Config FORM_KEY_SHA256 is not set');
const given = headers['x-solarfi-key'];
if (!given || String(given).length > 200 || !safeEqual(sha256(String(given)), expectedHash)) return respond(401, { ok: false, error: 'unauthorized' });

// 2. Origin allowlist (browser requests always send Origin)
const allowed = String(cfg.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const origin = headers.origin || '';
if (!allowed.includes(origin)) return respond(403, { ok: false, error: 'origin_not_allowed' });

// 3. Rate limit per IP per rolling hour (workflow static data; production runs only)
const ip = String(headers['cf-connecting-ip'] || headers['x-real-ip'] || String(headers['x-forwarded-for'] || '').split(',')[0] || 'unknown').trim();
const limit = Number(cfg.RATE_LIMIT_PER_HOUR || 5);
const HOUR = 3600 * 1000;
const now = Date.now();
const store = $getWorkflowStaticData('global');
store.rl = store.rl || {};
for (const k of Object.keys(store.rl)) {
  store.rl[k] = store.rl[k].filter(t => now - t < HOUR);
  if (!store.rl[k].length) delete store.rl[k];
}
// RATE_LIMIT_EPOCH is part of the key: changing it in Intake Config starts
// every IP from zero (old entries no longer match and are pruned within an hour).
const ipHash = fnv1a(String(cfg.RATE_LIMIT_EPOCH || '1') + ':' + ip);
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
