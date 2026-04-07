create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  preferred_locale text default 'en' not null check (preferred_locale in ('en', 'es')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'UTC',
  workday_start text not null default '09:00',
  workday_end text not null default '17:00',
  default_locale text not null default 'en' check (default_locale in ('en', 'es')),
  owner_member_id uuid,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  status text not null check (status in ('invited', 'pending_onboarding', 'active', 'inactive')),
  invited_email text,
  seat_consuming boolean default true not null,
  joined_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (workspace_id, user_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workspaces_owner_member_id_fkey'
      and conrelid = 'public.workspaces'::regclass
  ) then
    alter table public.workspaces
      add constraint workspaces_owner_member_id_fkey
      foreign key (owner_member_id) references public.workspace_members(id) on delete set null;
  end if;
end;
$$;

create table if not exists public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  location text,
  job_title text,
  language text check (language in ('en', 'es')),
  bio text,
  slack_user_id text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (workspace_id, user_id)
);

create table if not exists public.member_availability_windows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  weekday text not null check (weekday in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  start_time text not null,
  end_time text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

insert into public.interests (name, slug)
values
  ('Product', 'product'),
  ('Design', 'design'),
  ('Engineering', 'engineering'),
  ('AI', 'ai'),
  ('Data', 'data'),
  ('Marketing', 'marketing'),
  ('Sales', 'sales'),
  ('Operations', 'operations'),
  ('Finance', 'finance'),
  ('Customer Success', 'customer-success'),
  ('Community', 'community'),
  ('Startups', 'startups'),
  ('Leadership', 'leadership'),
  ('Career Growth', 'career-growth'),
  ('Public Speaking', 'public-speaking'),
  ('Reading', 'reading'),
  ('Travel', 'travel'),
  ('Fitness', 'fitness'),
  ('Health', 'health'),
  ('Music', 'music')
on conflict (slug) do nothing;

create table if not exists public.member_interests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (workspace_id, user_id, interest_id)
);

create table if not exists public.interest_suggestions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null references public.workspace_members(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (group_id, member_id)
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  assignment_policy text not null check (assignment_policy in ('mandatory', 'optional')),
  visibility text not null check (visibility in ('public', 'hidden')),
  join_policy text not null check (join_policy in ('free_join', 'approval_required', 'owner_only')),
  meeting_mode text not null check (meeting_mode in ('single_shared', 'generated_groups')),
  meeting_link_provider text not null check (meeting_link_provider in ('google_meet')),
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly')),
  group_size_target integer not null default 2 check (group_size_target >= 2),
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  reminder_minutes_before integer not null default 30 check (reminder_minutes_before >= 0),
  calendar_event_enabled boolean not null default true,
  anchor_weekday text check (anchor_weekday in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  anchor_time text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.club_group_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (club_id, group_id)
);

create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  member_id uuid not null references public.workspace_members(id) on delete cascade,
  status text not null check (status in ('active', 'pending_approval', 'invited', 'left', 'removed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (workspace_id, club_id, member_id)
);

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_member_id uuid not null references public.workspace_members(id) on delete cascade,
  token_hash text not null unique,
  invited_email text,
  usage_limit integer,
  usage_count integer not null default 0,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.meeting_rounds (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  club_id uuid not null references public.clubs(id) on delete cascade,
  period_key text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'completed', 'canceled')),
  scheduled_for timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (club_id, period_key)
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  meeting_round_id uuid not null references public.meeting_rounds(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'canceled')),
  meeting_link_provider text not null check (meeting_link_provider in ('google_meet', 'zoom')),
  meeting_link_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.meeting_participants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  state text not null default 'pending' check (state in ('pending', 'confirmed', 'declined', 'canceled', 'attended')),
  rating integer check (rating between 1 and 5),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (meeting_id, member_id)
);

