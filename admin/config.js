/*
 * Solarfi admin configuration.
 * Paste your Supabase values here (Supabase -> Project Settings -> API).
 *
 *  - supabaseUrl:     the "Project URL", e.g. https://abcd1234.supabase.co
 *  - supabaseAnonKey: the "anon public" key. It is SAFE to publish this key
 *                     because Row Level Security (supabase/schema.sql)
 *                     blocks everyone who is not on the admin list.
 *
 * NEVER put the "service_role" key here or anywhere in this repository.
 * It belongs only in n8n's credentials.
 */
window.SOLARFI_ADMIN_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT-REF.supabase.co",
  supabaseAnonKey: "YOUR-ANON-PUBLIC-KEY",
  // Sign staff out after this many hours without activity.
  inactivityTimeoutHours: 8
};
