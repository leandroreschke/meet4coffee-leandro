do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%preferred_locale%'
  loop
    execute format('alter table public.profiles drop constraint %I;', c.conname);
  end loop;
end;
$$;

alter table public.profiles
  add constraint profiles_preferred_locale_check
  check (preferred_locale in ('en', 'es', 'pt-br'));

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.workspaces'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%default_locale%'
  loop
    execute format('alter table public.workspaces drop constraint %I;', c.conname);
  end loop;
end;
$$;

alter table public.workspaces
  add constraint workspaces_default_locale_check
  check (default_locale in ('en', 'es', 'pt-br'));

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.member_profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%language%'
  loop
    execute format('alter table public.member_profiles drop constraint %I;', c.conname);
  end loop;
end;
$$;

alter table public.member_profiles
  add constraint member_profiles_language_check
  check (language in ('en', 'es', 'pt-br'));

-- Fix: Allow members to update their own status (e.g., from pending_onboarding to active)
create or replace function public.can_self_update_workspace_member(
  member_row_id uuid,
  next_workspace_id uuid,
  next_user_id uuid,
  next_role text,
  next_invited_email text,
  next_seat_consuming boolean,
  next_status text
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members as existing
    where existing.id = member_row_id
      and existing.workspace_id = next_workspace_id
      and existing.user_id = next_user_id
      and existing.role = next_role
      and existing.invited_email is not distinct from next_invited_email
      and existing.seat_consuming = next_seat_consuming
      -- Allow status change from invited/pending_onboarding to active
      and (
        existing.status = next_status
        or (existing.status in ('invited', 'pending_onboarding') and next_status = 'active')
      )
  );
$$;
