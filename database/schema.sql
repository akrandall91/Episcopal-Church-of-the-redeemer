-- Production-ready starting point. Review all policies and retention rules.
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
create index if not exists form_submissions_email_idx on public.form_submissions(lower(email));

alter table public.form_submissions enable row level security;

create policy "public may submit approved forms"
on public.form_submissions for insert to anon
with check (
  form_type in (
    'visit','prayer','pastoral_care','volunteer','ministry_interest',
    'student_family','transportation','campaign_pledge','partner',
    'contact','newsletter','memory','service_participation'
  )
  and status = 'new'
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists form_submissions_updated_at on public.form_submissions;
create trigger form_submissions_updated_at
before update on public.form_submissions
for each row execute function public.set_updated_at();

-- Do not add public SELECT/UPDATE/DELETE policies.
-- Use authenticated admin roles or server-side functions for dashboard access.
