/* Leads dashboard: website enquiries with an editable pipeline status. */
(function () {
  'use strict';
  var D = window.SolarfiDash, h = D.h;
  var STAGES = D.STAGES;
  var LABEL = D.STAGE_LABEL;
  var CLOSED = ['delivered', 'lost'];
  var CHASE_AFTER_DAYS = 1; // a 'new' lead with no call after this many days needs a chase
  var PROPERTY = { home: 'Home', shop: 'Shop', commercial: 'Commercial', industrial: 'Industrial', government: 'Government', other: 'Other' };
  var leads = [];
  var gate;

  var isOpen = function (l) { return CLOSED.indexOf(l.status) === -1; };
  var needsChase = function (l) { return l.status === 'new' && D.daysSince(l.created_at) >= CHASE_AFTER_DAYS; };

  var filter = document.getElementById('filter');
  [['open', 'Open leads'], ['chase', 'Needs chase'], ['all', 'All leads']].concat(STAGES.map(function (s) { return [s[0], 'Stage: ' + s[1]]; }))
    .forEach(function (o) { filter.append(h('option', { value: o[0] }, o[1])); });
  var search = document.getElementById('search');
  // Opened from "Leads to customers" with ?q=<mobile>: show that lead whatever its stage.
  var q0 = new URLSearchParams(location.search).get('q');
  if (q0) { search.value = q0.slice(0, 40); filter.value = 'all'; }

  function kpis() {
    var open = leads.filter(isOpen);
    var chase = leads.filter(needsChase).length;
    var fresh = leads.filter(function (l) { return l.status === 'new'; }).length;
    var kw = open.reduce(function (a, l) { return a + (Number(l.estimated_kw) || 0); }, 0);
    var delivered = leads.filter(function (l) { return l.status === 'delivered'; }).length;
    var lost = leads.filter(function (l) { return l.status === 'lost'; }).length;
    var box = document.getElementById('kpis');
    box.replaceChildren(
      h('div', { class: 'kpi is-hero' }, h('div', { class: 'kpi-label' }, 'Open leads'), h('div', { class: 'kpi-value' }, String(open.length)),
        h('div', { class: 'kpi-sub' }, D.plural(fresh, 'new lead') + ' · ' + chase + ' need chasing')),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'Pipeline size'), h('div', { class: 'kpi-value' }, (Math.round(kw * 10) / 10) + ' kW'),
        h('div', { class: 'kpi-sub' }, 'Estimated, across ' + D.plural(open.length, 'open lead'))),
      h('div', { class: 'kpi' }, h('div', { class: 'kpi-label' }, 'Delivered'), h('div', { class: 'kpi-value' }, String(delivered)),
        h('div', { class: 'kpi-sub' }, lost ? D.plural(lost, 'lead') + ' marked lost' : 'No leads marked lost')),
      stagePanel()
    );
    document.getElementById('listTitle').textContent = 'Website leads';
    document.getElementById('listSub').textContent = open.length + ' open · ' + chase + ' need chasing · ' + leads.length + ' in total';
    var pill = document.getElementById('chasePill');
    pill.hidden = !chase; pill.replaceChildren(D.icon('warn'), chase + ' need chasing');
  }

  // One panel with every stage, its colour and its count. Clicking a stage filters the list to it.
  function stagePanel() {
    var counts = {};
    leads.forEach(function (l) { counts[l.status] = (counts[l.status] || 0) + 1; });
    return h('div', { class: 'kpi kpi-stages' },
      h('div', { class: 'kpi-label' }, 'Leads by stage'),
      h('div', { class: 'stage-grid' }, STAGES.map(function (s) {
        var n = counts[s[0]] || 0;
        return h('button', {
          type: 'button', class: 'stage-chip stage-' + s[0] + (n ? '' : ' is-zero') + (filter.value === s[0] ? ' is-active' : ''),
          'aria-pressed': filter.value === s[0] ? 'true' : 'false',
          'aria-label': s[1] + ': ' + D.plural(n, 'lead') + '. Show these leads.',
          onclick: function () { filter.value = filter.value === s[0] ? 'all' : s[0]; render(); },
        }, h('span', { class: 'stage-count' }, String(n)), h('span', { class: 'stage-name' }, h('span', { class: 'stage-dot', 'aria-hidden': 'true' }), s[1]));
      })));
  }

  function visible() {
    var f = filter.value, q = search.value.trim().toLowerCase();
    return leads.filter(function (l) {
      if (f === 'open' && !isOpen(l)) return false;
      if (f === 'chase' && !needsChase(l)) return false;
      if (LABEL[f] && l.status !== f) return false;
      if (q && [l.name, l.mobile, l.city_area, l.email].join(' ').toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(function (a, b) { return (needsChase(b) - needsChase(a)) || (new Date(b.created_at) - new Date(a.created_at)); });
  }

  function statusSelect(l) {
    var note = h('span', { class: 'saved-note', 'aria-live': 'polite' });
    var sel = h('select', { class: 'status-select', 'data-stage': l.status, 'aria-label': 'Status for ' + l.name });
    STAGES.forEach(function (s) { var o = h('option', { value: s[0] }, s[1]); if (s[0] === l.status) o.selected = true; sel.append(o); });
    sel.addEventListener('change', async function () {
      var prev = l.status, next = sel.value;
      sel.setAttribute('data-stage', next);
      sel.disabled = true; sel.classList.add('is-saving'); note.textContent = 'Saving…';
      try {
        var res = await D.api({ action: 'set_status', lead_id: l.lead_id, status: next });
        l.status = res.lead.status;
        D.toast(l.name + ' moved to ' + LABEL[l.status] + '.');
        render();
      } catch (e) {
        if (e.status === 401) return gate.onUnauthorized();
        sel.value = prev; sel.setAttribute('data-stage', prev); sel.disabled = false; sel.classList.remove('is-saving'); note.textContent = '';
        D.toast('Not saved: ' + D.friendlyError(e), true);
      }
    });
    return [sel, note];
  }

  function row(l) {
    var chase = needsChase(l), days = D.daysSince(l.created_at);
    var meta = [D.phone(l.mobile), l.city_area].filter(Boolean).join(' · ');
    return h('tr', { class: chase ? 'is-chase' : null },
      h('td', { 'data-label': 'Customer' },
        h('div', { class: 'who' }, l.name,
          chase && h('span', { class: 'badge badge-chase' }, D.icon('warn'), 'Needs chase'),
          l.is_duplicate && h('span', { class: 'badge badge-repeat', title: 'Same mobile sent another enquiry within 24 hours' }, 'Repeat')),
        h('div', { class: 'meta' }, meta)),
      h('td', { 'data-label': 'System' },
        h('div', { class: 'big' }, l.estimated_kw + ' kW'),
        h('div', { class: 'meta' }, PROPERTY[l.property_type] || l.property_type)),
      h('td', { 'data-label': 'Usage' },
        h('div', { class: 'big' }, Number(l.monthly_units_kwh).toLocaleString('en-IN') + ' units/mo'),
        h('div', { class: 'meta' }, l.monthly_bill_inr !== null && l.monthly_bill_inr !== undefined ? 'Bill ' + D.money(l.monthly_bill_inr) : 'Bill not given')),
      h('td', { 'data-label': 'Waiting' },
        h('div', { class: 'serif-num' }, days === 0 ? 'Today' : D.plural(days, 'day')),
        h('div', { class: 'meta' }, 'Enquired ' + D.shortDate(l.created_at))),
      h('td', { 'data-label': 'Status' }, statusSelect(l)),
      h('td', { class: 'right', 'data-label': 'Actions' }, h('div', { class: 'actions' }, D.callButtons(l.mobile)))
    );
  }

  function render() {
    kpis();
    var list = visible(), box = document.getElementById('list');
    if (!leads.length) return box.replaceChildren(h('p', { class: 'empty' }, 'No website leads yet.'));
    if (!list.length) return box.replaceChildren(h('p', { class: 'empty' }, 'No leads match this view.'));
    box.replaceChildren(h('table', { class: 'worklist' },
      h('thead', null, h('tr', null, ['Customer', 'System', 'Usage', 'Waiting', 'Status'].map(function (t) { return h('th', { scope: 'col' }, t); }), h('th', { scope: 'col', class: 'right' }, 'Actions'))),
      h('tbody', null, list.map(row))));
    document.getElementById('note').textContent = 'A lead needs a chase when it is still New a day after it came in. Changing the status saves it straight to the database.';
  }

  async function load() {
    var btn = document.getElementById('refresh'); btn.disabled = true;
    try {
      var res = await D.api({ action: 'leads' });
      leads = res.leads || [];
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
