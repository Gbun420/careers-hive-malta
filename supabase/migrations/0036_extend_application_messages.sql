-- Migration: 0036_extend_application_messages.sql
-- Description: Add sender_id to application_messages for better tracking.

BEGIN;

ALTER TABLE public.application_messages 
ADD COLUMN IF NOT EXISTS sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMIT;
