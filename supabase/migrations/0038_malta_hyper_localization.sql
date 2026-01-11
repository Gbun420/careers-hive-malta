-- Phase 3: Hyper-Localization (The Malta Factor)
-- Adds Maltese-specific data points to the jobs table

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS commute_time_mins integer;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS office_region text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS sector_metadata jsonb DEFAULT '{}'::jsonb;

-- Add check constraint for office_region to ensure localization accuracy
-- Regions based on Malta NSO standards
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS check_office_region;
ALTER TABLE public.jobs ADD CONSTRAINT check_office_region CHECK (
  office_region IN (
    'Northern',
    'Northern Harbour',
    'South Eastern',
    'Southern Harbour',
    'Western',
    'Gozo',
    'Remote'
  )
);

-- Index for region-based searching (very common in Malta)
CREATE INDEX IF NOT EXISTS idx_jobs_office_region ON public.jobs(office_region);

-- Comments for documentation
COMMENT ON COLUMN public.jobs.commute_time_mins IS 'Estimated commute time from central hubs like Valletta/Sliema';
COMMENT ON COLUMN public.jobs.office_region IS 'Geographic region in Malta for local filtering';
COMMENT ON COLUMN public.jobs.sector_metadata IS 'Sector-specific attributes (e.g., license type for iGaming, certification for Finance)';
