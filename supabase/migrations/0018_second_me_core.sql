-- Migration: 0018_second_me_core.sql
-- Description: Core tables for "Second Me" AI Copilot

-- A) second_me_settings
create table if not exists public.second_me_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  consent_at timestamptz,
  tone text default 'professional',
  language text not null default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- B) second_me_outputs
create table if not exists public.second_me_outputs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  type text not null, -- FIT_SUMMARY | BULLETS | COVER_LETTER | INTERVIEW_PREP
  input_hash text not null,
  content jsonb not null,
  tokens_est int,
  cached boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, job_id, type, input_hash)
);

-- C) second_me_usage_daily
create table if not exists public.second_me_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, day)
);

-- RLS
alter table public.second_me_settings enable row level security;
alter table public.second_me_outputs enable row level security;
alter table public.second_me_usage_daily enable row level security;

-- Policies
create policy "Users can manage own second_me_settings"
  on public.second_me_settings for all
  using (auth.uid() = user_id);

create policy "Users can manage own second_me_outputs"
  on public.second_me_outputs for all
  using (auth.uid() = user_id);

create policy "Users can view own second_me_usage"
  on public.second_me_usage_daily for select
  using (auth.uid() = user_id);

-- Indexes
create index if not exists second_me_outputs_user_job_idx on public.second_me_outputs(user_id, job_id);
create index if not exists second_me_usage_day_idx on public.second_me_usage_daily(day);
