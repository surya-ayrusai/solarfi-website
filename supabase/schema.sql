-- =====================================================================
-- Solarfi admin: tables, indexes and Row Level Security (RLS)
-- Paste the whole file into Supabase -> SQL Editor -> New query -> Run.
-- Safe to re-run: it uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Who may use the admin area
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  email      text primary key check (email = lower(email)),
  role       text not null default 'staff' check (role in ('admin', 'staff')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- EDIT THIS LIST before running. Only these addresses can see leads.
-- (Each person must ALSO be invited under Authentication -> Users.)
insert into public.admin_users (email, role) values
  ('info.solarfi@gmail.com', 'admin')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------
-- 2. Leads and notes
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text,
  mobile         text check (mobile is null or mobile ~ '^[6-9][0-9]{9}$'),
  location       text,
  interest       text,
  source         text not null default 'chat' check (source in ('chat', 'form', 'phone', 'other')),
  last_message   text,
  status         text not null default 'New'
                 check (status in ('New', 'Contacted', 'Survey booked', 'Quote sent', 'Won', 'Lost')),
  next_follow_up date,
  session_id     text,
  updated_at     timestamptz not null default now(),
  updated_by     text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_mobile_idx     on public.leads (mobile);
create index if not exists leads_status_idx     on public.leads (status);

create table if not exists public.lead_notes (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads (id) on delete cascade,
  author_email text not null,
  note         text not null check (char_length(note) between 1 and 2000),
  created_at   timestamptz not null default now()
);

create index if not exists lead_notes_lead_idx on public.lead_notes (lead_id, created_at desc);

-- ---------------------------------------------------------------------
-- 3. Helpers
-- ---------------------------------------------------------------------
-- Email of the signed-in user, from the Supabase JWT (lower-cased).
create or replace function public.current_email()
returns text language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- true if the signed-in user is an active admin/staff member.
-- SECURITY DEFINER so it can read admin_users without exposing that table.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where email = public.current_email() and active
  )
$$;

-- 'admin', 'staff' or null for the signed-in user.
create or replace function public.admin_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.admin_users
  where email = public.current_email() and active
$$;

-- Normalise mobile numbers (+91 / 0 / spaces) and stamp updates.
create or replace function public.leads_before_write()
returns trigger language plpgsql as $$
begin
  if new.mobile is not null then
    new.mobile := regexp_replace(new.mobile, '\D', '', 'g');
    if length(new.mobile) = 12 and left(new.mobile, 2) = '91' then
      new.mobile := right(new.mobile, 10);
    elsif length(new.mobile) = 11 and left(new.mobile, 1) = '0' then
      new.mobile := right(new.mobile, 10);
    end if;
  end if;
  new.updated_at := now();
  -- current_email() is '' for the service role (n8n), so keep what n8n sent.
  if public.current_email() <> '' then
    new.updated_by := public.current_email();
  end if;
  return new;
end $$;

drop trigger if exists leads_before_write on public.leads;
create trigger leads_before_write
  before insert or update on public.leads
  for each row execute function public.leads_before_write();

-- Notes always carry the real author, whatever the browser sends.
create or replace function public.notes_before_insert()
returns trigger language plpgsql as $$
begin
  if public.current_email() <> '' then
    new.author_email := public.current_email();
  end if;
  return new;
end $$;

drop trigger if exists notes_before_insert on public.lead_notes;
create trigger notes_before_insert
  before insert on public.lead_notes
  for each row execute function public.notes_before_insert();

-- ---------------------------------------------------------------------
-- 4. Row Level Security: the real lock
-- ---------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.leads       enable row level security;
alter table public.lead_notes  enable row level security;

-- Nobody without a login gets anything.
revoke all on public.admin_users, public.leads, public.lead_notes from anon;
-- Signed-in users get only what the policies below allow; never DELETE.
revoke all on public.admin_users, public.leads, public.lead_notes from authenticated;
grant select, insert, update on public.leads      to authenticated;
grant select, insert         on public.lead_notes to authenticated;
grant select, update         on public.admin_users to authenticated;
-- n8n writes leads with the service_role key (server side only; bypasses RLS).
grant select, insert, update on public.leads, public.lead_notes to service_role;
revoke execute on function public.is_admin(), public.admin_role(), public.current_email() from public, anon;
grant execute on function public.is_admin(), public.admin_role(), public.current_email() to authenticated, service_role;

-- leads
drop policy if exists leads_select on public.leads;
drop policy if exists leads_insert on public.leads;
drop policy if exists leads_update on public.leads;
create policy leads_select on public.leads for select to authenticated using (public.is_admin());
create policy leads_insert on public.leads for insert to authenticated with check (public.is_admin());
create policy leads_update on public.leads for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- lead_notes
drop policy if exists notes_select on public.lead_notes;
drop policy if exists notes_insert on public.lead_notes;
create policy notes_select on public.lead_notes for select to authenticated using (public.is_admin());
create policy notes_insert on public.lead_notes for insert to authenticated
  with check (public.is_admin() and author_email = public.current_email());

-- admin_users: staff see only themselves; admins see everyone and can
-- deactivate/reactivate or change roles (adding users stays in the SQL editor).
drop policy if exists admins_select on public.admin_users;
drop policy if exists admins_update on public.admin_users;
create policy admins_select on public.admin_users for select to authenticated
  using (email = public.current_email() or public.admin_role() = 'admin');
create policy admins_update on public.admin_users for update to authenticated
  using (public.admin_role() = 'admin') with check (public.admin_role() = 'admin');

-- =====================================================================
-- 5. Self-test (optional). Run separately AFTER the above; it rolls back.
-- =====================================================================
-- begin;
--   insert into public.leads (name, mobile, location) values ('RLS test', '9876543210', 'Test');
--   -- a) not signed in: expect 0 rows / permission denied
--   set local role anon;
--   select count(*) from public.leads;
--   reset role;
--   -- b) signed in but NOT on the list: expect 0
--   set local role authenticated;
--   set local request.jwt.claims = '{"email":"stranger@example.com","role":"authenticated"}';
--   select count(*) from public.leads;
--   -- c) signed in AND on the list: expect >= 1
--   set local request.jwt.claims = '{"email":"info.solarfi@gmail.com","role":"authenticated"}';
--   select count(*) from public.leads;
-- rollback;