create table if not exists public.meeting_reschedule_proposals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  proposed_by_member_id uuid not null references public.workspace_members(id) on delete cascade,
  proposed_start_at timestamptz not null,
  proposed_end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.meeting_reschedule_responses (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  proposal_id uuid not null references public.meeting_reschedule_proposals(id) on delete cascade,
  member_id uuid not null references public.workspace_members(id) on delete cascade,
  response text not null check (response in ('accepted', 'rejected')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (proposal_id, member_id)
);

create table if not exists public.member_opt_outs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_member_id uuid not null references public.workspace_members(id) on delete cascade,
  target_member_id uuid not null references public.workspace_members(id) on delete cascade,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (workspace_id, source_member_id, target_member_id)
);

create table if not exists public.round_exclusions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  meeting_round_id uuid not null references public.meeting_rounds(id) on delete cascade,
  member_id uuid not null references public.workspace_members(id) on delete cascade,
  reason text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (meeting_round_id, member_id)
);

create table if not exists public.workspace_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  tier text not null default 'free' check (tier in ('free', 'premium', 'ultimate')),
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.stripe_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.workspace_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('slack', 'google_calendar')),
  status text not null default 'disconnected',
  external_workspace_id text,
  access_token text,
  refresh_token text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (workspace_id, provider)
);

create table if not exists public.meeting_external_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  provider text not null,
  external_id text,
  url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  actor_member_id uuid references public.workspace_members(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.content_authors (
  key text primary key,
  name text not null,
  bio text,
  avatar_path text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('blog', 'help')),
  slug text not null,
  title text not null,
  excerpt text,
  seo_title text,
  seo_description text,
  tags text[] not null default '{}',
  body_path text not null,
  cover_image_path text,
  author_key text references public.content_authors(key) on delete set null,
  is_published boolean not null default false,
  published_at timestamptz,
  is_archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (section, slug),
  check (not is_archived or archived_at is not null)
);

create index if not exists workspace_members_workspace_idx on public.workspace_members (workspace_id);
create index if not exists workspace_members_user_idx on public.workspace_members (user_id);
create unique index if not exists workspace_members_owner_user_unique
  on public.workspace_members (user_id)
  where role = 'owner';
create index if not exists member_profiles_workspace_idx on public.member_profiles (workspace_id);
create index if not exists member_profiles_user_idx on public.member_profiles (user_id);
create index if not exists availability_workspace_user_idx on public.member_availability_windows (workspace_id, user_id);
create index if not exists groups_workspace_idx on public.groups (workspace_id);
create index if not exists clubs_workspace_idx on public.clubs (workspace_id);
create index if not exists club_memberships_workspace_idx on public.club_memberships (workspace_id);
create index if not exists meetings_workspace_idx on public.meetings (workspace_id);
create index if not exists meeting_participants_workspace_idx on public.meeting_participants (workspace_id, member_id);
create index if not exists member_opt_outs_workspace_idx on public.member_opt_outs (workspace_id, source_member_id);
create index if not exists workspace_integrations_workspace_idx on public.workspace_integrations (workspace_id);
create index if not exists content_items_section_idx on public.content_items (section);
create index if not exists content_items_published_at_idx on public.content_items (published_at desc);
create index if not exists content_items_author_key_idx on public.content_items (author_key);
create index if not exists content_items_tags_gin_idx on public.content_items using gin (tags);

create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = ws_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.get_workspace_role(ws_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select role
    from public.workspace_members
   where workspace_id = ws_id
     and user_id = (select auth.uid())
   limit 1;
$$;

create or replace function public.is_workspace_owner(ws_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select public.get_workspace_role(ws_id) = 'owner'), false);
$$;

do $$
declare
  table_name text;
