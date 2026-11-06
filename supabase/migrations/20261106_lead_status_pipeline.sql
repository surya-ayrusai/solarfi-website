-- Lead status pipeline for the Phase 2 dashboard (approved 2026-11-06).
-- Old: new, contacted, site_survey, proposal, won, lost
-- New: new -> call -> site_visit -> quotation_sent -> installation -> delivery -> delivered, plus lost
-- Existing rows are mapped across; website leads still start as 'new'.

begin;

alter table public.leads drop constraint if exists leads_status_check;

update public.leads set status = case status
  when 'contacted'   then 'call'
  when 'site_survey' then 'site_visit'
  when 'proposal'    then 'quotation_sent'
  when 'won'         then 'installation'
  else status end
where status in ('contacted', 'site_survey', 'proposal', 'won');

alter table public.leads add constraint leads_status_check
  check (status in ('new', 'call', 'site_visit', 'quotation_sent', 'installation', 'delivery', 'delivered', 'lost'));

comment on column public.leads.status is
  'Pipeline stage: new, call, site_visit, quotation_sent, installation, delivery, delivered, lost. Changed from the dashboard.';

commit;
