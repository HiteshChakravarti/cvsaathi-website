-- Create video_resumes table
CREATE TABLE IF NOT EXISTS public.video_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  script TEXT,
  template TEXT NOT NULL DEFAULT 'professional',
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0, -- Duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create video-resumes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-resumes', 'video-resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.video_resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own video resumes" ON public.video_resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video resumes" ON public.video_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video resumes" ON public.video_resumes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video resumes" ON public.video_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage policies
CREATE POLICY "Users can upload their own video resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'video-resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own video resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'video-resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own video resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'video-resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_resumes_user_id ON public.video_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_resumes_created_at ON public.video_resumes(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_resumes_updated_at 
  BEFORE UPDATE ON public.video_resumes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
