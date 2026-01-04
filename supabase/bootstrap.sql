-- ============================================================================
-- Supabase Bootstrap Script
-- Run this script in Supabase SQL Editor to initialize a fresh project
-- This script is idempotent and can be run multiple times safely
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 0001_init.sql - Core schema
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('jobseeker', 'employer', 'admin')) default 'jobseeker',
  created_at timestamptz default now()
);

create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  salary_range text,
  created_at timestamptz default now(),
  is_active boolean default true
);

create table if not exists public.saved_searches (
  id uuid primary key default uuid_generate_v4(),
  jobseeker_id uuid references public.profiles(id) on delete cascade,
  frequency text check (frequency in ('instant', 'daily', 'weekly')) default 'instant',
  search_criteria jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Create trigger function for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'jobseeker')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.saved_searches enable row level security;

-- Create policies (drop if exists first for idempotency)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Anyone can view active jobs" on public.jobs;
create policy "Anyone can view active jobs" on public.jobs
  for select using (is_active = true);

drop policy if exists "Employers can manage their jobs" on public.jobs;
create policy "Employers can manage their jobs" on public.jobs
  for all using (auth.uid() = employer_id);

drop policy if exists "Jobseekers can manage own searches" on public.saved_searches;
create policy "Jobseekers can manage own searches" on public.saved_searches
  for all using (auth.uid() = jobseeker_id);

-- ============================================================================
-- 0002_notifications.sql
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  saved_search_id uuid not null references public.saved_searches(id) on delete cascade,
  channel text not null check (channel in ('email')),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notifications_status_idx on public.notifications (status);
create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_insert_service on public.notifications;
create policy notifications_insert_service on public.notifications
  for insert with check (auth.role() = 'service_role');

drop policy if exists notifications_update_service on public.notifications;
create policy notifications_update_service on public.notifications
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ============================================================================
-- 0003_trust.sql
-- ============================================================================
create table if not exists public.employer_verifications (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  notes text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references public.profiles(id)
);

create table if not exists public.job_reports (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('new', 'reviewing', 'resolved', 'dismissed')) default 'new',
  reason text not null,
  details text,
  resolution_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references public.profiles(id)
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists employer_verifications_employer_id_idx
  on public.employer_verifications (employer_id);
create index if not exists employer_verifications_status_idx
  on public.employer_verifications (status);
create index if not exists job_reports_job_id_idx
  on public.job_reports (job_id);
create index if not exists job_reports_reporter_id_idx
  on public.job_reports (reporter_id);
create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at);

alter table public.employer_verifications enable row level security;
alter table public.job_reports enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Employers can insert own verification" on public.employer_verifications;
create policy "Employers can insert own verification" on public.employer_verifications
  for insert with check (auth.uid() = employer_id);

drop policy if exists "Employers can view own verification" on public.employer_verifications;
create policy "Employers can view own verification" on public.employer_verifications
  for select using (auth.uid() = employer_id);

drop policy if exists "Admins can read verifications" on public.employer_verifications;
create policy "Admins can read verifications" on public.employer_verifications
  for select using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Admins can update verifications" on public.employer_verifications;
create policy "Admins can update verifications" on public.employer_verifications
  for update using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Users can insert job reports" on public.job_reports;
create policy "Users can insert job reports" on public.job_reports
  for insert with check (auth.uid() = reporter_id);

drop policy if exists "Users can view own reports" on public.job_reports;
create policy "Users can view own reports" on public.job_reports
  for select using (auth.uid() = reporter_id);

drop policy if exists "Admins can read reports" on public.job_reports;
create policy "Admins can read reports" on public.job_reports
  for select using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Admins can update reports" on public.job_reports;
create policy "Admins can update reports" on public.job_reports
  for update using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs" on public.audit_logs
  for select using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

drop policy if exists "Admins can insert audit logs" on public.audit_logs;
create policy "Admins can insert audit logs" on public.audit_logs
  for insert with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

-- ============================================================================
-- 0004_billing.sql
-- ============================================================================
create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  type text check (type in ('featured')) not null,
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent_id text,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.job_featured (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  featured_until timestamptz not null,
  featured_tier int default 1,
  updated_at timestamptz default now()
);

create index if not exists purchases_employer_id_idx
  on public.purchases (employer_id);
create index if not exists purchases_status_idx
  on public.purchases (status);
create index if not exists job_featured_until_idx
  on public.job_featured (featured_until);

alter table public.purchases enable row level security;
alter table public.job_featured enable row level security;

drop policy if exists "Employers can read own purchases" on public.purchases;
create policy "Employers can read own purchases" on public.purchases
  for select using (auth.uid() = employer_id);

-- ============================================================================
-- 0005_abuse.sql
-- ============================================================================
create unique index if not exists job_reports_unique_open_idx
  on public.job_reports (job_id, reporter_id)
  where status in ('new', 'reviewing');

-- ============================================================================
-- 0006_job_reports_details.sql
-- ============================================================================
alter table public.job_reports
  add column if not exists details text;

-- ============================================================================
-- 0007_billing_fix.sql
-- ============================================================================
-- Add columns idempotently
alter table public.job_featured
  add column if not exists job_id uuid;
alter table public.job_featured
  add column if not exists featured_until timestamptz;
alter table public.job_featured
  add column if not exists featured_tier int default 1;
alter table public.job_featured
  add column if not exists updated_at timestamptz default now();

-- Add primary key if not exists
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.job_featured'::regclass
      and contype = 'p'
  ) then
    alter table public.job_featured
      add constraint job_featured_pkey primary key (job_id);
  end if;
end $$;

-- Add foreign key if not exists
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.job_featured'::regclass
      and contype = 'f'
      and conname = 'job_featured_job_id_fkey'
  ) then
    alter table public.job_featured
      add constraint job_featured_job_id_fkey
      foreign key (job_id)
      references public.jobs(id)
      on delete cascade;
  end if;
end $$;

-- ============================================================================
-- Bootstrap Complete
-- ============================================================================
-- All core tables, indexes, policies, and triggers are now set up
-- Required tables: profiles, jobs, saved_searches, notifications, employer_verifications, job_reports, audit_logs, purchases, job_featured