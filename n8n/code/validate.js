// Validate & Normalise. Rules come from lead-validation.js (inlined at build time).
const V = (function () { var module = { exports: {} }; /*__LEAD_VALIDATION__*/ return module.exports; })();

const { body } = $input.first().json;
const result = V.validate(body);
if (!result.ok) return [{ json: { _respond: true, status: 422, body: { ok: false, errors: result.errors } } }];

// raw_payload keeps what the visitor sent (minus the honeypot) for audit.
const raw = Object.assign({}, body);
delete raw.honeypot;
return [{ json: { _respond: false, data: result.data, raw_payload: raw } }];
