-- Create table for storing uploaded resumes for ATS analysis
CREATE TABLE IF NOT EXISTS public.uploaded_resumes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text,
  extracted_text text,
  ats_score integer,
  analysis_results text,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'completed', 'failed')),
  uploaded_at timestamp with time zone DEFAULT now(),
  analyzed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_uploaded_resumes_user_id ON public.uploaded_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_resumes_status ON public.uploaded_resumes(analysis_status);
CREATE INDEX IF NOT EXISTS idx_uploaded_resumes_uploaded_at ON public.uploaded_resumes(uploaded_at);

-- Enable Row Level Security
ALTER TABLE public.uploaded_resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own uploaded resumes" 
  ON public.uploaded_resumes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploaded resumes" 
  ON public.uploaded_resumes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded resumes" 
  ON public.uploaded_resumes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded resumes" 
  ON public.uploaded_resumes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_uploaded_resumes_updated_at ON public.uploaded_resumes;
CREATE TRIGGER update_uploaded_resumes_updated_at
    BEFORE UPDATE ON public.uploaded_resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful comments
COMMENT ON TABLE public.uploaded_resumes IS 'Stores resumes uploaded by users for ATS analysis';
COMMENT ON COLUMN public.uploaded_resumes.file_name IS 'Original name of the uploaded file';
COMMENT ON COLUMN public.uploaded_resumes.file_type IS 'MIME type of the uploaded file';
COMMENT ON COLUMN public.uploaded_resumes.extracted_text IS 'Text content extracted from the uploaded resume';
COMMENT ON COLUMN public.uploaded_resumes.ats_score IS 'ATS compatibility score (0-100)';
COMMENT ON COLUMN public.uploaded_resumes.analysis_results IS 'Detailed ATS analysis results';
COMMENT ON COLUMN public.uploaded_resumes.analysis_status IS 'Status of the analysis: pending, completed, or failed';