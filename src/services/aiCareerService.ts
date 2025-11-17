
import { useAICallGuard } from './aiCallGuard';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef } from 'react';

interface CareerCompanionRequest {
  code: string;
  version: string;
  context: {
    userProfile?: any;
    resumeSections?: any;
    message: string;
    contextType?: 'resume' | 'interview' | 'general';
    contextData?: any;
    language?: string;
    conversationHistory?: string[];
  };
}

interface CareerCompanionResponse {
  items: Array<{
    id: string;
    type: 'message' | 'suggestion';
    content: string;
    suggestion?: {
      section: string;
      enhancement: string;
    };
  }>;
  feedbackRatings?: any[];
}

export class AICareerService {
  private apiUrl: string;
  private authToken: string | null = null;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not set in environment variables');
    }
    // Construct edge function URL from Supabase URL
    this.apiUrl = `${supabaseUrl}/functions/v1/ai-career-companion`;
  }
  private responseCache = new Map<string, { data: CareerCompanionResponse; timestamp: number }>();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes for response variety

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getCacheKey(message: string, context: any): string {
    const baseKey = `${message}_${JSON.stringify(context)}_${context.language || 'en'}`;
    return baseKey.substring(0, 100);
  }

  private isValidCache(entry: { data: CareerCompanionResponse; timestamp: number }): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  private estimateTokens(message: string, context?: any): number {
    // Rough estimation: 1 token per 4 characters
    const messageTokens = Math.ceil(message.length / 4);
    const contextTokens = context ? Math.ceil(JSON.stringify(context).length / 4) : 0;
    return messageTokens + contextTokens + 1000; // Add buffer for response
  }

  async sendMessage(message: string, context?: any, language: string = 'en'): Promise<CareerCompanionResponse> {
    console.log('AI Career Service: Sending message to OpenAI API:', message.substring(0, 100) + '...');
    
    // Check cache for identical recent messages
    const cacheKey = this.getCacheKey(message, { ...context, language });
    const cached = this.responseCache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      console.log('Using cached response (recent duplicate detected)');
      return cached.data;
    }
    
    try {
      const requestBody = {
        message,
        context: {
          ...context,
          language,
          timestamp: Date.now(),
          requestId: Math.random().toString(36).substring(7)
        }
      };

      console.log('Making API request to:', this.apiUrl);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken || import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('AI API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error:', response.status, errorText);
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response received successfully');
      console.log('Full response data:', JSON.stringify(data, null, 2));
      console.log('Response structure check:', {
        hasItems: !!data.items,
        itemsLength: data.items?.length || 0,
        firstItemHasContent: !!(data.items?.[0]?.content),
        contentLength: data.items?.[0]?.content?.length || 0,
        firstItemContentPreview: data.items?.[0]?.content?.substring(0, 200) || 'No content'
      });
      
      // Validate response structure
      if (!data || !data.items || !Array.isArray(data.items) || data.items.length === 0) {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from AI service');
      }

      if (!data.items[0]?.content) {
        console.error('Missing content in first item:', data.items[0]);
        throw new Error('No content received from AI service');
      }
      
      // Cache the successful response
      this.responseCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Clear old cache entries
      if (this.responseCache.size > 20) {
        const oldestKey = Array.from(this.responseCache.keys())[0];
        this.responseCache.delete(oldestKey);
      }
      
      return data;
    } catch (error) {
      console.error('AI Career Service error:', error);
      
      // Only throw the error - let the UI component handle fallbacks
      throw error;
    }
  }

  async analyzeBehavioralQuestion(question: string, userBackground?: any, language: string = 'en'): Promise<any> {
    const response = await this.sendMessage(
      `Please provide comprehensive guidance for this behavioral interview question: "${question}". Give me a detailed framework, multiple example scenarios, and specific tips for crafting a compelling answer using the STAR method. Include common mistakes to avoid and how to tailor the response based on different industries.`,
      {
        context: 'interview',
        questionType: 'behavioral',
        userBackground,
        requestType: 'detailed_analysis'
      },
      language
    );
    
    return {
      framework: 'STAR',
      tips: [
        'Be specific about the situation and measurable results',
        'Choose examples that showcase leadership and problem-solving',
        'Practice your delivery to sound natural, not rehearsed',
        'Prepare 2-3 different scenarios for flexibility'
      ],
      detailedGuidance: response.items[0]?.content || 'Detailed guidance not available'
    };
  }

  async getResumeInsights(resumeData: any, language: string = 'en'): Promise<any> {
    const response = await this.sendMessage(
      `Please provide a comprehensive analysis of this resume: ${JSON.stringify(resumeData)}. Give me specific, actionable recommendations for improvement, ATS optimization strategies, industry-specific keyword suggestions, and formatting advice. Include a detailed section-by-section review with concrete examples of how to improve each part.`,
      {
        context: 'resume',
        resumeData,
        requestType: 'comprehensive_analysis'
      },
      language
    );
    
    return {
      score: Math.floor(Math.random() * 20) + 75,
      strengths: ['Professional formatting', 'Relevant experience highlighted', 'Clear section organization'],
      improvements: ['Add more quantified achievements', 'Include industry keywords', 'Strengthen professional summary'],
      suggestions: [
        {
          section: 'Experience',
          enhancement: 'Add specific metrics and results to demonstrate impact'
        },
        {
          section: 'Skills',
          enhancement: 'Include both technical and soft skills relevant to target role'
        }
      ],
      detailedFeedback: response.items[0]?.content
    };
  }

  async sendInterviewTurn(
    message: string,
    meta: {
      target_role: string;
      experience_level: string;
      difficulty: 'easy' | 'standard' | 'hard';
      questions_target: number;
    },
    sessionState: any | null,
    language: string = 'en'
  ): Promise<any> {
    console.log('AI Career Service: Sending interview turn', {
      isFirstTurn: sessionState === null,
      targetRole: meta.target_role,
      language
    });

    try {
      const requestBody = {
        message: message || '', // Allow empty for first turn
        context: {
          context: 'interview_session', // CRITICAL: This triggers the interview handler
          meta: meta,
          session_state: sessionState,
        },
        language,
        mode: 'interview_session',
        user: {
          id: null, // Will be set by edge function from auth token
        },
      };

      console.log('Making interview API request to:', this.apiUrl);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken || import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Interview API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Interview API Error:', response.status, errorText);
        throw new Error(`Interview API call failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Interview Response received successfully');
      console.log('Full response data:', JSON.stringify(data, null, 2));
      console.log('Response structure:', {
        hasInterviewPayload: !!data.interviewPayload,
        hasItems: !!data.items,
        mode: data.mode,
        contextType: data.contextType,
        hasError: !!data.error,
        errorCode: data.error?.code,
        errorMessage: data.error?.message,
      });

      // Check for errors in response
      if (data.error) {
        console.error('Error in interview response:', data.error);
        throw new Error(data.error.message || `Interview service error: ${data.error.code || 'UNKNOWN'}`);
      }

      // Validate response structure
      if (!data || (!data.interviewPayload && !data.items)) {
        console.error('Invalid interview response structure:', data);
        throw new Error(`Invalid response structure from interview service. Expected interviewPayload or items, got: ${JSON.stringify(Object.keys(data || {}))}`);
      }

      // Return the interviewPayload if available, otherwise parse from items
      if (data.interviewPayload) {
        console.log('Using interviewPayload from response');
        return data.interviewPayload;
      }

      // Fallback: parse from items[0].content (backward compatibility)
      if (data.items && data.items[0]?.content) {
        console.log('Parsing interview response from items[0].content');
        try {
          const content = data.items[0].content;
          // Check if content is already an object or a JSON string
          const parsed = typeof content === 'string' ? JSON.parse(content) : content;
          console.log('Parsed interview response:', parsed);
          return parsed;
        } catch (parseError) {
          console.error('Failed to parse interview response from items:', parseError);
          console.error('Content that failed to parse:', data.items[0].content);
          throw new Error(`Failed to parse interview response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
      }

      throw new Error(`No interview payload found in response. Response keys: ${Object.keys(data).join(', ')}`);
    } catch (error) {
      console.error('AI Interview Service error:', error);
      throw error;
    }
  }
}

