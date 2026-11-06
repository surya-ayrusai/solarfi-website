-- =====================================================================
-- Inquiry intake (Phase 1): make "quote-chase-board" the leads table.
-- DRAFT — do not run until the column comparison has been reviewed.
--
-- Additive only: it ADDS missing columns, indexes and constraints. It never
-- drops, renames or retypes an existing column. Step 0 aborts the whole
-- migration if an existing column has the same name but an incompatible type,
-- so nothing is changed silently.
-- =====================================================================
begin;

-- 0. Safety check against existing columns ------------------------------
do $$
declare
  expected jsonb := '{
    "id":"uuid","lead_id":"uuid","created_at":"timestamptz","name":"text","mobile":"text",
    "email":"text","city_area":"text","property_type":"text","monthly_units_kwh":"int4",
    "monthly_bill_inr":"numeric","roof_area_sqft":"int4","estimated_kw":"numeric",
    "estimate_method":"text","routing_queue":"text","message":"text","source":"text",
    "status":"text","is_duplicate":"bool","assigned_to":"text","consent_at":"timestamptz",
    "client_request_id":"uuid","raw_payload":"jsonb"}';
  r record;
  problems text := '';
begin
  for r in
    select column_name, udt_name from information_schema.columns
    where table_schema = 'public' and table_name = 'quote-chase-board'
      and expected ? column_name and udt_name <> expected ->> column_name
  loop
    problems := problems || format(E'\n  %s is %s, expected %s', r.column_name, r.udt_name, expected ->> r.column_name);
  end loop;
  if problems <> '' then
    raise exception 'Column type conflicts in "quote-chase-board" (nothing changed):%', problems;
  end if;
end $$;

-- 1. Missing columns ------------------------------------------------------
alter table public."quote-chase-board"
  add column if not exists id                uuid default gen_random_uuid(),
  add column if not exists lead_id           uuid,
  add column if not exists created_at        timestamptz,
  add column if not exists name              text,
  add column if not exists mobile            text,
  add column if not exists email             text,
  add column if not exists city_area         text,
  add column if not exists property_type     text,
  add column if not exists monthly_units_kwh integer,
  add column if not exists monthly_bill_inr  numeric,
  add column if not exists roof_area_sqft    integer,
  add column if not exists estimated_kw      numeric(4,1),
  add column if not exists estimate_method   text,
  add column if not exists routing_queue     text,
  add column if not exists message           text,
  add column if not exists source            text,
  add column if not exists status            text,
  add column if not exists is_duplicate      boolean,
  add column if not exists assigned_to       text,
  add column if not exists consent_at        timestamptz,
  add column if not exists client_request_id uuid,
  add column if not exists raw_payload       jsonb;

-- Defaults apply to NEW rows only. Adding the columns above without a default
-- leaves existing quote-chase rows as NULL instead of mislabelling them as
-- fresh website leads. (Existing defaults on existing columns are kept.)
do $$
declare d record;
begin
  for d in select * from (values ('created_at', 'now()'), ('source', '''website-contact'''),
                                 ('status', '''new'''), ('is_duplicate', 'false')) v(col, def)
  loop
    if (select column_default from information_schema.columns
        where table_schema = 'public' and table_name = 'quote-chase-board' and column_name = d.col) is null then
      execute format('alter table public."quote-chase-board" alter column %I set default %s', d.col, d.def);
    end if;
  end loop;
end $$;

-- NOT NULL rules from the data model, enforced for website rows (they always
-- carry client_request_id). NOT VALID: existing quote-chase rows are not checked.
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'qcb_website_lead_required') then
    alter table public."quote-chase-board" add constraint qcb_website_lead_required check (
      client_request_id is null or (
        name is not null and mobile is not null and city_area is not null
        and property_type is not null and monthly_units_kwh is not null
        and routing_queue is not null and consent_at is not null)
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'qcb_routing_queue_chk') then
    alter table public."quote-chase-board" add constraint qcb_routing_queue_chk
      check (routing_queue is null or routing_queue in ('call', 'site_visit')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'qcb_status_chk') then
    alter table public."quote-chase-board" add constraint qcb_status_chk
      check (status is null or status in ('new', 'contacted', 'site_survey', 'proposal', 'won', 'lost')) not valid;
  end if;
end $$;

-- 2. Uniqueness and lookups (idempotency + 24h duplicate check) ------------
create unique index if not exists qcb_lead_id_key           on public."quote-chase-board" (lead_id);
create unique index if not exists qcb_client_request_id_key on public."quote-chase-board" (client_request_id);
create index        if not exists qcb_mobile_created_idx    on public."quote-chase-board" (mobile, created_at desc);
create index        if not exists qcb_created_at_idx        on public."quote-chase-board" (created_at desc);

-- 3. Row Level Security: no public access; only service_role (n8n) writes --
alter table public."quote-chase-board" enable row level security;
revoke all on public."quote-chase-board" from anon, authenticated;
grant select, insert, update on public."quote-chase-board" to service_role;
-- No policies are created: anon/authenticated see nothing. Phase 2 adds an
-- authenticated-admin SELECT/UPDATE policy (e.g. using public.is_admin()).

commit;
