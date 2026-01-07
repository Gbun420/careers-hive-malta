-- Migration: 0015_jboard_parity.sql
-- Description: Adds tables and columns for JBoard parity: Import, Alerts, Profiles, ATS.

-- 1. Enums
do $$ begin
  create type public.job_source_type as enum ('XML', 'URL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.import_run_status as enum ('SUCCESS', 'FAILED', 'PARTIAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_alert_frequency as enum ('DAILY', 'WEEKLY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.profile_status as enum ('PENDING', 'APPROVED', 'REJECTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum ('NEW', 'REVIEWING', 'SHORTLIST', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.message_sender_role as enum ('EMPLOYER', 'CANDIDATE');
exception when duplicate_object then null; end $$;

-- 2. New Tables

-- job_sources
create table if not exists public.job_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type public.job_source_type not null,
  feed_url text not null,
  enabled boolean default true,
  mapping jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- job_import_runs
create table if not exists public.job_import_runs (
  id uuid primary key default uuid_generate_v4(),
  source_id uuid references public.job_sources(id) on delete cascade,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status public.import_run_status,
  imported_count int default 0,
  updated_count int default 0,
  skipped_count int default 0,
  error text
);

-- job_alerts
create table if not exists public.job_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  query text,
  filters jsonb default '{}'::jsonb,
  frequency public.job_alert_frequency default 'DAILY',
  enabled boolean default true,
  last_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- applications
create table if not exists public.applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  employer_id uuid references public.profiles(id) on delete set null,
  status public.application_status default 'NEW',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, user_id)
);

-- Ensure employer_id exists if table was created by 0014
alter table public.applications add column if not exists employer_id uuid references public.profiles(id) on delete set null;

-- application_notes
create table if not exists public.application_notes (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references public.applications(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

-- application_messages
create table if not exists public.application_messages (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid references public.applications(id) on delete cascade,
  sender_role public.message_sender_role not null,
  body text not null,
  created_at timestamptz default now()
);

-- 3. Alter Tables

-- jobs
alter table public.jobs add column if not exists source_id uuid references public.job_sources(id) on delete set null;
alter table public.jobs add column if not exists external_id text;
alter table public.jobs add column if not exists company_name text;
alter table public.jobs add column if not exists company_id uuid references public.profiles(id) on delete set null;
alter table public.jobs add column if not exists employment_type text;
alter table public.jobs add column if not exists salary_min int;
alter table public.jobs add column if not exists salary_max int;
alter table public.jobs add column if not exists currency text default 'EUR';
alter table public.jobs add column if not exists url text;
alter table public.jobs add column if not exists apply_url text;
alter table public.jobs add column if not exists posted_at timestamptz default now();
alter table public.jobs add column if not exists valid_through timestamptz;
alter table public.jobs add column if not exists updated_at timestamptz default now();

-- Unique constraint for imported jobs
do $$ begin
  alter table public.jobs add constraint jobs_source_external_id_key unique (source_id, external_id);
exception when duplicate_table then null; end $$;

-- profiles
alter table public.profiles add column if not exists status public.profile_status default 'PENDING';
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists skills text[];
alter table public.profiles add column if not exists experience jsonb;
alter table public.profiles add column if not exists cv_file_path text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- 4. RLS Policies

-- Enable RLS
alter table public.job_sources enable row level security;
alter table public.job_import_runs enable row level security;
alter table public.job_alerts enable row level security;
alter table public.applications enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_messages enable row level security;

-- job_sources / job_import_runs: Admin only
drop policy if exists "Admins can manage job_sources" on public.job_sources;
create policy "Admins can manage job_sources" on public.job_sources
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admins can manage job_import_runs" on public.job_import_runs;
create policy "Admins can manage job_import_runs" on public.job_import_runs
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- job_alerts: User can CRUD own
drop policy if exists "Users can manage own alerts" on public.job_alerts;
create policy "Users can manage own alerts" on public.job_alerts
  for all using (auth.uid() = user_id);

-- jobs: Public read (active only), Admin/Employer manage
-- (Existing policies cover basic read/write, adding specific ones if needed)
-- Ensure public read allows seeing imported jobs (which have no employer_id usually, or a system one)
-- Existing: "Anyone can view active jobs" using (is_active = true) -> this covers it.

-- profiles: Public can read APPROVED, Users read/write own
drop policy if exists "Public view approved profiles" on public.profiles;
create policy "Public view approved profiles" on public.profiles
  for select using (status = 'APPROVED');

-- applications: Employer read/write own jobs' apps; Candidate read own apps
drop policy if exists "Employer view applications for own jobs" on public.applications;
create policy "Employer view applications for own jobs" on public.applications
  for select using (
    exists (select 1 from public.jobs where id = applications.job_id and employer_id = auth.uid())
    or employer_id = auth.uid() -- Direct link if set
  );

drop policy if exists "Employer update applications for own jobs" on public.applications;
create policy "Employer update applications for own jobs" on public.applications
  for update using (
    exists (select 1 from public.jobs where id = applications.job_id and employer_id = auth.uid())
    or employer_id = auth.uid()
  );

drop policy if exists "Candidate manage own applications" on public.applications;
create policy "Candidate manage own applications" on public.applications
  for all using (auth.uid() = user_id);

-- application_notes: Employer manage
drop policy if exists "Employer manage notes" on public.application_notes;
create policy "Employer manage notes" on public.application_notes
  for all using (
    exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.id = application_notes.application_id and j.employer_id = auth.uid()
    )
  );

-- application_messages: Employer and Candidate
drop policy if exists "Participants manage messages" on public.application_messages;
create policy "Participants manage messages" on public.application_messages
  for all using (
    exists (
      select 1 from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.id = application_messages.application_id 
      and (j.employer_id = auth.uid() or a.user_id = auth.uid())
    )
  );