begin
  for table_name in
    select unnest(array[
      'profiles',
      'workspaces',
      'workspace_members',
      'member_profiles',
      'member_availability_windows',
      'interests',
      'member_interests',
      'interest_suggestions',
      'groups',
      'group_memberships',
      'clubs',
      'club_group_assignments',
      'club_memberships',
      'workspace_invites',
      'meeting_rounds',
      'meetings',
      'meeting_participants',
      'meeting_reschedule_proposals',
      'meeting_reschedule_responses',
      'member_opt_outs',
      'round_exclusions',
      'workspace_subscriptions',
      'stripe_events',
      'workspace_integrations',
      'meeting_external_links',
      'audit_logs',
      'content_authors',
      'content_items'
    ])
  loop
    execute format('alter table public.%I enable row level security;', table_name);
    execute format('drop trigger if exists %I_set_updated_at on public.%I;', table_name, table_name);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at();', table_name, table_name);
  end loop;
end;
$$;

create policy "profiles_select_self" on public.profiles
for select using ((select auth.uid()) = id);

create policy "profiles_insert_self" on public.profiles
for insert with check ((select auth.uid()) = id);

create policy "profiles_update_self" on public.profiles
for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "workspaces_select_member" on public.workspaces
for select using ((select public.is_workspace_member(id)));

create policy "workspaces_insert_authenticated" on public.workspaces
for insert with check ((select auth.uid()) is not null);

create policy "workspaces_update_owner_only" on public.workspaces
for update using ((select public.is_workspace_owner(id))) with check ((select public.is_workspace_owner(id)));

create policy "workspace_members_select_member" on public.workspace_members
for select using ((select public.is_workspace_member(workspace_id)));

create policy "workspace_members_insert_self" on public.workspace_members
for insert with check ((select auth.uid()) = user_id);

create or replace function public.can_self_update_workspace_member(
  member_row_id uuid,
  next_workspace_id uuid,
  next_user_id uuid,
  next_role text,
  next_invited_email text,
  next_seat_consuming boolean
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
  );
$$;

create policy "workspace_members_update_owner_or_self" on public.workspace_members
for update using (
  (select public.is_workspace_owner(workspace_id))
  or (select auth.uid()) = user_id
) with check (
  (
    (select auth.uid()) = user_id
    and (
      select public.can_self_update_workspace_member(
        id,
        workspace_id,
        user_id,
        role,
        invited_email,
        seat_consuming,
        status
      )
    )
  )
  or (select public.is_workspace_owner(workspace_id))
);

create policy "member_profiles_select_member" on public.member_profiles
for select using ((select public.is_workspace_member(workspace_id)));

create policy "member_profiles_insert_self" on public.member_profiles
for insert with check (
  (select public.is_workspace_member(workspace_id))
  and (select auth.uid()) = user_id
);

create policy "member_profiles_update_self_or_owner" on public.member_profiles
for update using (
  ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)))
  or (select public.is_workspace_owner(workspace_id))
) with check (
  ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)))
  or (select public.is_workspace_owner(workspace_id))
);

create policy "availability_select_member" on public.member_availability_windows
for select using ((select public.is_workspace_member(workspace_id)));

create policy "availability_insert_self" on public.member_availability_windows
for insert with check ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)));

create policy "availability_update_self" on public.member_availability_windows
for update using ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)))
with check ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)));

create policy "interests_select_authenticated" on public.interests
for select using ((select auth.uid()) is not null);

create policy "interests_insert_authenticated" on public.interests
for insert with check ((select auth.uid()) is not null);

create policy "member_interests_select_member" on public.member_interests
for select using ((select public.is_workspace_member(workspace_id)));

create policy "member_interests_insert_self" on public.member_interests
for insert with check ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)));

create policy "interest_suggestions_select_member" on public.interest_suggestions
for select using ((select public.is_workspace_member(workspace_id)));

create policy "interest_suggestions_insert_self" on public.interest_suggestions
for insert with check ((select auth.uid()) = user_id and (select public.is_workspace_member(workspace_id)));

create policy "groups_select_member" on public.groups
for select using ((select public.is_workspace_member(workspace_id)));

create policy "groups_write_owner_only" on public.groups
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "group_memberships_select_member" on public.group_memberships
for select using ((select public.is_workspace_member(workspace_id)));

create policy "group_memberships_write_owner_only" on public.group_memberships
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "clubs_select_member" on public.clubs
for select using ((select public.is_workspace_member(workspace_id)));

