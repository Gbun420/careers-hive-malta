-- Migration: 0016_job_alerts_enhanced.sql
-- Description: Enhances job_alerts table with name, unsubscribe tokens, and indexes.

-- Add name and unsubscribe columns
alter table public.job_alerts 
  add column if not exists name text not null default 'My Alert',
  add column if not exists unsubscribe_token_hash text;

-- Create indexes for performance
create index if not exists job_alerts_user_id_idx on public.job_alerts (user_id);
create index if not exists job_alerts_enabled_frequency_idx on public.job_alerts (enabled, frequency);

-- Add unique constraint per user/name
alter table public.job_alerts drop constraint if exists job_alerts_user_id_name_key;
alter table public.job_alerts add constraint job_alerts_user_id_name_key unique (user_id, name);

-- RLS should already be enabled and configured from 0015, but ensuring it here.
alter table public.job_alerts enable row level security;

-- Policy: Users can CRUD own alerts (already in 0015, but keeping for parity)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'job_alerts' and policyname = 'Users can manage own alerts'
  ) then
    create policy "Users can manage own alerts" on public.job_alerts
      for all using (auth.uid() = user_id);
  end if;
end $$;
