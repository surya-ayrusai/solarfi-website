/*
 * Solarfi admin: login + leads dashboard.
 *
 * Security model: this page is only the UI. Who can read or change leads is
 * decided by Supabase Row Level Security (supabase/schema.sql), so hiding or
 * editing this page in a browser cannot expose data.
 */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const CFG = window.SOLARFI_ADMIN_CONFIG || {};
const STATUSES = ["New", "Contacted", "Survey booked", "Quote sent", "Won", "Lost"];
const ACTIVITY_KEY = "solarfi-admin-last-active";
const DRAFT_PREFIX = "solarfi-admin-note-draft:";
const REDIRECT_URL = `${location.origin}${location.pathname.replace(/index\.html$/, "")}`;

/* ---------- tiny DOM helpers ---------- */
const $ = (id) => document.getElementById(id);
function show(viewId) {
  ["viewLoading", "viewSetup", "viewLogin", "viewApp"].forEach((v) => { $(v).hidden = v !== viewId; });
}
function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children) if (c !== null && c !== undefined) n.append(c);
  return n;
}
function setAlert(id, kind, message, action) {
  const box = $(id);
  if (!message) { box.hidden = true; box.textContent = ""; return; }
  box.className = `alert ${kind}`;
  box.textContent = message;
  if (action) box.append(el("button", { type: "button", class: "alert-action", text: action.label, onclick: action.onClick }));
  box.hidden = false;
}
const safe = (s) => (s === null || s === undefined ? "" : String(s));

/* ---------- formatting ---------- */
const dtFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const dFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });
function fmtDateTime(iso) { return iso ? dtFmt.format(new Date(iso)) : ""; }
function fmtMobile(m) { const d = safe(m); return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : d; }
function telHref(m) { return `tel:+91${safe(m)}`; }
function waHref(m) { return `https://wa.me/91${safe(m)}`; }
function statusClass(s) { return `chip st-${safe(s).replace(/\s+/g, "-")}`; }
function localDateStr(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

/* ---------- state ---------- */
const state = {
  sb: null,
  user: null,
  role: null,
  leads: [],
  dupIds: new Set(),
  quick: null,
  openLead: null,      // lead as it was when the drawer opened
  loading: false,
  pendingRetry: null   // action to retry after re-login
};

/* ---------- boot ---------- */
function configMissing() {
  return !CFG.supabaseUrl || !CFG.supabaseAnonKey || /YOUR-/.test(CFG.supabaseUrl + CFG.supabaseAnonKey);
}

async function boot() {
  if (configMissing()) { show("viewSetup"); return; }

  state.sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" }
  });

  wireLogin();
  wireApp();

  // Errors Supabase sends back in the URL (expired link, sign-ups disabled...).
  const urlError = readUrlError();

  state.sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") { enterLogin(); return; }
    if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session && !state.user) {
      setTimeout(() => enterApp(session), 0);
    }
  });

  const { data } = await state.sb.auth.getSession();
  if (data.session) await enterApp(data.session);
  else enterLogin(urlError);
}

function readUrlError() {
  const params = new URLSearchParams(location.search + "&" + location.hash.replace(/^#/, ""));
  const code = params.get("error_code") || params.get("error");
  const desc = params.get("error_description") || "";
  if (!code && !desc) return null;
  history.replaceState(null, "", location.pathname); // keep tokens/errors out of history
  if (/otp_expired|expired|invalid/i.test(code + desc)) return { kind: "expired" };
  if (/signup|not allowed|not.*authori/i.test(code + desc)) return { kind: "denied" };
  return { kind: "error", text: desc.replace(/\+/g, " ") };
}

/* ---------- login ---------- */
function enterLogin(err) {
  state.user = null;
  state.role = null;
  show("viewLogin");
  if (!err) return;
  if (err.kind === "expired") {
    setAlert("authAlert", "warn", "That sign-in link has expired or was already used.", {
      label: "Send a new link", onClick: () => $("magicEmail").focus()
    });
  } else if (err.kind === "denied") {
    setAlert("authAlert", "error", "This account is not authorised for Solarfi admin.");
  } else {
    setAlert("authAlert", "error", err.text || "Sign-in failed. Please try again.");
  }
}

function wireLogin() {
  $("btnGoogle").addEventListener("click", async () => {
    setAlert("authAlert");
    const { error } = await state.sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: REDIRECT_URL, queryParams: { prompt: "select_account" } }
    });
    if (error) setAlert("authAlert", "error", "Google sign-in is not available right now. Try the email link instead.");
  });

  $("formMagic").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("magicEmail").value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAlert("authAlert", "error", "Please enter a valid email address.");
      return;
    }
    const btn = $("btnMagic");
    btn.disabled = true;
    btn.textContent = "Sending…";
    const { error } = await state.sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: REDIRECT_URL }
    });
    btn.disabled = false;
    btn.textContent = "Email me a sign-in link";
    if (error && /rate|too many|seconds/i.test(error.message)) {
      setAlert("authAlert", "warn", "Please wait a minute before asking for another link.");
      return;
    }
    // Same message whether or not the address is authorised, so the form
    // cannot be used to discover which emails have access.
    setAlert("authAlert", "info", "If this email is authorised, a sign-in link is on its way. Open it in this browser.");
  });
}

