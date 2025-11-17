import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface InterviewSession {
  id: string;
  user_id: string;
  target_roles?: string;
  industry?: string;
  questions?: any[]; // JSONB array of questions and answers
  audio_urls?: Record<string, string>; // JSONB object mapping questionId to audio URL
  total_score?: number;
  average_score?: number;
  duration_minutes?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewAnswer {
  questionId: number;
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

  useEffect(() => {
    if (!user?.id) {
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setSessions(data || []);
      } catch (err) {
        console.error('Error fetching interview sessions:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const createSession = async (role?: string, industry?: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const sessionData: any = {
        user_id: user.id,
        target_roles: role || 'General Interview',
        industry: industry || '',
        // questions will be set when session is completed
        // duration_minutes will be set when session is completed
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

      setSessions(prev => [data, ...prev]);
      return data;
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
      questions?: InterviewAnswer[];
      audio_urls?: Record<string, string>;
      total_score?: number;
      average_score?: number;
      duration_minutes?: number;
      completed_at?: string;
    }
  ) => {
    if (!user?.id) {
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
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSessions(prev => prev.map(s => s.id === sessionId ? data : s));
      return data;
    } catch (err) {
      console.error('Error updating interview session:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error: deleteError } = await supabase
        .from('interview_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

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
      if (user?.id) {
        setLoading(true);
        const { data, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setSessions(data);
        }
        setLoading(false);
      }
    }
  };
};

