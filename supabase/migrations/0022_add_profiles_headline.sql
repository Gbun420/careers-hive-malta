-- Migration: 0022_add_profiles_headline.sql
-- Description: Adds headline column to profiles table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS headline text;

-- Optional: backfill from existing name/title if available
UPDATE public.profiles
SET headline = full_name
WHERE headline IS NULL;