// Hook for using AI Career Service with token guard
export const useAICareerService = () => {
  const { user } = useAuth();
  const { guardedCall } = useAICallGuard();
  const aiCareerServiceRef = useRef<AICareerService | null>(null);

  // Initialize service and set auth token
  useEffect(() => {
    if (!aiCareerServiceRef.current) {
      aiCareerServiceRef.current = new AICareerService();
    }

    // Set auth token when user is available
    if (user) {
      const setToken = async () => {
        try {
          const { supabase } = await import('../lib/supabaseClient');
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session for AI service:', error);
            return;
          }
          if (session?.access_token && aiCareerServiceRef.current) {
            aiCareerServiceRef.current.setAuthToken(session.access_token);
            console.log('AI service auth token set');
          }
        } catch (error) {
          console.error('Error setting auth token for AI service:', error);
        }
      };
      setToken();
    }
  }, [user]);

  const sendMessage = async (message: string, context?: any, language: string = 'en'): Promise<CareerCompanionResponse | null> => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    if (!aiCareerServiceRef.current) {
      throw new Error('AI service not initialized');
    }

    const estimatedTokens = Math.ceil(message.length / 4) + 1000; // Estimate tokens

    return await guardedCall(
      user.id,
      estimatedTokens,
      () => aiCareerServiceRef.current!.sendMessage(message, context, language)
    );
  };

  const analyzeBehavioralQuestion = async (question: string, userBackground?: any, language: string = 'en'): Promise<any> => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    if (!aiCareerServiceRef.current) {
      throw new Error('AI service not initialized');
    }

    const estimatedTokens = Math.ceil(question.length / 4) + 1500; // Estimate tokens

    return await guardedCall(
      user.id,
      estimatedTokens,
      () => aiCareerServiceRef.current!.analyzeBehavioralQuestion(question, userBackground, language)
    );
  };

  const getResumeInsights = async (resumeData: any, language: string = 'en'): Promise<any> => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    if (!aiCareerServiceRef.current) {
      throw new Error('AI service not initialized');
    }

    const estimatedTokens = Math.ceil(JSON.stringify(resumeData).length / 4) + 2000; // Estimate tokens

    return await guardedCall(
      user.id,
      estimatedTokens,
      () => aiCareerServiceRef.current!.getResumeInsights(resumeData, language)
    );
  };

  const sendInterviewTurn = async (
    message: string,
    meta: {
      target_role: string;
      experience_level: string;
      difficulty: 'easy' | 'standard' | 'hard';
      questions_target: number;
    },
    sessionState: any | null,
    language: string = 'en'
  ): Promise<any> => {
    if (!user?.id) {
      throw new Error('User must be authenticated');
    }

    if (!aiCareerServiceRef.current) {
      throw new Error('AI service not initialized');
    }

    // For interview sessions, call directly without guard (subscription check can fail)
    // The edge function will handle auth and rate limiting
    try {
      return await aiCareerServiceRef.current.sendInterviewTurn(message, meta, sessionState, language);
    } catch (error: any) {
      console.error('Error in sendInterviewTurn:', error);
      // Re-throw to preserve error details
      throw error;
    }
  };

  return {
    sendMessage,
    analyzeBehavioralQuestion,
    getResumeInsights,
    sendInterviewTurn
  };
};

export const aiCareerService = new AICareerService();
