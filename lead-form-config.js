/*
 * Contact Us form -> n8n webhook settings. See SETUP.md.
 *
 * webhookUrl: the n8n PRODUCTION webhook URL of "Solarfi Inquiry Intake".
 * formKey:    sent as the `x-solarfi-key` header. It ships to every visitor's
 *             browser, so treat it as a spam filter, not a secret. Rotate it
 *             in n8n ($vars.SOLARFI_FORM_KEY) and here together.
 *
 * NEVER put the Supabase service_role key, n8n API key or any Google
 * credential in this file. They live only in n8n credentials.
 */
window.SOLARFI_LEAD_FORM_CONFIG = {
  webhookUrl: "https://ayrusai.app.n8n.cloud/webhook/solarfi-inquiry",
  formKey: "REPLACE_WITH_FORM_KEY",
  timeoutMs: 20000,
  whatsappNumber: "917358258385"
};
