/* Shared dashboard code: access key, API calls, formatting, small UI helpers. */
(function () {
  'use strict';
  var cfg = window.SOLARFI_DASHBOARD_CONFIG || {};
  var KEY_STORE = 'solarfi_dash_key';

  function getKey() { try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; } }
  function setKey(k) { try { localStorage.setItem(KEY_STORE, k); } catch (e) { /* private mode: key lives for this page only */ } memKey = k; }
  function clearKey() { try { localStorage.removeItem(KEY_STORE); } catch (e) {} memKey = ''; }
  var memKey = getKey();

  function ApiError(status, body) { this.status = status; this.body = body || {}; this.message = (body && body.error) || ('HTTP ' + status); }

  async function api(payload) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, cfg.timeoutMs || 20000);
    try {
      var res = await fetch(cfg.apiUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-solarfi-dash-key': memKey },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
        cache: 'no-store',
      });
      var body = null;
      try { body = await res.json(); } catch (e) { body = null; }
      if (!res.ok || !body || body.ok === false) throw new ApiError(res.status, body);
      return body;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(0, { error: e.name === 'AbortError' ? 'timeout' : 'network' });
    } finally { clearTimeout(t); }
  }

  function friendlyError(e) {
    if (e.status === 401) return 'That access key was not accepted.';
    if (e.status === 403) return 'This address is not allowed to use the dashboard.';
    if (e.status === 404) return 'That lead no longer exists. Refresh the list.';
    if (e.status === 422) return 'That change was not accepted. Refresh and try again.';
    if (e.body && e.body.error === 'timeout') return 'The server took too long to answer. Try again.';
    if (e.status === 0) return 'Could not reach the server. Check your internet connection.';
    return 'Something went wrong on the server. Try again in a minute.';
  }

  // Show the key prompt until a key works; then call onReady().
  function requireKey(onReady) {
    var gate = document.getElementById('gate');
    var app = document.getElementById('app');
    var form = document.getElementById('gateForm');
    var input = document.getElementById('gateKey');
    var err = document.getElementById('gateError');
    var btn = form.querySelector('button');

    function showGate(msg) {
      app.hidden = true; gate.hidden = false; err.textContent = msg || ''; input.value = ''; input.focus();
    }
    async function tryStart() {
      gate.hidden = true; app.hidden = false;
      try { await onReady(); } catch (e) {
        if (e.status === 401) { clearKey(); showGate('That access key was not accepted.'); }
        else throw e;
      }
    }
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      var k = input.value.trim();
      if (!k) { err.textContent = 'Enter the access key.'; return; }
      setKey(k); btn.disabled = true;
      try { await tryStart(); } finally { btn.disabled = false; }
    });
    var forget = document.getElementById('forgetKey');
    if (forget) forget.addEventListener('click', function () { clearKey(); showGate('Key removed from this browser.'); });

    if (memKey) tryStart(); else showGate();
    return { onUnauthorized: function () { clearKey(); showGate('Your access key stopped working. Enter it again.'); } };
  }

  var inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  function money(n) { return inr.format(Math.round(Number(n) || 0)); }
  function moneySigned(n) { n = Number(n) || 0; return (n < 0 ? '−' : '') + money(Math.abs(n)); }
  function phone(m) {
    var d = String(m || '').replace(/^\+91/, '');
    return /^\d{10}$/.test(d) ? '+91 ' + d.slice(0, 5) + ' ' + d.slice(5) : '';
  }
  var dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
  function shortDate(iso) { var d = new Date(iso); return isNaN(d) ? '' : dateFmt.format(d); }
  function daysSince(iso) { var d = new Date(iso); return isNaN(d) ? null : Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000)); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

  // Tiny element builder: h('td', { class: 'x', 'data-label': 'Y' }, child, 'text', ...)
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      (Array.isArray(c) ? c : [c]).forEach(function (cc) { if (cc !== null && cc !== undefined && cc !== false) el.append(cc.nodeType ? cc : document.createTextNode(String(cc))); });
    }
    return el;
  }
  var ICONS = {
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>',
  };
  function icon(name) { var s = document.createElement('span'); s.innerHTML = ICONS[name]; s.style.display = 'contents'; return s; }

  function callButtons(mobile) {
    var d = String(mobile || '').replace(/^\+/, '');
    if (!/^91\d{10}$/.test(d)) return h('span', { class: 'meta' }, 'No mobile');
    return [
      h('a', { class: 'btn', href: 'tel:+' + d, 'aria-label': 'Call ' + phone(mobile) }, icon('phone'), 'Call'),
      h('a', { class: 'btn btn-amber', href: 'https://wa.me/' + d, target: '_blank', rel: 'noopener', 'aria-label': 'WhatsApp ' + phone(mobile) }, icon('chat'), 'WhatsApp'),
    ];
  }

  var toastTimer;
  function toast(msg, isError) {
    var el = document.getElementById('toast');
    el.textContent = msg; el.className = 'toast' + (isError ? ' is-error' : ''); el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, isError ? 6000 : 3000);
  }

  window.SolarfiDash = { api: api, requireKey: requireKey, friendlyError: friendlyError, money: money, moneySigned: moneySigned, phone: phone,
    shortDate: shortDate, daysSince: daysSince, plural: plural, h: h, icon: icon, callButtons: callButtons, toast: toast };
})();
