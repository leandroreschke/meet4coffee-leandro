-- Add email and preferred_locale to member_profiles
alter table public.member_profiles
  add column if not exists email text,
  add column if not exists preferred_locale text default 'en' not null
    check (preferred_locale in ('en', 'es', 'pt-br'));

-- Backfill email from auth.users for existing rows
update public.member_profiles mp
set email = u.email
from auth.users u
where mp.user_id = u.id
  and mp.email is null;

-- Trigger to auto-populate email on insert from auth.users
create or replace function public.set_member_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    select email into new.email
    from auth.users
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists member_profiles_set_email on public.member_profiles;
create trigger member_profiles_set_email
  before insert on public.member_profiles
  for each row execute function public.set_member_profile_email();

-- Drop the now-redundant profiles table
drop table if exists public.profiles;
