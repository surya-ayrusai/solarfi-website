// Builds n8n/solarfi-dashboard-api.json: the read/update API behind /dashboard.
// Run: node n8n/build-dashboard-workflow.mjs
// Env overrides: N8N_SUPABASE_CRED_ID, SOLARFI_DASH_KEY_SHA256, SOLARFI_DASH_ALLOWED_ORIGINS, OUT
import { readFileSync, writeFileSync } from 'node:fs';

const here = new URL('.', import.meta.url);
const read = (p) => readFileSync(new URL(p, here), 'utf8');

// Reuse safeEqual + sha256 from the intake gate, so there is one copy of the hashing code.
const gateSrc = read('code/security-gate.js');
const shaBlock = gateSrc.slice(gateSrc.indexOf('function safeEqual'), gateSrc.indexOf('function fnv1a'));
if (!shaBlock.includes('function sha256')) throw new Error('Could not find sha256 in security-gate.js');
const gateCode = read('code/dashboard-gate.js').replace('/*__SHA256__*/', () => shaBlock.trim());

export const LEAD_STATUSES = ['new', 'call', 'site_visit', 'quotation_sent', 'installation', 'delivery', 'delivered', 'lost'];
const LEAD_FIELDS = 'lead_id,created_at,name,mobile,email,city_area,property_type,monthly_units_kwh,monthly_bill_inr,roof_area_sqft,estimated_kw,routing_queue,message,status,is_duplicate';
// PAN is deliberately not sent to the browser.
const CUSTOMER_FIELDS = 'customer_id,name,billing_address,mobile,company_name,gstin,closing_balance_inr,net_balance_inr,enquiry_date,installed_date,kw_system,tags,customer_group,source_row';

const SUPABASE = 'https://csikpgbacngeivttoejo.supabase.co/rest/v1';
const env = process.env;
const supabaseCred = { supabaseApi: { id: env.N8N_SUPABASE_CRED_ID || '', name: 'Supabase account' } };

let x = 0;
const pos = (col, row) => [col * 240, row * 200];
const nodes = [];
const add = (n) => { nodes.push({ id: `d${++x}`, ...n }); return n.name; };

const http = (name, p, parameters) => add({
  name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: p,
  credentials: supabaseCred,
  retryOnFail: true, maxTries: 2, waitBetweenTries: 1000,
  alwaysOutputData: true,
  onError: 'continueErrorOutput',
  parameters: { authentication: 'predefinedCredentialType', nodeCredentialType: 'supabaseApi', options: { timeout: 10000 }, ...parameters },
});
const ifTrue = (name, p, left, operator, right = '') => add({
  name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: p,
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: [{ id: `c${x}`, leftValue: left, rightValue: right, operator }],
      combinator: 'and',
    },
    options: {},
  },
});
const codeNode = (name, p, jsCode) => add({ name, type: 'n8n-nodes-base.code', typeVersion: 2, position: p, parameters: { jsCode } });

add({
  name: 'Dashboard Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2, position: pos(0, 2),
  webhookId: '9b3e7c21-4d5a-4f6b-8c7d-2e1f0a9b8c7d',
  parameters: {
    httpMethod: 'POST', path: 'solarfi-dashboard', responseMode: 'responseNode',
    options: { allowedOrigins: env.SOLARFI_DASH_ALLOWED_ORIGINS || 'https://solarfi.in,https://www.solarfi.in,https://solarfi-website.vercel.app' },
  },
});
add({
  name: 'Dashboard Config', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: pos(1, 2),
  parameters: {
    mode: 'manual', includeOtherFields: true,
    assignments: { assignments: [
      { id: 'k1', name: 'DASH_KEY_SHA256', value: env.SOLARFI_DASH_KEY_SHA256 || 'SET_SHA256_OF_DASHBOARD_KEY', type: 'string' },
      { id: 'k2', name: 'ALLOWED_ORIGINS', value: env.SOLARFI_DASH_ALLOWED_ORIGINS || 'https://solarfi.in,https://www.solarfi.in,https://solarfi-website.vercel.app', type: 'string' },
      { id: 'k3', name: 'LEAD_STATUSES', value: LEAD_STATUSES.join(','), type: 'string' },
    ] },
    options: {},
  },
});
codeNode('Dashboard Gate', pos(2, 2), gateCode);
ifTrue('Answer Now?', pos(3, 2), '={{ $json._respond }}', { type: 'boolean', operation: 'true', singleValue: true });
ifTrue('Wants Leads?', pos(4, 2), '={{ $json.action }}', { type: 'string', operation: 'equals' }, 'leads');
ifTrue('Wants Customers?', pos(5, 3), '={{ $json.action }}', { type: 'string', operation: 'equals' }, 'customers');

