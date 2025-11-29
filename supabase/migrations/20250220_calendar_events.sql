-- =====================================================
-- CALENDAR EVENTS TABLE
-- =====================================================
-- This table stores user calendar events (interviews, deadlines, followups, networking)
-- Supports full CRUD operations with user isolation via RLS
-- =====================================================

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  type TEXT NOT NULL CHECK (type IN ('interview', 'deadline', 'followup', 'networking')),
  company TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure title is not empty
  CONSTRAINT calendar_events_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id 
  ON public.calendar_events(user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date 
  ON public.calendar_events(date);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date 
  ON public.calendar_events(user_id, date);

CREATE INDEX IF NOT EXISTS idx_calendar_events_type 
  ON public.calendar_events(type);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own calendar events
CREATE POLICY "Users can view their own calendar events" 
  ON public.calendar_events
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" 
  ON public.calendar_events
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
  ON public.calendar_events
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
  ON public.calendar_events
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.calendar_events IS 'Stores user calendar events including interviews, deadlines, followups, and networking events';

