-- Invitation-only member portal schema for Supabase.
-- Run after database/schema.sql in the Supabase SQL Editor.

do $$ begin
  create type public.member_role as enum ('member', 'ministry_leader', 'staff', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text,
  directory_opt_in boolean not null default false,
  communication_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists public.member_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.member_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.member_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null check (url ~ '^https://'),
  category text not null default 'General',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.member_profiles enable row level security;
alter table public.member_roles enable row level security;
alter table public.member_announcements enable row level security;
alter table public.member_events enable row level security;
alter table public.member_resources enable row level security;

create or replace function public.is_member_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.member_roles
    where user_id = auth.uid() and role in ('staff', 'admin')
  );
$$;

revoke all on function public.is_member_staff() from public, anon;
grant execute on function public.is_member_staff() to authenticated;

create or replace function public.is_member_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.member_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_member_admin() from public, anon;
grant execute on function public.is_member_admin() to authenticated;

create policy "members read own profile"
on public.member_profiles for select to authenticated
using (id = auth.uid() or (select public.is_member_staff()));

create policy "members update own profile"
on public.member_profiles for update to authenticated
using (id = auth.uid() or (select public.is_member_staff()))
with check (id = auth.uid() or (select public.is_member_staff()));

create policy "members read own role"
on public.member_roles for select to authenticated
using (user_id = auth.uid() or (select public.is_member_staff()));

create policy "admins manage roles"
on public.member_roles for all to authenticated
using ((select public.is_member_admin()))
with check ((select public.is_member_admin()));

create policy "members read current announcements"
on public.member_announcements for select to authenticated
using (published_at <= now() and (expires_at is null or expires_at > now()));

create policy "staff manage announcements"
on public.member_announcements for all to authenticated
using ((select public.is_member_staff()))
with check ((select public.is_member_staff()));

create policy "members read events"
on public.member_events for select to authenticated
using (true);

create policy "staff manage events"
on public.member_events for all to authenticated
using ((select public.is_member_staff()))
with check ((select public.is_member_staff()));

create policy "members read resources"
on public.member_resources for select to authenticated
using (published_at <= now());

create policy "staff manage resources"
on public.member_resources for all to authenticated
using ((select public.is_member_staff()))
with check ((select public.is_member_staff()));

grant select, update on public.member_profiles to authenticated;
grant select, insert, update, delete on public.member_roles to authenticated;
grant select, insert, update, delete on public.member_announcements to authenticated;
grant select, insert, update, delete on public.member_events to authenticated;
grant select, insert, update, delete on public.member_resources to authenticated;

create or replace function public.create_member_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.member_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.member_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_member_profile_after_signup on auth.users;
create trigger create_member_profile_after_signup
after insert on auth.users
for each row execute function public.create_member_profile();

drop trigger if exists member_profiles_updated_at on public.member_profiles;
create trigger member_profiles_updated_at
before update on public.member_profiles
for each row execute function public.set_updated_at();

-- Backfill profiles and the default member role for users invited before this schema was installed.
insert into public.member_profiles (id, display_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '') from auth.users
on conflict (id) do nothing;

insert into public.member_roles (user_id, role)
select id, 'member'::public.member_role from auth.users
on conflict (user_id) do nothing;

-- After inviting the initial administrator, promote that account once:
-- update public.member_roles set role = 'admin'
-- where user_id = (select id from auth.users where email = 'ADMIN_EMAIL_HERE');