http('Get Leads', pos(5, 1), {
  method: 'GET', url: `${SUPABASE}/leads`,
  sendQuery: true, queryParameters: { parameters: [
    { name: 'select', value: LEAD_FIELDS }, { name: 'order', value: 'created_at.desc' }, { name: 'limit', value: '1000' },
  ] },
});
http('Get Customers', pos(6, 2), {
  method: 'GET', url: `${SUPABASE}/customer_data`,
  sendQuery: true, queryParameters: { parameters: [
    { name: 'select', value: CUSTOMER_FIELDS }, { name: 'order', value: 'closing_balance_inr.desc' }, { name: 'limit', value: '2000' },
  ] },
});
http('Update Lead Status', pos(6, 4), {
  method: 'PATCH', url: `=${SUPABASE}/leads?lead_id=eq.{{ $json.lead_id }}&select=lead_id,status`,
  sendHeaders: true, headerParameters: { parameters: [{ name: 'Prefer', value: 'return=representation' }] },
  sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify({ status: $json.status }) }}',
});

codeNode('Shape Leads', pos(7, 1),
  "const leads = $input.all().map((i) => i.json).filter((r) => r && r.lead_id);\nreturn [{ json: { status: 200, body: { ok: true, leads } } }];\n");
codeNode('Shape Customers', pos(7, 2),
  "const customers = $input.all().map((i) => i.json).filter((r) => r && r.customer_id);\nreturn [{ json: { status: 200, body: { ok: true, customers } } }];\n");
codeNode('Shape Status Update', pos(7, 4),
  "const row = $input.all().map((i) => i.json).find((r) => r && r.lead_id);\nif (!row) return [{ json: { status: 404, body: { ok: false, error: 'lead_not_found' } } }];\nreturn [{ json: { status: 200, body: { ok: true, lead: row } } }];\n");
codeNode('Database Error', pos(7, 5),
  "// Supabase failed after one retry. Keep details in the execution log, not the response.\nreturn [{ json: { status: 502, body: { ok: false, error: 'database_error' } } }];\n");
add({
  name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: pos(9, 2),
  parameters: {
    respondWith: 'json', responseBody: '={{ JSON.stringify($json.body) }}',
    options: { responseCode: '={{ $json.status }}', responseHeaders: { entries: [{ name: 'Cache-Control', value: 'no-store' }] } },
  },
});

const connections = {};
const link = (from, to, out = 0) => {
  connections[from] ??= { main: [] };
  while (connections[from].main.length <= out) connections[from].main.push([]);
  connections[from].main[out].push({ node: to, type: 'main', index: 0 });
};
link('Dashboard Webhook', 'Dashboard Config');
link('Dashboard Config', 'Dashboard Gate');
link('Dashboard Gate', 'Answer Now?');
link('Answer Now?', 'Respond', 0);
link('Answer Now?', 'Wants Leads?', 1);
link('Wants Leads?', 'Get Leads', 0);
link('Wants Leads?', 'Wants Customers?', 1);
link('Wants Customers?', 'Get Customers', 0);
link('Wants Customers?', 'Update Lead Status', 1);
link('Get Leads', 'Shape Leads', 0);
link('Get Leads', 'Database Error', 1);
link('Get Customers', 'Shape Customers', 0);
link('Get Customers', 'Database Error', 1);
link('Update Lead Status', 'Shape Status Update', 0);
link('Update Lead Status', 'Database Error', 1);
for (const n of ['Shape Leads', 'Shape Customers', 'Shape Status Update', 'Database Error']) link(n, 'Respond');

const workflow = {
  name: 'Solarfi Dashboard API',
  nodes, connections,
  settings: { executionOrder: 'v1', saveDataErrorExecution: 'all', saveDataSuccessExecution: 'none', callerPolicy: 'workflowsFromSameOwner' },
  pinData: {}, meta: { templateCredsSetupCompleted: false },
};

const out = env.OUT ? new URL(`file://${env.OUT}`) : new URL('solarfi-dashboard-api.json', here);
writeFileSync(out, JSON.stringify(workflow, null, 2).replace(/[\u007f-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const text = readFileSync(out, 'utf8');
for (const re of [/eyJ[A-Za-z0-9_-]{20,}/, /sb_secret_/, /service_role"\s*:/, /AIza[0-9A-Za-z_-]{20,}/, /-----BEGIN/]) {
  if (re.test(text)) throw new Error(`Possible secret in workflow export: ${re}`);
}
console.log(`Wrote ${out.pathname} (${nodes.length} nodes)`);
