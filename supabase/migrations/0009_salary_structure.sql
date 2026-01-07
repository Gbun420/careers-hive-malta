
DO $$
BEGIN
    ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS salary_min integer,
    ADD COLUMN IF NOT EXISTS salary_max integer,
    ADD COLUMN IF NOT EXISTS salary_period text CHECK (salary_period IN ('hourly', 'monthly', 'yearly')) DEFAULT 'yearly',
    ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';
END $$;
