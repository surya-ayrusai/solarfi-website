// Builds n8n/solarfi-inquiry-intake.json from n8n/code/*.js and lead-validation.js.
// Run: node n8n/build-workflow.mjs
// The output holds NO credentials or secrets: credentials are referenced by
// name only and must be selected in n8n after import (see SETUP.md).
import { readFileSync, writeFileSync } from 'node:fs';

const here = new URL('.', import.meta.url);
const read = (p) => readFileSync(new URL(p, here), 'utf8');
const validation = read('../lead-validation.js');
const code = (f) => read(`code/${f}`).replace(/\/\*__LEAD_VALIDATION__\*\//g, () => validation);

const SUPABASE = 'https://csikpgbacngeivttoejo.supabase.co';
const TABLE = 'leads';
const REST = `${SUPABASE}/rest/v1/${TABLE}`;

// Same columns, same order, in Supabase and in the "Leads" sheet tab.
export const COLUMNS = [
  'id', 'lead_id', 'created_at', 'name', 'mobile', 'email', 'city_area', 'property_type',
  'monthly_units_kwh', 'monthly_bill_inr', 'roof_area_sqft', 'estimated_kw', 'estimate_method',
  'routing_queue', 'message', 'source', 'status', 'is_duplicate', 'assigned_to', 'consent_at',
  'client_request_id', 'raw_payload',
];
const INSERT_COLUMNS = COLUMNS.filter((c) => c !== 'id');

// Import-time overrides (never committed): set by the person importing.
const env = process.env;
const supabaseCred = { supabaseApi: { id: env.N8N_SUPABASE_CRED_ID || '', name: 'Supabase account' } };
const sheetsCred = { googleSheetsOAuth2Api: { id: env.N8N_SHEETS_CRED_ID || '', name: 'Google Sheets account' } };
const gmailCred = { gmailOAuth2: { id: env.N8N_GMAIL_CRED_ID || '', name: 'Gmail account 2' } };

let x = 0;
const pos = (col, row) => [col * 240, row * 200];
const nodes = [];
const add = (n) => { nodes.push({ id: `n${++x}`, ...n }); return n.name; };

const http = (name, p, opts = {}) => add({
  name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: p,
  credentials: supabaseCred,
  retryOnFail: true, maxTries: 2, waitBetweenTries: 1000,
  onError: 'continueErrorOutput',
  ...opts.node,
  parameters: {
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'supabaseApi',
    options: { timeout: 10000 },
    ...opts.parameters,
  },
});

const ifTrue = (name, p, left, operator, right) => add({
  name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: p,
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: [{ id: `c${x}`, leftValue: left, rightValue: right ?? '', operator }],
      combinator: 'and',
    },
    options: {},
  },
});

// ---- Nodes -----------------------------------------------------------------
add({
  name: 'Inquiry Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2, position: pos(0, 2),
  webhookId: '6f1d2c3a-5b7e-4c8d-9a0b-1e2f3a4b5c6d',
  parameters: {
    httpMethod: 'POST', path: 'solarfi-inquiry', responseMode: 'responseNode',
    options: {
      rawBody: true,
      allowedOrigins: env.SOLARFI_ALLOWED_ORIGINS || 'https://solarfi.in,https://www.solarfi.in,https://solarfi-website.vercel.app',
    },
  },
});
// Settings (no secrets). n8n Starter has no Variables, so they live here.
add({
  name: 'Intake Config', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: pos(1, 0),
  parameters: {
    mode: 'manual', includeOtherFields: true, include: 'all',
    assignments: { assignments: [
      { id: 'u', name: 'UNITS_PER_KW_PER_MONTH', value: 120, type: 'number' },
      { id: 'o', name: 'ALLOWED_ORIGINS', value: env.SOLARFI_ALLOWED_ORIGINS || 'https://solarfi.in,https://www.solarfi.in,https://solarfi-website.vercel.app', type: 'string' },
      { id: 'r', name: 'RATE_LIMIT_PER_HOUR', value: 5, type: 'number' },
      { id: 'e', name: 'RATE_LIMIT_EPOCH', value: '2', type: 'string' },
      { id: 'a', name: 'ALERT_EMAIL', value: 'info@solarfi.in', type: 'string' },
      { id: 'n', name: 'NOTIFY_EMAILS', value: 'uday@solarfi.in,surya@ayrusai.com', type: 'string' },
      { id: 's', name: 'LEADS_SHEET_ID', value: '125ZB4f2EQjjQ6USLUKRT9VNuK4AIOfXzQtU0rSYzK-s', type: 'string' },
      { id: 'k', name: 'FORM_KEY_SHA256', value: env.SOLARFI_FORM_KEY_SHA256 || 'SET_SHA256_OF_FORM_KEY', type: 'string' },
    ] },
    options: {},
  },
});
add({ name: 'Security Gate', type: 'n8n-nodes-base.code', typeVersion: 2, position: pos(1, 2),
  parameters: { jsCode: code('security-gate.js') } });
