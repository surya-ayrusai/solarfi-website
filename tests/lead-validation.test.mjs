import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Load exactly as the n8n Code node does: wrapped with a local `module`.
const src = readFileSync(new URL('../lead-validation.js', import.meta.url), 'utf8');
const V = new Function('module', src + '\nreturn module.exports;')({ exports: {} });

const ok = {
  name: 'Ramesh Reddy', mobile: '+91 98765-43210', email: 'Ramesh@Example.COM', city_area: 'Kadapa',
  property_type: 'home', monthly_units_kwh: '300', monthly_bill_inr: '2500', roof_area_sqft: '',
  message: '', consent: true, honeypot: '', client_request_id: '3f2b8c1e-9a4d-4e2f-8b1a-0c9d8e7f6a5b',
};
const bad = (patch, field) => {
  const r = V.validate({ ...ok, ...patch });
  assert.equal(r.ok, false, JSON.stringify(patch));
  assert.ok(r.errors[field], `expected error on ${field} for ${JSON.stringify(patch)}: ${JSON.stringify(r.errors)}`);
};

test('valid lead normalises', () => {
  const r = V.validate(ok);
  assert.equal(r.ok, true);
  assert.equal(r.data.mobile, '+919876543210');
  assert.equal(r.data.email, 'ramesh@example.com');
  assert.equal(r.data.monthly_units_kwh, 300);
  assert.equal(r.data.roof_area_sqft, null);
});
test('mobile forms', () => {
  for (const m of ['9876543210', '09876543210', '919876543210', '+919876543210', '98765 43210'])
    assert.equal(V.normaliseMobile(m), '+919876543210', m);
  for (const m of ['5876543210', '987654321', '+1 5073581319', '98765432101', 'abc']) bad({ mobile: m }, 'mobile');
});
test('name rules', () => {
  bad({ name: 'R' }, 'name'); bad({ name: 'x'.repeat(81) }, 'name'); bad({ name: 'R3mesh' }, 'name');
  assert.equal(V.validate({ ...ok, name: 'Dr. K. Rao' }).ok, true);
  assert.equal(V.validate({ ...ok, name: 'రమేష్ రెడ్డి' }).ok, true);
});
test('units never clamped', () => {
  bad({ monthly_units_kwh: '19' }, 'monthly_units_kwh'); bad({ monthly_units_kwh: '10001' }, 'monthly_units_kwh');
  bad({ monthly_units_kwh: '300.5' }, 'monthly_units_kwh'); bad({ monthly_units_kwh: '' }, 'monthly_units_kwh');
});
test('other fields', () => {
  bad({ email: 'nope' }, 'email'); bad({ city_area: 'K' }, 'city_area'); bad({ property_type: 'farm' }, 'property_type');
  bad({ monthly_bill_inr: '-1' }, 'monthly_bill_inr'); bad({ roof_area_sqft: '49' }, 'roof_area_sqft');
  bad({ roof_area_sqft: '500001' }, 'roof_area_sqft'); bad({ message: 'x'.repeat(1001) }, 'message');
  bad({ consent: false }, 'consent'); bad({ client_request_id: 'abc' }, 'client_request_id');
  assert.equal(V.validate({ ...ok, message: 'x'.repeat(1000) }).ok, true);
});
test('derived', () => {
  assert.equal(V.estimateKw(300, 120), 2.5);
  assert.equal(V.estimateKw(20, 120), 0);   // 0.166 -> 0.0
  assert.equal(V.estimateKw(400, 120), 3.5); // 3.33 -> 3.5
  assert.equal(V.estimateKw(10000, 120), 83.5); // 83.33 -> 83.5
  assert.throws(() => V.estimateKw(300, undefined));
  for (const p of ['home', 'shop', 'other']) assert.equal(V.routingQueue(p), 'call');
  for (const p of ['commercial', 'industrial', 'government']) assert.equal(V.routingQueue(p), 'site_visit');
  assert.equal(V.isHoneypotFilled({ honeypot: 'x' }), true);
});
