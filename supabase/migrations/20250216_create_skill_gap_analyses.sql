-- Create table for storing Skill Gap Analyses history
CREATE TABLE IF NOT EXISTS public.skill_gap_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_role text,
  industry text,
  analysis_data text,              -- Full analysis payload (stringified JSON)
  recommendations text,            -- Learning recommendations (stringified JSON)
  overall_score integer,           -- 0-100
  match_percentage integer,        -- 0-100
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_skill_gap_analyses_user_id ON public.skill_gap_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_analyses_created_at ON public.skill_gap_analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.skill_gap_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Select
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'skill_gap_analyses' 
      AND policyname = 'Users can view their own skill gap analyses'
  ) THEN
    CREATE POLICY "Users can view their own skill gap analyses"
      ON public.skill_gap_analyses
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'skill_gap_analyses' 
      AND policyname = 'Users can insert their own skill gap analyses'
  ) THEN
    CREATE POLICY "Users can insert their own skill gap analyses"
      ON public.skill_gap_analyses
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'skill_gap_analyses' 
      AND policyname = 'Users can update their own skill gap analyses'
  ) THEN
    CREATE POLICY "Users can update their own skill gap analyses"
      ON public.skill_gap_analyses
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  -- Delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'skill_gap_analyses' 
      AND policyname = 'Users can delete their own skill gap analyses'
  ) THEN
    CREATE POLICY "Users can delete their own skill gap analyses"
      ON public.skill_gap_analyses
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_update_skill_gap_analyses_updated_at ON public.skill_gap_analyses;
CREATE TRIGGER trg_update_skill_gap_analyses_updated_at
  BEFORE UPDATE ON public.skill_gap_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comments for clarity
COMMENT ON TABLE public.skill_gap_analyses IS 'Stores user Skill Gap Analysis runs for history and recent activity';
COMMENT ON COLUMN public.skill_gap_analyses.analysis_data IS 'Full analysis results as stringified JSON (kept as text for frontend compatibility)';
COMMENT ON COLUMN public.skill_gap_analyses.recommendations IS 'Learning recommendations as stringified JSON';

