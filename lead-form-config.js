/*
 * Contact Us form -> n8n webhook settings. See SETUP.md.
 *
 * webhookUrl: the n8n PRODUCTION webhook URL of "Solarfi Inquiry Intake".
 * formKey:    sent as the `x-solarfi-key` header. It ships to every visitor's
 *             browser, so it is a spam filter, not a secret. n8n stores only
 *             its SHA-256 (Intake Config -> FORM_KEY_SHA256). Rotate both
 *             together; see SETUP.md.
 *
 * NEVER put the Supabase service_role key, n8n API key or any Google
 * credential in this file. They live only in n8n credentials.
 */
window.SOLARFI_LEAD_FORM_CONFIG = {
  webhookUrl: "https://ayrusai.app.n8n.cloud/webhook/solarfi-inquiry",
  formKey: "4d9e96a4e5a608bccc3063caa7425ac910760f735065f3e0",
  timeoutMs: 20000,
  whatsappNumber: "917358258385"
};
