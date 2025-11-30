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
  job_url?: string | null;
  salary?: string | null;
  location?: string | null;
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
    job_url?: string | null;
    salary?: string | null;
    location?: string | null;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Format application_date to DATE format (YYYY-MM-DD)
      let applicationDate = applicationData.application_date;
      if (!applicationDate) {
        applicationDate = new Date().toISOString().split('T')[0];
      } else if (applicationDate.includes('T')) {
        // If it's a full ISO string, extract just the date part
        applicationDate = applicationDate.split('T')[0];
      }

      // Format next_interview_date to DATE format if provided
      let nextInterviewDate = applicationData.next_interview_date;
      if (nextInterviewDate && nextInterviewDate.includes('T')) {
        nextInterviewDate = nextInterviewDate.split('T')[0];
      }

      // Convert empty strings to null
      const jobUrl = applicationData.job_url?.trim() || null;
      const salary = applicationData.salary?.trim() || null;
      const location = applicationData.location?.trim() || null;
      const notes = applicationData.notes?.trim() || null;

      const { data, error: insertError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_title: applicationData.job_title.trim(),
          company: applicationData.company.trim(),
          status: applicationData.status || 'applied',
          next_interview_date: nextInterviewDate || null,
          application_date: applicationDate,
          notes: notes,
          job_url: jobUrl,
          salary: salary,
          location: location,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      setApplications(prev => [data, ...prev]);
      toast.success('Application added successfully!');
      return data;
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err as Error);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to add application: ${errorMessage}`);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateApplication = async (
    applicationId: string,
    updates: Partial<JobApplication> & {
      job_title?: string;
      company?: string;
      status?: ApplicationStatus;
      next_interview_date?: string | null;
      application_date?: string;
      notes?: string | null;
      job_url?: string | null;
      salary?: string | null;
      location?: string | null;
    }
  ) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setSaving(true);
      setError(null);

      // Format dates properly
      const updateData: any = { ...updates };
      
      if (updateData.application_date && updateData.application_date.includes('T')) {
        updateData.application_date = updateData.application_date.split('T')[0];
      }
      
      if (updateData.next_interview_date) {
        if (updateData.next_interview_date.includes('T')) {
          updateData.next_interview_date = updateData.next_interview_date.split('T')[0];
        }
      } else if (updateData.next_interview_date === '') {
        updateData.next_interview_date = null;
      }

      // Convert empty strings to null for optional fields
      if (updateData.job_url !== undefined) {
        updateData.job_url = updateData.job_url?.trim() || null;
      }
      if (updateData.salary !== undefined) {
        updateData.salary = updateData.salary?.trim() || null;
      }
      if (updateData.location !== undefined) {
        updateData.location = updateData.location?.trim() || null;
      }
      if (updateData.notes !== undefined) {
        updateData.notes = updateData.notes?.trim() || null;
      }
      if (updateData.job_title !== undefined) {
        updateData.job_title = updateData.job_title.trim();
      }
      if (updateData.company !== undefined) {
        updateData.company = updateData.company.trim();
      }

      // Remove updated_at from updates as it's handled by trigger
      delete updateData.updated_at;

      const { data, error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      setApplications(prev => prev.map(app => app.id === applicationId ? data : app));
      toast.success('Application updated successfully!');
      return data;
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err as Error);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update application: ${errorMessage}`);
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

