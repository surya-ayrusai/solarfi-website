/**
 * n8n-chat.js - Solarfi website chatbot
 *
 * Front end for the n8n "Chat Trigger" workflow (the AI agent + Solarfi
 * knowledge base live in n8n; this file only renders the chat and adds
 * voice). Every question, typed or spoken, goes to the same webhook, so
 * answers always come from the same knowledge-base pipeline.
 *
 * Features added on top of the official @n8n/chat widget:
 *  - New Chat: unmounts the widget, drops the session id and mounts a fresh
 *    one, so no old messages, context or late replies leak into it.
 *  - Suggested questions on a fresh session.
 *  - Voice input (browser Web Speech API: English / Telugu / Hindi).
 *  - Voice replies (browser speechSynthesis) with auto-speak toggle,
 *    pause/resume, stop and replay.
 * No API keys or paid speech services are used.
 */
import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat@1.44.7/dist/chat.bundle.es.js";

const WEBHOOK_URL = "https://ayrusai.app.n8n.cloud/webhook/60896913-9d77-47a2-91a8-80355c8dcc1c/chat";
const SESSION_KEY = "n8n-chat/sessionId"; // key used by @n8n/chat itself
const PREFS_KEY = "solarfi-chat-prefs";

const SUGGESTIONS = [
  "How much subsidy can I get?",
  "What size system do I need?",
  "How does the installation process work?",
  "Do you give service after installation?"
];

const LANGS = [
  { code: "en-IN", label: "EN", name: "English" },
  { code: "te-IN", label: "తె", name: "Telugu" },
  { code: "hi-IN", label: "हि", name: "Hindi" }
];

const ICONS = {
  newChat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  speakerOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>',
  speakerOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4"/></svg>',
  stopSq: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5Z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
  replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>'
};

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */
const state = {
  app: null,
  token: 0,          // bumps on every new session; stale callbacks are ignored
  lastAnswer: "",
  status: null,      // { kind: 'listening'|'thinking'|'speaking'|'info'|'error', text }
  recognition: null,
  listening: false,
  speaking: false,
  paused: false,
  utterQueue: 0,
  prefs: { autoVoice: false, lang: "en-IN" }
};

try {
  const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
  if (typeof saved.autoVoice === "boolean") state.prefs.autoVoice = saved.autoVoice;
  if (LANGS.some(l => l.code === saved.lang)) state.prefs.lang = saved.lang;
} catch (e) { /* storage blocked: keep defaults */ }

function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(state.prefs)); } catch (e) { /* ignore */ }
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */
function addStyles(href) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}
addStyles("https://cdn.jsdelivr.net/npm/@n8n/chat@1.44.7/dist/style.css");
addStyles("n8n-chat.css");

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const $ = (sel, root = document) => root.querySelector(sel);

function windowEl() { return $("#n8n-chat .chat-window"); }
function isOpen() {
  const w = windowEl();
  return !!w && getComputedStyle(w).display !== "none" && w.offsetParent !== null;
}
function textarea() { return $("#n8n-chat .chat-window textarea"); }
function sendButton() { return $("#n8n-chat .chat-window .chat-input-send-button"); }

function setInputText(text) {
  const ta = textarea();
  if (!ta) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
  setter.call(ta, text);
  ta.dispatchEvent(new Event("input", { bubbles: true }));
}

function lastBotText() {
  const msgs = document.querySelectorAll("#n8n-chat .chat-message-from-bot:not(.chat-message-typing)");
  const last = msgs[msgs.length - 1];
  if (!last) return "";
  const md = last.querySelector(".chat-message-markdown") || last;
  return (md.innerText || "").trim();
}

function setStatus(kind, text, ttlMs) {
  state.status = kind ? { kind, text } : null;
  renderVoiceBar();
  if (ttlMs) {
    const snapshot = state.status;
    setTimeout(() => { if (state.status === snapshot) { state.status = null; renderVoiceBar(); } }, ttlMs);
  }
}

/* ------------------------------------------------------------------ */
/* Text to speech                                                      */
/* ------------------------------------------------------------------ */
const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

function detectLang(text) {
  if (/[ఀ-౿]/.test(text)) return "te-IN";
  if (/[ऀ-ॿ]/.test(text)) return "hi-IN";
  return "en-IN";
}

function pickVoice(lang) {
  if (!synth) return null;
  const voices = synth.getVoices() || [];
  const norm = v => (v.lang || "").replace("_", "-").toLowerCase();
  const exact = voices.filter(v => norm(v) === lang.toLowerCase());
  const base = lang.slice(0, 2);
  const family = voices.filter(v => norm(v).startsWith(base));
  const pool = exact.length ? exact : family;
  if (!pool.length) return null;
  const rank = v => (/(natural|neural|google|online)/i.test(v.name) ? 0 : 1) + (v.localService ? 0 : 0);
  return pool.slice().sort((a, b) => rank(a) - rank(b))[0];
}

function cleanForSpeech(text) {
  return text
    .replace(/https?:\/\/\S+/g, "the link in the chat")
    .replace(/[*_#`>|~]/g, "")
    .replace(/\+91[-\s]?(\d{5})(\d{5})/g, "+91 $1 $2")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function chunkText(text) {
  // Chrome stops long utterances after ~15s, so speak sentence by sentence.
  const parts = text.split(/(?<=[.!?।])\s+|\n+/).map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (out.length && (out[out.length - 1] + " " + p).length < 180) out[out.length - 1] += " " + p;
    else out.push(p);
  }
  return out;
}

function stopSpeaking() {
  if (synth) synth.cancel();
  state.speaking = false;
  state.paused = false;
  state.utterQueue = 0;
  if (state.status && state.status.kind === "speaking") state.status = null;
  renderVoiceBar();
}

function speak(text) {
  if (!text) return;
  if (!synth) { setStatus("error", "Voice replies are not supported in this browser.", 4000); return; }
  stopSpeaking();
  const lang = detectLang(text);
  const voice = pickVoice(lang);
  if (!voice && lang !== "en-IN") {
    const name = LANGS.find(l => l.code === lang)?.name || "this language";
    setStatus("info", `No ${name} voice on this device, so the answer is shown as text only.`, 5000);
    return;
  }
  const token = state.token;
  const chunks = chunkText(cleanForSpeech(text));
  state.utterQueue = chunks.length;
  state.speaking = true;
  state.paused = false;
  setStatus("speaking", "Speaking…");
  chunks.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c);
    u.lang = voice ? voice.lang : lang;
    if (voice) u.voice = voice;
    u.rate = 1;
    u.pitch = 1;
    const done = () => {
      if (token !== state.token) return;
      state.utterQueue = Math.max(0, state.utterQueue - 1);
      if (i === chunks.length - 1 || state.utterQueue === 0) {
        state.speaking = false;
        state.paused = false;
        if (state.status && state.status.kind === "speaking") state.status = null;
        renderVoiceBar();
      }
    };
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}

function togglePause() {
  if (!synth || !state.speaking) return;
  if (state.paused) { synth.resume(); state.paused = false; setStatus("speaking", "Speaking…"); }
  else { synth.pause(); state.paused = true; setStatus("speaking", "Paused"); }
}

if (synth && typeof synth.addEventListener === "function") {
  synth.addEventListener("voiceschanged", () => { /* voices load async; pickVoice reads them on demand */ });
}

/* ------------------------------------------------------------------ */
/* Speech to text                                                      */
/* ------------------------------------------------------------------ */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

function stopListening() {
  if (state.recognition) {
    try { state.recognition.onresult = null; state.recognition.onend = null; state.recognition.onerror = null; state.recognition.abort(); } catch (e) { /* ignore */ }
  }
  state.recognition = null;
  state.listening = false;
  if (state.status && state.status.kind === "listening") state.status = null;
  renderMic();
  renderVoiceBar();
}

// Chrome's speech recognition sends audio to Google. Chromium browsers
// without Google's speech service (Arc, Brave, Opera, some Edge builds)
// always fail with "network", so name the browser and suggest one that works.
function browserName() {
  try {
    if (getComputedStyle(document.documentElement).getPropertyValue("--arc-palette-title").trim()) return "Arc";
  } catch (e) { /* ignore */ }
  if (navigator.brave) return "Brave";
  if (/OPR\//.test(navigator.userAgent)) return "Opera";
  return "";
}
function networkMessage() {
  const name = browserName();
  return name
    ? `Voice input isn't available in ${name}. Please use Chrome, Edge or Safari, or type your question.`
    : "Voice input couldn't reach the speech service. Check your internet connection, or type your question.";
}

function startListening() {
  if (!SpeechRec) {
    setStatus("error", "Voice input works in Chrome, Edge and Safari. Please type your question here.", 6000);
    return;
  }
  if (!window.isSecureContext) {
    setStatus("error", "Voice input needs a secure (https) page.", 5000);
    return;
  }
  stopSpeaking();
  const token = state.token;
  const rec = new SpeechRec();
  rec.lang = state.prefs.lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  let finalText = "";
  rec.onresult = (ev) => {
    if (token !== state.token) return;
    let interim = "";
    finalText = "";
    for (let i = 0; i < ev.results.length; i++) {
      const r = ev.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    setInputText((finalText + interim).trim());
  };
  rec.onerror = (ev) => {
    if (token !== state.token) return;
    const msg = {
      "not-allowed": "Microphone access is blocked. Allow the microphone for this site in your browser settings.",
      "service-not-allowed": "Microphone access is blocked. Allow the microphone for this site in your browser settings.",
      "no-speech": "I didn't hear anything. Tap the mic and try again.",
      "audio-capture": "No microphone was found on this device.",
      "network": networkMessage(),
      "language-not-supported": "This language isn't supported for voice input here. Try English or type your question."
    }[ev.error];
    state.listening = false;
    renderMic();
    if (msg) setStatus("error", msg, 6000);
    else if (ev.error !== "aborted") setStatus("error", "Couldn't recognise that. Please try again or type.", 5000);
  };
  rec.onend = () => {
    if (token !== state.token) return;
    state.listening = false;
    state.recognition = null;
    renderMic();
    const text = (textarea()?.value || "").trim();
    if (text) {
      setStatus("info", "Check the text, then tap send.", 4000);
      textarea()?.focus();
    } else if (state.status && state.status.kind === "listening") {
      setStatus(null);
    }
  };
  try {
    rec.start();
    state.recognition = rec;
    state.listening = true;
    renderMic();
    const lang = LANGS.find(l => l.code === state.prefs.lang);
    setStatus("listening", `Listening (${lang ? lang.name : "English"})… tap the mic to stop`);
  } catch (e) {
    setStatus("error", "Couldn't start the microphone. Please try again.", 5000);
  }
}

function toggleMic() {
  if (state.listening) {
    try { state.recognition && state.recognition.stop(); } catch (e) { stopListening(); }
  } else {
    startListening();
  }
}

/* ------------------------------------------------------------------ */
/* Widget lifecycle                                                    */
/* ------------------------------------------------------------------ */
function mountChat(openAfter) {
  state.token += 1;
  const token = state.token;
  clearTimeout(state.replyTimer);
  state.lastAnswer = "";
  state.handledAnswer = "";
  if (!document.getElementById("n8n-chat")) {
    const host = document.createElement("div");
    host.id = "n8n-chat";
    document.body.appendChild(host);
  }
  try {
    state.app = createChat({
      webhookUrl: WEBHOOK_URL,
      target: "#n8n-chat",
      mode: "window",
      showWelcomeScreen: false,
      loadPreviousSession: true,
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      defaultLanguage: "en",
      initialMessages: [
        "Namaste! I'm the Solarfi assistant.",
        "Ask me about rooftop solar, the PM Surya Ghar subsidy, net metering or our installation process. You can type or tap the mic to speak."
      ],
      i18n: {
        en: {
          title: "Solarfi Assistant",
          subtitle: "Solar, subsidy & installation help",
          footer: "",
          getStarted: "New conversation",
          inputPlaceholder: "Type or tap the mic…",
          closeButtonTooltip: "Close chat"
        }
      },
      enableStreaming: true,
      beforeMessageSent: () => {
        if (token !== state.token) return;
        stopSpeaking();
        if (state.listening) stopListening();
        hideSuggestions();
        setStatus("thinking", "Thinking…");
      },
      afterMessageSent: () => {
        if (token !== state.token) return; // reply belongs to an old session
        // With streaming, n8n fires this once per agent step and again when the
        // stream ends, so wait for the calls to settle and handle each answer once.
        clearTimeout(state.replyTimer);
        state.replyTimer = setTimeout(() => {
          if (token !== state.token) return;
          const text = lastBotText();
          if (state.status && state.status.kind === "thinking") state.status = null;
          if (!text || text === state.handledAnswer) { renderVoiceBar(); return; }
          state.handledAnswer = text;
          state.lastAnswer = text;
          if (state.prefs.autoVoice) speak(text);
          else renderVoiceBar();
        }, 250);
      }
    });
  } catch (err) {
    console.warn("Solarfi chat could not start:", err);
    return;
  }
  if (openAfter) {
    setTimeout(() => {
      if (token !== state.token) return;
      const t = $("#n8n-chat .chat-window-toggle");
      if (t && !isOpen()) t.click();
    }, 30);
  }
}

function newChat() {
  const wasOpen = isOpen();
  stopListening();
  stopSpeaking();
  state.status = null;
  try { state.app && state.app.unmount(); } catch (e) { /* ignore */ }
  state.app = null;
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  const host = document.getElementById("n8n-chat");
  if (host) host.innerHTML = "";
  mountChat(wasOpen);
}

/* ------------------------------------------------------------------ */
/* Injected UI (header actions, mic, suggestions, voice bar)           */
/* ------------------------------------------------------------------ */
function button(cls, label, icon, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.setAttribute("aria-label", label);
  b.title = label;
  b.innerHTML = icon;
  b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); onClick(e); });
  return b;
}

