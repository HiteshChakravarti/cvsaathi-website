import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export interface PricingPlan {
  id: string;
  plan_id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  trial_days: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  ai_credits_used: number;
  ai_credits_limit: number;
  billing_cycle: string;
  auto_renew: boolean;
  trial_end_date?: string;
  plan_features: Record<string, any>;
}

export interface FeatureAccessResult {
  can_access: boolean;
  reason?: string;
  current_usage?: number;
  usage_limit?: number;
  plan: string;
}

export interface UsageStats {
  ai_interactions: number;
  ats_analyses: number;
  pdf_exports: number;
  interview_sessions: number;
  video_resumes: number;
  applications_tracked: number;
}

class SubscriptionService {
  
  /**
   * Get all available pricing plans
   */
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching pricing plans:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getPricingPlans:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      // Safety check for userId
      if (!userId) {
        console.warn('getUserSubscription called with empty userId');
        return null;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user subscription:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return null;
    }
  }

  /**
   * Check if user can access a specific feature
   */
  async canUserAccessFeature(
    userId: string, 
    featureName: string, 
    resourceType?: string
  ): Promise<FeatureAccessResult> {
    try {
      const { data, error } = await supabase.rpc('can_user_access_feature', {
        p_user_id: userId,
        p_feature_name: featureName,
        p_resource_type: resourceType || null
      });

      if (error) {
        console.error('Error checking feature access:', error);
        throw error;
      }

      return data as FeatureAccessResult;
    } catch (error) {
      console.error('Error in canUserAccessFeature:', error);
      // Fallback to free plan access in case of error
      return {
        can_access: false,
        reason: 'Service error',
        plan: 'free'
      };
    }
  }

  /**
   * Log feature usage and check limits
   */
  async logFeatureUsage(
    userId: string,
    featureName: string,
    resourceType: string,
    metadata: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('log_feature_usage', {
        p_user_id: userId,
        p_feature_name: featureName,
        p_resource_type: resourceType,
        p_metadata: metadata
      });

      if (error) {
        console.error('Error logging feature usage:', error);
        throw error;
      }

      return data as boolean;
    } catch (error) {
      console.error('Error in logFeatureUsage:', error);
      return false;
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsageStats(userId: string): Promise<UsageStats> {
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const startDate = currentMonth.toISOString().split('T')[0];
      
      const endMonth = new Date(currentMonth);
      endMonth.setMonth(endMonth.getMonth() + 1);
      endMonth.setDate(0);
      const endDate = endMonth.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('resource_type, usage_count')
        .eq('user_id', userId)
        .gte('billing_period_start', startDate)
        .lte('billing_period_end', endDate);

      if (error) {
        console.error('Error fetching usage stats:', error);
        throw error;
      }

      // Aggregate usage by resource type
      const stats: UsageStats = {
        ai_interactions: 0,
        ats_analyses: 0,
        pdf_exports: 0,
        interview_sessions: 0,
        video_resumes: 0,
        applications_tracked: 0
      };

      data?.forEach(record => {
        const resourceType = record.resource_type as keyof UsageStats;
        if (resourceType in stats) {
          stats[resourceType] += record.usage_count || 0;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getUserUsageStats:', error);
      return {
        ai_interactions: 0,
        ats_analyses: 0,
        pdf_exports: 0,
        interview_sessions: 0,
        video_resumes: 0,
        applications_tracked: 0
      };
    }
  }

  /**
   * Create or update user subscription
   */
  async createSubscription(
    userId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    transactionId?: string
  ): Promise<UserSubscription> {
    try {
      // Get plan details
      const { data: plan } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('plan_id', planId)
        .single();

      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Calculate period dates
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      
      if (billingCycle === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      // Create/update subscription
      const subscriptionData = {
        user_id: userId,
        plan_name: planId,
        status: 'active',
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        ai_credits_used: 0,
        ai_credits_limit: plan.limits.ai_interactions_monthly || 10,
        billing_cycle: billingCycle,
        plan_features: plan.features,
        auto_renew: true,
        external_subscription_id: transactionId
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          auto_renew: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error canceling subscription:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      throw error;
    }
  }

  /**
   * Check and enforce feature limits with user-friendly messages
   */
  async checkFeatureAccess(
    userId: string,
    featureName: string,
    resourceType: string,
    showAlert: boolean = true
  ): Promise<boolean> {
    try {
      const accessResult = await this.canUserAccessFeature(userId, featureName, resourceType);
      
      if (!accessResult.can_access) {
        if (showAlert) {
          this.showUpgradeAlert(accessResult, featureName);
        }
        return false;
      }

      // Log successful usage
      await this.logFeatureUsage(userId, featureName, resourceType);
      return true;
    } catch (error) {
      console.error('Error checking feature access:', error);
      if (showAlert) {
        toast.error('Unable to verify feature access. Please try again.');
      }
      return false;
    }
  }

  /**
   * Show upgrade alert to user
   */
  private showUpgradeAlert(accessResult: FeatureAccessResult, featureName: string): void {
    const planName = accessResult.plan;
    let title = 'Upgrade Required';
    let message = '';

    if (accessResult.reason === 'Usage limit exceeded') {
      const currentUsage = accessResult.current_usage || 0;
      const usageLimit = accessResult.usage_limit || 0;
      
      message = `You've reached your ${featureName} limit (${currentUsage}/${usageLimit}) for this month. `;
      
      if (planName === 'free') {
        message += 'Upgrade to Starter (₹99/month) or Professional (₹199/month) for higher limits.';
      } else if (planName === 'starter') {
        message += 'Upgrade to Professional (₹199/month) for unlimited access.';
      }
    } else {
      if (planName === 'free') {
        message = `${featureName} is available in our Starter (₹99/month) and Professional (₹199/month) plans.`;
      } else if (planName === 'starter') {
        message = `${featureName} is available in our Professional (₹199/month) plan.`;
      }
    }

    // Show upgrade message with toast
    toast.info(message, {
      duration: 5000,
      action: {
        label: 'Upgrade Now',
        onClick: () => {
          // Navigate to subscription screen
          // This will be implemented when we create the UI
        }
      }
    });
  }

  /**
   * Get feature usage percentage for progress indicators
   */
  async getFeatureUsagePercentage(
    userId: string, 
    resourceType: string
  ): Promise<{ percentage: number; current: number; limit: number }> {
    try {
      const accessResult = await this.canUserAccessFeature(userId, 'check_usage', resourceType);
      const current = accessResult.current_usage || 0;
      const limit = accessResult.usage_limit || 0;
      
      if (limit === -1) {
        // Unlimited
        return { percentage: 0, current, limit: -1 };
      }
      
      const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
      return { percentage, current, limit };
    } catch (error) {
      console.error('Error getting usage percentage:', error);
      return { percentage: 0, current: 0, limit: 0 };
    }
  }

  /**
   * Refresh user subscription from server
   */
  async refreshSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      // Force refresh from server
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      return null;
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;