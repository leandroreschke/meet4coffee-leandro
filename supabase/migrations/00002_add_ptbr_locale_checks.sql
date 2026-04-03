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
