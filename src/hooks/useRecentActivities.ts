import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface RecentActivity {
  id: string;
  type: 'resume' | 'ai_session' | 'interview' | 'ats_check' | 'skill_gap';
  name: string;
  timestamp: string;
  avatar: string;
}

export const useRecentActivities = (limit: number = 4) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Fetch recent activities from different tables
        const [
          { data: resumes },
          { data: aiSessions },
          { data: interviews },
          { data: atsChecks },
          { data: skillGaps }
        ] = await Promise.all([
          // Recent resume updates
          supabase
            .from('resumes')
            .select('id, updated_at, created_at')
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
          
          // Recent ATS checks
          supabase
            .from('uploaded_resumes')
            .select('id, analyzed_at, uploaded_at')
            .eq('user_id', user.id)
            .order('analyzed_at', { ascending: false })
            .limit(10),
          
          // Recent skill gap analyses
          supabase
            .from('skill_gap_analyses')
            .select('id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
        ]);

        // Combine and format activities
        const allActivities: RecentActivity[] = [];

        // Resume activities
        resumes?.data?.forEach((resume: any) => {
          const timestamp = resume.updated_at || resume.created_at;
          allActivities.push({
            id: resume.id,
            type: 'resume',
            name: 'Resume Updated',
            timestamp,
            avatar: 'from-teal-400 to-cyan-500'
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
            name: 'ATS Check',
            timestamp,
            avatar: 'from-emerald-400 to-teal-500'
          });
        });

        // Skill Gap Analysis activities
        skillGaps?.data?.forEach((analysis: any) => {
          allActivities.push({
            id: analysis.id,
            type: 'skill_gap',
            name: 'Skill Gap Analysis',
            timestamp: analysis.created_at,
            avatar: 'from-orange-400 to-red-500'
          });
        });

        // Sort by timestamp (most recent first) and limit
        allActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(allActivities.slice(0, limit));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
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
    loading 
  };
};

