-- Admin content console migration. Run once in the Supabase SQL Editor.
-- Safe to run again: existing rows and columns are preserved.

alter table public.member_announcements
  add column if not exists status text not null default 'published',
  add column if not exists audience text not null default 'members',
  add column if not exists pinned boolean not null default false,
  add column if not exists related_event_id uuid references public.member_events(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

alter table public.member_events
  add column if not exists status text not null default 'published',
  add column if not exists audience text not null default 'public',
  add column if not exists all_day boolean not null default false,
  add column if not exists registration_url text,
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text,
  add column if not exists google_event_id text,
  add column if not exists google_event_url text,
  add column if not exists google_synced_at timestamptz,
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
  (status = 'published' and published_at <= now() and expires_at > now())
);

drop policy if exists "public read current announcements" on public.member_announcements;
create policy "public read current announcements"
on public.member_announcements for select to anon
using (
  status = 'published' and audience = 'public' and
  published_at <= now() and expires_at > now()
);

grant select on public.member_announcements to anon;

drop policy if exists "members read events" on public.member_events;
create policy "members read events"
on public.member_events for select to authenticated
using (
  (select public.is_member_staff()) or
  (status = 'published' and coalesce(ends_at, starts_at + interval '2 hours') > now())
);

drop policy if exists "public read published events" on public.member_events;
create policy "public read published events"
on public.member_events for select to anon
using (
  status = 'published' and audience = 'public' and
  coalesce(ends_at, starts_at + interval '2 hours') > now()
);

grant select on public.member_events to anon;

-- Existing announcements receive a reasonable expiration window. New published
-- announcements require an explicit expiration date in the admin console.
update public.member_announcements
set expires_at = published_at + interval '30 days'
where expires_at is null;

-- Private Storage bucket for event PDFs and images. Access is granted through
-- policies that mirror each event's audience and publication window.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-attachments', 'event-attachments', false, 10485760,
  array['application/pdf','image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "staff upload event attachments" on storage.objects;
create policy "staff upload event attachments" on storage.objects
for insert to authenticated
with check (bucket_id = 'event-attachments' and (select public.is_member_staff()));

drop policy if exists "staff manage event attachments" on storage.objects;
create policy "staff manage event attachments" on storage.objects
for update to authenticated
using (bucket_id = 'event-attachments' and (select public.is_member_staff()))
with check (bucket_id = 'event-attachments' and (select public.is_member_staff()));

drop policy if exists "staff delete event attachments" on storage.objects;
create policy "staff delete event attachments" on storage.objects
for delete to authenticated
using (bucket_id = 'event-attachments' and (select public.is_member_staff()));

drop policy if exists "members read event attachments" on storage.objects;
create policy "members read event attachments" on storage.objects
for select to authenticated
using (
  bucket_id = 'event-attachments' and (
    (select public.is_member_staff()) or exists (
      select 1 from public.member_events e
      where e.attachment_path = name and e.status = 'published'
        and coalesce(e.ends_at, e.starts_at + interval '2 hours') > now()
    )
  )
);

drop policy if exists "public read public event attachments" on storage.objects;
create policy "public read public event attachments" on storage.objects
for select to anon
using (
  bucket_id = 'event-attachments' and exists (
    select 1 from public.member_events e
    where e.attachment_path = name and e.status = 'published' and e.audience = 'public'
      and coalesce(e.ends_at, e.starts_at + interval '2 hours') > now()
  )
);

drop trigger if exists member_announcements_updated_at on public.member_announcements;
create trigger member_announcements_updated_at before update on public.member_announcements
for each row execute function public.set_updated_at();

drop trigger if exists member_events_updated_at on public.member_events;
create trigger member_events_updated_at before update on public.member_events
for each row execute function public.set_updated_at();