function renderHeader(header) {
  if (header.querySelector(".sf-head")) return;
  const wrap = document.createElement("div");
  wrap.className = "sf-head";
  wrap.innerHTML = `
    <div class="sf-brand">
      <span class="sf-avatar" aria-hidden="true">${ICONS.sun}<i class="sf-avatar-wave"></i></span>
      <span class="sf-status"><i class="sf-dot" aria-hidden="true"></i>Online now</span>
    </div>`;
  const actions = document.createElement("div");
  actions.className = "sf-actions";

  const langBtn = button("sf-icon-btn sf-lang", "Voice language", "", () => {
    const i = LANGS.findIndex(l => l.code === state.prefs.lang);
    state.prefs.lang = LANGS[(i + 1) % LANGS.length].code;
    savePrefs();
    renderHeaderState();
    const l = LANGS.find(x => x.code === state.prefs.lang);
    setStatus("info", `Voice input language: ${l.name}`, 2500);
  });
  const voiceBtn = button("sf-icon-btn sf-voice-toggle", "Speak answers aloud", "", () => {
    state.prefs.autoVoice = !state.prefs.autoVoice;
    savePrefs();
    if (!state.prefs.autoVoice) stopSpeaking();
    renderHeaderState();
    setStatus("info", state.prefs.autoVoice ? "Answers will be read aloud." : "Voice replies off.", 2500);
  });
  const newBtn = button("sf-icon-btn sf-new", "Start a new chat", ICONS.newChat + '<span class="sf-new-label">New chat</span>', newChat);

  actions.append(langBtn, voiceBtn, newBtn);
  wrap.appendChild(actions);
  header.appendChild(wrap);
  renderHeaderState();
}

function renderHeaderState() {
  const lang = LANGS.find(l => l.code === state.prefs.lang) || LANGS[0];
  document.querySelectorAll("#n8n-chat .sf-lang").forEach(b => {
    b.textContent = lang.label;
    b.setAttribute("aria-label", `Voice input language: ${lang.name}. Tap to change.`);
    b.title = `Voice input language: ${lang.name}`;
  });
  document.querySelectorAll("#n8n-chat .sf-voice-toggle").forEach(b => {
    b.innerHTML = state.prefs.autoVoice ? ICONS.speakerOn : ICONS.speakerOff;
    b.setAttribute("aria-pressed", String(state.prefs.autoVoice));
    b.title = state.prefs.autoVoice ? "Voice replies on" : "Voice replies off";
  });
  const w = windowEl();
  if (w) w.classList.toggle("sf-is-speaking", state.speaking && !state.paused);
}

function renderMic() {
  document.querySelectorAll("#n8n-chat .sf-mic").forEach(b => {
    b.classList.toggle("is-listening", state.listening);
    b.innerHTML = state.listening ? ICONS.stopSq : ICONS.mic;
    b.setAttribute("aria-pressed", String(state.listening));
    b.setAttribute("aria-label", state.listening ? "Stop listening" : "Speak your question");
    b.title = state.listening ? "Stop listening" : "Speak your question";
  });
}

