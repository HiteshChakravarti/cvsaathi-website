import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export interface JobApplication {
  id: string;
  user_id: string;
  job_title: string;
  company: string;
  status: ApplicationStatus;
  next_interview_date?: string | null;
  application_date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export const useApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchApplications();
  }, [user?.id]);

  const fetchApplications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('application_date', { ascending: false });

      if (fetchError) throw fetchError;

      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err as Error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: {
    job_title: string;
    company: string;
    status?: ApplicationStatus;
    next_interview_date?: string | null;
    application_date?: string;
    notes?: string | null;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_title: applicationData.job_title,
          company: applicationData.company,
          status: applicationData.status || 'applied',
          next_interview_date: applicationData.next_interview_date || null,
          application_date: applicationData.application_date || new Date().toISOString(),
          notes: applicationData.notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setApplications(prev => [data, ...prev]);
      toast.success('Application added successfully!');
      return data;
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err as Error);
      toast.error('Failed to add application');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateApplication = async (
    applicationId: string,
    updates: Partial<JobApplication>
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setApplications(prev => prev.map(app => app.id === applicationId ? data : app));
      toast.success('Application updated successfully!');
      return data;
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err as Error);
      toast.error('Failed to update application');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast.success('Application deleted successfully!');
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err as Error);
      toast.error('Failed to delete application');
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    saving,
    createApplication,
    updateApplication,
    deleteApplication,
    refetch: fetchApplications,
  };
};

