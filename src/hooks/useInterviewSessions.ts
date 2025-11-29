import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

// Aligns with backend interview_sessions schema, but keeps fields optional
// so we can evolve without breaking callers.
export interface InterviewSession {
  id: string;
  user_id: string;
  role?: string;
  industry?: string;
  experience_level?: string;
  scenario?: string | null;
  questions_attempted?: number;
  questions_completed?: number;
  total_questions?: number;
  session_duration_minutes?: number;
  status?: string;
  completion_percentage?: number;
  session_data?: any; // JSONB: { answers: InterviewAnswer[], scores, meta, ... }
  avg_response_time_seconds?: number;
  confidence_score?: number;
  ai_feedback?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  audio_urls?: Record<string, string>; // JSONB object mapping questionId to audio URL
}

export interface InterviewAnswer {
  questionId: number | string;
  question: string;
  answer: string;
  audioUrl?: string; // URL to the audio recording in Supabase Storage
  score?: number;
  feedback?: {
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
  timeSpent: number;
}

export const useInterviewSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  const isReady = () => !!user?.id;

  useEffect(() => {
    if (!isReady()) {
      setLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching interview sessions:', fetchError);
          throw fetchError;
        }
        
        console.log('Fetched interview sessions:', {
          count: data?.length || 0,
          sessions: data?.map(s => ({
            id: s.id,
            role: s.role,
            status: s.status,
            confidence_score: s.confidence_score
          }))
        });
        
        setSessions((data as InterviewSession[]) || []);
      } catch (err) {
        console.error('Error fetching interview sessions:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const createSession = async (role?: string, industry?: string, experienceLevel?: string) => {
    if (!isReady()) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const sessionData: any = {
        user_id: user!.id,
        role: role || 'General Interview',
        industry: industry || '',
        experience_level: experienceLevel || '0-2 years', // Default to '0-2 years' if not provided (NOT NULL constraint)
        status: 'in_progress',
        session_data: {},
      };

      const { data, error: insertError } = await supabase
        .from('interview_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw new Error(`Failed to create session: ${insertError.message}`);
      }

      const typed = data as InterviewSession;
      setSessions(prev => [typed, ...prev]);
      return typed;
    } catch (err) {
      console.error('Error creating interview session:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateSession = async (
    sessionId: string,
    updates: {
      questions_attempted?: number;
      questions_completed?: number;
      total_questions?: number;
      session_duration_minutes?: number;
      status?: string;
      completion_percentage?: number;
      session_data?: any;
      avg_response_time_seconds?: number;
      confidence_score?: number;
      ai_feedback?: string;
      audio_urls?: Record<string, string>;
      completed_at?: string;
    }
  ) => {
    if (!isReady()) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('interview_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .eq('user_id', user!.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const typed = data as InterviewSession;
      setSessions(prev => prev.map(s => (s.id === sessionId ? typed : s)));
      return typed;
    } catch (err) {
      console.error('Error updating interview session:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!isReady()) {
      throw new Error('User not authenticated');
    }

    try {
      const { error: deleteError } = await supabase
        .from('interview_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user!.id);

      if (deleteError) throw deleteError;

      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Error deleting interview session:', err);
      setError(err as Error);
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    saving,
    createSession,
    updateSession,
    deleteSession,
    refetch: async () => {
      if (!isReady()) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setSessions(data as InterviewSession[]);
      }
      setLoading(false);
    }
  };
};

