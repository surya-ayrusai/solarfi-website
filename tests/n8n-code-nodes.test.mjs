// Runs the generated n8n Code nodes in a tiny stand-in for n8n's Code node runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const wf = JSON.parse(readFileSync(new URL('../n8n/solarfi-inquiry-intake.json', import.meta.url), 'utf8'));
const src = (name) => wf.nodes.find((n) => n.name === name).parameters.jsCode;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const config = { FORM_KEY_SHA256: createHash('sha256').update('test-key').digest('hex'), ALLOWED_ORIGINS: 'https://solarfi.in,https://www.solarfi.in', UNITS_PER_KW_PER_MONTH: 120, RATE_LIMIT_PER_HOUR: 5 };

async function run(name, input, { nodes = {}, staticData = {}, binary = null } = {}) {
  const item = { json: input, binary };
  const ctx = { helpers: { getBinaryDataBuffer: async () => Buffer.from(binary.__raw) } };
  const fn = new AsyncFunction('$input', '$getWorkflowStaticData', '$', '$node', '$execution', src(name));
  const all = { 'Intake Config': config, ...nodes };
  return fn.call(ctx, { first: () => item, all: () => [item] }, () => staticData,
    (n) => ({ first: () => { if (!(n in all)) throw new Error('node not run: ' + n); return { json: all[n] }; } }),
    new Proxy({}, { get: (_, k) => { throw new Error(`Referenced node doesn't exist: ${String(k)}`); } }), { id: 'test' });
}
const lead = { name: 'Ramesh Reddy', mobile: '09876543210', email: '', city_area: 'Kadapa', property_type: 'commercial',
  monthly_units_kwh: 400, consent: true, honeypot: '', client_request_id: '3f2b8c1e-9a4d-4e2f-8b1a-0c9d8e7f6a5b' };
const hdr = (h = {}) => ({ 'x-solarfi-key': 'test-key', origin: 'https://solarfi.in', 'x-forwarded-for': '1.2.3.4', ...h });

test('gate: secret, origin, honeypot, malformed json, pass-through', async () => {
  let [r] = await run('Security Gate', { headers: hdr({ 'x-solarfi-key': undefined }), body: lead });
  assert.equal(r.json.status, 401);
  [r] = await run('Security Gate', { headers: hdr({ 'x-solarfi-key': 'wrong' }), body: lead });
  assert.equal(r.json.status, 401);
  [r] = await run('Security Gate', { headers: hdr({ origin: 'https://evil.example' }), body: lead });
  assert.equal(r.json.status, 403);
  [r] = await run('Security Gate', { headers: hdr(), body: { ...lead, honeypot: 'spam' } });
  assert.equal(r.json.status, 200); assert.ok(r.json.body.lead_id);
  [r] = await run('Security Gate', { headers: hdr(), body: {} }, { binary: { data: {}, __raw: '{"name": ' } });
  assert.equal(r.json.status, 400);
  [r] = await run('Security Gate', { headers: hdr(), body: {} }, { binary: { data: {}, __raw: JSON.stringify(lead) } });
  assert.equal(r.json._respond, false); assert.equal(r.json.body.name, 'Ramesh Reddy');
});

test('gate: 6th request from one IP in an hour is 429', async () => {
  const staticData = {};
  const codes = [];
  for (let i = 0; i < 7; i++) {
    const [r] = await run('Security Gate', { headers: hdr({ 'x-forwarded-for': '9.9.9.9' }), body: lead }, { staticData });
    codes.push(r.json._respond ? r.json.status : 'pass');
  }
  assert.deepEqual(codes, ['pass', 'pass', 'pass', 'pass', 'pass', 429, 429]);
  const [other] = await run('Security Gate', { headers: hdr({ 'x-forwarded-for': '8.8.8.8' }), body: lead }, { staticData });
  assert.equal(other.json._respond, false);
  assert.ok(!JSON.stringify(staticData).includes('9.9.9.9'), 'raw IP must not be stored');
  // Changing RATE_LIMIT_EPOCH resets every IP
  config.RATE_LIMIT_EPOCH = '2';
  const [reset] = await run('Security Gate', { headers: hdr({ 'x-forwarded-for': '9.9.9.9' }), body: lead }, { staticData });
  assert.equal(reset.json._respond, false, 'new epoch should start from zero');
  delete config.RATE_LIMIT_EPOCH;
});

test('validate: 422 with field errors, else cleaned data', async () => {
  let [r] = await run('Validate & Normalise', { body: { ...lead, monthly_units_kwh: 5, mobile: '123' } });
  assert.equal(r.json.status, 422);
  assert.ok(r.json.body.errors.monthly_units_kwh && r.json.body.errors.mobile);
  [r] = await run('Validate & Normalise', { body: lead });
  assert.equal(r.json._respond, false);
  assert.equal(r.json.data.mobile, '+919876543210');
  assert.equal(r.json.raw_payload.honeypot, undefined);
});

test('derive: estimate, flags, ids', async () => {
  const [v] = await run('Validate & Normalise', { body: lead });
  let [d] = await run('Derive Lead Fields', {}, { nodes: { 'Validate & Normalise': v.json } });
  assert.equal(d.json.estimated_kw, 3.5);
  assert.equal(d.json.estimate_method, 'units_div_120');
  assert.equal(d.json.is_duplicate, false);
  assert.equal(d.json.source, 'website-contact');
  assert.match(d.json.lead_id, /^[0-9a-f-]{36}$/);
  [d] = await run('Derive Lead Fields', { lead_id: 'x' }, { nodes: { 'Validate & Normalise': v.json } });
  assert.equal(d.json.is_duplicate, true);
});

test('gate sha256 matches node crypto for long and unicode keys', async () => {
  for (const k of ['x', 'a'.repeat(55), 'b'.repeat(56), 'c'.repeat(64), 'kéy-ü-' + 'z'.repeat(70)]) {
    config.FORM_KEY_SHA256 = createHash('sha256').update(k).digest('hex');
    const [r] = await run('Security Gate', { headers: hdr({ 'x-solarfi-key': k, 'x-forwarded-for': Math.random().toString() }), body: lead });
    assert.equal(r.json._respond, false, `key of length ${k.length} should pass`);
  }
  config.FORM_KEY_SHA256 = createHash('sha256').update('test-key').digest('hex');
});

test('alert text masks mobile', async () => {
  const [r] = await run('Build Sheet Alert', { error: { message: 'quota' } },
    { nodes: { 'Merge Enquiry Queues': { lead_id: 'L1', name: 'R', mobile: '+919876543210', routing_queue: 'call' } } });
  assert.match(r.json.text, /\+9198XXXX3210/);
  assert.match(r.json.text, /Queue: call/);
  assert.match(r.json.text, /lead IS saved/);
  const [s2] = await run('Build Supabase Alert', { error: { message: 'timeout' } }, { nodes: {} });
  assert.match(s2.json.subject, /Supabase/);
  assert.match(s2.json.text, /NOT saved/);
  assert.ok(!r.json.text.includes('9876543210'));
  assert.match(r.json.subject, /Sheet/);
});
