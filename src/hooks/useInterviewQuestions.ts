import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export type QuestionCategory = 'introduction' | 'technical' | 'behavioral' | 'situational' | 'closing';
export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior';

export interface InterviewQuestion {
  id: number;
  category: QuestionCategory;
  question: string;
  difficulty: ExperienceLevel;
  roles?: string[] | string; // Can be array or comma-separated string
  industries?: string[] | string; // Can be array or comma-separated string
  hints?: string[] | string;
  sample_answer?: string;
  key_points?: string[] | string;
  created_at?: string;
  updated_at?: string;
}

export const useInterviewQuestions = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (filters?: {
    category?: QuestionCategory;
    difficulty?: ExperienceLevel;
    role?: string;
    industry?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('interview_questions')
        .select('*');

      // Apply filters if provided
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process the data to normalize arrays/strings
      const processedQuestions: InterviewQuestion[] = (data || []).map((q: any) => ({
        ...q,
        // Normalize roles - handle both array and string formats
        roles: Array.isArray(q.roles) 
          ? q.roles 
          : typeof q.roles === 'string' 
            ? (q.roles.includes(',') ? q.roles.split(',').map((r: string) => r.trim()) : [q.roles])
            : q.roles || [],
        // Normalize industries - handle both array and string formats
        industries: Array.isArray(q.industries)
          ? q.industries
          : typeof q.industries === 'string'
            ? (q.industries.includes(',') ? q.industries.split(',').map((i: string) => i.trim()) : [q.industries])
            : q.industries || [],
        // Normalize hints
        hints: Array.isArray(q.hints)
          ? q.hints
          : typeof q.hints === 'string'
            ? (q.hints.includes(',') ? q.hints.split(',').map((h: string) => h.trim()) : [q.hints])
            : q.hints || [],
        // Normalize key_points
        key_points: Array.isArray(q.key_points)
          ? q.key_points
          : typeof q.key_points === 'string'
            ? (q.key_points.includes(',') ? q.key_points.split(',').map((k: string) => k.trim()) : [q.key_points])
            : q.key_points || [],
      }));

      // Apply client-side filtering for role and industry if needed
      let filteredQuestions = processedQuestions;
      
      if (filters?.role) {
        filteredQuestions = filteredQuestions.filter(q => {
          const roles = Array.isArray(q.roles) ? q.roles : [q.roles];
          return roles.includes('all') || roles.includes(filters.role!);
        });
      }

      if (filters?.industry) {
        filteredQuestions = filteredQuestions.filter(q => {
          const industries = Array.isArray(q.industries) ? q.industries : [q.industries];
          return industries.includes('all') || industries.includes(filters.industry!);
        });
      }

      setQuestions(filteredQuestions);
    } catch (err) {
      console.error('Error fetching interview questions:', err);
      setError(err as Error);
      setQuestions([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const getQuestionsByFilters = (
    role?: string,
    industry?: string,
    difficulty?: ExperienceLevel,
    category?: QuestionCategory,
    limit: number = 10
  ): InterviewQuestion[] => {
    let filtered = questions;

    // Filter by role
    if (role) {
      filtered = filtered.filter(q => {
        const roles = Array.isArray(q.roles) ? q.roles : [q.roles];
        return roles.includes('all') || roles.includes(role);
      });
    }

    // Filter by industry
    if (industry) {
      filtered = filtered.filter(q => {
        const industries = Array.isArray(q.industries) ? q.industries : [q.industries];
        return industries.includes('all') || industries.includes(industry);
      });
    }

    // Filter by difficulty
    if (difficulty) {
      filtered = filtered.filter(q => 
        q.difficulty === difficulty || q.difficulty === 'fresher'
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(q => q.category === category);
    }

    // Shuffle and limit
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  };

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    getQuestionsByFilters,
    refetch: () => fetchQuestions(),
  };
};

