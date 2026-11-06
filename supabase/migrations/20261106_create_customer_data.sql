-- customer_data: existing Solarfi customers, imported from the Google Sheet
-- "solarfi_customer_data" (Sheet1, 13 columns). Separate from public.leads
-- (website inquiries). Holds PAN, GSTIN and account balances, so it is
-- private: RLS on with no policies, no access for anon/authenticated.
--
-- Sheet column        -> table column
--   Enquiry Date             -> enquiry_date
--   Name                     -> name
--   Billing Address          -> billing_address
--   Mobile                   -> mobile            (+91XXXXXXXXXX, null if not a valid number)
--   INSTALLED_DATE           -> installed_date
--   KW SYSTEM                -> kw_system
--   Company Name             -> company_name
--   GSTIN                    -> gstin
--   Closing Balance          -> closing_balance_inr   (Indian format "-2,00,000.00" -> -200000.00)
--   Net Balance as of today  -> net_balance_inr
--   Tags                     -> tags
--   PAN No.                  -> pan_no
--   Group                    -> customer_group    ("group" is a reserved word)

create table if not exists public.customer_data (
  id                  bigint generated always as identity primary key,
  customer_id         uuid not null unique default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  enquiry_date        date,
  name                text not null check (length(btrim(name)) between 1 and 120),
  billing_address     text,
  mobile              text check (mobile ~ '^\+91[6-9][0-9]{9}$'),
  installed_date      date,
  kw_system           numeric(8,2) check (kw_system > 0),
  company_name        text,
  gstin               text check (gstin ~ '^[0-9]{2}[A-Z0-9]{13}$'),
  closing_balance_inr numeric(14,2),
  net_balance_inr     numeric(14,2),
  tags                text,
  pan_no              text check (pan_no ~ '^[A-Z]{5}[0-9]{4}[A-Z]$'),
  customer_group      text,
  source              text not null default 'sheet-import',
  source_row          integer
);

comment on table public.customer_data is
  'Existing Solarfi customers (imported from Google Sheet solarfi_customer_data). Private: service_role only.';
comment on column public.customer_data.mobile is
  'Normalised +91XXXXXXXXXX, same format as leads.mobile. Null when the sheet had no valid number.';
comment on column public.customer_data.source_row is
  'Row number in the source sheet (header = row 1), for tracing an import back.';

create index if not exists customer_data_mobile_idx on public.customer_data (mobile);
create index if not exists customer_data_name_idx   on public.customer_data (lower(name));

-- keep updated_at current on edits
create or replace function public.customer_data_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists customer_data_touch_updated_at on public.customer_data;
create trigger customer_data_touch_updated_at
  before update on public.customer_data
  for each row execute function public.customer_data_touch_updated_at();

alter table public.customer_data enable row level security;
revoke all on public.customer_data from anon, authenticated;
grant select, insert, update on public.customer_data to service_role;
