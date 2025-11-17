import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from './useSubscription';

export interface FeatureGateOptions {
  featureName: string;
  description: string;
  requiredPlan?: 'starter' | 'professional';
  showUpgradePrompt?: boolean;
  customUpgradeAction?: () => void;
}

export const useFeatureGate = () => {
  const { canAccessFeature, getUpgradeMessage, currentPlan } = useSubscription();
  const navigate = useNavigate();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<FeatureGateOptions | null>(null);

  const checkFeatureAccess = (
    featureKey: string,
    options: FeatureGateOptions
  ): boolean => {
    const hasAccess = canAccessFeature(featureKey as any);
    
    if (!hasAccess) {
      if (options.showUpgradePrompt !== false) {
        setCurrentFeature(options);
        setShowUpgradePrompt(true);
      } else if (options.customUpgradeAction) {
        options.customUpgradeAction();
      } else {
        // Show simple alert
        showUpgradeAlert(options);
      }
      return false;
    }
    
    return true;
  };

  const showUpgradeAlert = (options: FeatureGateOptions) => {
    const message = getUpgradeMessage(options.featureName);
    
    toast.info(message, {
      duration: 5000,
      action: {
        label: 'Upgrade Now',
        onClick: () => navigate('/app/pricing')
      }
    });
  };

  const closeUpgradePrompt = () => {
    setShowUpgradePrompt(false);
    setCurrentFeature(null);
  };

  // Pre-configured feature checks
  const checkAIAccess = (sessionType: 'chat' | 'review' = 'chat'): boolean => {
    const featureKey = sessionType === 'chat' ? 'aiSessionsPerMonth' : 'aiResumeReviewsPerMonth';
    return checkFeatureAccess(featureKey, {
      featureName: sessionType === 'chat' ? 'AI Career Coaching' : 'AI Resume Review',
      description: sessionType === 'chat' 
        ? 'Get unlimited AI-powered career guidance and personalized recommendations.'
        : 'Get detailed AI analysis and improvement suggestions for your resume.',
      requiredPlan: 'starter',
    });
  };

  const checkTemplateAccess = (): boolean => {
    return checkFeatureAccess('accessToAllTemplates', {
      featureName: 'Premium Templates',
      description: 'Access all 13+ professional resume templates designed by experts.',
      requiredPlan: 'starter',
    });
  };

  const checkVideoResumeAccess = (duration?: number): boolean => {
    // Check basic access first
    const hasBasicAccess = checkFeatureAccess('videoResumeCount', {
      featureName: 'Video Resume',
      description: 'Create professional video resumes to stand out from the crowd.',
      requiredPlan: 'starter',
    });

    if (!hasBasicAccess) return false;

    // Check duration limit for professional features
    if (duration && duration > 120) {
      return checkFeatureAccess('maxVideoDurationSeconds', {
        featureName: 'Extended Video Resume',
        description: 'Create longer video resumes (up to 5 minutes) with Professional plan.',
        requiredPlan: 'professional',
      });
    }

    return true;
  };

  const checkInterviewPrepAccess = (type: 'basic' | 'unlimited' = 'basic'): boolean => {
    const featureKey = type === 'basic' ? 'interviewQuestionsPerDay' : 'mockInterviewsPerMonth';
    return checkFeatureAccess(featureKey, {
      featureName: type === 'basic' ? 'Interview Preparation' : 'Unlimited Interview Prep',
      description: type === 'basic'
        ? 'Practice with AI-powered interview questions and get feedback.'
        : 'Get unlimited mock interviews and advanced preparation tools.',
      requiredPlan: type === 'basic' ? 'starter' : 'professional',
    });
  };

  const checkAdvancedFeatureAccess = (feature: 'atsChecker' | 'advancedAnalytics' | 'prioritySupport'): boolean => {
    const featureNames = {
      atsChecker: 'ATS Checker',
      advancedAnalytics: 'Advanced Analytics',
      prioritySupport: 'Priority Support',
    };

    const descriptions = {
      atsChecker: 'Check if your resume passes Applicant Tracking Systems (ATS).',
      advancedAnalytics: 'Get detailed insights and analytics on your job search progress.',
      prioritySupport: 'Get priority customer support and faster response times.',
    };

    return checkFeatureAccess(feature, {
      featureName: featureNames[feature],
      description: descriptions[feature],
      requiredPlan: feature === 'prioritySupport' ? 'professional' : 'starter',
    });
  };

  return {
    // Core functions
    checkFeatureAccess,
    showUpgradePrompt,
    currentFeature,
    closeUpgradePrompt,
    
    // Pre-configured checks
    checkAIAccess,
    checkTemplateAccess,
    checkVideoResumeAccess,
    checkInterviewPrepAccess,
    checkAdvancedFeatureAccess,
    
    // Utility
    currentPlan: currentPlan.name,
  };
};

export default useFeatureGate;
