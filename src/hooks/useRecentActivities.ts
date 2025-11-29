import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface RecentActivity {
  id: string;
  type: 'resume' | 'ai_session' | 'interview' | 'ats_check' | 'skill_gap';
  name: string;
  timestamp: string;
  avatar: string;
  metadata?: {
    resumeName?: string;
    targetRole?: string;
    fileName?: string;
  };
}

export const useRecentActivities = (limit: number = 4) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Fetch recent activities from different tables
        // Using Promise.allSettled to handle individual failures gracefully
        const results = await Promise.allSettled([
          // Recent resume updates (with name)
          supabase
            .from('resumes')
            .select('id, name, updated_at, created_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(10),
          
          // Recent AI chat sessions
          supabase
            .from('ai_chat_conversations')
            .select('session_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          
          // Recent interview sessions
          supabase
            .from('interview_sessions')
            .select('id, created_at, completed_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          
          // Recent ATS checks (handle null analyzed_at)
          supabase
            .from('uploaded_resumes')
            .select('id, file_name, analyzed_at, uploaded_at')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false })
            .limit(10),
          
          // Recent skill gap analyses
          supabase
            .from('skill_gap_analyses')
            .select('id, target_role, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        // Extract data from results, handling failures
        const resumes = results[0].status === 'fulfilled' ? results[0].value : { data: null, error: results[0].status === 'rejected' ? { message: 'Failed to fetch resumes' } : null };
        const aiSessions = results[1].status === 'fulfilled' ? results[1].value : { data: null, error: results[1].status === 'rejected' ? { message: 'Failed to fetch AI sessions' } : null };
        const interviews = results[2].status === 'fulfilled' ? results[2].value : { data: null, error: results[2].status === 'rejected' ? { message: 'Failed to fetch interviews' } : null };
        const atsChecks = results[3].status === 'fulfilled' ? results[3].value : { data: null, error: results[3].status === 'rejected' ? { message: 'Failed to fetch ATS checks' } : null };
        const skillGaps = results[4].status === 'fulfilled' ? results[4].value : { data: null, error: results[4].status === 'rejected' ? { message: 'Failed to fetch skill gaps' } : null };

        // Check for errors and log them
        const errors = [
          resumes.error,
          aiSessions.error,
          interviews.error,
          atsChecks.error,
          skillGaps.error
        ].filter(Boolean);

        if (errors.length > 0) {
          console.warn('Some activity queries failed:', errors);
          // Don't set error state if we still have some data
        }

        // Combine and format activities
        const allActivities: RecentActivity[] = [];

        // Resume activities
        resumes?.data?.forEach((resume: any) => {
          const timestamp = resume.updated_at || resume.created_at;
          allActivities.push({
            id: resume.id,
            type: 'resume',
            name: 'Resume Updated', // Will be translated in component
            timestamp,
            avatar: 'from-teal-400 to-cyan-500',
            metadata: {
              resumeName: resume.name || 'Untitled Resume'
            }
          });
        });

        // AI Session activities (group by session_id to avoid duplicates)
        const uniqueAISessions = new Map();
        aiSessions?.data?.forEach((session: any) => {
          if (!uniqueAISessions.has(session.session_id)) {
            uniqueAISessions.set(session.session_id, session);
            allActivities.push({
              id: session.session_id,
              type: 'ai_session',
              name: 'AI Session',
              timestamp: session.created_at,
              avatar: 'from-purple-400 to-pink-500'
            });
          }
        });

        // Interview activities
        interviews?.data?.forEach((interview: any) => {
          const timestamp = interview.completed_at || interview.created_at;
          allActivities.push({
            id: interview.id,
            type: 'interview',
            name: 'Interview Prep',
            timestamp,
            avatar: 'from-blue-400 to-indigo-500'
          });
        });

        // ATS Check activities
        atsChecks?.data?.forEach((check: any) => {
          const timestamp = check.analyzed_at || check.uploaded_at;
          allActivities.push({
            id: check.id,
            type: 'ats_check',
            name: 'ATS Check', // Will be translated in component
            timestamp,
            avatar: 'from-emerald-400 to-teal-500',
            metadata: {
              fileName: check.file_name || 'Resume'
            }
          });
        });

        // Skill Gap Analysis activities
        skillGaps?.data?.forEach((analysis: any) => {
          allActivities.push({
            id: analysis.id,
            type: 'skill_gap',
            name: 'Skill Gap Analysis', // Will be translated in component
            timestamp: analysis.created_at,
            avatar: 'from-orange-400 to-red-500',
            metadata: {
              targetRole: analysis.target_role || 'Role Analysis'
            }
          });
        });

        // Sort by timestamp (most recent first) and limit
        allActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(allActivities.slice(0, limit));
        setError(null);
      } catch (error: any) {
        console.error('Error fetching recent activities:', error);
        setError(error.message || 'Failed to load recent activities');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id, limit]);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return time.toLocaleDateString();
  };

  return { 
    activities: activities.map(activity => ({
      ...activity,
      formattedTime: formatTimestamp(activity.timestamp)
    })), 
    loading,
    error
  };
};