create policy "clubs_write_owner_only" on public.clubs
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "club_group_assignments_select_member" on public.club_group_assignments
for select using ((select public.is_workspace_member(workspace_id)));

create policy "club_group_assignments_write_owner_only" on public.club_group_assignments
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "club_memberships_select_member" on public.club_memberships
for select using ((select public.is_workspace_member(workspace_id)));

create policy "club_memberships_insert_member_or_owner" on public.club_memberships
for insert with check (
  (select public.is_workspace_owner(workspace_id))
  or exists (
    select 1
    from public.workspace_members wm
    where wm.id = member_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "club_memberships_update_member_or_owner" on public.club_memberships
for update using (
  (select public.is_workspace_owner(workspace_id))
  or exists (
    select 1
    from public.workspace_members wm
    where wm.id = member_id
      and wm.user_id = (select auth.uid())
  )
) with check (
  (select public.is_workspace_owner(workspace_id))
  or exists (
    select 1
    from public.workspace_members wm
    where wm.id = member_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "workspace_invites_select_owner_only" on public.workspace_invites
for select using ((select public.is_workspace_owner(workspace_id)));

create policy "workspace_invites_write_owner_only" on public.workspace_invites
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "meeting_rounds_select_member" on public.meeting_rounds
for select using ((select public.is_workspace_member(workspace_id)));

create policy "meeting_rounds_write_owner_only" on public.meeting_rounds
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "meetings_select_member" on public.meetings
for select using ((select public.is_workspace_member(workspace_id)));

create policy "meetings_write_owner_only" on public.meetings
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "meeting_participants_select_member" on public.meeting_participants
for select using ((select public.is_workspace_member(workspace_id)));

create policy "meeting_participants_insert_owner_only" on public.meeting_participants
for insert with check ((select public.is_workspace_owner(workspace_id)));

create policy "meeting_participants_update_self_or_owner" on public.meeting_participants
for update using (
  (select public.is_workspace_owner(workspace_id))
  or exists (
    select 1
    from public.workspace_members wm
    where wm.id = member_id
      and wm.user_id = (select auth.uid())
  )
) with check (
  (select public.is_workspace_owner(workspace_id))
  or exists (
    select 1
    from public.workspace_members wm
    where wm.id = member_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "meeting_reschedule_proposals_select_member" on public.meeting_reschedule_proposals
for select using ((select public.is_workspace_member(workspace_id)));

create policy "meeting_reschedule_proposals_insert_self" on public.meeting_reschedule_proposals
for insert with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.id = proposed_by_member_id
      and wm.user_id = (select auth.uid())
      and wm.workspace_id = meeting_reschedule_proposals.workspace_id
  )
);

create policy "meeting_reschedule_responses_select_member" on public.meeting_reschedule_responses
for select using ((select public.is_workspace_member(workspace_id)));

create policy "meeting_reschedule_responses_insert_self" on public.meeting_reschedule_responses
for insert with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.id = member_id
      and wm.user_id = (select auth.uid())
      and wm.workspace_id = meeting_reschedule_responses.workspace_id
  )
);

create policy "member_opt_outs_select_member" on public.member_opt_outs
for select using ((select public.is_workspace_member(workspace_id)));

create policy "member_opt_outs_insert_self" on public.member_opt_outs
for insert with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.id = source_member_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "member_opt_outs_delete_self" on public.member_opt_outs
for delete using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.id = source_member_id
      and wm.user_id = (select auth.uid())
  )
);

create policy "round_exclusions_select_member" on public.round_exclusions
for select using ((select public.is_workspace_member(workspace_id)));

create policy "round_exclusions_write_owner_only" on public.round_exclusions
for all using ((select public.is_workspace_owner(workspace_id)))
with check ((select public.is_workspace_owner(workspace_id)));

create policy "workspace_subscriptions_select_member" on public.workspace_subscriptions
for select using ((select public.is_workspace_member(workspace_id)));

