-- =====================================================================
-- Inquiry intake (Phase 1): website leads table.
-- Creates public.leads. Does NOT touch public.quotes or anything else.
-- Safe to re-run (IF NOT EXISTS everywhere).
-- =====================================================================
begin;

create table if not exists public.leads (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid not null unique default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  name              text not null check (char_length(name) between 2 and 80),
  mobile            text not null check (mobile ~ '^\+91[6-9][0-9]{9}$'),
  email             text check (email is null or email = lower(email)),
  city_area         text not null check (char_length(city_area) between 2 and 80),
  property_type     text not null check (property_type in ('home', 'shop', 'commercial', 'industrial', 'government', 'other')),
  monthly_units_kwh integer not null check (monthly_units_kwh between 20 and 10000),
  monthly_bill_inr  numeric check (monthly_bill_inr is null or monthly_bill_inr >= 0),
  roof_area_sqft    integer check (roof_area_sqft is null or roof_area_sqft between 50 and 500000),
  estimated_kw      numeric(4,1) check (estimated_kw is null or estimated_kw >= 0),
  estimate_method   text,
  routing_queue     text not null check (routing_queue in ('call', 'site_visit')),
  message           text check (message is null or char_length(message) <= 1000),
  source            text not null default 'website-contact',
  status            text not null default 'new'
                    check (status in ('new', 'contacted', 'site_survey', 'proposal', 'won', 'lost')),
  is_duplicate      boolean not null default false,
  assigned_to       text,
  consent_at        timestamptz not null,
  client_request_id uuid unique,
  raw_payload       jsonb
);

comment on table public.leads is 'Website inquiries (Phase 1). Written only by n8n (service_role). Phase 2 admin reads via authenticated policies.';

-- 24h duplicate-mobile lookup and newest-first listing
create index if not exists leads_mobile_created_idx on public.leads (mobile, created_at desc);
create index if not exists leads_created_at_idx     on public.leads (created_at desc);
create index if not exists leads_status_idx         on public.leads (status);

-- Row Level Security: on, with NO policies, so anon/authenticated get nothing.
-- service_role (n8n only) bypasses RLS. Phase 2 adds an admin SELECT/UPDATE policy.
alter table public.leads enable row level security;
revoke all on public.leads from anon, authenticated;
grant select, insert, update on public.leads to service_role;

commit;
