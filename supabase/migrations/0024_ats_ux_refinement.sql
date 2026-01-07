-- Migration: 0024_ats_ux_refinement.sql
-- Description: Refines application_notes and application_messages for better ATS UX.

-- 1. Refine application_notes
ALTER TABLE public.application_notes
ADD COLUMN IF NOT EXISTS employer_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;

-- Add index for notes performance
CREATE INDEX IF NOT EXISTS application_notes_application_id_created_at_idx 
ON public.application_notes (application_id, created_at DESC);

-- 2. Refine application_messages
ALTER TABLE public.application_messages
ADD COLUMN IF NOT EXISTS sender_id uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Add index for messages performance
CREATE INDEX IF NOT EXISTS application_messages_application_id_created_at_idx 
ON public.application_messages (application_id, created_at ASC);

-- 3. RLS Refinements

-- application_notes: Employer manage
DROP POLICY IF EXISTS "Employer manage notes" ON public.application_notes;
CREATE POLICY "Employer manage notes" ON public.application_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_notes.application_id AND j.employer_id = auth.uid()
    )
  );

-- application_messages: Employer and Candidate
DROP POLICY IF EXISTS "Participants manage messages" ON public.application_messages;
CREATE POLICY "Participants manage messages" ON public.application_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.id = application_messages.application_id 
      AND (j.employer_id = auth.uid() OR a.user_id = auth.uid())
    )
  );