create policy "workspace_integrations_select_owner_only" on public.workspace_integrations
for select using ((select public.is_workspace_owner(workspace_id)));

create policy "meeting_external_links_select_member" on public.meeting_external_links
for select using ((select public.is_workspace_member(workspace_id)));

create policy "audit_logs_select_owner_only" on public.audit_logs
for select using (
  workspace_id is not null
  and (select public.is_workspace_owner(workspace_id))
);

create policy "content_authors_select_published_only" on public.content_authors
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.content_items item
    where item.author_key = content_authors.key
      and item.is_published
      and not item.is_archived
      and item.published_at is not null
      and item.published_at <= now()
  )
);

create policy "content_authors_write_service_only" on public.content_authors
for all
to service_role
using (true)
with check (true);

create policy "content_items_select_published_only" on public.content_items
for select
to anon, authenticated
using (
  is_published
  and not is_archived
  and published_at is not null
  and published_at <= now()
);

create policy "content_items_write_service_only" on public.content_items
for all
to service_role
using (true)
with check (true);

insert into public.interests (name, slug)
values
  ('Coffee', 'coffee'),
  ('Tea', 'tea'),
  ('Cooking', 'cooking'),
  ('Baking', 'baking'),
  ('Travel', 'travel'),
  ('Hiking', 'hiking'),
  ('Running', 'running'),
  ('Cycling', 'cycling'),
  ('Yoga', 'yoga'),
  ('Pilates', 'pilates'),
  ('Gym', 'gym'),
  ('Football', 'football'),
  ('Basketball', 'basketball'),
  ('Tennis', 'tennis'),
  ('Padel', 'padel'),
  ('Swimming', 'swimming'),
  ('Gaming', 'gaming'),
  ('Board Games', 'board-games'),
  ('Tabletop RPGs', 'tabletop-rpgs'),
  ('Movies', 'movies'),
  ('TV Shows', 'tv-shows'),
  ('Anime', 'anime'),
  ('Books', 'books'),
  ('Writing', 'writing'),
  ('Poetry', 'poetry'),
  ('Photography', 'photography'),
  ('Design', 'design'),
  ('Illustration', 'illustration'),
  ('Painting', 'painting'),
  ('Music', 'music'),
  ('Guitar', 'guitar'),
  ('Piano', 'piano'),
  ('Singing', 'singing'),
  ('Podcasts', 'podcasts'),
  ('Startups', 'startups'),
  ('Product', 'product'),
  ('Engineering', 'engineering'),
  ('AI', 'ai'),
  ('Open Source', 'open-source'),
  ('Robotics', 'robotics'),
  ('Science', 'science'),
  ('Astronomy', 'astronomy'),
  ('History', 'history'),
  ('Languages', 'languages'),
  ('Learning', 'learning'),
  ('Mindfulness', 'mindfulness'),
  ('Pets', 'pets'),
  ('Cats', 'cats'),
  ('Dogs', 'dogs'),
  ('Gardening', 'gardening'),
  ('Fashion', 'fashion'),
  ('Skincare', 'skincare'),
  ('Volunteering', 'volunteering'),
  ('Community', 'community'),
  ('Career Growth', 'career-growth'),
  ('Mentorship', 'mentorship'),
  ('Public Speaking', 'public-speaking'),
  ('Finance', 'finance'),
  ('Investing', 'investing'),
  ('Sustainability', 'sustainability')
on conflict (slug) do nothing;


-- Final hardening for fresh projects

create index if not exists group_memberships_group_idx
on public.group_memberships (group_id);

create index if not exists group_memberships_member_idx
on public.group_memberships (member_id);

create index if not exists club_group_assignments_club_idx
on public.club_group_assignments (club_id);

create index if not exists club_group_assignments_group_idx
on public.club_group_assignments (group_id);

create index if not exists club_memberships_club_idx
on public.club_memberships (club_id);

create index if not exists club_memberships_member_idx
on public.club_memberships (member_id);

create index if not exists workspace_invites_creator_idx
on public.workspace_invites (created_by_member_id);

