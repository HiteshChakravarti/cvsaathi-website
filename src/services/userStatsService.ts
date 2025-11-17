import { supabase } from '../lib/supabaseClient';

export interface UserStats {
  user_id: string;
  resumes_created: number;
  interviews_practiced: number;
  ai_conversations: number;
  total_time_spent: number; // in minutes
  last_active_date: string;
  achievement_badges: string[];
  current_streak: number;
  ats_average_score: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

class UserStatsService {
  private userId: string | undefined;

  constructor(userId?: string) {
    this.userId = userId;
  }

  // Initialize or get user stats
  async initializeUserStats(): Promise<UserStats | null> {
    if (!this.userId) return null;

    try {
      // Check if stats exist
      let { data: existingStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Stats don't exist, create them
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: this.userId,
            resumes_created: 0,
            interviews_practiced: 0,
            ai_conversations: 0,
            total_time_spent: 0,
            last_active_date: new Date().toISOString(),
            achievement_badges: [],
            current_streak: 0,
            ats_average_score: 0
          })
          .select('*')
          .single();

        if (createError) throw createError;
        return newStats;
      }

      if (fetchError) throw fetchError;
      return existingStats;
    } catch (error) {
      console.error('Error initializing user stats:', error);
      return null;
    }
  }

  // Get current user stats
  async getUserStats(): Promise<UserStats | null> {
    if (!this.userId) return null;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Update last active date
  async updateLastActive(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from('user_stats')
        .update({ 
          last_active_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last active date:', error);
    }
  }

  // Increment resume count
  async incrementResumesCreated(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .rpc('increment_resumes_created', { user_uuid: this.userId });

      if (error) throw error;
      
      // Check for achievements
      await this.checkResumeAchievements();
    } catch (error) {
      console.error('Error incrementing resumes created:', error);
    }
  }

  // Increment interview practice count
  async incrementInterviewsPracticed(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .rpc('increment_interviews_practiced', { user_id_param: this.userId });

      if (error) throw error;
      
      // Check for achievements
      await this.checkInterviewAchievements();
    } catch (error) {
      console.error('Error incrementing interviews practiced:', error);
    }
  }

  // Increment AI conversations count
  async incrementAIConversations(): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .rpc('increment_ai_conversations', { user_id_param: this.userId });

      if (error) throw error;
      
      // Check for achievements
      await this.checkAIAchievements();
    } catch (error) {
      console.error('Error incrementing AI conversations:', error);
    }
  }

  // Add time spent (in minutes)
  async addTimeSpent(minutes: number): Promise<void> {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .rpc('add_time_spent', { 
          user_id_param: this.userId, 
          minutes_param: minutes 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding time spent:', error);
    }
  }

  // Update ATS average score
  async updateATSAverageScore(newScore: number): Promise<void> {
    if (!this.userId) return;

    try {
      const stats = await this.getUserStats();
      if (!stats) return;

      const currentTotal = stats.ats_average_score * (stats.resumes_created || 1);
      const newTotal = currentTotal + newScore;
      const newAverage = newTotal / ((stats.resumes_created || 1) + 1);

      const { error } = await supabase
        .from('user_stats')
        .update({ 
          ats_average_score: newAverage,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating ATS average score:', error);
    }
  }

  // Check and award achievements
  private async checkResumeAchievements(): Promise<void> {
    const stats = await this.getUserStats();
    if (!stats) return;

    const newBadges: string[] = [];
    
    if (stats.resumes_created >= 1 && !stats.achievement_badges.includes('first_resume')) {
      newBadges.push('first_resume');
    }
    if (stats.resumes_created >= 5 && !stats.achievement_badges.includes('resume_master')) {
      newBadges.push('resume_master');
    }
    if (stats.resumes_created >= 10 && !stats.achievement_badges.includes('resume_expert')) {
      newBadges.push('resume_expert');
    }

    if (newBadges.length > 0) {
      await this.addAchievementBadges(newBadges);
    }
  }

  private async checkInterviewAchievements(): Promise<void> {
    const stats = await this.getUserStats();
    if (!stats) return;

    const newBadges: string[] = [];
    
    if (stats.interviews_practiced >= 1 && !stats.achievement_badges.includes('first_interview')) {
      newBadges.push('first_interview');
    }
    if (stats.interviews_practiced >= 10 && !stats.achievement_badges.includes('interview_ready')) {
      newBadges.push('interview_ready');
    }
    if (stats.interviews_practiced >= 25 && !stats.achievement_badges.includes('interview_pro')) {
      newBadges.push('interview_pro');
    }

    if (newBadges.length > 0) {
      await this.addAchievementBadges(newBadges);
    }
  }

  private async checkAIAchievements(): Promise<void> {
    const stats = await this.getUserStats();
    if (!stats) return;

    const newBadges: string[] = [];
    
    if (stats.ai_conversations >= 5 && !stats.achievement_badges.includes('ai_helper')) {
      newBadges.push('ai_helper');
    }
    if (stats.ai_conversations >= 20 && !stats.achievement_badges.includes('ai_explorer')) {
      newBadges.push('ai_explorer');
    }
    if (stats.ai_conversations >= 50 && !stats.achievement_badges.includes('ai_master')) {
      newBadges.push('ai_master');
    }

    if (newBadges.length > 0) {
      await this.addAchievementBadges(newBadges);
    }
  }

  // Add achievement badges
  private async addAchievementBadges(badges: string[]): Promise<void> {
    if (!this.userId) return;

    try {
      const stats = await this.getUserStats();
      if (!stats) return;

      const updatedBadges = [...stats.achievement_badges, ...badges];

      const { error } = await supabase
        .from('user_stats')
        .update({ 
          achievement_badges: updatedBadges,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', this.userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding achievement badges:', error);
    }
  }

  // Get achievement definitions
  getAchievementDefinitions(): Record<string, AchievementBadge> {
    return {
      first_resume: {
        id: 'first_resume',
        name: 'First Resume',
        description: 'Created your first resume',
        icon: 'document-text'
      },
      resume_master: {
        id: 'resume_master',
        name: 'Resume Master',
        description: 'Created 5 resumes',
        icon: 'documents'
      },
      resume_expert: {
        id: 'resume_expert',
        name: 'Resume Expert',
        description: 'Created 10 resumes',
        icon: 'trophy'
      },
      first_interview: {
        id: 'first_interview',
        name: 'First Interview',
        description: 'Completed your first interview practice',
        icon: 'mic'
      },
      interview_ready: {
        id: 'interview_ready',
        name: 'Interview Ready',
        description: 'Completed 10 interview practices',
        icon: 'checkmark-circle'
      },
      interview_pro: {
        id: 'interview_pro',
        name: 'Interview Pro',
        description: 'Completed 25 interview practices',
        icon: 'star'
      },
      ai_helper: {
        id: 'ai_helper',
        name: 'AI Helper',
        description: 'Had 5 AI conversations',
        icon: 'chatbubble'
      },
      ai_explorer: {
        id: 'ai_explorer',
        name: 'AI Explorer',
        description: 'Had 20 AI conversations',
        icon: 'compass'
      },
      ai_master: {
        id: 'ai_master',
        name: 'AI Master',
        description: 'Had 50 AI conversations',
        icon: 'bulb'
      }
    };
  }
}

export default UserStatsService;
