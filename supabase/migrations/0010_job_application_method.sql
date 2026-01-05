
DO $$
BEGIN
    ALTER TABLE public.jobs
    ADD COLUMN IF NOT EXISTS application_method text CHECK (application_method IN ('email', 'url')) DEFAULT 'email',
    ADD COLUMN IF NOT EXISTS application_url text,
    ADD COLUMN IF NOT EXISTS application_email text;
END $$;