ifTrue('Gate Says Respond?', pos(2, 2), '={{ $json._respond }}', { type: 'boolean', operation: 'true', singleValue: true });
add({ name: 'Validate & Normalise', type: 'n8n-nodes-base.code', typeVersion: 2, position: pos(3, 3),
  parameters: { jsCode: code('validate.js') } });
ifTrue('Invalid?', pos(4, 3), '={{ $json._respond }}', { type: 'boolean', operation: 'true', singleValue: true });

http('Request Already Seen?', pos(5, 4), {
  node: { alwaysOutputData: true },
  parameters: {
    method: 'GET', url: REST, sendQuery: true,
    queryParameters: { parameters: [
      { name: 'select', value: 'lead_id' },
      { name: 'client_request_id', value: "=eq.{{ $json.data.client_request_id }}" },
      { name: 'limit', value: '1' },
    ] },
  },
});
ifTrue('Seen Before?', pos(6, 4), '={{ $json.lead_id }}', { type: 'string', operation: 'exists', singleValue: true });
add({
  name: 'Original Lead Response', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: pos(7, 3),
  parameters: { mode: 'raw', jsonOutput: '={{ { _respond: true, status: 200, body: { ok: true, lead_id: $json.lead_id } } }}', options: {} },
});
http('Same Mobile in 24h?', pos(7, 5), {
  node: { alwaysOutputData: true },
  parameters: {
    method: 'GET', url: REST, sendQuery: true,
    queryParameters: { parameters: [
      { name: 'select', value: 'lead_id' },
      { name: 'mobile', value: "=eq.{{ $('Validate & Normalise').first().json.data.mobile }}" },
      { name: 'created_at', value: '=gte.{{ $now.minus({ hours: 24 }).toUTC().toISO() }}' },
      { name: 'limit', value: '1' },
    ] },
  },
});
add({ name: 'Derive Lead Fields', type: 'n8n-nodes-base.code', typeVersion: 2, position: pos(8, 5),
  parameters: { jsCode: code('derive.js') } });

// Reused routing pattern from "Solar Enquiry Sorter": two queues, then merge.
add({
  name: 'Call Queue Property?', type: 'n8n-nodes-base.if', typeVersion: 2.2, position: pos(9, 5),
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
      conditions: [{ id: 'cq', leftValue: "={{ ['home', 'shop', 'other'].includes($json.property_type) }}", rightValue: '',
        operator: { type: 'boolean', operation: 'true', singleValue: true } }],
      combinator: 'and',
    },
    options: {},
  },
});
const markQueue = (name, value, p) => add({
  name, type: 'n8n-nodes-base.set', typeVersion: 3.4, position: p,
  parameters: {
    mode: 'manual', includeOtherFields: true, include: 'all',
    assignments: { assignments: [{ id: name, name: 'routing_queue', value, type: 'string' }] },
    options: {},
  },
});
markQueue('Mark Call Queue', 'call', pos(10, 4));
markQueue('Mark Site Visit Queue', 'site_visit', pos(10, 6));
add({ name: 'Merge Enquiry Queues', type: 'n8n-nodes-base.merge', typeVersion: 3.1, position: pos(11, 5),
  parameters: {} }); // default mode: append

http('Insert Lead (Supabase)', pos(12, 5), {
  parameters: {
    method: 'POST', url: REST,
    sendHeaders: true,
    headerParameters: { parameters: [{ name: 'Prefer', value: 'return=representation' }] },
    sendBody: true, specifyBody: 'json',
    jsonBody: `={{ JSON.stringify({ ${INSERT_COLUMNS.map((c) => `${c}: $json.${c}`).join(', ')} }) }}`,
  },
});

