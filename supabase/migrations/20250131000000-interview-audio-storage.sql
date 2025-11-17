-- Add audio_urls column to interview_sessions table
-- This will store a JSONB object mapping questionId to audio URL
ALTER TABLE public.interview_sessions 
ADD COLUMN IF NOT EXISTS audio_urls JSONB DEFAULT '{}';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_audio_urls 
ON public.interview_sessions USING GIN (audio_urls);

-- Create storage bucket for interview recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('interview-recordings', 'interview-recordings', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for interview recordings
-- Users can upload their own recordings
CREATE POLICY "Users can upload their own interview recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'interview-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own recordings
CREATE POLICY "Users can view their own interview recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'interview-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own recordings
CREATE POLICY "Users can delete their own interview recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'interview-recordings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add comment
COMMENT ON COLUMN public.interview_sessions.audio_urls IS 'JSONB object mapping questionId (as string) to audio file URL in Supabase Storage';

