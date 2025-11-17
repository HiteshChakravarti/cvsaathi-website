import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  bio?: string;
  location?: string;
  job_title?: string;
  company?: string;
  experience?: string;
  skills?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  email?: string;
  avatar_url?: string;
  notifications_enabled?: boolean;
  language_pref?: string;
  created_at?: string;
  updated_at?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          // If profile doesn't exist, create a new one
          if (fetchError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                email: user.email,
                first_name: '',
                last_name: '',
              })
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
          } else {
            throw fetchError;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, error, saving, updateProfile, refetch: () => {
    if (user?.id) {
      setLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data);
          }
          setLoading(false);
        });
    }
  }};
};

