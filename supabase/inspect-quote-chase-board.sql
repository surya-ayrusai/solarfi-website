-- READ-ONLY. Lists the current shape of "quote-chase-board" so it can be
-- compared with the inquiry data model before any migration runs.
select c.ordinal_position as pos, c.column_name, c.data_type, c.udt_name,
       c.is_nullable, c.column_default
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'quote-chase-board'
order by c.ordinal_position;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid = 'public."quote-chase-board"'::regclass;

select indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename = 'quote-chase-board';

select relrowsecurity as rls_enabled, (select count(*) from public."quote-chase-board") as row_count
from pg_class where oid = 'public."quote-chase-board"'::regclass;

select policyname, roles, cmd, qual, with_check from pg_policies
where schemaname = 'public' and tablename = 'quote-chase-board';

select grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'quote-chase-board'
group by grantee order by grantee;
