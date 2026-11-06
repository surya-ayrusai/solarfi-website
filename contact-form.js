/*
 * Contact Us inquiry form -> n8n webhook.
 * Validation rules live in lead-validation.js (shared with n8n).
 */
(function () {
  'use strict';

  var form = document.getElementById('contactForm');
  if (!form) return;

  var cfg = window.SOLARFI_LEAD_FORM_CONFIG || {};
  var V = window.SolarfiLeadValidation;
  var btn = document.getElementById('submitBtn');
  var statusBox = document.getElementById('formStatus');
  var BTN_LABEL = btn.textContent;
  var FIELDS = ['name', 'mobile', 'email', 'city_area', 'property_type', 'monthly_units_kwh',
    'monthly_bill_inr', 'roof_area_sqft', 'message', 'consent'];

  // One ID per form session. Reused on retry so a double-submit or a retry
  // after a timeout never creates a second lead. Reset only after success.
  var requestId = newUuid();

  function newUuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }

  function field(name) { return form.elements[name]; }

  function setError(name, msg) {
    var el = field(name);
    var box = document.getElementById('err-' + name);
    if (box) box.textContent = msg || '';
    if (el) {
      el.classList.toggle('is-invalid', !!msg);
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
  }

  function clearErrors() { FIELDS.forEach(function (f) { setError(f, ''); }); }

  function showErrors(errors) {
    var first = null;
    FIELDS.forEach(function (f) {
      setError(f, errors[f] || '');
      if (errors[f] && !first) first = f;
    });
    // Errors for fields the visitor can't see (e.g. client_request_id)
    var hidden = Object.keys(errors).filter(function (k) { return FIELDS.indexOf(k) === -1; });
    if (hidden.length) showStatus('error', errors[hidden[0]]);
    if (first && field(first)) field(first).focus();
  }

  function showStatus(kind, text, html) {
    statusBox.hidden = false;
    statusBox.className = 'form-status ' + (kind === 'success' ? 'is-success' : 'is-error');
    if (html) statusBox.innerHTML = html; else statusBox.textContent = text;
  }

  function hideStatus() { statusBox.hidden = true; statusBox.textContent = ''; }

  function setBusy(busy) {
    btn.disabled = busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
    btn.textContent = busy ? 'Sending…' : BTN_LABEL;
  }

  function payload() {
    return {
      name: field('name').value,
      mobile: field('mobile').value,
      email: field('email').value,
      city_area: field('city_area').value,
      property_type: field('property_type').value,
      monthly_units_kwh: field('monthly_units_kwh').value,
      monthly_bill_inr: field('monthly_bill_inr').value,
      roof_area_sqft: field('roof_area_sqft').value,
      message: field('message').value,
      consent: field('consent').checked,
      honeypot: field('company_website_hp').value,
      client_request_id: requestId
    };
  }

  function retryHtml(lead) {
    var wa = 'https://wa.me/' + encodeURIComponent(cfg.whatsappNumber || '917358258385') +
      '?text=' + encodeURIComponent('Hi Solarfi, I tried to send a solar enquiry from your website. Name: ' +
      (lead.name || '') + ', City: ' + (lead.city_area || ''));
    return 'Sorry, we couldn’t send your request just now. Please try again in a moment. ' +
      'If it keeps failing, <a href="' + wa + '" target="_blank" rel="noopener noreferrer">message us on WhatsApp</a> ' +
      'or call <a href="tel:+917358258385">+91 73582 58385</a>.';
  }

  // Clear a field's error as soon as the visitor edits it
  FIELDS.forEach(function (f) {
    var el = field(f);
    if (el) el.addEventListener('input', function () { setError(f, ''); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (btn.disabled) return;
    hideStatus();
    clearErrors();

    var body = payload();
    var check = V.validate(body);
    if (!check.ok) { showErrors(check.errors); return; }

    setBusy(true);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, cfg.timeoutMs || 20000) : null;

    fetch(cfg.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'x-solarfi-key': cfg.formKey },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (json) { return { res: res, json: json }; });
      })
      .then(function (r) {
        if (r.res.ok && r.json && r.json.ok && r.json.lead_id) {
          var ref = String(r.json.lead_id).slice(0, 8).toUpperCase();
          showStatus('success', null,
            '✅ Thank you! We’ve received your request and will call you within 24 hours.<br>' +
            'Your reference ID: <strong>' + ref + '</strong>');
          form.reset();
          requestId = newUuid();
          return;
        }
        if (r.res.status === 422 && r.json && r.json.errors) { showErrors(r.json.errors); return; }
        if (r.res.status === 429) {
          showStatus('error', (r.json && r.json.message) ||
            'You’ve sent several requests in the last hour. Please wait a little and try again, or call us on +91 73582 58385.');
          return;
        }
        showStatus('error', null, retryHtml(body));
      })
      .catch(function () { showStatus('error', null, retryHtml(body)); })
      .then(function () {
        if (timer) clearTimeout(timer);
        setBusy(false);
      });
  });
})();
