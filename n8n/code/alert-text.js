// Build a team alert without full mobile numbers or emails.
const mask = m => (m ? String(m).replace(/^(\+91)?(\d{2})\d{4}(\d{4})$/, (x, p, a, b) => (p || '') + a + 'XXXX' + b) : '-');
let lead = {};
try { lead = $('Derive Lead Fields').first().json; } catch (e) { lead = {}; }
const err = $input.first().json.error || $input.first().json;
const stage = $node.name.includes('Sheet') ? 'Google Sheet append' : 'Supabase';
return [{ json: {
  subject: `[Solarfi] Lead intake failure: ${stage}`,
  text: [
    `Stage: ${stage}`,
    `When (UTC): ${new Date().toISOString()}`,
    `Execution: ${$execution.id}`,
    `Lead ID: ${lead.lead_id || '-'}`,
    `Name: ${lead.name || '-'}`,
    `Mobile: ${mask(lead.mobile)}`,
    `Property: ${lead.property_type || '-'} / Queue: ${lead.routing_queue || '-'}`,
    stage === 'Supabase'
      ? 'The visitor was shown an error and asked to retry. The lead was NOT saved.'
      : 'The lead IS saved in Supabase. Only the Sheet row is missing; add it from Supabase.',
    '',
    `Error: ${String((err && (err.message || err.description)) || JSON.stringify(err)).slice(0, 500)}`
  ].join('\n')
} }];
