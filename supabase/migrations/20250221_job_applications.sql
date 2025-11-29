-- =====================================================
-- JOB APPLICATIONS TABLE
-- =====================================================
-- This table stores user job applications for tracking
-- Supports full CRUD operations with user isolation via RLS
-- =====================================================

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')) DEFAULT 'applied',
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_interview_date DATE,
  notes TEXT,
  job_url TEXT,
  salary TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure required fields are not empty
  CONSTRAINT applications_job_title_not_empty CHECK (length(trim(job_title)) > 0),
  CONSTRAINT applications_company_not_empty CHECK (length(trim(company)) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id 
  ON public.applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_status 
  ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_applications_application_date 
  ON public.applications(application_date);

CREATE INDEX IF NOT EXISTS idx_applications_user_status 
  ON public.applications(user_id, status);

CREATE INDEX IF NOT EXISTS idx_applications_next_interview_date 
  ON public.applications(next_interview_date)
  WHERE next_interview_date IS NOT NULL;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running the migration)
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON public.applications;

-- RLS Policies: Users can only access their own applications
CREATE POLICY "Users can view their own applications" 
  ON public.applications
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" 
  ON public.applications
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
  ON public.applications
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" 
  ON public.applications
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.applications IS 'Stores user job applications for tracking application status and progress';

