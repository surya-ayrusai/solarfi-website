/* Leads to customers: website leads whose mobile number matches a current customer. */
(function () {
  'use strict';
  var D = window.SolarfiDash, h = D.h;
  var WON = ['installation', 'delivery', 'delivered']; // stages that mean the lead became a customer
  var PROPERTY = { home: 'Home', shop: 'Shop', commercial: 'Commercial', industrial: 'Industrial', government: 'Government', other: 'Other' };
  var leads = [], customers = [], matches = [];
  var gate;

  var bal = function (c) { return Number(c.closing_balance_inr) || 0; };
  var stageBehind = function (m) { return WON.indexOf(m.lead.status) === -1; };
  var owes = function (m) { return m.balance > 0; };

  var filter = document.getElementById('filter');
  [['all', 'All matches'], ['behind', 'Stage not updated'], ['owes', 'Owes a balance']]
    .forEach(function (o) { filter.append(h('option', { value: o[0] }, o[1])); });
  var search = document.getElementById('search');

  // One match per mobile number: every lead and every customer record that share it.
  function join() {
    var byMobile = {};
    customers.forEach(function (c) { if (c.mobile) (byMobile[c.mobile] = byMobile[c.mobile] || []).push(c); });
    var groups = {};
    leads.forEach(function (l) {
      if (!l.mobile || !byMobile[l.mobile]) return;
      (groups[l.mobile] = groups[l.mobile] || []).push(l);
    });
    return Object.keys(groups).map(function (mobile) {
      var ls = groups[mobile].sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });
      var cs = byMobile[mobile];
      return {
        mobile: mobile, lead: ls[0], leadCount: ls.length, firstEnquiry: ls[ls.length - 1].created_at,
        customers: cs, balance: cs.reduce(function (a, c) { return a + bal(c); }, 0),
      };
    });
  }

  function kpis() {
    var leadMobiles = {}; leads.forEach(function (l) { if (l.mobile) leadMobiles[l.mobile] = true; });
    var withMobile = Object.keys(leadMobiles).length;
    var rate = withMobile ? Math.round((matches.length / withMobile) * 1000) / 10 : 0;
    var behind = matches.filter(stageBehind).length;
    var owing = matches.filter(owes);
    var due = owing.reduce(function (a, m) { return a + m.balance; }, 0);
    var kw = matches.reduce(function (a, m) { return a + (Number(m.customers[0].kw_system || m.lead.estimated_kw) || 0); }, 0);
    document.getElementById('kpis').replaceChildren(
      h('div', { class: 'kpi is-hero' }, h('div', { class: 'kpi-label' }, 'Leads converted'), h('div', { class: 'kpi-value' }, String(matches.length)),
        h('div', { class: 'kpi-sub' }, 'Website leads now in the customer list')),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'Conversion rate'), h('div', { class: 'kpi-value' }, rate + '%'),
        h('div', { class: 'kpi-sub' }, matches.length + ' of ' + D.plural(withMobile, 'lead') + ' (by mobile number)')),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'Converted capacity'), h('div', { class: 'kpi-value' }, (Math.round(kw * 10) / 10) + ' kW'),
        h('div', { class: 'kpi-sub' }, 'Installed size where known, else the lead estimate')),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'To collect from them'), h('div', { class: 'kpi-value' }, D.money(due)),
        h('div', { class: 'kpi-sub' }, D.plural(owing.length, 'converted customer') + ' owe a balance'))
    );
    document.getElementById('listTitle').textContent = 'Leads that became customers';
    document.getElementById('listSub').textContent = D.plural(matches.length, 'match', 'matches') + ' · ' + behind + ' with the lead stage not updated';
    var pill = document.getElementById('chasePill');
    pill.hidden = !behind; pill.replaceChildren(D.icon('warn'), behind + ' stage' + (behind === 1 ? '' : 's') + ' to update');
  }

  function visible() {
    var f = filter.value, q = search.value.trim().toLowerCase();
    return matches.filter(function (m) {
      if (f === 'behind' && !stageBehind(m)) return false;
      if (f === 'owes' && !owes(m)) return false;
      if (q) {
        var hay = [m.mobile, m.lead.name, m.lead.city_area].concat(m.customers.map(function (c) { return c.name + ' ' + (c.company_name || ''); })).join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) { return (stageBehind(b) - stageBehind(a)) || (new Date(b.lead.created_at) - new Date(a.lead.created_at)); });
  }

  function row(m) {
    var c = m.customers[0], l = m.lead, b = m.balance;
    var names = m.customers.map(function (x) { return x.name; });
    var leadName = String(l.name || '').toLowerCase() !== String(c.name || '').toLowerCase() ? 'Enquired as ' + l.name : null;
    var behind = stageBehind(m);
    return h('tr', { class: b > 0 ? 'is-chase' : b === 0 ? 'is-settled' : null },
      h('td', { 'data-label': 'Customer' },
        h('div', { class: 'who' }, names.join(' / '), m.customers.length > 1 && h('span', { class: 'badge badge-repeat' }, m.customers.length + ' records')),
        h('div', { class: 'meta' }, [D.phone(m.mobile), c.company_name].filter(Boolean).join(' · '))),
      h('td', { 'data-label': 'Enquiry' },
        h('div', { class: 'big' }, 'Enquired ' + D.shortDate(m.firstEnquiry)),
        h('div', { class: 'meta' }, [leadName, m.leadCount > 1 ? m.leadCount + ' enquiries' : null, l.city_area].filter(Boolean).join(' · '))),
      h('td', { 'data-label': 'Lead stage' },
        h('span', { class: 'stage-pill', 'data-stage': l.status }, D.STAGE_LABEL[l.status] || l.status),
        behind && h('div', { class: 'meta stage-hint' }, 'Already a customer: update the lead stage')),
      h('td', { 'data-label': 'System' },
        h('div', { class: 'big' }, (c.kw_system || l.estimated_kw) + ' kW'),
        h('div', { class: 'meta' }, c.kw_system ? 'Installed size' : (PROPERTY[l.property_type] || l.property_type) + ', estimated')),
      h('td', { 'data-label': 'Balance' },
        h('div', { class: 'serif-num ' + (b > 0 ? 'money-due' : b < 0 ? 'money-adv' : 'money-settled') }, D.money(Math.abs(b))),
        h('div', { class: 'meta' }, b > 0 ? 'Owes us' : b < 0 ? 'Advance paid' : 'Settled')),
      h('td', { class: 'right', 'data-label': 'Actions' }, h('div', { class: 'actions' },
        h('a', { class: 'btn', href: './?q=' + encodeURIComponent(m.mobile.slice(3)) }, 'Open lead'),
        D.callButtons(m.mobile)))
    );
  }

  function render() {
    kpis();
    var list = visible(), box = document.getElementById('list');
    if (!matches.length) return box.replaceChildren(h('p', { class: 'empty' }, 'No website lead matches a current customer yet. A match appears here when a lead’s mobile number is the same as a customer’s.'));
    if (!list.length) return box.replaceChildren(h('p', { class: 'empty' }, 'No matches in this view.'));
    box.replaceChildren(h('table', { class: 'worklist' },
      h('thead', null, h('tr', null, ['Customer', 'Enquiry', 'Lead stage', 'System', 'Balance'].map(function (t) { return h('th', { scope: 'col' }, t); }), h('th', { scope: 'col', class: 'right' }, 'Actions'))),
      h('tbody', null, list.map(row))));
  }

  async function load() {
    var btn = document.getElementById('refresh'); btn.disabled = true;
    try {
      var res = await Promise.all([D.api({ action: 'leads' }), D.api({ action: 'customers' })]);
      leads = res[0].leads || []; customers = res[1].customers || [];
      matches = join();
      render();
      var noMobile = customers.filter(function (c) { return !c.mobile; }).length;
      document.getElementById('note').textContent = 'Leads and customers are matched on mobile number. ' +
        (noMobile ? D.plural(noMobile, 'customer') + (noMobile === 1 ? ' has' : ' have') + ' no mobile on file and cannot be matched. ' : '') + 'Red: owes a balance. Green: settled.';
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
