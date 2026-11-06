// Runs the customer sheet sync Code node in a stand-in for n8n's Code node runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const wf = JSON.parse(readFileSync(new URL('../n8n/solarfi-customer-sheet-sync.json', import.meta.url), 'utf8'));
const src = wf.nodes.find((n) => n.name === 'Find New Customers').parameters.jsCode;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const HEADER = ['Enquiry Date', 'Name', 'Billing Address', 'Mobile', 'INSTALLED_DATE', 'KW SYSTEM', 'Company Name', 'GSTIN', 'Closing Balance', 'Net Balance as of today', 'Tags', 'PAN No.', 'Group'];
async function run(values, existing = [], { staticData = {}, dryRun = false } = {}) {
  const nodes = { 'Sync Config': [{ DRY_RUN: dryRun }], 'Read Customer Sheet': [{ values }], 'Get Existing Customers': existing.length ? existing : [{}] };
  const fn = new AsyncFunction('$', '$getWorkflowStaticData', src);
  const [out] = await fn((n) => ({ first: () => ({ json: nodes[n][0] }), all: () => nodes[n].map((j) => ({ json: j })) }), () => staticData);
  return out.json;
}

test('sync: maps columns, converts Indian money, normalises mobile, skips blanks', async () => {
  const r = await run([HEADER,
    ['', 'Sample  Ravi  Kumar', 'Main Road Kadapa 37-ANDHRA PRADESH India', '98765 43210', '', '', '', '', '-2,00,000.00', '-2,00,000.00', '', '', ''],
    [],
    ['15/08/2026', 'Sample Traders Owner', '', '+91 91234 56789', '2026-09-01', '5', 'Sample Traders', '37abcde1234f1z5', '49,885.00', '49,885.00', 'vip', 'abcde1234f', 'B2B'],
  ]);
  assert.equal(r.rows.length, 2); assert.equal(r.invalid.length, 0); assert.equal(r.scanned, 3);
  assert.deepEqual(r.rows[0], { name: 'Sample Ravi Kumar', billing_address: 'Main Road Kadapa 37-ANDHRA PRADESH India', mobile: '+919876543210',
    enquiry_date: null, installed_date: null, kw_system: null, company_name: null, gstin: null, closing_balance_inr: -200000, net_balance_inr: -200000,
    tags: null, pan_no: null, customer_group: null, source: 'sheet-sync', source_row: 2 });
  assert.equal(r.rows[1].enquiry_date, '2026-08-15', 'dd/mm/yyyy is read day first');
  assert.equal(r.rows[1].installed_date, '2026-09-01');
  assert.equal(r.rows[1].gstin, '37ABCDE1234F1Z5'); assert.equal(r.rows[1].pan_no, 'ABCDE1234F');
  assert.equal(r.rows[1].source_row, 4);
});

test('sync: customers already in the table are skipped, whatever the row order', async () => {
  const sheet = [HEADER, ['', 'New Person', '', '9000000001'], ['', 'SAMPLE  MAHESH', '', '99'], ['', 'Sample Lalitha', '', '9441100000']];
  const existing = [{ name: 'Sample Mahesh', mobile: null }, { name: 'SAMPLE LALITHA', mobile: '+919441100000' }];
  const r = await run(sheet, existing);
  assert.deepEqual(r.rows.map((x) => x.name), ['New Person']);
  const reordered = await run([HEADER, sheet[3], sheet[2], sheet[1]], existing);
  assert.deepEqual(reordered.rows.map((x) => x.name), ['New Person']);
  const again = await run(sheet, [...existing, { name: 'New Person', mobile: '+919000000001' }]);
  assert.equal(again.rows.length, 0, 'second run inserts nothing');
});

test('sync: same name with a different mobile is a different customer; duplicates within the sheet are copied once', async () => {
  const r = await run([HEADER, ['', 'A Kumar', '', '9000000001'], ['', 'A Kumar', '', '9000000002'], ['', 'A Kumar', '', '9000000002']]);
  assert.deepEqual(r.rows.map((x) => x.mobile), ['+919000000001', '+919000000002']);
});

test('sync: bad rows are skipped and reported once', async () => {
  const sheet = [HEADER,
    ['', '', 'address only', '9000000001'],
    ['', 'Bad Gst', '', '', '', '', '', 'GST123'],
    ['31/02/2026', 'Bad Date'],
    ['', 'Bad Money', '', '', '', '', '', '', 'twelve'],
    ['', 'Good One', '', '9000000009']];
  const staticData = {};
  const r = await run(sheet, [], { staticData });
  assert.deepEqual(r.rows.map((x) => x.name), ['Good One']);
  assert.deepEqual(r.invalid.map((b) => b.row), [2, 3, 4, 5]);
  assert.match(r.invalid[0].problem, /Name is empty/);
  assert.match(r.invalid[1].problem, /GSTIN/);
  assert.match(r.invalid[2].problem, /not a real date/);
  assert.equal(r.alert.length, 4);
  const second = await run(sheet, [], { staticData });
  assert.equal(second.alert.length, 0, 'not reported again');
  assert.equal(second.invalid.length, 4, 'still skipped');
});

test('sync: dry run reports nothing as sent and remembers nothing', async () => {
  const staticData = {};
  const r = await run([HEADER, ['', '', 'x']], [], { staticData, dryRun: true });
  assert.equal(r.dryRun, true); assert.equal(r.alert.length, 1);
  assert.deepEqual(staticData.reported, {});
});

test('sync: columns can move; a sheet without a Name column stops with a clear error', async () => {
  const r = await run([['Mobile', 'Closing Balance', 'Name'], ['9000000001', '1,000', 'Moved Columns']]);
  assert.equal(r.rows[0].name, 'Moved Columns'); assert.equal(r.rows[0].closing_balance_inr, 1000);
  await assert.rejects(run([['Customer', 'Mobile'], ['X', '9000000001']]), /no "Name" column/);
});

test('sync: workflow wiring', () => {
  const trig = wf.nodes.find((n) => n.type === 'n8n-nodes-base.googleSheetsTrigger');
  assert.equal(trig.parameters.event, 'rowAdded', 'runs only when rows are added');
  assert.equal(trig.parameters.documentId.value, '1gW2TNCZT9XpOJSbbo3pnxIGNlbp8fjp8ARVf88sDLaU');
  assert.ok(!wf.nodes.some((n) => n.type === 'n8n-nodes-base.scheduleTrigger'), 'no timed runs');
  assert.equal(wf.nodes.find((n) => n.name === 'Sync Config').executeOnce, true);
  assert.equal(wf.settings.timezone, 'Asia/Kolkata');
  const ins = wf.nodes.find((n) => n.name === 'Insert New Customers');
  assert.equal(ins.parameters.method, 'POST');
  assert.ok(!JSON.stringify(wf).includes('"DELETE"') && !JSON.stringify(wf).includes('PATCH'), 'sync only inserts');
});
