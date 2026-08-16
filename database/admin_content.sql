-- Admin content console migration. Run once in the Supabase SQL Editor.
-- Safe to run again: existing rows and columns are preserved.

alter table public.member_announcements
  add column if not exists status text not null default 'published',
  add column if not exists audience text not null default 'members',
  add column if not exists pinned boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.member_events
  add column if not exists status text not null default 'published',
  add column if not exists audience text not null default 'public',
  add column if not exists all_day boolean not null default false,
  add column if not exists registration_url text,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.member_announcements add constraint member_announcements_status_check check (status in ('draft','published','archived'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.member_announcements add constraint member_announcements_audience_check check (audience in ('public','members'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.member_events add constraint member_events_status_check check (status in ('draft','published','cancelled','archived'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.member_events add constraint member_events_audience_check check (audience in ('public','members'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.member_events add constraint member_events_registration_url_check check (registration_url is null or registration_url ~ '^https://');
exception when duplicate_object then null; end $$;

drop policy if exists "members read current announcements" on public.member_announcements;
create policy "members read current announcements"
on public.member_announcements for select to authenticated
using (
  (select public.is_member_staff()) or
  (status = 'published' and published_at <= now() and (expires_at is null or expires_at > now()))
);

drop policy if exists "members read events" on public.member_events;
create policy "members read events"
on public.member_events for select to authenticated
using ((select public.is_member_staff()) or status = 'published');

drop policy if exists "public read published events" on public.member_events;
create policy "public read published events"
on public.member_events for select to anon
using (status = 'published' and audience = 'public');

grant select on public.member_events to anon;

drop trigger if exists member_announcements_updated_at on public.member_announcements;
create trigger member_announcements_updated_at before update on public.member_announcements
for each row execute function public.set_updated_at();

drop trigger if exists member_events_updated_at on public.member_events;
create trigger member_events_updated_at before update on public.member_events
for each row execute function public.set_updated_at();

