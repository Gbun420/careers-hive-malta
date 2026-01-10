-- Migration: 0033_analytics_infrastructure.sql
-- Description: Adds views_count to jobs and creates daily metrics table for analytics.

-- 1. Add views_count to jobs if not exists
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS views_count int DEFAULT 0;

-- 2. Create job_daily_metrics table
CREATE TABLE IF NOT EXISTS public.job_daily_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  views_count int DEFAULT 0,
  clicks_count int DEFAULT 0,
  applications_count int DEFAULT 0,
  UNIQUE(job_id, date)
);

-- 3. RLS for job_daily_metrics
ALTER TABLE public.job_daily_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employer read own metrics" ON public.job_daily_metrics;
CREATE POLICY "Employer read own metrics" ON public.job_daily_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_daily_metrics.job_id
      AND j.employer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage all metrics" ON public.job_daily_metrics;
CREATE POLICY "Admins manage all metrics" ON public.job_daily_metrics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- 4. RPC to safely increment metrics (atomic update)
CREATE OR REPLACE FUNCTION public.track_job_metric(
  p_job_id uuid,
  p_type text -- 'view', 'click', 'application'
)
RETURNS void AS $$
BEGIN
  -- 1. Update main jobs table counters
  IF p_type = 'view' THEN
    UPDATE public.jobs SET views_count = views_count + 1 WHERE id = p_job_id;
  END IF;
  -- 'application' count is usually handled by a trigger on applications table, 
  -- but we can track it here too for the daily breakdown if needed.
  -- For now, we assume application_count on jobs is handled separately or we add it here.
  
  -- 2. Upsert daily metrics
  INSERT INTO public.job_daily_metrics (job_id, date, views_count, clicks_count, applications_count)
  VALUES (
    p_job_id, 
    CURRENT_DATE, 
    CASE WHEN p_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN p_type = 'click' THEN 1 ELSE 0 END,
    CASE WHEN p_type = 'application' THEN 1 ELSE 0 END
  )
  ON CONFLICT (job_id, date) DO UPDATE SET
    views_count = job_daily_metrics.views_count + CASE WHEN p_type = 'view' THEN 1 ELSE 0 END,
    clicks_count = job_daily_metrics.clicks_count + CASE WHEN p_type = 'click' THEN 1 ELSE 0 END,
    applications_count = job_daily_metrics.applications_count + CASE WHEN p_type = 'application' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger to sync applications count to daily metrics (optional but good consistency)
CREATE OR REPLACE FUNCTION public.sync_application_to_metrics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.track_job_metric(NEW.job_id, 'application');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_application_created_metric ON public.applications;
CREATE TRIGGER on_application_created_metric
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_application_to_metrics();
