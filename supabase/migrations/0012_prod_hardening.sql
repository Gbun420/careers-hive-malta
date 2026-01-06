-- Enable pg_trgm extension first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS jobs_is_active_idx ON public.jobs (is_active);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_title_trgm_idx ON public.jobs USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS jobs_location_idx ON public.jobs (location);
CREATE INDEX IF NOT EXISTS saved_searches_jobseeker_id_idx ON public.saved_searches (jobseeker_id);

-- RLS Hardening
-- Ensure users can only insert reports as themselves
DROP POLICY IF EXISTS "Users can insert job reports" ON public.job_reports;
CREATE POLICY "Users can insert job reports" ON public.job_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Hardening: allow service role or authenticated users to insert for themselves
DROP POLICY IF EXISTS "notifications_insert_service" ON public.notifications;
CREATE POLICY "notifications_insert_service" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Admin Jobs Policy
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
CREATE POLICY "Admins can manage all jobs" ON public.jobs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );