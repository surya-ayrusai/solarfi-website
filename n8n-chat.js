/**
 * n8n-chat.js - Solarfi website chatbot (n8n Chat Trigger workflow)
 * Loads the official @n8n/chat widget from jsDelivr and mounts a floating
 * chat window on every page. Webhook = n8n "Chat Trigger" production URL.
 */
import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat@1.44.7/dist/chat.bundle.es.js";

const WEBHOOK_URL = "https://ayrusai.app.n8n.cloud/webhook/60896913-9d77-47a2-91a8-80355c8dcc1c/chat";

function addStyles(href) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

addStyles("https://cdn.jsdelivr.net/npm/@n8n/chat@1.44.7/dist/style.css");
addStyles("n8n-chat.css");

try {
  createChat({
    webhookUrl: WEBHOOK_URL,
    mode: "window",
    showWelcomeScreen: false,
    loadPreviousSession: true,
    chatInputKey: "chatInput",
    chatSessionKey: "sessionId",
    defaultLanguage: "en",
    initialMessages: [
      "Hi! I'm the Solarfi assistant.",
      "Ask me about rooftop solar savings, the PM Surya Ghar subsidy, or how installation works."
    ],
    i18n: {
      en: {
        title: "Solarfi Assistant",
        subtitle: "Ask about solar savings, subsidy & installation",
        footer: "",
        getStarted: "New conversation",
        inputPlaceholder: "Type your question…",
        closeButtonTooltip: "Close chat"
      }
    },
    enableStreaming: true
  });
} catch (err) {
  console.warn("Solarfi chat could not start:", err);
}
