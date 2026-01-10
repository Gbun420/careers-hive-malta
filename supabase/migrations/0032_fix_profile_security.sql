-- Migration: 0032_fix_profile_security.sql
-- Description: Protect sensitive profile fields (role, verification_status) from self-update.

CREATE OR REPLACE FUNCTION public.check_profile_updates()
RETURNS TRIGGER AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- If usage is from service_role, bypass checks
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Check if the requesting user is an admin
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;

  -- 1. Protect ROLE changes
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT is_admin THEN
       RAISE EXCEPTION 'Unauthorized: Only admins can change roles.';
    END IF;
  END IF;

  -- 2. Protect VERIFICATION_STATUS changes
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF NOT is_admin THEN
       RAISE EXCEPTION 'Unauthorized: Only admins can change verification status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_profile_sensitive_updates ON public.profiles;

CREATE TRIGGER protect_profile_sensitive_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_updates();
