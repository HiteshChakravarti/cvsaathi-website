import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UserStats {
  lessonsCompleted: number;
  daysStreak: number;
  points: number;
  resumesCreated: number;
  applicationsSubmitted: number;
  interviewsCompleted: number;
  profileCompleteness: number;
  aiSessionsCompleted: number;
  totalTimeSpent: number; // in minutes
}

// Helper functions for calculations
function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 0;
  
  const fields = [
    'first_name', 'last_name', 'bio', 'location', 'job_title',
    'company', 'experience', 'skills', 'phone', 'linkedin'
  ];
  
  const completedFields = fields.filter(field => 
    profile[field] && profile[field].toString().trim().length > 0
  ).length;
  
  return Math.round((completedFields / fields.length) * 100);
}

function calculateDaysStreak(activityArrays: any[]): number {
  const allActivities = activityArrays.flat().filter(Boolean);
  if (allActivities.length === 0) return 0;

  // Get unique dates from all activities
  const activityDates = [...new Set(
    allActivities.map(activity => 
      new Date(activity.created_at).toDateString()
    )
  )].sort();

  // Calculate consecutive days
  let currentStreak = 0;
  let maxStreak = 0;
  const today = new Date().toDateString();
  
  for (let i = 0; i < activityDates.length; i++) {
    const currentDate = new Date(activityDates[i]);
    const nextDate = i < activityDates.length - 1 ? new Date(activityDates[i + 1]) : null;
    
    if (nextDate) {
      const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak + 1);
        currentStreak = 0;
      }
    } else {
      // Check if last activity was today or yesterday
      const lastActivityDate = currentDate.toDateString();
      const dayDiff = (new Date(today).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff <= 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      }
    }
  }
  
  return maxStreak;
}

function calculatePoints(activities: {
  resumes: number;
  applications: number;
  interviews: number;
  profileCompleteness: number;
  aiCreditsUsed: number;
}): number {
  let points = 0;
  
  // Points for activities
  points += activities.resumes * 50; // 50 points per resume
  points += activities.applications * 25; // 25 points per application
  points += activities.interviews * 100; // 100 points per interview
  
  // Points for profile completeness
  points += Math.round(activities.profileCompleteness * 2); // 2 points per % complete
  
  // Points for AI usage (engagement)
  points += Math.round(activities.aiCreditsUsed * 0.1); // 0.1 points per AI credit used
  
  return points;
}

export function getUserLevel(points: number): { level: number; title: string } {
  if (points < 100) return { level: 1, title: 'Beginner' };
  if (points < 500) return { level: 2, title: 'Learner' };
  if (points < 1000) return { level: 3, title: 'Enthusiast' };
  if (points < 2000) return { level: 4, title: 'Professional' };
  if (points < 5000) return { level: 5, title: 'Expert' };
  return { level: 6, title: 'Master' };
}

export const useUserStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<UserStats>({
    lessonsCompleted: 0,
    daysStreak: 0,
    points: 0,
    resumesCreated: 0,
    applicationsSubmitted: 0,
    interviewsCompleted: 0,
    profileCompleteness: 0,
    aiSessionsCompleted: 0,
    totalTimeSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    
    async function fetchStats() {
      try {
        // Fetch all relevant data (live, per-user) from existing tables
        const [
          { data: resumes },
          { data: applications },
          { data: interviews },
          { data: profile },
          { data: aiMessages },
          { data: userStatsRow },
        ] = await Promise.all([
          supabase.from('resumes').select('id, created_at').eq('user_id', userId),
          supabase.from('applications').select('id, created_at, status').eq('user_id', userId),
          // Only completed interviews count toward "interviewsCompleted"
          supabase.from('interview_sessions').select('id, created_at, duration_minutes, completed_at').eq('user_id', userId),
          supabase.from('profiles').select('*').eq('user_id', userId).single(),
          // AI sessions are counted when at least one AI reply exists for a session_id
          supabase.from('ai_chat_conversations').select('session_id, created_at, response').eq('user_id', userId),
          // Optional snapshot counters (if present)
          supabase.from('user_stats').select('resumes_created, interviews_practiced, ai_conversations, total_time_spent, current_streak, ats_average_score').eq('user_id', userId).maybeSingle(),
        ]);

        if (!isMounted) return;

        // Calculate profile completeness
        const profileCompleteness = calculateProfileCompleteness(profile);
        
        // Calculate days streak (consecutive days with activity)
        const daysStreak = calculateDaysStreak([resumes, applications, interviews]);
        
        // Calculate points based on activities
        const points = calculatePoints({
          resumes: resumes?.length || 0,
          applications: applications?.length || 0,
          interviews: (interviews || []).filter(i => i?.completed_at).length || 0,
          profileCompleteness,
          // Use number of AI sessions (unique session_id with a non-empty response) as engagement proxy
          aiCreditsUsed: (() => {
            const unique = new Set<string>();
            (aiMessages || []).forEach((m: any) => {
              if (m?.response && String(m.response).trim().length > 0 && m?.session_id) {
                unique.add(m.session_id);
              }
            });
            return unique.size;
          })(),
        });

        // Calculate total time spent (interview sessions)
        const totalTimeSpent = ((interviews || []).reduce((total, session) => 
          total + (session?.duration_minutes || 0), 0) || 0);

        // Calculate lessons completed (resumes + interviews + applications)
        const lessonsCompleted = (resumes?.length || 0) + 
                                (((interviews || []).filter(i => i?.completed_at).length) || 0) + 
                                (applications?.length || 0);

        // AI sessions completed (unique session_ids with a non-empty response)
        const aiSessionsCompleted = (() => {
          const unique = new Set<string>();
          (aiMessages || []).forEach((m: any) => {
            if (m?.response && String(m.response).trim().length > 0 && m?.session_id) {
              unique.add(m.session_id);
            }
          });
          return unique.size;
        })();

        // Prefer snapshot counters from user_stats when available; otherwise fallback to live counts
        const resumesCreated = userStatsRow?.resumes_created ?? (resumes?.length || 0);
        const interviewsCompleted = userStatsRow?.interviews_practiced ?? (((interviews || []).filter(i => i?.completed_at).length) || 0);
        const aiConversations = userStatsRow?.ai_conversations ?? aiSessionsCompleted;
        const totalMinutes = userStatsRow?.total_time_spent ?? totalTimeSpent;
        const streak = userStatsRow?.current_streak ?? daysStreak;

        setStats({
          lessonsCompleted,
          daysStreak: streak,
          points,
          resumesCreated,
          applicationsSubmitted: applications?.length || 0,
          interviewsCompleted,
          profileCompleteness,
          aiSessionsCompleted: aiConversations,
          totalTimeSpent: totalMinutes,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [userId]);

  return { stats, loading };
};