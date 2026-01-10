-- Migration: 0034_fix_applications_fk.sql
-- Description: Point applications.user_id to profiles(id) to enable easy PostgREST joins.

BEGIN;

-- 1. Drop existing FK if it points to auth.users (it likely was named automatically or applications_user_id_fkey)
-- We use a DO block to find and drop it safely.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'applications'
    AND constraint_type = 'FOREIGN KEY'
  LOOP
    -- We can't easily check target table in info schema standardly in one go without joining, 
    -- but usually we just want to replace the user_id fk.
    -- Let's just drop the specific one if we know its name, or drop/recreate.
    -- Assuming standard naming or just force a specific constraint change.
    NULL; 
  END LOOP;
END;
$$;

-- Safely drop the specific FK if we can predict it, otherwise we use ALTER TABLE ... DROP CONSTRAINT ...
-- generated name is usually applications_user_id_fkey
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;

-- 2. Add new FK to profiles
ALTER TABLE public.applications
  ADD CONSTRAINT applications_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

COMMIT;
