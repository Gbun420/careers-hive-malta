-- Migration: 0027_google_indexing_events.sql
-- Description: Table for tracking Google Indexing API notifications to prevent spam and duplicates.

CREATE TABLE IF NOT EXISTS public.google_indexing_events (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text not null check (type in ('URL_UPDATED', 'URL_DELETED')),
  job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz default now()
);

-- Unique constraint: prevent same URL + type in the same UTC day
-- Note: Supabase/Postgres date_trunc('day', created_at) isn't directly usable in UNIQUE constraints 
-- unless it's a generated column or an expression index.
CREATE UNIQUE INDEX IF NOT EXISTS google_indexing_events_url_type_day_idx 
ON public.google_indexing_events (url, type, (date_trunc('day', created_at)));

ALTER TABLE public.google_indexing_events ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "admin reads indexing events"
ON public.google_indexing_events
FOR SELECT
USING (exists (
  select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- Service role full access
CREATE POLICY "service role full access indexing"
ON public.google_indexing_events
FOR ALL
USING (auth.role() = 'service_role');