function ensureMic() {
  const send = sendButton();
  if (!send || send.parentElement.querySelector(".sf-mic")) return;
  const mic = button("sf-mic", "Speak your question", ICONS.mic, toggleMic);
  send.parentElement.insertBefore(mic, send);
  renderMic();
}

function hideSuggestions() {
  document.querySelectorAll("#n8n-chat .sf-suggest").forEach(n => n.remove());
}

function ensureSuggestions(footer) {
  const hasUser = !!$("#n8n-chat .chat-message-from-user");
  const existing = footer.querySelector(".sf-suggest");
  if (hasUser) { if (existing) existing.remove(); return; }
  if (existing) return;
  const box = document.createElement("div");
  box.className = "sf-suggest";
  box.setAttribute("role", "list");
  SUGGESTIONS.forEach(q => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "sf-chip";
    chip.setAttribute("role", "listitem");
    chip.textContent = q;
    chip.addEventListener("click", () => {
      setInputText(q);
      requestAnimationFrame(() => sendButton()?.click());
    });
    box.appendChild(chip);
  });
  footer.insertBefore(box, footer.firstChild);
}

function ensureVoiceBar(footer) {
  if (footer.querySelector(".sf-voicebar")) return;
  const bar = document.createElement("div");
  bar.className = "sf-voicebar";
  bar.setAttribute("aria-live", "polite");
  bar.innerHTML = `
    <span class="sf-vb-status"><i class="sf-eq" aria-hidden="true"><b></b><b></b><b></b><b></b></i><span class="sf-vb-text"></span></span>
    <span class="sf-vb-actions"></span>`;
  const actions = bar.querySelector(".sf-vb-actions");
  actions.append(
    button("sf-vb-btn sf-vb-pause", "Pause or resume voice", ICONS.pause, togglePause),
    button("sf-vb-btn sf-vb-stop", "Stop voice", ICONS.stopSq, stopSpeaking),
    button("sf-vb-btn sf-vb-replay", "Read the last answer aloud", ICONS.replay + "<span>Listen</span>", () => speak(state.lastAnswer || lastBotText()))
  );
  footer.insertBefore(bar, footer.querySelector(".sf-suggest") ? footer.querySelector(".sf-suggest").nextSibling : footer.firstChild);
  renderVoiceBar();
}

function renderVoiceBar() {
  const bar = $("#n8n-chat .sf-voicebar");
  renderHeaderState();
  if (!bar) return;
  const st = state.status;
  const hasAnswer = !!(state.lastAnswer || "").trim();
  const show = !!st || state.speaking || (hasAnswer && !!synth);
  bar.hidden = !show;
  bar.dataset.kind = st ? st.kind : (state.speaking ? "speaking" : "idle");
  bar.querySelector(".sf-vb-text").textContent = st ? st.text : (hasAnswer ? "Hear the last answer" : "");
  bar.querySelector(".sf-vb-pause").hidden = !state.speaking;
  bar.querySelector(".sf-vb-pause").innerHTML = state.paused ? ICONS.play : ICONS.pause;
  bar.querySelector(".sf-vb-stop").hidden = !state.speaking;
  bar.querySelector(".sf-vb-replay").hidden = state.speaking || !hasAnswer || !synth;
}

function enhance() {
  const w = windowEl();
  if (!w) return;
  w.classList.add("sf-chat");
  const header = $(".chat-header", w);
  if (header) renderHeader(header);
  const footer = $(".chat-footer", w);
  if (footer) {
    ensureSuggestions(footer);
    ensureVoiceBar(footer);
  }
  ensureMic();
}

let scheduled = false;
const observer = new MutationObserver(() => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; enhance(); });
});

function boot() {
  mountChat(false);
  observer.observe(document.body, { childList: true, subtree: true });
  enhance();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

window.addEventListener("pagehide", () => { stopListening(); stopSpeaking(); });
