-- Migration: 0030_admin_ops_core.sql
-- Description: Core tables and fields for Admin Operations.

-- A) Employer verification fields on profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS verification_notes text;

-- B) Update audit_logs to include actor_email for easier triage
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS actor_email text;

-- C) Ensure RLS policies for audit_logs are robust and case-insensitive
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  ) OR auth.role() = 'service_role'
);

-- D) Case-insensitive admin RLS for employer_verifications
DROP POLICY IF EXISTS "Admins can read verifications" ON public.employer_verifications;
CREATE POLICY "Admins can read verifications"
ON public.employer_verifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update verifications" ON public.employer_verifications;
CREATE POLICY "Admins can update verifications"
ON public.employer_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
);

-- E) Case-insensitive admin RLS for job_reports
DROP POLICY IF EXISTS "Admins can read reports" ON public.job_reports;
CREATE POLICY "Admins can read reports"
ON public.job_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update reports" ON public.job_reports;
CREATE POLICY "Admins can update reports"
ON public.job_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND LOWER(p.role) = 'admin'
  )
);