/* ---------- authorisation (server-side check via RLS-backed function) ---------- */
let entering = null;
function enterApp(session) {
  if (state.user && state.user.id === session.user.id) return Promise.resolve();
  if (!entering) entering = doEnterApp(session).finally(() => { entering = null; });
  return entering;
}
async function doEnterApp(session) {
  show("viewLoading");
  const { data: role, error } = await state.sb.rpc("admin_role");
  if (error || !role) {
    await state.sb.auth.signOut();
    enterLogin({ kind: "denied" });
    return;
  }
  state.user = session.user;
  state.role = role;
  touchActivity();
  $("whoami").textContent = `${session.user.email} · ${role}`;
  $("btnExport").hidden = role !== "admin";
  show("viewApp");
  await loadLeads();
  if (state.pendingRetry) {
    const retry = state.pendingRetry;
    state.pendingRetry = null;
    retry();
  }
}

/* ---------- inactivity sign-out ---------- */
function touchActivity() {
  try { localStorage.setItem(ACTIVITY_KEY, String(Date.now())); } catch (e) { /* ignore */ }
}
function lastActivity() {
  try { return Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now(); } catch (e) { return Date.now(); }
}
let activityThrottle = 0;
["click", "keydown", "scroll", "touchstart"].forEach((ev) =>
  document.addEventListener(ev, () => {
    if (!state.user) return;
    const now = Date.now();
    if (now - activityThrottle > 30000) { activityThrottle = now; touchActivity(); }
  }, { passive: true })
);
setInterval(async () => {
  if (!state.user) return;
  const hours = Number(CFG.inactivityTimeoutHours) || 8;
  if (Date.now() - lastActivity() > hours * 3600 * 1000) {
    await state.sb.auth.signOut();
    enterLogin();
    setAlert("authAlert", "info", `You were signed out after ${hours} hours of inactivity.`);
  }
}, 60 * 1000);

/* ---------- auth errors during work ---------- */
function isAuthError(error) {
  if (!error) return false;
  const msg = `${error.code || ""} ${error.message || ""}`;
  return error.status === 401 || /jwt|token|expired|not authenticated/i.test(msg);
}
async function handleAuthLoss(retry) {
  state.pendingRetry = retry || null;
  await state.sb.auth.signOut().catch(() => {});
  enterLogin();
  setAlert("authAlert", "warn", "Your session expired. Sign in again; your unsaved note is kept and the change will be retried.");
}

