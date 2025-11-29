import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type FeedbackType = 'general' | 'bug' | 'feature' | 'support';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Feedback {
  id: string;
  user_id: string;
  message: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  app_version: string | null;
  device_info: Record<string, any> | null;
  screen_context: string | null;
  sentiment_score: number | null;
  response_required: boolean | null;
  rating: number | null;
}

export interface CreateFeedbackInput {
  message: string;
  type: FeedbackType;
  rating?: number | null;
  screen_context?: string | null;
  priority?: FeedbackPriority;
  response_required?: boolean;
}

// Auto-detect device info
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return null;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

// Get app version from package.json or env
const getAppVersion = () => {
  // You can set this from environment variable or package.json
  return process.env.REACT_APP_VERSION || '1.0.0';
};

// Auto-determine priority based on type and rating
const determinePriority = (type: FeedbackType, rating?: number | null): FeedbackPriority => {
  if (type === 'bug') return 'high';
  if (type === 'support') return 'high';
  if (rating !== null && rating !== undefined && rating <= 2) return 'high';
  if (type === 'feature') return 'medium';
  return 'low';
};

// Auto-determine if response is required
const determineResponseRequired = (type: FeedbackType, rating?: number | null): boolean => {
  if (type === 'bug') return true;
  if (type === 'support') return true;
  if (rating !== null && rating !== undefined && rating <= 2) return true;
  return false;
};

export const useFeedback = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchFeedback = useCallback(async () => {
    if (!user?.id) {
      setFeedback([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFeedback(data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const createFeedback = async (input: CreateFeedbackInput) => {
    if (!user?.id) {
      throw new Error(t('dashboard.feedback.authRequired'));
    }

    try {
      setSaving(true);
      setError(null);

      const priority = input.priority || determinePriority(input.type, input.rating);
      const responseRequired = input.response_required !== undefined 
        ? input.response_required 
        : determineResponseRequired(input.type, input.rating);

      const feedbackData = {
        user_id: user.id,
        message: input.message.trim(),
        type: input.type,
        rating: input.rating || null,
        screen_context: input.screen_context || null,
        priority,
        status: 'open' as FeedbackStatus,
        response_required: responseRequired,
        app_version: getAppVersion(),
        device_info: getDeviceInfo(),
      };

      const { data, error: insertError } = await supabase
        .from('feedback')
        .insert(feedbackData)
        .select()
        .single();

      if (insertError) throw insertError;

      setFeedback(prev => [data, ...prev]);
      toast.success(t('dashboard.feedback.submitSuccess'));
      return data;
    } catch (err) {
      console.error('Error creating feedback:', err);
      setError(err as Error);
      toast.error(t('dashboard.feedback.submitFailed', { error: (err as Error).message }));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateFeedback = async (feedbackId: string, updates: Partial<Feedback>) => {
    if (!user?.id) {
      throw new Error(t('dashboard.feedback.authRequired'));
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('feedback')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setFeedback(prev => prev.map(f => f.id === feedbackId ? data : f));
      toast.success(t('dashboard.feedback.updateSuccess'));
      return data;
    } catch (err) {
      console.error('Error updating feedback:', err);
      setError(err as Error);
      toast.error(t('dashboard.feedback.updateFailed', { error: (err as Error).message }));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!user?.id) {
      throw new Error(t('dashboard.feedback.authRequired'));
    }

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
      toast.success(t('dashboard.feedback.deleteSuccess'));
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError(err as Error);
      toast.error(t('dashboard.feedback.deleteFailed', { error: (err as Error).message }));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    feedback,
    loading,
    error,
    saving,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    refetch: fetchFeedback,
  };
};

