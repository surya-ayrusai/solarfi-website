// Build a team alert without full mobile numbers or emails.
const mask = m => (m ? String(m).replace(/^(\+91)?(\d{2})\d{4}(\d{4})$/, (x, p, a, b) => (p || '') + a + 'XXXX' + b) : '-');
// STAGE is filled in per node by build-workflow.mjs.
const stage = '__STAGE__';
let lead = {};
for (const n of ['Merge Enquiry Queues', 'Derive Lead Fields']) {
  try { lead = $(n).first().json; break; } catch (e) { /* node did not run */ }
}
const err = $input.first().json.error || $input.first().json;
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
    `Error: ${(() => { const m = err && (err.message || err.description); return (typeof m === 'string' ? m : JSON.stringify(m || err)).slice(0, 500); })()}`
  ].join('\n')
} }];