add({
  name: 'Append Enquiry to Sheet', type: 'n8n-nodes-base.googleSheets', typeVersion: 4.5, position: pos(13, 5),
  credentials: sheetsCred, onError: 'continueErrorOutput',
  parameters: {
    operation: 'append',
    documentId: { __rl: true, mode: 'id', value: "={{ $('Intake Config').first().json.LEADS_SHEET_ID }}" },
    sheetName: { __rl: true, mode: 'name', value: 'Leads' },
    columns: {
      mappingMode: 'defineBelow',
      value: Object.fromEntries(COLUMNS.map((c) => [c, c === 'raw_payload'
        ? '={{ JSON.stringify($json.raw_payload) }}'
        : `={{ $json.${c} === null || $json.${c} === undefined ? '' : $json.${c} }}`])),
      matchingColumns: [],
      schema: COLUMNS.map((c) => ({ id: c, displayName: c, required: false, defaultMatch: false,
        display: true, type: 'string', canBeUsedToMatch: true })),
    },
    options: { cellFormat: 'RAW' },
  },
});

add({
  name: 'Respond Success', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: pos(15, 5),
  parameters: {
    respondWith: 'json',
    responseBody: "={{ JSON.stringify({ ok: true, lead_id: $('Insert Lead (Supabase)').first().json.lead_id }) }}",
    options: { responseCode: 200 },
  },
});
add({
  name: 'Respond Early', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: pos(9, 1),
  parameters: {
    respondWith: 'json', responseBody: '={{ JSON.stringify($json.body) }}',
    options: { responseCode: '={{ $json.status }}' },
  },
});

// New-lead notification: runs after Respond Success, so the visitor is never kept waiting.
add({ name: 'Build Lead Notification', type: 'n8n-nodes-base.code', typeVersion: 2, position: pos(16, 5),
  onError: 'continueRegularOutput',
  parameters: { jsCode: code('lead-notification.js') } });
add({
  name: 'Email Team: New Lead', type: 'n8n-nodes-base.gmail', typeVersion: 2.1, position: pos(17, 5), credentials: gmailCred,
  onError: 'continueRegularOutput',
  parameters: { sendTo: '={{ $json.to }}', subject: '={{ $json.subject }}', emailType: 'text', message: '={{ $json.text }}', options: { appendAttribution: false } },
});

// Sheet failure: lead stays in Supabase, alert the team, still answer 200.
add({ name: 'Build Sheet Alert', type: 'n8n-nodes-base.code', typeVersion: 2, position: pos(14, 6),
  parameters: { jsCode: code('alert-text.js').replace('__STAGE__', 'Google Sheet append') } });
const gmail = (name, p) => add({
  name, type: 'n8n-nodes-base.gmail', typeVersion: 2.1, position: p, credentials: gmailCred,
  onError: 'continueRegularOutput',
  parameters: {
    sendTo: "={{ $('Intake Config').first().json.ALERT_EMAIL }}", subject: '={{ $json.subject }}',
    emailType: 'text', message: '={{ $json.text }}', options: { appendAttribution: false },
  },
});
gmail('Alert Team: Sheet Failed', pos(15, 6));

// Supabase failure (after one retry): maybe it was a duplicate client_request_id
// racing in; re-check, else alert and answer 500.
http('Recheck Request ID', pos(13, 7), {
  node: { alwaysOutputData: true, onError: 'continueRegularOutput', retryOnFail: false },
  parameters: {
    method: 'GET', url: REST, sendQuery: true,
    queryParameters: { parameters: [
      { name: 'select', value: 'lead_id' },
      { name: 'client_request_id', value: "=eq.{{ $('Validate & Normalise').first().json.data.client_request_id }}" },
      { name: 'limit', value: '1' },
    ] },
  },
});
ifTrue('Already Saved?', pos(14, 7), '={{ $json.lead_id }}', { type: 'string', operation: 'exists', singleValue: true });
add({ name: 'Build Supabase Alert', type: 'n8n-nodes-base.code', typeVersion: 2, position: pos(15, 8),
  parameters: { jsCode: code('alert-text.js').replace('__STAGE__', 'Supabase') } });