create index if not exists meeting_rounds_club_idx
on public.meeting_rounds (club_id);

create index if not exists meetings_round_idx
on public.meetings (meeting_round_id);

create index if not exists meeting_participants_meeting_idx
on public.meeting_participants (meeting_id);

create index if not exists meeting_external_links_meeting_idx
on public.meeting_external_links (meeting_id);

create index if not exists meeting_reschedule_proposals_meeting_idx
on public.meeting_reschedule_proposals (meeting_id);

create index if not exists meeting_reschedule_proposals_proposer_idx
on public.meeting_reschedule_proposals (proposed_by_member_id);

create index if not exists meeting_reschedule_responses_proposal_idx
on public.meeting_reschedule_responses (proposal_id);

create index if not exists meeting_reschedule_responses_member_idx
on public.meeting_reschedule_responses (member_id);

create index if not exists round_exclusions_round_idx
on public.round_exclusions (meeting_round_id);

create index if not exists round_exclusions_member_idx
on public.round_exclusions (member_id);

create index if not exists audit_logs_actor_member_idx
on public.audit_logs (actor_member_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('content', 'content', false, 5242880, array['text/markdown', 'text/plain']),
  ('content-public', 'content-public', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "content_public_assets_read" on storage.objects;
create policy "content_public_assets_read" on storage.objects
for select
to anon, authenticated
using (bucket_id = 'content-public');

drop policy if exists "content_private_service_read" on storage.objects;
create policy "content_private_service_read" on storage.objects
for select
to service_role
using (bucket_id = 'content');

drop policy if exists "content_storage_write_service_only" on storage.objects;
create policy "content_storage_write_service_only" on storage.objects
for all
to service_role
using (bucket_id in ('content', 'content-public'))
with check (bucket_id in ('content', 'content-public'));

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_members_workspace_id_id_key'
      and conrelid = 'public.workspace_members'::regclass
  ) then
    alter table public.workspace_members
      add constraint workspace_members_workspace_id_id_key unique (workspace_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'groups_workspace_id_id_key'
      and conrelid = 'public.groups'::regclass
  ) then
    alter table public.groups
      add constraint groups_workspace_id_id_key unique (workspace_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'clubs_workspace_id_id_key'
      and conrelid = 'public.clubs'::regclass
  ) then
    alter table public.clubs
      add constraint clubs_workspace_id_id_key unique (workspace_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_rounds_workspace_id_id_key'
      and conrelid = 'public.meeting_rounds'::regclass
  ) then
    alter table public.meeting_rounds
      add constraint meeting_rounds_workspace_id_id_key unique (workspace_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meetings_workspace_id_id_key'
      and conrelid = 'public.meetings'::regclass
  ) then
    alter table public.meetings
      add constraint meetings_workspace_id_id_key unique (workspace_id, id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_reschedule_proposals_workspace_id_id_key'
      and conrelid = 'public.meeting_reschedule_proposals'::regclass
  ) then
    alter table public.meeting_reschedule_proposals
      add constraint meeting_reschedule_proposals_workspace_id_id_key unique (workspace_id, id);
  end if;
end;
$$;

create or replace function public.enforce_workspace_owner_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.owner_member_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.id = new.owner_member_id
      and wm.workspace_id = new.id
  ) then
    raise exception 'owner_member_id must reference a member of the same workspace';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_audit_log_actor_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.actor_member_id is null then
    return new;
  end if;

  if new.workspace_id is null then
    raise exception 'workspace_id is required when actor_member_id is set';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.id = new.actor_member_id
      and wm.workspace_id = new.workspace_id
  ) then
    raise exception 'actor_member_id must reference a member of the same workspace';
  end if;

  return new;
end;
$$;

drop trigger if exists workspaces_owner_member_integrity on public.workspaces;
create trigger workspaces_owner_member_integrity
before insert or update of owner_member_id, id on public.workspaces
for each row
execute function public.enforce_workspace_owner_membership();

