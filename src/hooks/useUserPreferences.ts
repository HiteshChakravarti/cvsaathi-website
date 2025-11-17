import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface UserPreferences {
  id?: string;
  user_id?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  analytics_tracking?: boolean;
  data_sharing?: boolean;
  two_factor_enabled?: boolean;
  auto_save?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          // If preferences don't exist, create default ones
          if (fetchError.code === 'PGRST116') {
            const defaultPreferences: UserPreferences = {
              user_id: user.id,
              email_notifications: true,
              push_notifications: true,
              analytics_tracking: true,
              data_sharing: false,
              two_factor_enabled: false,
              auto_save: true,
            };

            const { data: newPreferences, error: createError } = await supabase
              .from('user_preferences')
              .insert(defaultPreferences)
              .select()
              .single();

            if (createError) throw createError;
            setPreferences(newPreferences);
          } else {
            throw fetchError;
          }
        } else {
          setPreferences(data);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    error,
    saving,
    updatePreferences,
    refetch: async () => {
      if (user?.id) {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setPreferences(data);
        }
        setLoading(false);
      }
    },
  };
};

