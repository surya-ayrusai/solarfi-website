// Find customers in the sheet that are not yet in public.customer_data.
// Inputs: 'Sync Config', 'Read Customer Sheet' (Sheets API values), 'Get Existing Customers' (name, mobile).
// Output (one item): { rows: [...to insert], invalid: [...all bad rows], alert: [...bad rows not reported before], scanned, existing }
//
// A customer counts as "already there" when the same name (case and spacing ignored) and the
// same mobile (or both blank) exist in the table. Row order in the sheet does not matter, so
// sorting or inserting rows in the middle never creates duplicates.
const cfg = $('Sync Config').first().json;
const sheet = $('Read Customer Sheet').first().json;
const existing = $('Get Existing Customers').all().map((i) => i.json).filter((r) => r && r.name);
const values = Array.isArray(sheet.values) ? sheet.values : [];

// Sheet header -> table column. Headers are matched ignoring case, so columns can be reordered.
const HEAD = {
  'enquiry date': 'enquiry_date', 'name': 'name', 'billing address': 'billing_address', 'mobile': 'mobile',
  'installed_date': 'installed_date', 'kw system': 'kw_system', 'company name': 'company_name', 'gstin': 'gstin',
  'closing balance': 'closing_balance_inr', 'net balance as of today': 'net_balance_inr', 'tags': 'tags',
  'pan no.': 'pan_no', 'group': 'customer_group',
};
if (!values.length) return [{ json: { rows: [], invalid: [], alert: [], scanned: 0, existing: existing.length } }];
const header = values[0].map((h) => String(h || '').trim().toLowerCase());
const col = {};
for (const [label, field] of Object.entries(HEAD)) { const i = header.indexOf(label); if (i >= 0) col[field] = i; }
if (col.name === undefined) throw new Error('The customer sheet has no "Name" column in row 1');

const text = (v) => { const s = String(v === undefined || v === null ? '' : v).replace(/\s+/g, ' ').trim(); return s === '' ? null : s; };
const mobile = (v) => {
  let s = String(v || '').replace(/[\s\-().]/g, '');
  if (s.startsWith('+91')) s = s.slice(3); else if (/^91\d{10}$/.test(s)) s = s.slice(2); else if (/^0\d{10}$/.test(s)) s = s.slice(1);
  return /^[6-9]\d{9}$/.test(s) ? '+91' + s : null;
};
const money = (v) => {
  const s = text(v); if (s === null) return null;
  const n = Number(s.replace(/[₹,\s]/g, '').replace(/^\((.*)\)$/, '-$1'));
  if (!Number.isFinite(n)) throw new Error(`not a number: "${s}"`);
  return Math.round(n * 100) / 100;
};
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const date = (v) => {
  const s = text(v); if (s === null) return null;
  let y, m, d, x;
  if ((x = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) [y, m, d] = [+x[1], +x[2], +x[3]];
  else if ((x = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/))) [d, m, y] = [+x[1], +x[2], +x[3]]; // Indian order: day first
  else if ((x = s.match(/^(\d{1,2})[\s\-]([A-Za-z]{3})[A-Za-z]*[\s\-,]+(\d{4})$/)) && MONTHS[x[2].toLowerCase()]) [d, m, y] = [+x[1], MONTHS[x[2].toLowerCase()], +x[3]];
  else throw new Error(`not a date: "${s}"`);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) throw new Error(`not a real date: "${s}"`);
  return dt.toISOString().slice(0, 10);
};
const keyOf = (name, mob) => String(name || '').replace(/\s+/g, ' ').trim().toLowerCase() + '|' + (mob || '');

const known = new Set(existing.map((r) => keyOf(r.name, r.mobile)));
const rows = [], invalid = [];
for (let i = 1; i < values.length; i++) {
  const r = values[i] || [];
  const get = (f) => (col[f] === undefined ? undefined : r[col[f]]);
  if (!r.some((c) => text(c) !== null)) continue; // blank line
  const sheetRow = i + 1;
  try {
    const name = text(get('name'));
    if (!name) throw new Error('Name is empty');
    if (name.length > 120) throw new Error('Name is longer than 120 characters');
    const gstin = text(get('gstin')); const pan = text(get('pan_no'));
    if (gstin && !/^[0-9]{2}[A-Z0-9]{13}$/.test(gstin.toUpperCase())) throw new Error(`GSTIN "${gstin}" is not 15 characters in the usual format`);
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) throw new Error(`PAN "${pan}" is not in the usual format`);
    const kw = money(get('kw_system'));
    if (kw !== null && !(kw > 0)) throw new Error('KW SYSTEM must be more than 0');
    const row = {
      name, billing_address: text(get('billing_address')), mobile: mobile(get('mobile')),
      enquiry_date: date(get('enquiry_date')), installed_date: date(get('installed_date')), kw_system: kw,
      company_name: text(get('company_name')), gstin: gstin ? gstin.toUpperCase() : null,
      closing_balance_inr: money(get('closing_balance_inr')), net_balance_inr: money(get('net_balance_inr')),
      tags: text(get('tags')), pan_no: pan ? pan.toUpperCase() : null, customer_group: text(get('customer_group')),
      source: 'sheet-sync', source_row: sheetRow,
    };
    const key = keyOf(row.name, row.mobile);
    if (known.has(key)) continue; // already in the table (or earlier in this sheet)
    known.add(key);
    rows.push(row);
  } catch (e) {
    invalid.push({ row: sheetRow, name: text(get('name')) || '(no name)', problem: e.message });
  }
}

// Report each bad row once, not every run (remembered in workflow static data; production runs only).
const store = $getWorkflowStaticData('global');
store.reported = store.reported || {};
const alert = invalid.filter((b) => !store.reported[b.row + '|' + b.problem]);
if (String(cfg.DRY_RUN) !== 'true') alert.forEach((b) => { store.reported[b.row + '|' + b.problem] = Date.now(); });

return [{ json: { rows, invalid, alert, scanned: values.length - 1, existing: existing.length, dryRun: String(cfg.DRY_RUN) === 'true' } }];
