import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { usageTrackingService, CoreResourceType, UsageStats } from '../services/usageTrackingService';
// import { subscriptionService, UserSubscription } from '../services/subscriptionService';

// Temporary type definition
interface UserSubscription {
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

export interface SubscriptionPlan {
  name: 'free' | 'starter' | 'professional';
  displayName: string;
  isActive: boolean;
  expiresAt?: Date;
}

export interface FeatureLimits {
  // AI Features
  aiSessionsPerMonth: number; // -1 for unlimited
  aiResumeReviewsPerMonth: number;
  
  // Templates
  accessToAllTemplates: boolean;
  maxTemplatesPerMonth: number;
  
  // Interview Prep
  interviewQuestionsPerDay: number;
  mockInterviewsPerMonth: number;
  
  // Video Resume
  videoResumeCount: number;
  maxVideoDurationSeconds: number;
  
  // Export Features
  pdfExportsPerMonth: number;
  advancedFormatting: boolean;
  
  // Premium Features
  prioritySupport: boolean;
  whatsappNotifications: boolean;
  atsChecker: boolean;
  advancedAnalytics: boolean;
  analyticsPerSession: number; // New for analytics
}

const PLAN_LIMITS: Record<SubscriptionPlan['name'], FeatureLimits> = {
  free: {
    aiSessionsPerMonth: 3, // ✅ Already correct
    aiResumeReviewsPerMonth: 1,
    accessToAllTemplates: false, // Free users get access to free templates only
    maxTemplatesPerMonth: 10, // ✅ 10 templates for free tier
    interviewQuestionsPerDay: 5,
    mockInterviewsPerMonth: 2, // ⬆️ Increased from 1 to 2
    videoResumeCount: 0, // No video resume in free tier
    maxVideoDurationSeconds: 0,
    pdfExportsPerMonth: 3, // ⬆️ Increased from 2 to 3
    advancedFormatting: false,
    prioritySupport: false,
    whatsappNotifications: false,
    atsChecker: true, // ✅ NEW - Enable 1 ATS check
    advancedAnalytics: false,
    analyticsPerSession: 1, // ✅ NEW - Enable 1 skill gap analysis
  },
  starter: {
    aiSessionsPerMonth: 15, // ⬆️ Increased from 10 to 15 (better value)
    aiResumeReviewsPerMonth: 5,
    accessToAllTemplates: false, // ✅ Only 15 templates, not all
    maxTemplatesPerMonth: 15, // ✅ 15 templates as discussed
    interviewQuestionsPerDay: 15,
    mockInterviewsPerMonth: 15, // ⬆️ Increased from 10 to 15
    videoResumeCount: 0, // ✅ Hidden for V1.0
    maxVideoDurationSeconds: 0,
    pdfExportsPerMonth: 10,
    advancedFormatting: true,
    prioritySupport: false,
    whatsappNotifications: true,
    atsChecker: true,
    advancedAnalytics: false, // No export in starter
    analyticsPerSession: 8, // ⬆️ Increased from 5 to 8 analytics sessions
  },
  professional: {
    aiSessionsPerMonth: -1, // ✅ Unlimited
    aiResumeReviewsPerMonth: -1, // ✅ Unlimited
    accessToAllTemplates: true,
    maxTemplatesPerMonth: -1, // ✅ Unlimited
    interviewQuestionsPerDay: -1, // ✅ Unlimited
    mockInterviewsPerMonth: -1, // ⬆️ Unlimited (was 10)
    videoResumeCount: 0, // ✅ Hidden for V1.0
    maxVideoDurationSeconds: 0,
    pdfExportsPerMonth: -1, // ✅ Unlimited
    advancedFormatting: true,
    prioritySupport: true,
    whatsappNotifications: true,
    atsChecker: true,
    advancedAnalytics: true, // ✅ Export available in professional
    analyticsPerSession: -1, // ✅ Unlimited analytics for professional
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>({
    name: 'free',
    displayName: 'Free',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState<any>({});
  const [plansLoading, setPlansLoading] = useState(false);
  const [analyticsUsedThisSession, setAnalyticsUsedThisSession] = useState(0);
  
  // Usage tracking state
  const [coreUsageStats, setCoreUsageStats] = useState<UsageStats[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  // Reset analytics usage when plan changes
  useEffect(() => {
    setAnalyticsUsedThisSession(0);
  }, [currentPlan.name]);

  // Load usage stats when user or plan changes
  useEffect(() => {
    if (user?.id) {
      loadUsageStats();
    }
  }, [user?.id, currentPlan.name]);

  const useAnalytics = (): boolean => {
    const limits = getFeatureLimits();
    
    // If unlimited, always allow
    if (limits.analyticsPerSession === -1) {
      return true;
    }
    
    // Check if user has analytics left
    if (analyticsUsedThisSession < limits.analyticsPerSession) {
      setAnalyticsUsedThisSession(prev => prev + 1);
      return true;
    }
    
    return false;
  };

  const getAnalyticsRemaining = (): number => {
    const limits = getFeatureLimits();
    if (limits.analyticsPerSession === -1) {
      return -1; // unlimited
    }
    return Math.max(0, limits.analyticsPerSession - analyticsUsedThisSession);
  };

  useEffect(() => {
    if (user?.id) {
      loadSubscription();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      
      // Safety check for user
      if (!user?.id) {
        setCurrentPlan({
          name: 'free',
          displayName: 'Free',
          isActive: true,
        });
        return;
      }
      
      // ✅ Load subscription from DATABASE
      const { data: userSubscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle() to handle no results
      
      if (error) {
        console.error('Error loading subscription:', error);
        setCurrentPlan({ name: 'free', displayName: 'Free', isActive: true });
        return;
      }
      
      if (!userSubscription) {
        // No active subscription found
        console.log('No active subscription - defaulting to free plan');
        setCurrentPlan({ name: 'free', displayName: 'Free', isActive: true });
        return;
      }
      
      // Check if subscription is still valid
      const now = new Date();
      const expiresAt = new Date(userSubscription.current_period_end);
      
      if (expiresAt > now) {
        // ✅ Valid subscription
        console.log(`✅ Active subscription: ${userSubscription.plan_name}`);
        setSubscription(userSubscription);
        setCurrentPlan({
          name: userSubscription.plan_name as SubscriptionPlan['name'],
          displayName: getPlanDisplayName(userSubscription.plan_name),
          isActive: true,
          expiresAt,
        });
      } else {
        // Subscription expired
        console.log('Subscription expired - defaulting to free plan');
        setCurrentPlan({ name: 'free', displayName: 'Free', isActive: true });
      }
      
    } catch (error) {
      console.error('Error in loadSubscription:', error);
      setCurrentPlan({ name: 'free', displayName: 'Free', isActive: true });
    } finally {
      setLoading(false);
    }
  };

  const getPlanDisplayName = (planName: string): string => {
    switch (planName) {
      case 'starter': return 'Starter';
      case 'professional': return 'Professional';
      default: return 'Free';
    }
  };

  const getFeatureLimits = (): FeatureLimits => {
    return PLAN_LIMITS[currentPlan.name];
  };

  const canAccessFeature = (featureName: keyof FeatureLimits): boolean => {
    const limits = getFeatureLimits();
    const featureValue = limits[featureName];
    
    // For boolean features, return the boolean value
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    
    // For numeric limits, -1 means unlimited (true), 0 means no access (false), >0 means limited access (true)
    if (typeof featureValue === 'number') {
      return featureValue !== 0;
    }
    
    return false;
  };

  const getFeatureLimit = (featureName: keyof FeatureLimits): number | boolean => {
    const limits = getFeatureLimits();
    return limits[featureName];
  };

  const isUnlimited = (featureName: keyof FeatureLimits): boolean => {
    const limit = getFeatureLimit(featureName);
    return typeof limit === 'number' && limit === -1;
  };

  const isPremiumPlan = (): boolean => {
    return currentPlan.name === 'starter' || currentPlan.name === 'professional';
  };

  const isProfessionalPlan = (): boolean => {
    return currentPlan.name === 'professional';
  };

  const getUpgradeMessage = (featureName: string): string => {
    const planName = currentPlan.name;
    
    if (planName === 'free') {
      return `${featureName} is available in our Starter (₹99/month) and Professional (₹199/month) plans.`;
    } else if (planName === 'starter') {
      return `${featureName} is available in our Professional (₹199/month) plan.`;
    }
    
    return `This feature requires a subscription upgrade.`;
  };

  const refreshSubscription = async () => {
    if (user?.id) {
      await loadSubscription();
    }
  };

  // DEVELOPMENT MODE: Set premium access after successful dummy transaction
  const setDevPremiumAccess = async (planName: string) => {
    if (import.meta.env.DEV) {
      try {
        const planData = {
          plan: planName,
          timestamp: Date.now(),
          isDev: true
        };
        localStorage.setItem('dev_premium_plan', JSON.stringify(planData));
        // Reload subscription to apply the new plan
        await loadSubscription();
      } catch (error) {
        console.error('Error setting dev premium access:', error);
      }
    }
  };

  // DEVELOPMENT MODE: Reset premium access (for testing)
  const resetDevPremiumAccess = async () => {
    if (import.meta.env.DEV) {
      try {
        localStorage.removeItem('dev_premium_plan');
        // Reload subscription to reset to free plan
        await loadSubscription();
      } catch (error) {
        console.error('Error resetting dev premium access:', error);
      }
    }
  };

  // Mock pricing plans for now
  const mockPricingPlans = [
    {
      id: '1',
      plan_id: 'free',
      name: 'Free',
      display_name: 'Free Plan',
      description: 'Perfect for getting started',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'INR',
      features: {},
      limits: PLAN_LIMITS.free,
      is_active: true,
      sort_order: 1,
      trial_days: 0,
    },
    {
      id: '2',
      plan_id: 'starter',
      name: 'Starter',
      display_name: 'Starter Plan',
      description: 'Great for job seekers',
      price_monthly: 99,
      price_yearly: 999,
      currency: 'INR',
      features: {},
      limits: PLAN_LIMITS.starter,
      is_active: true,
      sort_order: 2,
      trial_days: 7,
    },
    {
      id: '3',
      plan_id: 'professional',
      name: 'Professional',
      display_name: 'Professional Plan',
      description: 'For serious career growth',
      price_monthly: 199,
      price_yearly: 1999,
      currency: 'INR',
      features: {},
      limits: PLAN_LIMITS.professional,
      is_active: true,
      sort_order: 3,
      trial_days: 14,
    },
  ];

  const isPremiumUser = isPremiumPlan();
  const isFeatureUnlimited = isUnlimited;

  const getRemainingUsage = (featureName: keyof FeatureLimits): number => {
    const limit = getFeatureLimit(featureName);
    if (typeof limit === 'number') {
      if (limit === -1) return -1; // unlimited
      // For now, return the limit as remaining (in real app, subtract used amount)
      return limit;
    }
    return 0;
  };

  // Usage tracking functions
  const loadUsageStats = async (): Promise<void> => {
    if (!user?.id) return;
    
    try {
      setUsageLoading(true);
      const limits = getFeatureLimits();
      
      // Map feature limits to resource types for core features
      const resumeLimit = currentPlan.name === 'free' ? 3 : currentPlan.name === 'starter' ? 10 : -1;
      
      const resourceLimits: Record<CoreResourceType, number> = {
        resume_creation: resumeLimit,
        pdf_export: limits.pdfExportsPerMonth,
        ai_career_coaching: limits.aiSessionsPerMonth,
        ai_interview_prep: limits.interviewQuestionsPerDay,
        ai_mock_interview: limits.mockInterviewsPerMonth,
        skill_gap_analysis: limits.analyticsPerSession,
        ats_scan: currentPlan.name === 'free' ? 1 : currentPlan.name === 'starter' ? 5 : -1
      };

      const { stats, error } = await usageTrackingService.getUsageStats(user.id, resourceLimits);
      
      if (error) {
        console.error('Error loading usage stats:', error);
      } else {
        setCoreUsageStats(stats);
      }
    } catch (error) {
      console.error('Error in loadUsageStats:', error);
    } finally {
      setUsageLoading(false);
    }
  };

  const trackUsage = async (
    resourceType: CoreResourceType,
    resourceSubtype: string | null = null,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await usageTrackingService.trackUsage(
        user.id,
        resourceType,
        resourceSubtype as any,
        metadata
      );

      if (result.success) {
        // Reload usage stats to update UI
        await loadUsageStats();
      }

      return result;
    } catch (error: any) {
      console.error('Error in trackUsage:', error);
      return { success: false, error: error.message };
    }
  };

  const getUsageForResource = (resourceType: CoreResourceType): UsageStats | null => {
    return coreUsageStats.find(stat => stat.resource_type === resourceType) || null;
  };

  const canUseResource = async (
    resourceType: CoreResourceType,
    resourceSubtype: string | null = null
  ): Promise<{ canUse: boolean; remaining: number; error?: string }> => {
    if (!user?.id) {
      return { canUse: false, remaining: 0, error: 'User not authenticated' };
    }

    const limits = getFeatureLimits();
    let limit = 0;

    // Map resource type to feature limit
    switch (resourceType) {
      case 'resume_creation':
        limit = currentPlan.name === 'free' ? 3 : currentPlan.name === 'starter' ? 10 : -1;
        break;
      case 'pdf_export':
        limit = limits.pdfExportsPerMonth;
        break;
      case 'ai_career_coaching':
        limit = limits.aiSessionsPerMonth;
        break;
      case 'ai_interview_prep':
        limit = limits.interviewQuestionsPerDay;
        break;
      case 'ai_mock_interview':
        limit = limits.mockInterviewsPerMonth;
        break;
      case 'skill_gap_analysis':
        limit = limits.analyticsPerSession;
        break;
      case 'ats_scan':
        limit = currentPlan.name === 'free' ? 1 : currentPlan.name === 'starter' ? 5 : -1;
        break;
    }

    return await usageTrackingService.canUseResource(user.id, resourceType, limit, resourceSubtype as any);
  };

  return {
    subscription,
    currentPlan,
    loading,
    pricingPlans: mockPricingPlans,
    usageStats,
    plansLoading,
    isPremiumUser,
    canAccessFeature,
    getFeatureLimit,
    getFeatureLimits,
    isUnlimited,
    isPremiumPlan,
    isProfessionalPlan,
    getUpgradeMessage,
    refreshSubscription,
    setDevPremiumAccess, // DEVELOPMENT MODE: For setting premium access after dummy transaction
    resetDevPremiumAccess, // DEVELOPMENT MODE: For resetting premium access (testing)
    useAnalytics,
    getAnalyticsRemaining,
    getRemainingUsage,
    isFeatureUnlimited,
    
    // Usage tracking functions
    coreUsageStats,
    usageLoading,
    loadUsageStats,
    trackUsage,
    getUsageForResource,
    canUseResource,
  };
};

export default useSubscription;