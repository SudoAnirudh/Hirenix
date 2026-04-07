-- ============================================================
-- ROADMAPS Table
-- Stores generated career roadmaps and user progress
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_role     TEXT NOT NULL,
  roadmap_data    JSONB NOT NULL,           -- Full roadmap object from AI
  completed_skills JSONB DEFAULT '[]'::JSONB, -- Array of skill names completed by the user
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: users can only see and manage their own roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own roadmaps" ON public.roadmaps FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roadmaps_updated_at
BEFORE UPDATE ON public.roadmaps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Index for performance
CREATE INDEX ON public.roadmaps (user_id);
