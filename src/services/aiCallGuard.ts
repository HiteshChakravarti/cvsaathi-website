/**
 * AI Call Guard Service
 * 
 * Guards AI API calls by checking usage limits and tracking usage.
 * Prevents calls if user has exceeded their plan limits.
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usageTrackingService, CoreResourceType } from './usageTrackingService';
import { subscriptionService } from './subscriptionService';
import { toast } from 'sonner';

interface GuardedCallOptions {
  resourceType?: CoreResourceType;
  resourceSubtype?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Hook for guarding AI API calls
 * 
 * Usage:
 * const { guardedCall } = useAICallGuard();
 * const result = await guardedCall(userId, estimatedTokens, async () => {
 *   return await aiService.call();
 * });
 */
export const useAICallGuard = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const guardedCall = useCallback(
    async <T,>(
      userId: string,
      estimatedTokens: number,
      apiCall: () => Promise<T>,
      options: GuardedCallOptions = {}
    ): Promise<T | null> => {
      if (!user?.id || userId !== user.id) {
        toast.error('Authentication required');
        return null;
      }

      setIsChecking(true);

      try {
        // Check if user can access the feature
        const resourceType = options.resourceType || 'ai_career_coaching';
        const canAccess = await subscriptionService.canUserAccessFeature(
          userId,
          resourceType
        );

        if (!canAccess.can_access) {
          toast.error(canAccess.reason || 'Feature access denied. Please upgrade your plan.');
          setIsChecking(false);
          return null;
        }

        // Make the API call
        const result = await apiCall();

        // Track usage after successful call
        try {
          await usageTrackingService.trackUsage(
            userId,
            resourceType,
            options.resourceSubtype || null,
            {
              ...options.metadata,
              estimated_tokens: estimatedTokens,
              timestamp: new Date().toISOString(),
            }
          );
        } catch (trackingError) {
          // Don't fail the call if tracking fails, just log it
          console.warn('Failed to track usage:', trackingError);
        }

        setIsChecking(false);
        return result;
      } catch (error: any) {
        console.error('Guarded call error:', error);
        const errorMessage = error?.message || 'An error occurred';
        console.error('Full error details:', {
          message: errorMessage,
          stack: error?.stack,
          response: error?.response,
        });
        toast.error(errorMessage);
        setIsChecking(false);
        return null;
      }
    },
    [user]
  );

  return {
    guardedCall,
    isChecking,
  };
};

