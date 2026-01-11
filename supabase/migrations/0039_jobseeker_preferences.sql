-- Adds Maltese-specific preference fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_region text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_commute_time integer;

-- Add check constraint for preferred_region
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_preferred_region;
ALTER TABLE public.profiles ADD CONSTRAINT check_preferred_region CHECK (
  preferred_region IN (
    'Northern',
    'Northern Harbour',
    'South Eastern',
    'Southern Harbour',
    'Western',
    'Gozo',
    'Remote',
    'Any'
  )
);

COMMENT ON COLUMN public.profiles.preferred_region IS 'Preferred Maltese region for work';
COMMENT ON COLUMN public.profiles.max_commute_time IS 'Maximum acceptable commute time in minutes';
