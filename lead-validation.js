/*
 * Solarfi inquiry validation — single source of truth.
 *
 * Used in two places with identical rules:
 *   1. The Contact Us page (window.SolarfiLeadValidation) for instant feedback.
 *   2. The n8n "Validate & Normalise" Code node. scripts/build-n8n-workflow.mjs
 *      copies this file into the workflow JSON, so edit it here, not in n8n.
 *
 * No dependencies, no network, no secrets.
 */
(function (root) {
  'use strict';

  var PROPERTY_TYPES = ['home', 'shop', 'commercial', 'industrial', 'government', 'other'];
  var CALL_QUEUE = ['home', 'shop', 'other'];
  var NAME_RE = /^[\p{L}\p{M} .]+$/u;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function str(v) {
    return v === undefined || v === null ? '' : String(v).trim();
  }

  function isBlank(v) {
    return str(v) === '';
  }

  // "12" -> 12, "12.0" -> 12, "12.5" -> NaN-ish (not an integer), "" -> null
  function toNumber(v) {
    if (typeof v === 'number') return v;
    var s = str(v).replace(/,/g, '');
    if (s === '' || !/^-?\d+(\.\d+)?$/.test(s)) return NaN;
    return Number(s);
  }

  function normaliseMobile(v) {
    var s = str(v).replace(/[\s\-().]/g, '');
    if (s.indexOf('+91') === 0) s = s.slice(3);
    else if (/^91\d{10}$/.test(s)) s = s.slice(2);
    else if (/^0\d{10}$/.test(s)) s = s.slice(1);
    return /^[6-9]\d{9}$/.test(s) ? '+91' + s : null;
  }

  /**
   * validate(input) -> { ok: true, data } | { ok: false, errors: { field: message } }
   * `data` holds the cleaned values, ready to store.
   */
  function validate(input) {
    var b = input && typeof input === 'object' ? input : {};
    var errors = {};
    var d = {};

    // name
    var name = str(b.name).replace(/\s+/g, ' ');
    if (!name) errors.name = 'Please enter your name.';
    else if (name.length < 2 || name.length > 80) errors.name = 'Name must be 2 to 80 characters.';
    else if (!NAME_RE.test(name)) errors.name = 'Name can contain only letters, spaces and dots.';
    else d.name = name;

    // mobile
    if (isBlank(b.mobile)) errors.mobile = 'Please enter your mobile number.';
    else {
      var m = normaliseMobile(b.mobile);
      if (!m) errors.mobile = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).';
      else d.mobile = m;
    }

    // email (optional)
    if (isBlank(b.email)) d.email = null;
    else {
      var email = str(b.email).toLowerCase();
      if (email.length > 254 || !EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address, or leave it blank.';
      else d.email = email;
    }

    // city_area
    var city = str(b.city_area).replace(/\s+/g, ' ');
    if (!city) errors.city_area = 'Please enter your city or area.';
    else if (city.length < 2 || city.length > 80) errors.city_area = 'City / area must be 2 to 80 characters.';
    else d.city_area = city;

    // property_type
    var pt = str(b.property_type).toLowerCase();
    if (!pt) errors.property_type = 'Please choose a property type.';
    else if (PROPERTY_TYPES.indexOf(pt) === -1) errors.property_type = 'Please choose a property type from the list.';
    else d.property_type = pt;

    // monthly_units_kwh (required, never clamped)
    if (isBlank(b.monthly_units_kwh)) errors.monthly_units_kwh = 'Please enter your monthly units (kWh). You can find it on your electricity bill.';
    else {
      var u = toNumber(b.monthly_units_kwh);
      if (!Number.isInteger(u)) errors.monthly_units_kwh = 'Monthly units must be a whole number.';
      else if (u < 20 || u > 10000) errors.monthly_units_kwh = 'Monthly units must be between 20 and 10,000 kWh.';
      else d.monthly_units_kwh = u;
    }

    // monthly_bill_inr (optional)
    if (isBlank(b.monthly_bill_inr)) d.monthly_bill_inr = null;
    else {
      var bill = toNumber(b.monthly_bill_inr);
      if (!Number.isFinite(bill) || bill < 0) errors.monthly_bill_inr = 'Monthly bill must be a number of 0 or more.';
      else if (bill > 100000000) errors.monthly_bill_inr = 'Monthly bill looks too large. Please check it.';
      else d.monthly_bill_inr = bill;
    }

    // roof_area_sqft (optional)
    if (isBlank(b.roof_area_sqft)) d.roof_area_sqft = null;
    else {
      var r = toNumber(b.roof_area_sqft);
      if (!Number.isInteger(r)) errors.roof_area_sqft = 'Roof area must be a whole number of square feet.';
      else if (r < 50 || r > 500000) errors.roof_area_sqft = 'Roof area must be between 50 and 5,00,000 sq ft.';
      else d.roof_area_sqft = r;
    }

    // message (optional, never truncated)
    var msg = b.message === undefined || b.message === null ? '' : String(b.message).trim();
    if (msg.length > 1000) errors.message = 'Message must be 1000 characters or fewer (currently ' + msg.length + ').';
    else d.message = msg || null;

    // consent
    if (b.consent !== true && b.consent !== 'true' && b.consent !== 'on') errors.consent = 'Please tick the box so we can contact you.';
    else d.consent = true;

    // client_request_id
    var rid = str(b.client_request_id).toLowerCase();
    if (!UUID_RE.test(rid)) errors.client_request_id = 'Missing request ID. Please reload the page and try again.';
    else d.client_request_id = rid;

    return Object.keys(errors).length ? { ok: false, errors: errors } : { ok: true, data: d };
  }

  function isHoneypotFilled(input) {
    return !!(input && !isBlank(input.honeypot));
  }

  /** Round to nearest 0.5 kW. unitsPerKw comes from the n8n variable. */
  function estimateKw(units, unitsPerKw) {
    var per = Number(unitsPerKw);
    if (!Number.isFinite(per) || per <= 0) throw new Error('UNITS_PER_KW_PER_MONTH is not set to a positive number');
    return Math.round((units / per) * 2) / 2;
  }

  function routingQueue(propertyType) {
    return CALL_QUEUE.indexOf(propertyType) !== -1 ? 'call' : 'site_visit';
  }

  var api = {
    PROPERTY_TYPES: PROPERTY_TYPES,
    validate: validate,
    normaliseMobile: normaliseMobile,
    isHoneypotFilled: isHoneypotFilled,
    estimateKw: estimateKw,
    routingQueue: routingQueue
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SolarfiLeadValidation = api;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
