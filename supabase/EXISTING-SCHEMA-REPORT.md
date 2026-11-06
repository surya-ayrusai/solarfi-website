# Existing Supabase schema vs. the inquiry data model

Inspected 2026-11-06, read-only, in project `csikpgbacngeivttoejo` (Postgres 17.11, Free plan).

## Key finding

**`quote-chase-board` is the project's name, not a table.** The `public` schema has one table: **`quotes`**, with 13 columns and 12 rows. There is no `leads` table. The repo's `supabase/schema.sql` (from the `/admin` commit) has never been run on this project.

## `public.quotes` as it is today

| # | Column | Type | Null | Default |
|---|---|---|---|---|
| 1 | id | uuid (PK) | not null | gen_random_uuid() |
| 2 | created_at | timestamptz | not null | now() |
| 3 | customer_name | text | not null, check: not blank | |
| 4 | phone | text | null | |
| 5 | system_kw | numeric | not null, check: > 0 | |
| 6 | quote_value_paise | int8 | not null, check: > 0 | |
| 7 | sent_on | date | not null | |
| 8 | status | text | not null, check: open / won / lost | 'open' |
| 9 | paid_paise | int8 | not null, check: 0 ≤ paid ≤ value | 0 |
| 10 | last_reply_at | timestamptz | null | |
| 11 | won_at | timestamptz | null | |
| 12 | last_activity_at | timestamptz | null | |
| 13 | last_activity_note | text | null | |

- Indexes: `quotes_pkey` only.
- RLS is enabled, but the four policies (`quotes_select_all`, `quotes_insert_all`, `quotes_update_all`, `quotes_delete_all`) all apply to **`anon, authenticated`** with `using true` / `check true`.
- Grants: anon, authenticated, service_role and postgres all have full privileges.
- No triggers.

## How it compares with the inquiry data model

`quotes` is a tracker for following up on sent quotes. It is not a table for inquiries.

| Data model needs | `quotes` has | Conflict |
|---|---|---|
| A lead with no quote yet | `quote_value_paise` NOT NULL > 0, `sent_on` NOT NULL | **Blocking.** Every inquiry insert would fail unless these NOT NULLs are dropped. |
| `estimated_kw` may round to 0 (e.g. 20 kWh/month) | `system_kw` NOT NULL, > 0 | **Blocking** for small leads. |
| status: new, contacted, site_survey, proposal, won, lost | status: open, won, lost (check constraint) | **Blocking.** The check would have to be replaced, which changes what the quote-chase app accepts. |
| `name` | `customer_name` | Different name, same meaning |
| `mobile` (+91XXXXXXXXXX) | `phone` (no format rule) | Different name |
| No public read or write; only n8n writes | anon can SELECT / INSERT / UPDATE / DELETE every row | **Blocking.** Website leads (names, mobiles, emails) would be readable and deletable by anyone holding the public anon key. Fixing that would change how whatever app uses `quotes` today gets its access. |
| lead_id, email, city_area, property_type, monthly_units_kwh, monthly_bill_inr, roof_area_sqft, estimate_method, routing_queue, message, source, is_duplicate, assigned_to, consent_at, client_request_id, raw_payload | — | Missing (adding them is fine on its own) |

## Separate security note (outside this build)

Because of the four `*_all` policies, anyone with the project's anon key can read, change or delete all 12 quotes. If a quote-chase app is meant to be private, those policies need tightening. Nothing has been changed.
