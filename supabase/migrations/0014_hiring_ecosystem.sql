-- Hiring Ecosystem: Profiles, Resumes, and Applications
-- Adheres to the Careers.mt Professional Workflow Roadmap

-- 1. Enhance Profiles with Jobseeker data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}'::text[];

-- 2. Enhance Jobs with Status and Metadata
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('active', 'closed', 'filled')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS filled_at timestamptz,
ADD COLUMN IF NOT EXISTS application_count int DEFAULT 0;

-- 3. Resumes Table (for parsed data and files)
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text,
  parsed_content jsonb DEFAULT '{}'::jsonb,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Applications Table (ATS Core)
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES public.resumes(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending', 'reviewed', 'interviewing', 'rejected', 'offered')) DEFAULT 'pending',
  cover_letter text,
  answers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Prevent duplicate applications for the same job
  UNIQUE(job_id, user_id)
);

-- 5. RLS Policies
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Resumes: Users can manage their own
CREATE POLICY "Users can manage own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- Applications: Jobseekers can view/insert their own
CREATE POLICY "Jobseekers can manage own applications" ON public.applications
  FOR ALL USING (auth.uid() = user_id);

-- Applications: Employers can view applications for their jobs
CREATE POLICY "Employers can view applications for their jobs" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- Applications: Employers can update status of applications for their jobs
CREATE POLICY "Employers can update application status" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- 6. Trigger to increment application_count
CREATE OR REPLACE FUNCTION public.handle_new_application()
RETURNS trigger AS $$
BEGIN
  UPDATE public.jobs
  SET application_count = application_count + 1
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

CREATE TRIGGER on_application_created
  AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_application();

-- 7. Indexes for Performance
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes (user_id);
CREATE INDEX IF NOT EXISTS applications_job_id_idx ON public.applications (job_id);
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON public.applications (user_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON public.applications (status);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON public.jobs (status);
