-- Migration: 0021_schema_repair.sql
-- Description: Ensures all required columns and tables exist across overlapping migrations.
-- This script is idempotent and repairs schema state for Careers.mt

DO $$
BEGIN
    -- 1. Ensure Profiles table has all necessary columns
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}'::text[];
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_file_path text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
    
    -- Ensure role column exists (baseline)
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'jobseeker';

    -- 2. Ensure Jobs table has all necessary columns
    ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
    ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS filled_at timestamptz;
    ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS application_count int DEFAULT 0;
    ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS employer_id uuid REFERENCES auth.users(id); -- Ensure FK exists
    
    -- 3. Repair Applications table
    -- If applications table was created by 0014, it might be missing employer_id
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS employer_id uuid REFERENCES public.profiles(id);
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cover_letter text;
    ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS answers jsonb DEFAULT '{}'::jsonb;
    
    -- Ensure status column is consistent
    -- Note: We don't change types here to avoid data loss, but ensure columns exist
END $$;

-- 4. Ensure RLS is active and correct
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Re-create or update policies for applications
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.applications;
CREATE POLICY "Employers can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update application status" ON public.applications;
CREATE POLICY "Employers can update application status" ON public.applications
  FOR UPDATE USING (
    auth.uid() = employer_id OR
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );
