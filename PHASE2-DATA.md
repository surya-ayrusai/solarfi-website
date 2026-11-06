# Phase 2 data reference

What the Phase 2 dashboard reads and writes, and the rules behind every number on it. Supabase project `csikpgbacngeivttoejo`. Last updated 2026-11-06.

There is no admin page and no login in this phase. Staff open `/dashboard/` and type a shared access key once per browser. The old `/admin` folder is not used.

## How the pieces connect

```
Browser (/dashboard)  --x-solarfi-dash-key-->  n8n "Solarfi Dashboard API"  --service role-->  Supabase
                                                (checks key + origin)                         leads, customer_data
Website form  --x-solarfi-key-->  n8n "Solarfi Inquiry Intake"  -->  Supabase leads + Leads sheet + email
```

- The browser never holds a database key. The Supabase service-role key exists only in the n8n credential "Supabase account".
- n8n stores the SHA-256 hash of the dashboard key, not the key itself. The key is in `.env.local` (`SOLARFI_DASH_KEY`, gitignored).
- The public form key (`x-solarfi-key`) cannot read or change anything through the dashboard API.

## Table `public.leads` (website enquiries)

Written by the intake workflow. The dashboard reads it and changes `status` only.

| Column | Type | Meaning |
|---|---|---|
| lead_id | uuid | Public ID of the lead; the reference on the thank-you message is its first 8 characters |
| created_at | timestamptz | When the enquiry arrived |
| name, mobile, email, city_area | text | As the visitor typed them. `mobile` is normalised to `+91XXXXXXXXXX` |
| property_type | text | home, shop, commercial, industrial, government, other |
| monthly_units_kwh | int | 20 to 10,000 |
| monthly_bill_inr, roof_area_sqft | numeric / int | Optional |
| estimated_kw | numeric | units / 120, rounded to the nearest 0.5 kW |
| routing_queue | text | `call` (home, shop, other) or `site_visit` (the rest) |
| message | text | Optional, up to 1000 characters |
| status | text | Pipeline stage (below). Changed from the dashboard |
| is_duplicate | bool | Same mobile sent another enquiry in the 24 hours before |
| client_request_id | uuid | Idempotency key from the browser |
| consent_at, source, assigned_to, raw_payload | | Audit fields; not shown on the dashboard |

### Lead status pipeline

Enforced by the check constraint `leads_status_check` (migration `20261106_lead_status_pipeline.sql`).

| Value | Shown as | Meaning |
|---|---|---|
| new | New | Arrived, nobody has called yet. Every website lead starts here |
| call | Call | First call made or in progress |
| site_visit | Site visit | Survey booked or done |
| quotation_sent | Quotation sent | Quote with the customer |
| installation | Installation | Order won; installation under way |
| delivery | Delivery | Installed; handover and commissioning |
| delivered | Delivered | Complete. Closed |
| lost | Lost | Customer said no or went silent. Closed |

Old values were mapped across: contacted → call, site_survey → site_visit, proposal → quotation_sent, won → installation.

There is no status history yet: the table keeps only the current status. Days "waiting" are counted from `created_at`.

## Table `public.customer_data` (existing customers)

Imported from the Google Sheet "solarfi_customer_data" (92 rows on 2026-11-06). New rows added to the sheet are copied in by the n8n workflow "Solarfi Customer Sheet Sync" (below). The dashboard only reads this table.

| Column | Type | Meaning |
|---|---|---|
| customer_id | uuid | Stable ID |
| name, billing_address, company_name | text | From the sheet |
| mobile | text | `+91XXXXXXXXXX`, or null (10 rows had no valid number) |
| gstin | text | 15 characters, 6 rows |
| pan_no | text | 3 rows. **Never sent to the dashboard** |
| closing_balance_inr | numeric | From "Closing Balance". **Positive = customer owes Solarfi. Negative = advance paid** |
| net_balance_inr | numeric | From "Net Balance as of today" (identical to closing balance at import) |
| enquiry_date, installed_date, kw_system, tags, customer_group | | Empty in the sheet today; kept for later |
| source | text | `sheet-import` (first copy) or `sheet-sync` (added later by the sync) |
| source_row | int | Row number in the sheet when it was copied (header = 1) |

