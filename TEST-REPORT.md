# Test report: inquiry intake, Phase 1

Run on 2026-11-06 against the live n8n workflow **Solarfi Inquiry Intake** (`n7eVuA1wr3sS6L50`), Supabase `public.leads`, and the "Solarfi Leads" Sheet.

- **Frontend:** served locally on `http://localhost:3000`. The Vercel deploy is known to be failing and is out of scope, so it was not used.
- **Build:** `npm run build` passes locally.
- **Test data:** leads are named `Test Lead Home` or `Etest …`, with mobiles `+91 90000 000xx`.

**Summary: 10 pass, 1 pass with deviation (malformed JSON returns 422, not 400; n8n platform behaviour), 0 fail.** Testing found two defects, both fixed and re-tested (see the end of this report).

| # | Test | Result | Evidence |
|---|---|---|---|
| 1 | Valid submission → one Supabase row and one Sheet row, same `lead_id`, correct `estimated_kw` / `routing_queue` | **Pass** | API: lead `1e7bb3eb…` (home, 300 kWh → 2.5 kW, `call`). Browser: success message "Your reference ID: 7C6E1997", one row `7c6e1997…`. The Sheet append returned the same `lead_id` and `id` as the Supabase insert (execution 171: `23de850c…`, 22 columns in table order). Every successful execution (171–174, 176–178) ran the Sheet append without error. |
| 2 | Each validation case → correct status and field error, zero rows | **Pass** | 422 with the matching field error for: units 19, units 10001, mobile 5…, `+1` mobile, name with digits, 81-char name, 1001-char message, property `farm`, no consent, bad email, roof 49, bad request ID. None of their mobiles appear in `leads`. In the browser, the same rules show inline errors before sending; a server 422 (browser check bypassed, name "Etest R2D2") shows inline under the name field, and no row was written for `…0022`. |
| 2b | Malformed JSON → 400 | **Pass with deviation** | Returns **422** `{"message":"Failed to parse request body"}` from n8n itself, before the workflow runs. Nothing written. |
| 3 | commercial → `site_visit`; home → `call` | **Pass** | commercial 1200 kWh → 10.0 kW `site_visit`; government 5000 → 41.5 `site_visit`; home 300 → 2.5 `call`; shop 450 → 4.0 `call`; industrial 8000 → 66.5 `site_visit`. |
| 4 | Honeypot filled → 200, zero rows | **Pass** | 200 `{ok:true, lead_id:…}` (a decoy ID). No row for mobile `…0015`. |
| 5 | Missing or wrong key → 401 | **Pass** | No header → 401 `unauthorized`; wrong key → 401. Also: a foreign `Origin` → 403 `origin_not_allowed` (localhost is rejected after cleanup). |
| 6 | 6th submission from one IP in an hour → 429, nothing written | **Pass** | With limit 5, over both IPv4 and IPv6: 429 `rate_limited` with the friendly message; the browser shows the same message. No rows for `…0023` / `…0024`. The exact 5-then-429 boundary is covered by the offline test `gate: 6th request from one IP in an hour is 429` (pass,pass,pass,pass,pass,429,429), which also checks that raw IPs are not stored. |
| 7 | Duplicate mobile → second row `is_duplicate = true` | **Pass** | `Etest Dup One` (`+919000000016`) `dup=false`; `Etest Dup Two` (sent as `+91-90000-00016`) `dup=true`. Both stored. |
| 8 | Same `client_request_id` twice → 200 both times, one row | **Pass** | Both responses had `lead_id` `1d1e590e-6fe1-…`; exactly one row for request `1628b769…`. In the browser, a retry after a failed attempt reused the ID and produced one row. |
| 9 | Forced Sheet failure → lead in Supabase, alert sent | **Pass** (after fix A) | Sheet ID set to a bogus value → Sheets error "resource … could not be found" → visitor got 200 → rows `94157db2…` and `6572a40a…` exist → Gmail returned `labelIds:["SENT"]` (execution 182). The alert text masks the mobile (`+9190XXXX0020`). |
| 10 | Forced Supabase failure → visitor sees error, no success, alert sent | **Pass** | Insert URL pointed at a missing table. The browser showed "Sorry, we couldn't send your request just now…" with WhatsApp and phone fallbacks, and no success message. Execution 183: Insert error → Recheck → Supabase alert `["SENT"]` → 500. No row written. After restoring the URL, clicking Submit again succeeded with one row. |
| 11 | Built frontend has no service key or Google credential | **Pass** | 76 tracked text files plus `dist/` scanned for Supabase JWTs, `sb_secret_`, service_role assignments, Google API keys, OAuth client secrets, private keys, service-account JSON, n8n API keys and GitHub tokens: none found. The form key was in no tracked file at test time. It was committed to `lead-form-config.js` afterwards, by decision, because it is public by design. |

## Offline tests

`node --test tests/*.test.mjs` → **12 pass, 0 fail**. They cover the validation rules, mobile normalisation, the kW estimate and routing, the security gate (401/403/400/429/honeypot), the pure-JS SHA-256 against Node's crypto, and the alert masking.

## Defects found by these tests (fixed)

- **A. Sheet-failure alert crashed, so the visitor got 500.** The alert node used `$node.name`, which n8n reads as "the node named `name`". Fixed by setting each alert node's stage at build time. The offline harness now behaves like n8n here, so this kind of bug is caught.
- **B. Mangled characters in the rate-limit message** ("You‚Äôve"). The workflow JSON was pasted through the macOS clipboard, which re-encoded it. Fixed in the live workflow, and the export is now ASCII-only (`\uXXXX` escapes) so any import method is safe.
- Also changed during testing:
  - Alerts now use the **Gmail account 2** credential; "Gmail account" returned *Forbidden*.
  - Errors in alert emails are no longer printed as `[object Object]`.

## Not covered

- **Vercel preview:** the deploy is failing, which is out of scope. Tested on a local server instead.
- **The automatic retry on Supabase insert** is configured (2 tries, 1 s apart) but can't be seen in n8n's run data. Only the final failure path was observed.
- **The Google Sheet was not viewed directly.** The rows were confirmed from n8n's append responses.
- **Test data left in place:** 12 test leads in `public.leads` and 9 Sheet rows (the 3 forced-Sheet-failure leads have no Sheet row, by design). Removing them is a deletion, so it is left for the owner to do.
