-- Migration: 0023_create_job_alerts.sql
-- Description: Creates job_alerts table with JSONB filters and RLS

CREATE TABLE IF NOT EXISTS public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Alert',
  query text null,
  filters jsonb not null default '{}'::jsonb,
  frequency text not null default 'DAILY', -- 'DAILY' | 'WEEKLY'
  enabled boolean not null default true,
  last_sent_at timestamptz null,
  unsubscribe_token_hash text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS job_alerts_user_id_idx ON public.job_alerts (user_id);
CREATE INDEX IF NOT EXISTS job_alerts_enabled_frequency_idx ON public.job_alerts (enabled, frequency);

-- RLS
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobseeker manages own alerts" ON public.job_alerts;
CREATE POLICY "jobseeker manages own alerts"
ON public.job_alerts
FOR ALL
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "service role full access" ON public.job_alerts;
CREATE POLICY "service role full access"
ON public.job_alerts
FOR ALL
USING (auth.role() = 'service_role');
