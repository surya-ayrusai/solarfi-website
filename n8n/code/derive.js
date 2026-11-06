// Derive Lead Fields: estimated_kw, lead_id, timestamps, duplicate flag.
const V = (function () { var module = { exports: {} }; /*__LEAD_VALIDATION__*/ return module.exports; })();
const { data, raw_payload } = $('Validate & Normalise').first().json;
const recent = $input.first().json;           // row from "Same Mobile in 24h?" or {}
const now = new Date().toISOString();
const leadId = (globalThis.crypto && globalThis.crypto.randomUUID) ? globalThis.crypto.randomUUID()
  : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); });

return [{ json: {
  lead_id: leadId,
  created_at: now,
  name: data.name,
  mobile: data.mobile,
  email: data.email,
  city_area: data.city_area,
  property_type: data.property_type,
  monthly_units_kwh: data.monthly_units_kwh,
  monthly_bill_inr: data.monthly_bill_inr,
  roof_area_sqft: data.roof_area_sqft,
  estimated_kw: V.estimateKw(data.monthly_units_kwh, $vars.UNITS_PER_KW_PER_MONTH),
  estimate_method: 'units_div_120',
  message: data.message,
  source: 'website-contact',
  status: 'new',
  is_duplicate: Boolean(recent && recent.lead_id),
  assigned_to: null,
  consent_at: now,
  client_request_id: data.client_request_id,
  raw_payload
} }];
