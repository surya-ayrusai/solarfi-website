// Dashboard Gate: key -> origin -> action check.
// Output: { _respond: true, status, body } to answer now, or
//         { _respond: false, action, lead_id?, status? } to continue.
const item = $input.first();
const cfg = $('Dashboard Config').first().json;
const headers = item.json.headers || {};
const respond = (status, body) => [{ json: { _respond: true, status, body } }];

/*__SHA256__*/

// 1. Dashboard key header, compared by SHA-256 (the key itself is not stored in n8n)
const expectedHash = String(cfg.DASH_KEY_SHA256 || '').toLowerCase();
if (!/^[0-9a-f]{64}$/.test(expectedHash)) throw new Error('Dashboard Config DASH_KEY_SHA256 is not set');
const given = headers['x-solarfi-dash-key'];
if (!given || String(given).length > 200 || !safeEqual(sha256(String(given)), expectedHash)) return respond(401, { ok: false, error: 'unauthorized' });

// 2. Origin allowlist
const allowed = String(cfg.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!allowed.includes(headers.origin || '')) return respond(403, { ok: false, error: 'origin_not_allowed' });

// 3. Body + action
let body = item.json.body;
if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
if (!body || typeof body !== 'object' || Array.isArray(body)) return respond(400, { ok: false, error: 'malformed_json' });

const action = String(body.action || '');
if (action === 'leads' || action === 'customers') return [{ json: { _respond: false, action } }];

if (action === 'set_status') {
  const STATUSES = String(cfg.LEAD_STATUSES || '').split(',').map((s) => s.trim()).filter(Boolean);
  const leadId = String(body.lead_id || '').toLowerCase();
  const status = String(body.status || '');
  const errors = {};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(leadId)) errors.lead_id = 'Missing or invalid lead_id.';
  if (!STATUSES.includes(status)) errors.status = 'Status must be one of: ' + STATUSES.join(', ') + '.';
  if (Object.keys(errors).length) return respond(422, { ok: false, error: 'validation', errors });
  return [{ json: { _respond: false, action, lead_id: leadId, status } }];
}

return respond(400, { ok: false, error: 'unknown_action' });
