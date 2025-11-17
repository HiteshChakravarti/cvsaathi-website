import { supabase } from '../lib/supabaseClient';

// Resource types for Phase 1 - Core Usage Tracking
export type CoreResourceType = 
  | 'resume_creation'
  | 'pdf_export' 
  | 'ai_career_coaching'
  | 'ai_interview_prep'
  | 'ai_mock_interview'
  | 'skill_gap_analysis'
  | 'ats_scan';

export type ResourceSubtype = 
  | 'with_watermark'
  | 'clean'
  | 'general'
  | 'specific_question'
  | 'questions_only'
  | 'full_prep'
  | 'fresher'
  | 'experienced'
  | null;

export interface UsageMetadata {
  resume_id?: string;
  template_used?: string;
  sections_completed?: number;
  export_format?: string;
  file_size?: number;
  session_id?: string;
  question_type?: string;
  language?: string;
  duration?: number;
  role?: string;
  industry?: string;
  difficulty?: string;
  questions_count?: number;
  score?: number;
  analysis_depth?: string;
  [key: string]: any;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  resource_type: CoreResourceType;
  resource_subtype: ResourceSubtype;
  usage_count: number;
  billing_period_start: string;
  billing_period_end: string;
  metadata: UsageMetadata;
  created_at: string;
  updated_at: string;
}

export interface UsageStats {
  resource_type: CoreResourceType;
  current_usage: number;
  limit: number;
  remaining: number;
  is_unlimited: boolean;
  percentage_used: number;
}

class UsageTrackingService {
  
  /**
   * Get current billing period (first day to last day of current month)
   */
  private getCurrentBillingPeriod(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: start.toISOString().split('T')[0], // YYYY-MM-DD format
      end: end.toISOString().split('T')[0]
    };
  }

  /**
   * Track usage of a resource
   */
  async trackUsage(
    userId: string,
    resourceType: CoreResourceType,
    resourceSubtype: ResourceSubtype = null,
    metadata: UsageMetadata = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { start, end } = this.getCurrentBillingPeriod();
      
      // Check if usage record already exists for this user, resource, and period
      const { data: existingRecord, error: fetchError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_subtype', resourceSubtype)
        .eq('billing_period_start', start)
        .eq('billing_period_end', end)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing usage record:', fetchError);
        return { success: false, error: fetchError.message };
      }

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('usage_tracking')
          .update({
            usage_count: existingRecord.usage_count + 1,
            metadata: { ...existingRecord.metadata, ...metadata },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);

        if (updateError) {
          console.error('Error updating usage record:', updateError);
          return { success: false, error: updateError.message };
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: userId,
            resource_type: resourceType,
            resource_subtype: resourceSubtype,
            usage_count: 1,
            billing_period_start: start,
            billing_period_end: end,
            metadata: metadata
          });

        if (insertError) {
          console.error('Error creating usage record:', insertError);
          return { success: false, error: insertError.message };
        }
      }

      console.log(`✅ Usage tracked: ${resourceType} for user ${userId}`);
      return { success: true };

    } catch (error: any) {
      console.error('Error in trackUsage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get usage count for a specific resource in current billing period
   */
  async getUsageCount(
    userId: string,
    resourceType: CoreResourceType,
    resourceSubtype: ResourceSubtype = null
  ): Promise<{ count: number; error?: string }> {
    try {
      const { start, end } = this.getCurrentBillingPeriod();
      
      const { data: record, error } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_subtype', resourceSubtype)
        .eq('billing_period_start', start)
        .eq('billing_period_end', end)
        .maybeSingle();

      if (error) {
        console.error('Error fetching usage count:', error);
        return { count: 0, error: error.message };
      }

      return { count: record?.usage_count || 0 };

    } catch (error: any) {
      console.error('Error in getUsageCount:', error);
      return { count: 0, error: error.message };
    }
  }

  /**
   * Get remaining usage for a resource
   */
  async getRemainingUsage(
    userId: string,
    resourceType: CoreResourceType,
    limit: number,
    resourceSubtype: ResourceSubtype = null
  ): Promise<{ remaining: number; error?: string }> {
    try {
      const { count, error } = await this.getUsageCount(userId, resourceType, resourceSubtype);
      
      if (error) {
        return { remaining: 0, error };
      }

      const remaining = Math.max(0, limit - count);
      return { remaining };

    } catch (error: any) {
      console.error('Error in getRemainingUsage:', error);
      return { remaining: 0, error: error.message };
    }
  }

  /**
   * Get usage statistics for multiple resources
   */
  async getUsageStats(
    userId: string,
    resourceLimits: Record<CoreResourceType, number>
  ): Promise<{ stats: UsageStats[]; error?: string }> {
    try {
      const stats: UsageStats[] = [];
      
      for (const [resourceType, limit] of Object.entries(resourceLimits)) {
        const { count, error } = await this.getUsageCount(userId, resourceType as CoreResourceType);
        
        if (error) {
          console.error(`Error getting usage for ${resourceType}:`, error);
          continue;
        }

        const isUnlimited = limit === -1;
        const remaining = isUnlimited ? -1 : Math.max(0, limit - count);
        const percentageUsed = isUnlimited ? 0 : Math.min(100, (count / limit) * 100);

        stats.push({
          resource_type: resourceType as CoreResourceType,
          current_usage: count,
          limit,
          remaining,
          is_unlimited: isUnlimited,
          percentage_used: percentageUsed
        });
      }

      return { stats };

    } catch (error: any) {
      console.error('Error in getUsageStats:', error);
      return { stats: [], error: error.message };
    }
  }

  /**
   * Check if user can use a resource (has remaining usage)
   */
  async canUseResource(
    userId: string,
    resourceType: CoreResourceType,
    limit: number,
    resourceSubtype: ResourceSubtype = null
  ): Promise<{ canUse: boolean; remaining: number; error?: string }> {
    try {
      const { remaining, error } = await this.getRemainingUsage(userId, resourceType, limit, resourceSubtype);
      
      if (error) {
        return { canUse: false, remaining: 0, error };
      }

      const canUse = limit === -1 || remaining > 0; // -1 means unlimited
      return { canUse, remaining };

    } catch (error: any) {
      console.error('Error in canUseResource:', error);
      return { canUse: false, remaining: 0, error: error.message };
    }
  }

  /**
   * Get all usage records for a user in current billing period
   */
  async getUserUsageSummary(userId: string): Promise<{ records: UsageRecord[]; error?: string }> {
    try {
      const { start, end } = this.getCurrentBillingPeriod();
      
      const { data: records, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('billing_period_start', start)
        .eq('billing_period_end', end)
        .order('resource_type');

      if (error) {
        console.error('Error fetching user usage summary:', error);
        return { records: [], error: error.message };
      }

      return { records: records || [] };

    } catch (error: any) {
      console.error('Error in getUserUsageSummary:', error);
      return { records: [], error: error.message };
    }
  }
}

// Export singleton instance
export const usageTrackingService = new UsageTrackingService();
export default usageTrackingService;
