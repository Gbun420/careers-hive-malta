-- Migration: 0025_growth_job_ingestion.sql
-- Description: Schema for controlled job ingestion from RSS/CSV.

-- 1. AGGREGATED JOB SOURCES
CREATE TABLE IF NOT EXISTS public.aggregated_job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('RSS','CSV')),
  url text not null,
  enabled boolean default true,
  created_at timestamptz default now()
);

ALTER TABLE public.aggregated_job_sources ENABLE ROW LEVEL SECURITY;

-- Admin-only management
DROP POLICY IF EXISTS "admin manages sources" ON public.aggregated_job_sources;
CREATE POLICY "admin manages sources"
ON public.aggregated_job_sources
FOR ALL
USING (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- Service role can read for cron
DROP POLICY IF EXISTS "service role reads sources" ON public.aggregated_job_sources;
CREATE POLICY "service role reads sources"
ON public.aggregated_job_sources
FOR SELECT
USING (auth.role() = 'service_role');

-- 2. JOBS TABLE EXTENSIONS
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS is_aggregated boolean default false,
ADD COLUMN IF NOT EXISTS aggregated_source_id uuid references public.aggregated_job_sources(id),
ADD COLUMN IF NOT EXISTS canonical_hash text;

-- Unique dedupe key only for aggregated jobs
CREATE UNIQUE INDEX IF NOT EXISTS jobs_aggregated_canonical_hash_uq
ON public.jobs(canonical_hash)
WHERE is_aggregated = true AND canonical_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS jobs_is_aggregated_idx ON public.jobs(is_aggregated);
CREATE INDEX IF NOT EXISTS jobs_aggregated_source_idx ON public.jobs(aggregated_source_id);

-- 3. INGESTION RUNS (Observability)
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.aggregated_job_sources(id) on delete set null,
  started_at timestamptz default now(),
  finished_at timestamptz,
  inserted_count int default 0,
  updated_count int default 0,
  skipped_count int default 0,
  error text
);

ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin reads runs" ON public.ingestion_runs;
CREATE POLICY "admin reads runs"
ON public.ingestion_runs
FOR SELECT
USING (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

DROP POLICY IF EXISTS "service role writes runs" ON public.ingestion_runs;
CREATE POLICY "service role writes runs"
ON public.ingestion_runs
FOR ALL
USING (auth.role() = 'service_role');