gmail('Alert Team: Supabase Failed', pos(16, 8));
add({
  name: 'Respond 500', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1.1, position: pos(17, 8),
  parameters: {
    respondWith: 'json',
    responseBody: '={{ JSON.stringify({ ok: false, error: "server_error", message: "We could not save your request. Please try again." }) }}',
    options: { responseCode: 500 },
  },
});

// ---- Connections -------------------------------------------------------------
const connections = {};
const link = (from, to, out = 0, input = 0) => {
  connections[from] ??= { main: [] };
  while (connections[from].main.length <= out) connections[from].main.push([]);
  connections[from].main[out].push({ node: to, type: 'main', index: input });
};
link('Inquiry Webhook', 'Intake Config');
link('Intake Config', 'Security Gate');
link('Security Gate', 'Gate Says Respond?');
link('Gate Says Respond?', 'Respond Early', 0);
link('Gate Says Respond?', 'Validate & Normalise', 1);
link('Validate & Normalise', 'Invalid?');
link('Invalid?', 'Respond Early', 0);
link('Invalid?', 'Request Already Seen?', 1);
link('Request Already Seen?', 'Seen Before?', 0);
link('Request Already Seen?', 'Recheck Request ID', 1);       // Supabase error
link('Seen Before?', 'Original Lead Response', 0);
link('Seen Before?', 'Same Mobile in 24h?', 1);
link('Original Lead Response', 'Respond Early');
link('Same Mobile in 24h?', 'Derive Lead Fields', 0);
link('Same Mobile in 24h?', 'Recheck Request ID', 1);         // Supabase error
link('Derive Lead Fields', 'Call Queue Property?');
link('Call Queue Property?', 'Mark Call Queue', 0);
link('Call Queue Property?', 'Mark Site Visit Queue', 1);
link('Mark Call Queue', 'Merge Enquiry Queues', 0, 0);
link('Mark Site Visit Queue', 'Merge Enquiry Queues', 0, 1);
link('Merge Enquiry Queues', 'Insert Lead (Supabase)');
link('Insert Lead (Supabase)', 'Append Enquiry to Sheet', 0);
link('Insert Lead (Supabase)', 'Recheck Request ID', 1);      // Supabase error after retry
link('Append Enquiry to Sheet', 'Respond Success', 0);
link('Append Enquiry to Sheet', 'Build Sheet Alert', 1);
link('Build Sheet Alert', 'Alert Team: Sheet Failed');
link('Alert Team: Sheet Failed', 'Respond Success');
link('Respond Success', 'Build Lead Notification');
link('Build Lead Notification', 'Email Team: New Lead');
link('Recheck Request ID', 'Already Saved?');
link('Already Saved?', 'Original Lead Response', 0);
link('Already Saved?', 'Build Supabase Alert', 1);
link('Build Supabase Alert', 'Alert Team: Supabase Failed');
link('Alert Team: Supabase Failed', 'Respond 500');

const workflow = {
  name: 'Solarfi Inquiry Intake',
  nodes,
  connections,
  settings: { executionOrder: 'v1', saveDataErrorExecution: 'all', saveDataSuccessExecution: 'all', callerPolicy: 'workflowsFromSameOwner' },
  pinData: {},
  meta: { templateCredsSetupCompleted: false },
};

const out = env.OUT ? new URL(`file://${env.OUT}`) : new URL('solarfi-inquiry-intake.json', here);
// ASCII-only output (\uXXXX escapes): survives clipboard/encoding round-trips on import.
writeFileSync(out, JSON.stringify(workflow, null, 2).replace(/[\u007f-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');

// Guard: never ship a secret in the export.
const text = readFileSync(out, 'utf8');
for (const re of [/eyJ[A-Za-z0-9_-]{20,}/, /sb_secret_/, /service_role"\s*:/, /AIza[0-9A-Za-z_-]{20,}/, /-----BEGIN/]) {
  if (re.test(text)) throw new Error(`Possible secret in workflow export: ${re}`);
}
console.log(`Wrote ${out.pathname} (${nodes.length} nodes)`);
