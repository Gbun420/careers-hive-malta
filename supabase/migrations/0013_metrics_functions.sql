-- Metrics helper functions for Careers Hive Dynamic Data
-- Adheres to the Dynamic Data Integration Guide

CREATE OR REPLACE FUNCTION public.get_avg_notification_delivery_time()
RETURNS float8 AS $$
  SELECT 
    AVG(EXTRACT(EPOCH FROM (sent_at - created_at)) / 60)
  FROM public.notifications 
  WHERE sent_at IS NOT NULL 
  AND created_at >= NOW() - INTERVAL '7 days';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_verified_postings_percentage()
RETURNS float8 AS $$
  SELECT 
    COALESCE(ROUND((COUNT(CASE WHEN ev.status = 'approved' THEN 1 END) 
    * 100.0 / NULLIF(COUNT(*), 0))::NUMERIC, 1), 0)::float8
  FROM public.jobs j
  LEFT JOIN public.employer_verifications ev ON j.employer_id = ev.employer_id 
  WHERE j.is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_avg_verification_days()
RETURNS float8 AS $$
  SELECT 
    COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at)) / 86400)::NUMERIC, 1), 0)::float8
  FROM public.employer_verifications 
  WHERE status = 'approved' 
  AND reviewed_at IS NOT NULL 
  AND submitted_at IS NOT NULL
  AND reviewed_at >= NOW() - INTERVAL '60 days';
$$ LANGUAGE sql STABLE SECURITY DEFINER;
