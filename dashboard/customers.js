/* Current customers: balances from the accounts sheet, with the ones that owe money flagged. */
(function () {
  'use strict';
  var D = window.SolarfiDash, h = D.h;
  var customers = [];
  var gate;

  // Positive closing balance = the customer owes Solarfi (receivable). Negative = advance paid.
  var bal = function (c) { return Number(c.closing_balance_inr) || 0; };
  var needsChase = function (c) { return bal(c) > 0; };

  var filter = document.getElementById('filter');
  [['all', 'All customers'], ['chase', 'Needs chase (owes us)'], ['advance', 'Advance paid'], ['settled', 'Settled (zero balance)']]
    .forEach(function (o) { filter.append(h('option', { value: o[0] }, o[1])); });
  var search = document.getElementById('search');

  function tidyAddress(a) {
    if (!a) return '';
    return String(a).replace(/\s*India\s*$/i, '').replace(/\b\d{2}-([A-Z][A-Z ]+?)(?=\s+\d{6}|\s*$)/, function (_, s) {
      return s.toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }).replace(/\s+/g, ' ').trim();
  }

  function kpis() {
    var owing = customers.filter(needsChase);
    var adv = customers.filter(function (c) { return bal(c) < 0; });
    var toCollect = owing.reduce(function (a, c) { return a + bal(c); }, 0);
    var advances = adv.reduce(function (a, c) { return a - bal(c); }, 0);
    var opening = customers.reduce(function (a, c) { return a + bal(c); }, 0);
    document.getElementById('kpis').replaceChildren(
      h('div', { class: 'kpi is-hero' }, h('div', { class: 'kpi-label' }, 'Money to collect'), h('div', { class: 'kpi-value' }, D.money(toCollect)),
        h('div', { class: 'kpi-sub' }, D.plural(owing.length, 'customer') + ' owe a balance')),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'Opening balance'), h('div', { class: 'kpi-value' }, D.moneySigned(opening)),
        h('div', { class: 'kpi-sub' }, 'Net of all ' + customers.length + ' accounts' + (opening < 0 ? ' (more advance than dues)' : ''))),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'Advances held'), h('div', { class: 'kpi-value' }, D.money(advances)),
        h('div', { class: 'kpi-sub' }, D.plural(adv.length, 'customer') + ' paid ahead'))
    );
    document.getElementById('listTitle').textContent = 'Customer balances';
    var settledCount = customers.filter(function (c) { return bal(c) === 0; }).length;
    document.getElementById('listSub').textContent = customers.length + ' customers · ' + owing.length + ' need chasing · ' + settledCount + ' settled';
    var pill = document.getElementById('chasePill');
    pill.hidden = !owing.length; pill.replaceChildren(D.icon('warn'), owing.length + ' need chasing');
  }

  function visible() {
    var f = filter.value, q = search.value.trim().toLowerCase();
    return customers.filter(function (c) {
      var b = bal(c);
      if (f === 'chase' && !(b > 0)) return false;
      if (f === 'advance' && !(b < 0)) return false;
      if (f === 'settled' && b !== 0) return false;
      if (q && [c.name, c.mobile, c.company_name, c.billing_address, c.gstin].join(' ').toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) { return (needsChase(b) - needsChase(a)) || (bal(b) - bal(a)) || String(a.name).localeCompare(b.name); });
  }

  function row(c) {
    var b = bal(c), chase = b > 0, settled = b === 0, addr = tidyAddress(c.billing_address);
    return h('tr', { class: chase ? 'is-chase' : settled ? 'is-settled' : null },
      h('td', { 'data-label': 'Customer' },
        h('div', { class: 'who' }, c.name,
          chase && h('span', { class: 'badge badge-chase' }, D.icon('warn'), 'Needs chase'),
          b < 0 && h('span', { class: 'badge badge-advance' }, 'Advance'),
          settled && h('span', { class: 'badge badge-settled' }, 'Settled')),
        h('div', { class: 'meta' }, D.phone(c.mobile) || 'No mobile on file')),
      h('td', { 'data-label': 'Business' },
        h('div', { class: 'big' }, c.company_name || 'Individual'),
        h('div', { class: 'meta' }, c.gstin ? 'GSTIN ' + c.gstin : ' ')),
      h('td', { 'data-label': 'Location' }, h('div', { class: 'meta', title: c.billing_address || '' }, addr.length > 70 ? addr.slice(0, 68) + '…' : (addr || 'No address'))),
      h('td', { 'data-label': 'Balance' },
        h('div', { class: 'serif-num ' + (chase ? 'money-due' : b < 0 ? 'money-adv' : 'money-settled') }, D.money(Math.abs(b))),
        h('div', { class: 'meta' }, chase ? 'Owes us' : b < 0 ? 'Advance paid' : 'Settled')),
      h('td', { class: 'right', 'data-label': 'Actions' }, h('div', { class: 'actions' }, D.callButtons(c.mobile)))
    );
  }

  function render() {
    kpis();
    var list = visible(), box = document.getElementById('list');
    if (!customers.length) return box.replaceChildren(h('p', { class: 'empty' }, 'No customers loaded yet.'));
    if (!list.length) return box.replaceChildren(h('p', { class: 'empty' }, 'No customers match this view.'));
    box.replaceChildren(h('table', { class: 'worklist' },
      h('thead', null, h('tr', null, ['Customer', 'Business', 'Location', 'Balance'].map(function (t) { return h('th', { scope: 'col' }, t); }), h('th', { scope: 'col', class: 'right' }, 'Actions'))),
      h('tbody', null, list.map(row))));
    document.getElementById('note').textContent = 'Balances come from the accounts sheet (closing balance). Red: the customer owes Solarfi and needs a chase. Green: settled, zero balance. The opening balance is the net of every account.';
  }

  async function load() {
    var btn = document.getElementById('refresh'); btn.disabled = true;
    try {
      var res = await D.api({ action: 'customers' });
      customers = res.customers || [];
      render();
    } catch (e) {
      if (e.status === 401) throw e;
      document.getElementById('list').replaceChildren(h('p', { class: 'error-box' }, D.friendlyError(e)));
    } finally { btn.disabled = false; }
  }

  filter.addEventListener('change', render);
  search.addEventListener('input', render);
  document.getElementById('refresh').prepend(D.icon('refresh'));
  document.getElementById('refresh').addEventListener('click', function () { load().catch(function (e) { if (e.status === 401) gate.onUnauthorized(); }); });
  gate = D.requireKey(load);
})();
