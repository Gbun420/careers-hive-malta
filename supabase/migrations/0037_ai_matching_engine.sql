-- Phase 2: Semantic AI Matching Engine
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding support to Jobs and Profiles
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Table for match score persistence
CREATE TABLE IF NOT EXISTS public.ai_match_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  score float NOT NULL,
  match_reasons text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, profile_id)
);

-- Fast Vector search index
CREATE INDEX IF NOT EXISTS jobs_embedding_idx ON public.jobs USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS profiles_embedding_idx ON public.profiles USING hnsw (embedding vector_cosine_ops);

-- Similarity matching function
CREATE OR REPLACE FUNCTION match_jobs_to_profile(
  p_profile_id UUID,
  p_match_threshold FLOAT DEFAULT 0.5,
  p_match_count INT DEFAULT 10
)
RETURNS TABLE (
  job_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id AS job_id,
    1 - (j.embedding <=> (SELECT embedding FROM public.profiles WHERE id = p_profile_id)) AS similarity
  FROM
    public.jobs j
  WHERE
    j.is_active = true
    AND j.embedding IS NOT NULL
    AND 1 - (j.embedding <=> (SELECT embedding FROM public.profiles WHERE id = p_profile_id)) > p_match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    p_match_count;
END;
$$;
