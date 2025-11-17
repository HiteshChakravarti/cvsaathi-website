-- =====================================================
-- USAGE TRACKING TABLE
-- =====================================================
-- This table tracks feature usage for subscription limits
-- Supports monthly billing periods with automatic resets
-- =====================================================

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  resource_subtype TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one record per user/resource/period combination
  CONSTRAINT usage_tracking_unique_key UNIQUE (user_id, resource_type, resource_subtype, billing_period_start, billing_period_end)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id 
  ON public.usage_tracking(user_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type 
  ON public.usage_tracking(resource_type);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_billing_period 
  ON public.usage_tracking(billing_period_start, billing_period_end);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_resource 
  ON public.usage_tracking(user_id, resource_type, billing_period_start);

-- Enable Row Level Security
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own usage data
CREATE POLICY "Users can view their own usage tracking" 
  ON public.usage_tracking
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage tracking" 
  ON public.usage_tracking
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage tracking" 
  ON public.usage_tracking
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own usage tracking" 
  ON public.usage_tracking
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_usage_tracking_updated_at_trigger
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_tracking_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_tracking TO authenticated;

-- Add helpful comment
COMMENT ON TABLE public.usage_tracking IS 'Tracks feature usage for subscription limits with monthly billing periods';
COMMENT ON COLUMN public.usage_tracking.resource_type IS 'Type of resource being tracked (e.g., resume_creation, pdf_export, ai_career_coaching)';
COMMENT ON COLUMN public.usage_tracking.resource_subtype IS 'Optional subtype for more granular tracking (e.g., with_watermark, clean)';
COMMENT ON COLUMN public.usage_tracking.usage_count IS 'Number of times the resource was used in this billing period';
COMMENT ON COLUMN public.usage_tracking.billing_period_start IS 'Start date of the billing period (typically 1st of month)';
COMMENT ON COLUMN public.usage_tracking.billing_period_end IS 'End date of the billing period (typically last day of month)';
COMMENT ON COLUMN public.usage_tracking.metadata IS 'Additional metadata about usage (JSON format)';

-- =====================================================
-- SAMPLE RESOURCE TYPES
-- =====================================================
-- Core Features:
--   - resume_creation: Resume saves/creates
--   - pdf_export: PDF downloads (subtypes: with_watermark, clean)
--   - ai_career_coaching: Career guidance sessions
--   - ai_interview_prep: Interview questions
--   - ai_mock_interview: Mock interview sessions
--   - skill_gap_analysis: Skill analysis requests
--
-- Additional Features (Future):
--   - ats_scan: ATS compatibility checks
--   - cover_letter_generation: AI cover letters
--   - template_download: Resume template downloads
--   - job_applications: Job application tracking
--   - salary_insights: Salary data queries
-- =====================================================
