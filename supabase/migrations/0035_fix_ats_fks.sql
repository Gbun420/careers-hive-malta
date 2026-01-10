-- Migration: 0035_fix_ats_fks.sql
-- Description: Point ATS tables' user-related FKs to profiles(id) for consistent joins.

BEGIN;

-- 1. Fix application_notes.author_user_id
ALTER TABLE public.application_notes DROP CONSTRAINT IF EXISTS application_notes_author_user_id_fkey;
ALTER TABLE public.application_notes
  ADD CONSTRAINT application_notes_author_user_id_fkey
  FOREIGN KEY (author_user_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- 2. Fix job_alerts.user_id
ALTER TABLE public.job_alerts DROP CONSTRAINT IF EXISTS job_alerts_user_id_fkey;
ALTER TABLE public.job_alerts
  ADD CONSTRAINT job_alerts_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

COMMIT;