/* ---------- leads ---------- */
function wireApp() {
  $("btnLogout").addEventListener("click", async () => {
    await state.sb.auth.signOut();
    enterLogin();
  });
  ["fSearch", "fStatus", "fSource", "fFrom", "fTo"].forEach((id) =>
    $(id).addEventListener("input", () => { state.quick = null; render(); })
  );
  $("btnClear").addEventListener("click", () => {
    ["fSearch", "fStatus", "fSource", "fFrom", "fTo"].forEach((id) => { $(id).value = ""; });
    state.quick = null;
    render();
  });
  $("btnRefresh").addEventListener("click", () => loadLeads());
  $("btnExport").addEventListener("click", exportCsv);
  document.querySelectorAll(".counter").forEach((b) =>
    b.addEventListener("click", () => {
      state.quick = state.quick === b.dataset.quick ? null : b.dataset.quick;
      render();
    })
  );
  $("btnCloseDrawer").addEventListener("click", closeDrawer);
  $("drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("drawer").hidden) closeDrawer(); });
  $("formLead").addEventListener("submit", (e) => { e.preventDefault(); saveLead(); });
  $("formNote").addEventListener("submit", (e) => { e.preventDefault(); addNote(); });
  $("dNote").addEventListener("input", () => {
    if (!state.openLead) return;
    try { sessionStorage.setItem(DRAFT_PREFIX + state.openLead.id, $("dNote").value); } catch (e) { /* ignore */ }
  });
  window.addEventListener("focus", () => { if (state.user && $("drawer").hidden) loadLeads(true); });
  setInterval(() => { if (state.user && $("drawer").hidden && !document.hidden) loadLeads(true); }, 2 * 60 * 1000);
}

function renderSkeleton() {
  const body = $("leadRows");
  body.replaceChildren();
  for (let i = 0; i < 5; i++) {
    const tr = el("tr", { class: "skeleton" });
    for (let j = 0; j < 8; j++) tr.append(el("td"));
    body.append(tr);
  }
  $("emptyState").hidden = true;
}

async function loadLeads(quiet) {
  if (state.loading) return;
  state.loading = true;
  if (!quiet) renderSkeleton();
  const { data, error } = await state.sb
    .from("leads")
    .select("id, created_at, name, mobile, location, interest, source, last_message, status, next_follow_up, updated_at, updated_by")
    .order("created_at", { ascending: false })
    .limit(2000);
  state.loading = false;
  if (error) {
    if (isAuthError(error)) return handleAuthLoss(() => loadLeads());
    setAlert("appAlert", "error", "Couldn't load leads. Check your connection.", { label: "Retry", onClick: () => loadLeads() });
    if (!quiet) { $("leadRows").replaceChildren(); }
    return;
  }
  setAlert("appAlert");
  state.leads = data || [];
  computeDuplicates();
  render();
}

function computeDuplicates() {
  // Same mobile number within 7 days of another lead => possible duplicate.
  state.dupIds = new Set();
  const byMobile = new Map();
  for (const l of state.leads) {
    if (!l.mobile) continue;
    if (!byMobile.has(l.mobile)) byMobile.set(l.mobile, []);
    byMobile.get(l.mobile).push(l);
  }
  const week = 7 * 24 * 3600 * 1000;
  for (const list of byMobile.values()) {
    if (list.length < 2) continue;
    for (const a of list) {
      for (const b of list) {
        if (a !== b && Math.abs(new Date(a.created_at) - new Date(b.created_at)) <= week) { state.dupIds.add(a.id); break; }
      }
    }
  }
}

function counters() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  return {
    newToday: (l) => new Date(l.created_at) >= todayStart,
    stale: (l) => l.status === "New" && new Date(l.created_at).getTime() < dayAgo,
    surveyWeek: (l) => l.status === "Survey booked" && new Date(l.updated_at) >= weekStart
  };
}

function filtered() {
  const q = $("fSearch").value.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");
  const st = $("fStatus").value;
  const src = $("fSource").value;
  const from = $("fFrom").value;
  const to = $("fTo").value;
  const quickFn = state.quick ? counters()[state.quick] : null;
  return state.leads.filter((l) => {
    if (quickFn && !quickFn(l)) return false;
    if (st && l.status !== st) return false;
    if (src && l.source !== src) return false;
    const day = localDateStr(new Date(l.created_at));
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (q) {
      const hay = `${safe(l.name)} ${safe(l.location)}`.toLowerCase();
      const mobileHit = qDigits.length >= 3 && safe(l.mobile).includes(qDigits.replace(/^91(?=\d{10}$)/, ""));
      if (!hay.includes(q) && !mobileHit) return false;
    }
    return true;
  });
}

function render() {
  const c = counters();
  $("cNewToday").textContent = state.leads.filter(c.newToday).length;
  $("cStale").textContent = state.leads.filter(c.stale).length;
  $("cSurvey").textContent = state.leads.filter(c.surveyWeek).length;
  document.querySelectorAll(".counter").forEach((b) => b.setAttribute("aria-pressed", String(state.quick === b.dataset.quick)));

  const rows = filtered();
  const body = $("leadRows");
  body.replaceChildren();
  $("emptyState").hidden = state.leads.length !== 0;
  $("resultCount").textContent = state.leads.length
    ? `${rows.length} of ${state.leads.length} leads${state.quick ? " (summary filter on)" : ""}`
    : "";

  if (state.leads.length && !rows.length) {
    body.append(el("tr", {}, el("td", { colspan: "8", class: "muted", text: "No leads match these filters." })));
    return;
  }

  for (const l of rows) {
    const mobileCell = el("td", { class: "cell-mobile", "data-label": "Mobile" });
    if (l.mobile) {
      mobileCell.append(
        el("a", { href: telHref(l.mobile), text: fmtMobile(l.mobile), onclick: (e) => e.stopPropagation() }),
        el("span", { class: "row-actions" },
          el("a", { href: waHref(l.mobile), target: "_blank", rel: "noopener noreferrer", text: "WhatsApp", onclick: (e) => e.stopPropagation() }))
      );
    }
    const statusCell = el("td", { "data-label": "Status" }, el("span", { class: statusClass(l.status), text: l.status }));
    if (state.dupIds.has(l.id)) statusCell.append(" ", el("span", { class: "chip chip-dup", text: "Possible duplicate" }));

    const tr = el("tr", { tabindex: "0", "aria-label": `Open lead ${safe(l.name) || "without name"}` },
      el("td", { "data-label": "Received", text: fmtDateTime(l.created_at) }),
      el("td", { class: "cell-name", "data-label": "Name", text: safe(l.name) || "—" }),
      mobileCell,
      el("td", { "data-label": "Location", text: safe(l.location) }),
      el("td", { "data-label": "Interest", text: safe(l.interest) }),
      el("td", { "data-label": "Source", text: safe(l.source) }),
      statusCell,
      el("td", { class: "cell-msg", "data-label": "Last message", text: safe(l.last_message), title: safe(l.last_message) })
    );
    tr.addEventListener("click", () => openDrawer(l.id));
    tr.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(l.id); } });
    body.append(tr);
  }
}

/* ---------- drawer ---------- */
let lastFocus = null;
async function openDrawer(id) {
  const l = state.leads.find((x) => x.id === id);
  if (!l) return;
  lastFocus = document.activeElement;
  state.openLead = { ...l };
  setAlert("drawerAlert");
  $("dName").textContent = safe(l.name) || "Lead";
  $("dMeta").textContent = `Received ${fmtDateTime(l.created_at)}`;
  $("dMobile").textContent = l.mobile ? fmtMobile(l.mobile) : "—";
  $("dLocation").textContent = safe(l.location) || "—";
  $("dInterest").textContent = safe(l.interest) || "—";
  $("dSource").textContent = safe(l.source) || "—";
  $("dLast").textContent = safe(l.last_message) || "—";
  $("dCall").hidden = !l.mobile;
  $("dWa").hidden = !l.mobile;
  if (l.mobile) { $("dCall").href = telHref(l.mobile); $("dWa").href = waHref(l.mobile); }
  $("dDup").hidden = !state.dupIds.has(l.id);
  $("dStatus").value = STATUSES.includes(l.status) ? l.status : "New";
  $("dFollow").value = l.next_follow_up || "";
  $("dUpdated").textContent = updatedLine(l);
  let draft = "";
  try { draft = sessionStorage.getItem(DRAFT_PREFIX + l.id) || ""; } catch (e) { /* ignore */ }
  $("dNote").value = draft;
  $("drawerBackdrop").hidden = false;
  $("drawer").hidden = false;
  $("btnCloseDrawer").focus();
  await loadNotes(l.id);
}

function updatedLine(l) {
  if (!l.updated_by) return "";
  return `Last updated by ${l.updated_by} on ${fmtDateTime(l.updated_at)}`;
}

