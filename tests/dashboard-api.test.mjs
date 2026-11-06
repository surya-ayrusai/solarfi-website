// Runs the Dashboard API's Code nodes in a stand-in for n8n's Code node runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const wf = JSON.parse(readFileSync(new URL('../n8n/solarfi-dashboard-api.json', import.meta.url), 'utf8'));
const node = (name) => wf.nodes.find((n) => n.name === name);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const config = {
  DASH_KEY_SHA256: createHash('sha256').update('dash-test-key').digest('hex'),
  ALLOWED_ORIGINS: 'https://solarfi.in,https://solarfi-website.vercel.app',
  LEAD_STATUSES: node('Dashboard Config').parameters.assignments.assignments.find((a) => a.name === 'LEAD_STATUSES').value,
};
async function run(name, items) {
  const fn = new AsyncFunction('$input', '$', '$node', node(name).parameters.jsCode);
  return fn({ first: () => items[0], all: () => items },
    (n) => ({ first: () => { if (n !== 'Dashboard Config') throw new Error('node not run: ' + n); return { json: config }; } }),
    new Proxy({}, { get: (_, k) => { throw new Error(`Referenced node doesn't exist: ${String(k)}`); } }));
}
const req = (body, h = {}) => [{ json: { headers: { 'x-solarfi-dash-key': 'dash-test-key', origin: 'https://solarfi.in', ...h }, body } }];
const LEAD = '5ab9f381-af54-46f7-ad8f-d393f0f02c7a';

test('dashboard gate: key, origin, actions, validation', async () => {
  const code = async (b, h) => { const [r] = await run('Dashboard Gate', req(b, h)); return r.json._respond ? r.json.status : r.json; };
  assert.equal(await code({ action: 'leads' }, { 'x-solarfi-dash-key': undefined }), 401);
  assert.equal(await code({ action: 'leads' }, { 'x-solarfi-dash-key': 'wrong' }), 401);
  assert.equal(await code({ action: 'leads' }, { 'x-solarfi-key': 'dash-test-key', 'x-solarfi-dash-key': undefined }), 401, 'the public form key header is not accepted');
  assert.equal(await code({ action: 'leads' }, { origin: 'https://evil.example' }), 403);
  assert.equal(await code('{not json'), 400);
  assert.equal(await code({ action: 'drop_table' }), 400);
  assert.deepEqual(await code({ action: 'leads' }), { _respond: false, action: 'leads' });
  assert.deepEqual(await code('{"action":"customers"}'), { _respond: false, action: 'customers' });
  assert.equal(await code({ action: 'set_status', lead_id: LEAD, status: 'won' }), 422, 'old status names are rejected');
  assert.equal(await code({ action: 'set_status', lead_id: "x' or 1=1", status: 'call' }), 422);
  assert.deepEqual(await code({ action: 'set_status', lead_id: LEAD.toUpperCase(), status: 'site_visit' }),
    { _respond: false, action: 'set_status', lead_id: LEAD, status: 'site_visit' });
});

test('dashboard: every pipeline status is accepted', async () => {
  for (const s of ['new', 'call', 'site_visit', 'quotation_sent', 'installation', 'delivery', 'delivered', 'lost']) {
    const [r] = await run('Dashboard Gate', req({ action: 'set_status', lead_id: LEAD, status: s }));
    assert.equal(r.json._respond, false, s);
  }
});

test('dashboard: response shaping', async () => {
  let [r] = await run('Shape Leads', [{ json: {} }]);
  assert.deepEqual(r.json, { status: 200, body: { ok: true, leads: [] } }, 'empty table gives an empty list');
  [r] = await run('Shape Customers', [{ json: { customer_id: 'a', name: 'A' } }, { json: { customer_id: 'b', name: 'B' } }]);
  assert.equal(r.json.body.customers.length, 2);
  [r] = await run('Shape Status Update', [{ json: {} }]);
  assert.equal(r.json.status, 404);
  [r] = await run('Shape Status Update', [{ json: { lead_id: LEAD, status: 'call' } }]);
  assert.deepEqual(r.json.body, { ok: true, lead: { lead_id: LEAD, status: 'call' } });
});

test('dashboard: PAN never leaves the database', () => {
  const q = node('Get Customers').parameters.queryParameters.parameters.find((p) => p.name === 'select').value;
  assert.ok(!q.split(',').includes('pan_no'), q);
});
