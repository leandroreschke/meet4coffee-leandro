-- Drop assignment_policy from clubs
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.clubs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%assignment_policy%'
  loop
    execute format('alter table public.clubs drop constraint %I;', c.conname);
  end loop;
end;
$$;

alter table public.clubs drop column if exists assignment_policy;

-- Drop meeting_mode from clubs
do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.clubs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%meeting_mode%'
  loop
    execute format('alter table public.clubs drop constraint %I;', c.conname);
  end loop;
end;
$$;

alter table public.clubs drop column if exists meeting_mode;

-- Add is_ready flag to clubs
alter table public.clubs
  add column if not exists is_ready boolean not null default false;

-- Cron run logs for observability
create table if not exists public.cron_run_logs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  status text not null check (status in ('success', 'skipped', 'error')),
  error_message text,
  rounds_generated integer not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists cron_run_logs_job_created_idx on public.cron_run_logs (job_name, created_at desc);

alter table public.cron_run_logs enable row level security;

drop policy if exists "cron_run_logs_select_owner_only" on public.cron_run_logs;

create policy "cron_run_logs_select_owner_only" on public.cron_run_logs
for select using (
  workspace_id is not null
  and (select public.is_workspace_owner(workspace_id))
);

drop trigger if exists cron_run_logs_set_updated_at on public.cron_run_logs;

-- ---------------------------------------------------------------------------
-- pg_cron schedule — run this ONCE manually in the Supabase SQL editor.
-- Requires pg_cron + pg_net extensions (enable in Supabase dashboard first).
-- Replace <YOUR_APP_URL> and <YOUR_CRON_SECRET> with real values.
-- ---------------------------------------------------------------------------
--
-- select cron.schedule(
--   'generate-rounds-weekly',
--   '0 14 * * 1',   -- every Monday at 14:00 UTC (= 9 am ET)
--   $$
--     select net.http_post(
--       url     := '<YOUR_APP_URL>/api/cron/generate-rounds',
--       headers := jsonb_build_object(
--         'Content-Type',  'application/json',
--         'Authorization', 'Bearer <YOUR_CRON_SECRET>'
--       ),
--       body    := '{}'::jsonb
--     );
--   $$
-- );
--
-- To remove the job later:
--   select cron.unschedule('generate-rounds-weekly');
-- ---------------------------------------------------------------------------
