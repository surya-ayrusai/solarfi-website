// Builds n8n/solarfi-customer-sheet-sync.json: copies NEW rows from the Google Sheet
// "solarfi_customer_data" into public.customer_data.
// Run: node n8n/build-customer-sync-workflow.mjs
// Env overrides: N8N_SUPABASE_CRED_ID, N8N_SHEETS_CRED_ID, N8N_SHEETS_TRIGGER_CRED_ID, N8N_GMAIL_CRED_ID, SYNC_DRY_RUN, OUT
import { readFileSync, writeFileSync } from 'node:fs';

const here = new URL('.', import.meta.url);
const read = (p) => readFileSync(new URL(p, here), 'utf8');
const env = process.env;

const SUPABASE = 'https://csikpgbacngeivttoejo.supabase.co/rest/v1';
export const SHEET_ID = '1gW2TNCZT9XpOJSbbo3pnxIGNlbp8fjp8ARVf88sDLaU';
// Started by n8n's Google Sheets Trigger: it checks the sheet every minute, and a run starts
// only when rows have been added. Checks that find nothing do not start a run.
export const TRIGGER_EVENT = 'rowAdded';

const supabaseCred = { supabaseApi: { id: env.N8N_SUPABASE_CRED_ID || '', name: 'Supabase account' } };
const sheetsCred = { googleSheetsOAuth2Api: { id: env.N8N_SHEETS_CRED_ID || '', name: 'Google Sheets account' } };
const sheetsTriggerCred = { googleSheetsTriggerOAuth2Api: { id: env.N8N_SHEETS_TRIGGER_CRED_ID || '', name: 'Google Sheets Trigger account' } };
const gmailCred = { gmailOAuth2: { id: env.N8N_GMAIL_CRED_ID || '', name: 'Gmail account 3' } };

let x = 0;
const pos = (col, row) => [col * 240, row * 200];
const nodes = [];
const add = (n) => { nodes.push({ id: `s${++x}`, ...n }); return n.name; };
const ifTrue = (name, p, conditions) => add({
  name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: p,
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
      conditions: conditions.map((c, i) => ({ id: `c${x}${i}`, rightValue: '', ...c })),
      combinator: 'and',
    },
    options: {},
  },
});
const codeNode = (name, p, jsCode) => add({ name, type: 'n8n-nodes-base.code', typeVersion: 2, position: p, parameters: { jsCode } });
const gmail = (name, p) => add({
  name, type: 'n8n-nodes-base.gmail', typeVersion: 2.1, position: p, credentials: gmailCred,
  onError: 'continueRegularOutput',
  parameters: {
    sendTo: "={{ $('Sync Config').first().json.ALERT_EMAIL }}", subject: '={{ $json.subject }}',
    emailType: 'text', message: '={{ $json.text }}', options: { appendAttribution: false },
  },
});

add({
  name: 'New Row in Customer Sheet', type: 'n8n-nodes-base.googleSheetsTrigger', typeVersion: 1, position: pos(0, 2),
  credentials: sheetsTriggerCred,
  parameters: {
    pollTimes: { item: [{ mode: 'everyMinute' }] },
    documentId: { __rl: true, mode: 'id', value: SHEET_ID },
    sheetName: { __rl: true, mode: 'id', value: '0' },
    event: TRIGGER_EVENT,
    options: {},
  },
});
add({
  name: 'Sync Config', type: 'n8n-nodes-base.set', typeVersion: 3.4, position: pos(1, 2),
  executeOnce: true, // the trigger can hand over several new rows; check the whole sheet once
  parameters: {
    mode: 'manual', includeOtherFields: false,
    assignments: { assignments: [
      { id: 'k1', name: 'SHEET_ID', value: SHEET_ID, type: 'string' },
      { id: 'k2', name: 'SHEET_RANGE', value: 'Sheet1', type: 'string' },
      { id: 'k3', name: 'ALERT_EMAIL', value: 'info@solarfi.in', type: 'string' },
      // true = work out what would be inserted, insert nothing, send no email.
      { id: 'k4', name: 'DRY_RUN', value: env.SYNC_DRY_RUN === 'true', type: 'boolean' },
    ] },
    options: {},
  },
});
add({
  name: 'Read Customer Sheet', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: pos(2, 2),
  credentials: sheetsCred, retryOnFail: true, maxTries: 2, waitBetweenTries: 5000,
  parameters: {
    method: 'GET',
    url: "=https://sheets.googleapis.com/v4/spreadsheets/{{ $json.SHEET_ID }}/values/{{ encodeURIComponent($json.SHEET_RANGE) }}",
    authentication: 'predefinedCredentialType', nodeCredentialType: 'googleSheetsOAuth2Api',
    sendQuery: true, queryParameters: { parameters: [
      { name: 'valueRenderOption', value: 'FORMATTED_VALUE' }, { name: 'dateTimeRenderOption', value: 'FORMATTED_STRING' },
    ] },
    options: { timeout: 20000 },
  },
});
add({
  name: 'Get Existing Customers', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: pos(3, 2),
  credentials: supabaseCred, retryOnFail: true, maxTries: 2, waitBetweenTries: 2000,
  executeOnce: true, alwaysOutputData: true,
  parameters: {
    method: 'GET', url: `${SUPABASE}/customer_data`,
    authentication: 'predefinedCredentialType', nodeCredentialType: 'supabaseApi',
    sendQuery: true, queryParameters: { parameters: [{ name: 'select', value: 'name,mobile' }, { name: 'limit', value: '20000' }] },
    options: { timeout: 20000 },
  },
});
codeNode('Find New Customers', pos(4, 2), read('code/customer-sync.js'));

