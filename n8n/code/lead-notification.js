// Build the "new lead" notification for the team. Runs AFTER the visitor has
// been answered, so a slow or failing email never delays or breaks the form.
// Internal recipients only: full mobile/email are included so staff can call.
const lead = $('Insert Lead (Supabase)').first().json;
const cfg = $('Intake Config').first().json;
const val = (v, suffix = '') => (v === null || v === undefined || v === '' ? '-' : String(v) + suffix);
const ist = new Date(lead.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
const queue = lead.routing_queue === 'site_visit' ? 'SITE VISIT' : 'CALL';
const ref = String(lead.lead_id).slice(0, 8).toUpperCase();
const dup = lead.is_duplicate ? ' (REPEAT - same mobile in last 24h)' : '';
const digits = String(lead.mobile).replace(/^\+/, '');

const lines = [
  `New website lead${dup}`,
  '',
  `Name:        ${val(lead.name)}`,
  `Mobile:      ${val(lead.mobile)}`,
  `WhatsApp:    https://wa.me/${digits}`,
  `Email:       ${val(lead.email)}`,
  `City/Area:   ${val(lead.city_area)}`,
  `Property:    ${val(lead.property_type)}`,
  `Units/month: ${val(lead.monthly_units_kwh, ' kWh')}`,
  `Bill/month:  ${lead.monthly_bill_inr === null ? '-' : 'Rs ' + lead.monthly_bill_inr}`,
  `Roof area:   ${val(lead.roof_area_sqft, ' sq ft')}`,
  `Est. system: ${val(lead.estimated_kw, ' kW')} (units / ${cfg.UNITS_PER_KW_PER_MONTH})`,
  `Next step:   ${queue}`,
  `Message:     ${val(lead.message)}`,
  '',
  `Received:    ${ist} IST`,
  `Reference:   ${ref}  (lead_id ${lead.lead_id})`,
];

return [{ json: {
  to: String(cfg.NOTIFY_EMAILS || '').split(',').map((s) => s.trim()).filter(Boolean).join(','),
  subject: `New solar lead: ${lead.name} - ${lead.property_type} - ${lead.city_area} [${queue}]${lead.is_duplicate ? ' [REPEAT]' : ''}`,
  text: lines.join('\n'),
  // Short form for WhatsApp (used once a WhatsApp sender is connected).
  whatsapp_text: [
    `*New Solarfi lead*${lead.is_duplicate ? ' (repeat)' : ''}`,
    `${lead.name} - ${lead.mobile}`,
    `${lead.property_type}, ${lead.city_area}`,
    `${val(lead.monthly_units_kwh, ' kWh/month')} -> ~${val(lead.estimated_kw, ' kW')}`,
    `Next: ${queue} | Ref ${ref}`,
  ].join('\n'),
} }];