## Dashboard numbers

### Leads page

| Number | Rule |
|---|---|
| Open leads | Status is not `delivered` or `lost` |
| Needs chase (red row) | Status is still `new` one day or more after `created_at` |
| Pipeline size | Sum of `estimated_kw` over open leads |
| Delivered | Count of `delivered`; the line under it counts `lost` |

### Customers page

| Number | Rule | At import |
|---|---|---|
| Money to collect | Sum of positive `closing_balance_inr` | ₹10,07,550 from 11 customers |
| Opening balance | Sum of `closing_balance_inr` over all customers (net) | −₹2,07,252 |
| Advances held | Sum of negative balances, shown as a positive amount | ₹12,14,802 from 6 customers |
| Needs chase (red row) | `closing_balance_inr` > 0 | 11 rows |

"Opening balance" means the sheet's closing balance at import. The sheet has no separate opening-balance column.

### Leads to customers page

A website lead and a customer match when their mobile numbers are the same (both stored as `+91XXXXXXXXXX`). One row per matching mobile number, showing every lead and customer record that share it. Customers with no mobile on file (10 at import) can never match.

| Number | Rule |
|---|---|
| Leads converted | Mobile numbers that appear in both leads and customer_data |
| Conversion rate | Leads converted ÷ distinct lead mobile numbers |
| Converted capacity | Customer `kw_system` where filled in, else the latest lead's `estimated_kw` |
| To collect from them | Sum of positive balances of the matched customers |
| Stage to update (flag) | Matched, but the latest lead is not at installation, delivery or delivered |

## Customer sheet sync (n8n "Solarfi Customer Sheet Sync")

- **When it runs:** n8n's Google Sheets Trigger checks the sheet every minute and starts a run only when rows have been added. Checks that find nothing do not start a run.
- **What it copies:** each run reads the whole sheet and inserts customers not yet in the table. A customer is "already there" when the same name (ignoring case and spacing) and the same mobile exist. It never updates or deletes existing rows. Editing a balance in the sheet does not change the table.
- **Clean-up:** the same rules as the first import. Mobiles become `+91XXXXXXXXXX`, "-2,00,000.00" becomes -200000, and dates are read day first (15/08/2026).
- **Bad rows:** a row with no name, a malformed GSTIN or PAN, or an unreadable amount or date is skipped. It is emailed once to info@solarfi.in and copied once fixed.
- **Failures:** the insert is all-or-nothing. A failure is emailed, and the next added row retries everything.

Built from `n8n/build-customer-sync-workflow.mjs` (logic in `n8n/code/customer-sync.js`, tests in `tests/customer-sync.test.mjs`).

## Dashboard API

`POST https://ayrusai.app.n8n.cloud/webhook/solarfi-dashboard` with headers `content-type: application/json` and `x-solarfi-dash-key: <key>`, from an allowed origin (solarfi.in, www.solarfi.in, solarfi-website.vercel.app).

| Body | Response |
|---|---|
| `{"action":"leads"}` | `{ ok, leads: [...] }`, newest first, up to 1000 |
| `{"action":"customers"}` | `{ ok, customers: [...] }`, highest balance first, without PAN |
| `{"action":"set_status","lead_id":"<uuid>","status":"call"}` | `{ ok, lead: { lead_id, status } }` |

Errors: 401 wrong or missing key · 403 origin not allowed · 400 bad JSON or unknown action · 422 invalid lead_id or status · 404 lead not found · 502 database error.

Built from `n8n/build-dashboard-workflow.mjs`, which writes `n8n/solarfi-dashboard-api.json` (credentials and real key hash left out). Tests: `node --test tests/*.test.mjs`.

## Not in Phase 2

- Per-person logins, roles and an audit trail of who changed what
- Status history or timestamps per stage
- Editing customer balances or logging payments
- Copying edits to existing rows from the customer sheet (only new rows are copied)
- Reminders by email or WhatsApp
