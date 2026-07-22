-- Run in the Supabase SQL editor, then review policies before production.
create extension if not exists pgcrypto;

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null,
  name text,
  email text,
  phone text,
  consent boolean,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new','contacted','in_progress','completed','archived')),
  internal_notes text,
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists form_submissions_type_idx on public.form_submissions(form_type);
create index if not exists form_submissions_status_idx on public.form_submissions(status);
create index if not exists form_submissions_created_idx on public.form_submissions(created_at desc);

alter table public.form_submissions enable row level security;

-- Allows anonymous website inserts only. The browser cannot read submissions.
create policy "public may submit forms"
on public.form_submissions for insert
to anon
with check (
  form_type in (
    'visit','prayer','pastoral_care','volunteer','ministry_interest',
    'student_family','transportation','campaign_pledge','partner',
    'contact','newsletter','memory','service_participation'
  )
  and status = 'new'
);

-- Authenticated dashboard access should be granted only through an admin role
-- or server-side function. Do not add a broad authenticated SELECT policy.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists form_submissions_updated_at on public.form_submissions;
create trigger form_submissions_updated_at
before update on public.form_submissions
for each row execute function public.set_updated_at();

-- CSV export: use the Supabase table editor or an authenticated server endpoint.
-- Recommended production additions:
-- 1. Turnstile/hCaptcha verification through an Edge Function.
-- 2. IP-based rate limiting in that function.
-- 3. Transactional email notification with sensitive-field redaction.
-- 4. Retention/deletion policies, especially for prayer and pastoral care.