ifTrue('New Rows To Insert?', pos(5, 1), [
  { leftValue: '={{ $json.rows.length }}', rightValue: 0, operator: { type: 'number', operation: 'gt' } },
  { leftValue: '={{ $json.dryRun }}', operator: { type: 'boolean', operation: 'false', singleValue: true } },
]);
add({
  name: 'Insert New Customers', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: pos(6, 1),
  credentials: supabaseCred, retryOnFail: true, maxTries: 2, waitBetweenTries: 2000,
  onError: 'continueErrorOutput',
  parameters: {
    method: 'POST', url: `${SUPABASE}/customer_data`,
    authentication: 'predefinedCredentialType', nodeCredentialType: 'supabaseApi',
    sendHeaders: true, headerParameters: { parameters: [{ name: 'Prefer', value: 'return=minimal' }] },
    sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.rows) }}',
    options: { timeout: 20000 },
  },
});
codeNode('Build Insert Failure Email', pos(7, 2), [
  "// The insert is all-or-nothing, so nothing was added. The next added row starts a new run, which tries again.",
  "const found = $('Find New Customers').first().json;",
  "const err = $json.error ? (typeof $json.error === 'string' ? $json.error : ($json.error.message || JSON.stringify($json.error))) : 'unknown error';",
  "return [{ json: {",
  "  subject: `Customer sheet sync failed: ${found.rows.length} new row(s) not saved`,",
  "  text: [`The copy from the customer Google Sheet to the database failed. Nothing was saved. It tries again the next time a row is added to the sheet.`, '',",
  "    `Rows waiting: ${found.rows.map((r) => 'row ' + r.source_row + ' (' + r.name + ')').join(', ')}`, '', `Error: ${String(err).slice(0, 500)}`].join('\\n'),",
  "} }];",
].join('\n'));
gmail('Email: Sync Failed', pos(8, 2));

ifTrue('Rows To Report?', pos(5, 3), [
  { leftValue: '={{ $json.alert.length }}', rightValue: 0, operator: { type: 'number', operation: 'gt' } },
  { leftValue: '={{ $json.dryRun }}', operator: { type: 'boolean', operation: 'false', singleValue: true } },
]);
codeNode('Build Bad Rows Email', pos(6, 3), [
  "// Each bad row is reported once. Fix it in the sheet and the next run copies it in.",
  "const list = $json.alert;",
  "return [{ json: {",
  "  subject: `Customer sheet: ${list.length} row(s) could not be copied`,",
  "  text: ['These rows in the customer Google Sheet were skipped. Fix them in the sheet; they are copied the next time a row is added.', '',",
  "    ...list.map((b) => `Row ${b.row} (${b.name}): ${b.problem}`)].join('\\n'),",
  "} }];",
].join('\n'));
gmail('Email: Rows Skipped', pos(7, 3));

const connections = {};
const link = (from, to, out = 0) => {
  connections[from] ??= { main: [] };
  while (connections[from].main.length <= out) connections[from].main.push([]);
  connections[from].main[out].push({ node: to, type: 'main', index: 0 });
};
link('New Row in Customer Sheet', 'Sync Config');
link('Sync Config', 'Read Customer Sheet');
link('Read Customer Sheet', 'Get Existing Customers');
link('Get Existing Customers', 'Find New Customers');
link('Find New Customers', 'New Rows To Insert?');
link('Find New Customers', 'Rows To Report?');
link('New Rows To Insert?', 'Insert New Customers', 0);
link('Insert New Customers', 'Build Insert Failure Email', 1);
link('Build Insert Failure Email', 'Email: Sync Failed');
link('Rows To Report?', 'Build Bad Rows Email', 0);
link('Build Bad Rows Email', 'Email: Rows Skipped');

const workflow = {
  name: 'Solarfi Customer Sheet Sync',
  nodes, connections,
  settings: { executionOrder: 'v1', timezone: 'Asia/Kolkata', saveDataErrorExecution: 'all', saveDataSuccessExecution: 'all', callerPolicy: 'workflowsFromSameOwner' },
  pinData: {}, meta: { templateCredsSetupCompleted: false },
};

const out = env.OUT ? new URL(`file://${env.OUT}`) : new URL('solarfi-customer-sheet-sync.json', here);
writeFileSync(out, JSON.stringify(workflow, null, 2).replace(/[\u007f-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) + '\n');
const textOut = readFileSync(out, 'utf8');
for (const re of [/eyJ[A-Za-z0-9_-]{20,}/, /sb_secret_/, /service_role"\s*:/, /AIza[0-9A-Za-z_-]{20,}/, /-----BEGIN/]) {
  if (re.test(textOut)) throw new Error(`Possible secret in workflow export: ${re}`);
}
console.log(`Wrote ${out.pathname} (${nodes.length} nodes)`);