drop trigger if exists audit_logs_actor_member_integrity on public.audit_logs;
create trigger audit_logs_actor_member_integrity
before insert or update of actor_member_id, workspace_id on public.audit_logs
for each row
execute function public.enforce_audit_log_actor_membership();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'member_profiles_workspace_user_membership_fkey'
      and conrelid = 'public.member_profiles'::regclass
  ) then
    alter table public.member_profiles
      add constraint member_profiles_workspace_user_membership_fkey
      foreign key (workspace_id, user_id)
      references public.workspace_members (workspace_id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'member_availability_workspace_user_membership_fkey'
      and conrelid = 'public.member_availability_windows'::regclass
  ) then
    alter table public.member_availability_windows
      add constraint member_availability_workspace_user_membership_fkey
      foreign key (workspace_id, user_id)
      references public.workspace_members (workspace_id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'member_interests_workspace_user_membership_fkey'
      and conrelid = 'public.member_interests'::regclass
  ) then
    alter table public.member_interests
      add constraint member_interests_workspace_user_membership_fkey
      foreign key (workspace_id, user_id)
      references public.workspace_members (workspace_id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'interest_suggestions_workspace_user_membership_fkey'
      and conrelid = 'public.interest_suggestions'::regclass
  ) then
    alter table public.interest_suggestions
      add constraint interest_suggestions_workspace_user_membership_fkey
      foreign key (workspace_id, user_id)
      references public.workspace_members (workspace_id, user_id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'group_memberships_workspace_group_fkey'
      and conrelid = 'public.group_memberships'::regclass
  ) then
    alter table public.group_memberships
      add constraint group_memberships_workspace_group_fkey
      foreign key (workspace_id, group_id)
      references public.groups (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'group_memberships_workspace_member_fkey'
      and conrelid = 'public.group_memberships'::regclass
  ) then
    alter table public.group_memberships
      add constraint group_memberships_workspace_member_fkey
      foreign key (workspace_id, member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'club_group_assignments_workspace_club_fkey'
      and conrelid = 'public.club_group_assignments'::regclass
  ) then
    alter table public.club_group_assignments
      add constraint club_group_assignments_workspace_club_fkey
      foreign key (workspace_id, club_id)
      references public.clubs (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'club_group_assignments_workspace_group_fkey'
      and conrelid = 'public.club_group_assignments'::regclass
  ) then
    alter table public.club_group_assignments
      add constraint club_group_assignments_workspace_group_fkey
      foreign key (workspace_id, group_id)
      references public.groups (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'club_memberships_workspace_club_fkey'
      and conrelid = 'public.club_memberships'::regclass
  ) then
    alter table public.club_memberships
      add constraint club_memberships_workspace_club_fkey
      foreign key (workspace_id, club_id)
      references public.clubs (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'club_memberships_workspace_member_fkey'
      and conrelid = 'public.club_memberships'::regclass
  ) then
    alter table public.club_memberships
      add constraint club_memberships_workspace_member_fkey
      foreign key (workspace_id, member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_invites_workspace_creator_fkey'
      and conrelid = 'public.workspace_invites'::regclass
  ) then
    alter table public.workspace_invites
      add constraint workspace_invites_workspace_creator_fkey
      foreign key (workspace_id, created_by_member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_rounds_workspace_club_fkey'
      and conrelid = 'public.meeting_rounds'::regclass
  ) then
    alter table public.meeting_rounds
      add constraint meeting_rounds_workspace_club_fkey
      foreign key (workspace_id, club_id)
      references public.clubs (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meetings_workspace_round_fkey'
      and conrelid = 'public.meetings'::regclass
  ) then
    alter table public.meetings
      add constraint meetings_workspace_round_fkey
      foreign key (workspace_id, meeting_round_id)
      references public.meeting_rounds (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_participants_workspace_meeting_fkey'
      and conrelid = 'public.meeting_participants'::regclass
  ) then
    alter table public.meeting_participants
      add constraint meeting_participants_workspace_meeting_fkey
      foreign key (workspace_id, meeting_id)
      references public.meetings (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_participants_workspace_member_fkey'
      and conrelid = 'public.meeting_participants'::regclass
  ) then
    alter table public.meeting_participants
      add constraint meeting_participants_workspace_member_fkey
      foreign key (workspace_id, member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_reschedule_proposals_workspace_meeting_fkey'
      and conrelid = 'public.meeting_reschedule_proposals'::regclass
  ) then
    alter table public.meeting_reschedule_proposals
      add constraint meeting_reschedule_proposals_workspace_meeting_fkey
      foreign key (workspace_id, meeting_id)
      references public.meetings (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_reschedule_proposals_workspace_member_fkey'
      and conrelid = 'public.meeting_reschedule_proposals'::regclass
  ) then
    alter table public.meeting_reschedule_proposals
      add constraint meeting_reschedule_proposals_workspace_member_fkey
      foreign key (workspace_id, proposed_by_member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_reschedule_responses_workspace_proposal_fkey'
      and conrelid = 'public.meeting_reschedule_responses'::regclass
  ) then
    alter table public.meeting_reschedule_responses
      add constraint meeting_reschedule_responses_workspace_proposal_fkey
      foreign key (workspace_id, proposal_id)
      references public.meeting_reschedule_proposals (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_reschedule_responses_workspace_member_fkey'
      and conrelid = 'public.meeting_reschedule_responses'::regclass
  ) then
    alter table public.meeting_reschedule_responses
      add constraint meeting_reschedule_responses_workspace_member_fkey
      foreign key (workspace_id, member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'member_opt_outs_workspace_source_member_fkey'
      and conrelid = 'public.member_opt_outs'::regclass
  ) then
    alter table public.member_opt_outs
      add constraint member_opt_outs_workspace_source_member_fkey
      foreign key (workspace_id, source_member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'member_opt_outs_workspace_target_member_fkey'
      and conrelid = 'public.member_opt_outs'::regclass
  ) then
    alter table public.member_opt_outs
      add constraint member_opt_outs_workspace_target_member_fkey
      foreign key (workspace_id, target_member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'round_exclusions_workspace_round_fkey'
      and conrelid = 'public.round_exclusions'::regclass
  ) then
    alter table public.round_exclusions
      add constraint round_exclusions_workspace_round_fkey
      foreign key (workspace_id, meeting_round_id)
      references public.meeting_rounds (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'round_exclusions_workspace_member_fkey'
      and conrelid = 'public.round_exclusions'::regclass
  ) then
    alter table public.round_exclusions
      add constraint round_exclusions_workspace_member_fkey
      foreign key (workspace_id, member_id)
      references public.workspace_members (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'meeting_external_links_workspace_meeting_fkey'
      and conrelid = 'public.meeting_external_links'::regclass
  ) then
    alter table public.meeting_external_links
      add constraint meeting_external_links_workspace_meeting_fkey
      foreign key (workspace_id, meeting_id)
      references public.meetings (workspace_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'workspace_subscriptions_status_check'
      and conrelid = 'public.workspace_subscriptions'::regclass
  ) then
    alter table public.workspace_subscriptions
      add constraint workspace_subscriptions_status_check
      check (
        status in (
          'trialing',
          'active',
          'past_due',
          'canceled',
          'incomplete',
          'incomplete_expired',
          'unpaid',
          'paused'
        )
      );
  end if;
end;
$$;

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;
revoke all privileges on all functions in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant all privileges on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to service_role;

grant execute on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public
revoke all on tables from anon, authenticated;

alter default privileges in schema public
revoke all on sequences from anon, authenticated;

alter default privileges in schema public
revoke all on functions from anon, authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to anon, authenticated;

alter default privileges in schema public
grant all on tables to service_role;

alter default privileges in schema public
grant usage, select on sequences to anon, authenticated;

alter default privileges in schema public
grant all on sequences to service_role;

alter default privileges in schema public
grant execute on functions to anon, authenticated, service_role;

notify pgrst, 'reload schema';
