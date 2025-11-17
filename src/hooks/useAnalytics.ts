

import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackPageView = useCallback((page: string) => {
    // Only track in production and if GA is configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXX', {
        page_title: page,
        page_location: window.location.href,
      });
    }
    
    console.log(`Analytics: Page view tracked for ${page}`);
  }, []);

  const trackUserAction = useCallback((action: string, category: string, label?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
    
    console.log(`Analytics: User action tracked - ${action} in ${category}${label ? ` (${label})` : ''}`);
  }, []);

  const trackTemplateUsage = useCallback((templateId: string, templateName: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'template_used', {
        template_id: templateId,
        template_name: templateName,
      });
    }
    
    console.log(`Analytics: Template usage tracked - ${templateName} (${templateId})`);
  }, []);

  const trackError = useCallback((error: string, context?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error,
        fatal: false,
        context: context,
      });
    }
    
    console.error(`Analytics: Error tracked - ${error}${context ? ` in ${context}` : ''}`);
  }, []);

  return {
    trackPageView,
    trackUserAction,
    trackTemplateUsage,
    trackError,
  };
};