function closeDrawer() {
  $("drawer").hidden = true;
  $("drawerBackdrop").hidden = true;
  state.openLead = null;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

async function loadNotes(leadId) {
  const list = $("noteList");
  list.replaceChildren(el("li", { class: "muted small", text: "Loading notes…" }));
  const { data, error } = await state.sb
    .from("lead_notes")
    .select("id, author_email, note, created_at")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (!state.openLead || state.openLead.id !== leadId) return;
  if (error) {
    if (isAuthError(error)) return handleAuthLoss(() => openDrawer(leadId));
    list.replaceChildren(el("li", { class: "muted small", text: "Couldn't load notes." }));
    return;
  }
  list.replaceChildren();
  if (!data.length) list.append(el("li", { class: "muted small", text: "No notes yet." }));
  for (const n of data) {
    list.append(el("li", {},
      el("div", { class: "note-meta", text: `${n.author_email} · ${fmtDateTime(n.created_at)}` }),
      el("div", { class: "note-text", text: n.note })
    ));
  }
}

async function saveLead() {
  const opened = state.openLead;
  if (!opened) return;
  const btn = $("btnSaveLead");
  btn.disabled = true;
  btn.textContent = "Saving…";
  const changes = { status: $("dStatus").value, next_follow_up: $("dFollow").value || null };

  // Did someone else change this lead since it was opened? (last write wins, but say so)
  const { data: current } = await state.sb.from("leads").select("updated_at, updated_by").eq("id", opened.id).maybeSingle();
  const changedByOther = current && current.updated_at !== opened.updated_at && current.updated_by !== state.user.email;

  const { data, error } = await state.sb.from("leads").update(changes).eq("id", opened.id).select().maybeSingle();
  btn.disabled = false;
  btn.textContent = "Save changes";
  if (error || !data) {
    if (isAuthError(error)) return handleAuthLoss(() => openDrawer(opened.id).then(() => {
      $("dStatus").value = changes.status; $("dFollow").value = changes.next_follow_up || ""; saveLead();
    }));
    setAlert("drawerAlert", "error", "Couldn't save. Please try again.");
    return;
  }
  const i = state.leads.findIndex((x) => x.id === data.id);
  if (i >= 0) state.leads[i] = { ...state.leads[i], ...data };
  state.openLead = { ...state.openLead, ...data };
  $("dUpdated").textContent = updatedLine(data);
  if (changedByOther) {
    setAlert("drawerAlert", "warn", `Note: ${current.updated_by} had changed this lead at ${fmtDateTime(current.updated_at)}. Your change was saved over theirs.`);
  } else {
    setAlert("drawerAlert", "info", "Saved.");
  }
  render();
}

async function addNote() {
  const opened = state.openLead;
  const text = $("dNote").value.trim();
  if (!opened || !text) return;
  const btn = $("btnAddNote");
  btn.disabled = true;
  const { error } = await state.sb.from("lead_notes").insert({ lead_id: opened.id, author_email: state.user.email, note: text });
  btn.disabled = false;
  if (error) {
    if (isAuthError(error)) return handleAuthLoss(() => openDrawer(opened.id).then(addNote));
    setAlert("drawerAlert", "error", "Couldn't add the note. Your text is still here; try again.");
    return;
  }
  $("dNote").value = "";
  try { sessionStorage.removeItem(DRAFT_PREFIX + opened.id); } catch (e) { /* ignore */ }
  await loadNotes(opened.id);
}

/* ---------- CSV export (admin role only) ---------- */
function csvCell(v) {
  let s = safe(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function exportCsv() {
  if (state.role !== "admin") return;
  const rows = filtered();
  const head = ["Received", "Name", "Mobile", "Location", "Interest", "Source", "Status", "Next follow-up", "Last message", "Updated by", "Updated at"];
  const lines = [head.join(",")];
  for (const l of rows) {
    lines.push([
      new Date(l.created_at).toISOString(), l.name, l.mobile ? `+91${l.mobile}` : "", l.location, l.interest,
      l.source, l.status, l.next_follow_up, l.last_message, l.updated_by, l.updated_at
    ].map(csvCell).join(","));
  }
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = el("a", { href: URL.createObjectURL(blob), download: `solarfi-leads-${localDateStr(new Date())}.csv` });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

boot().catch(() => {
  show("viewLogin");
  setAlert("authAlert", "error", "Couldn't reach the sign-in service. Check your connection and reload.");
});
