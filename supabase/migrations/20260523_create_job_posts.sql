-- ============================================================
-- JOB POSTINGS (aggregated from Twitter/X)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  company       TEXT NOT NULL,
  location      TEXT NOT NULL,
  apply_url     TEXT,
  description   TEXT,
  requirements  TEXT[] DEFAULT '{}'::TEXT[],
  tweet_id      TEXT UNIQUE, -- To prevent duplicate insertions from the same tweet
  posted_at     TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public, authenticated, anonymous) to read jobs
CREATE POLICY "Allow public read job_posts" ON public.job_posts FOR SELECT USING (true);
