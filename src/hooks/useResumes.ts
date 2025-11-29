import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

// NOTE:
// Backend schema (shared with mobile app) uses:
//   - name      : text        -> resume title
//   - sections  : jsonb       -> full resume JSON (all steps)
//   - created_at / updated_at
// Frontend previously expected title / resume_data – we now align to backend
// without changing the database by mapping to these fields on the client.
export interface Resume {
  id: string;
  user_id: string;
  name?: string;        // backend column for resume title
  sections?: any;       // backend column for full resume data (JSONB)
  // legacy / compatibility fields (may be undefined)
  title?: string;
  template_id?: string;
  resume_data?: any;
  created_at: string;
  updated_at: string;
}

export const useResumes = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchResumes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('resumes')
          // Align with backend schema: use name + sections
          .select('id, user_id, name, sections, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (fetchError) throw fetchError;
        setResumes(data || []);
      } catch (err) {
        console.error('Error fetching resumes:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [user?.id]);

  const saveResume = async (resumeData: any, resumeId?: string, title?: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const resumePayload: any = {
        user_id: user.id,
        // Store full resume JSON in sections (backend-compatible)
        sections: resumeData,
        // Use backend "name" column for title so mobile + web share same data
        name: title || 'Untitled Resume',
        updated_at: new Date().toISOString(),
      };

      if (resumeId) {
        // Update existing resume
        const { data, error: updateError } = await supabase
          .from('resumes')
          .update(resumePayload)
          .eq('id', resumeId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        setResumes(prev => prev.map(r => r.id === resumeId ? data : r));
        return data;
      } else {
        // Create new resume
        const { data, error: insertError } = await supabase
          .from('resumes')
          .insert(resumePayload)
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        setResumes(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      console.error('Error saving resume:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state
      setResumes(prev => prev.filter(r => r.id !== resumeId));
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError(err as Error);
      throw err;
    }
  };

  const loadResume = (resumeId: string): Resume | undefined => {
    return resumes.find(r => r.id === resumeId);
  };

  return {
    resumes,
    loading,
    error,
    saving,
    saveResume,
    deleteResume,
    loadResume,
    refetch: async () => {
      if (user?.id) {
        setLoading(true);
        const { data, error } = await supabase
          .from('resumes')
          .select('id, user_id, name, sections, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (!error && data) {
          setResumes(data);
        }
        setLoading(false);
      }
    }
  };
};

