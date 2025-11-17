import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Database, Zap, MessageSquare, FileText, Target, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { AICareerService } from '../services/aiCareerService';
import { useInterviewSessions } from '../hooks/useInterviewSessions';
import { useAIConversations } from '../hooks/useAIConversations';
import { useResumes } from '../hooks/useResumes';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
  data?: any;
}

export function AIServicesTest() {
  const { user } = useAuth();
  const { sessions: interviewSessions, loading: sessionsLoading, refetch: refetchSessions } = useInterviewSessions();
  const { conversations, loading: conversationsLoading } = useAIConversations();
  const { resumes, loading: resumesLoading } = useResumes();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user, interviewSessions, conversations, resumes]);

  const runTests = async () => {
    setTesting(true);
    const newResults: TestResult[] = [];

    // Test 1: Authentication
    newResults.push({
      name: 'User Authentication',
      status: user ? 'success' : 'error',
      message: user ? `Authenticated as ${user.email}` : 'Not authenticated',
      details: { userId: user?.id, email: user?.email },
    });
    setResults([...newResults]);

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      newResults.push({
        name: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? `Connection failed: ${error.message}` : 'Connected successfully',
        details: error ? { error: error.message } : { connected: true },
      });
    } catch (error: any) {
      newResults.push({
        name: 'Supabase Connection',
        status: 'error',
        message: `Connection error: ${error.message}`,
      });
    }
    setResults([...newResults]);

    // Test 3: Interview Sessions from Supabase
    newResults.push({
      name: 'Interview Sessions (Supabase)',
      status: sessionsLoading ? 'pending' : interviewSessions.length > 0 ? 'success' : 'success',
      message: sessionsLoading 
        ? 'Loading...' 
        : `Found ${interviewSessions.length} interview session(s)`,
      data: interviewSessions,
      details: {
        count: interviewSessions.length,
        sessions: interviewSessions.slice(0, 3).map(s => ({
          id: s.id,
          role: s.target_roles || s.role,
          industry: s.industry,
          completed: !!s.completed_at,
          score: s.average_score,
          duration: s.duration_minutes,
          created: new Date(s.created_at).toLocaleDateString(),
        })),
      },
    });
    setResults([...newResults]);

    // Test 4: AI Conversations from Supabase
    newResults.push({
      name: 'AI Conversations (Supabase)',
      status: conversationsLoading ? 'pending' : 'success',
      message: conversationsLoading 
        ? 'Loading...' 
        : `Found ${conversations.length} conversation(s)`,
      data: conversations,
      details: {
        count: conversations.length,
        conversations: conversations.slice(0, 3).map(c => ({
          id: c.id,
          title: c.title,
          type: c.type,
          messages: c.messages.length,
          created: new Date(c.created_at).toLocaleDateString(),
        })),
      },
    });
    setResults([...newResults]);

    // Test 5: Resumes from Supabase
    newResults.push({
      name: 'Resumes (Supabase)',
      status: resumesLoading ? 'pending' : 'success',
      message: resumesLoading 
        ? 'Loading...' 
        : `Found ${resumes.length} resume(s)`,
      data: resumes,
      details: {
        count: resumes.length,
        resumes: resumes.slice(0, 3).map(r => ({
          id: r.id,
          title: r.title,
          created: new Date(r.created_at).toLocaleDateString(),
        })),
      },
    });
    setResults([...newResults]);

    // Test 6: Edge Function - AI Career Companion
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not set');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token');
      }

      const aiService = new AICareerService();
      aiService.setAuthToken(session.access_token);

      const testResponse = await aiService.sendMessage(
        'Hello, this is a test message. Please respond with "AI service is working"',
        { contextType: 'general' },
        'en'
      );

      newResults.push({
        name: 'AI Career Companion (Edge Function)',
        status: testResponse && testResponse.items?.length > 0 ? 'success' : 'error',
        message: testResponse && testResponse.items?.length > 0
          ? 'AI service is responding correctly'
          : 'AI service did not respond',
        details: {
          responseReceived: !!testResponse,
          itemsCount: testResponse?.items?.length || 0,
          sampleResponse: testResponse?.items?.[0]?.content?.substring(0, 100) || 'No response',
        },
      });
    } catch (error: any) {
      newResults.push({
        name: 'AI Career Companion (Edge Function)',
        status: 'error',
        message: `Error: ${error.message}`,
        details: { error: error.message },
      });
    }
    setResults([...newResults]);

    // Test 7: Resume Builder AI
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token');
      }

      const aiService = new AICareerService();
      aiService.setAuthToken(session.access_token);

      const testResponse = await aiService.sendMessage(
        'Write a professional resume summary for a software engineer with 5 years of experience.',
        { contextType: 'resume', resumeSection: 'summary' },
        'en'
      );

      newResults.push({
        name: 'Resume Builder AI',
        status: testResponse && testResponse.items?.length > 0 ? 'success' : 'error',
        message: testResponse && testResponse.items?.length > 0
          ? 'Resume AI generation working'
          : 'Resume AI generation failed',
        details: {
          responseReceived: !!testResponse,
          hasContent: !!(testResponse?.items?.[0]?.content),
        },
      });
    } catch (error: any) {
      newResults.push({
        name: 'Resume Builder AI',
        status: 'error',
        message: `Error: ${error.message}`,
      });
    }
    setResults([...newResults]);

    // Test 8: Interview Prep AI
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token');
      }

      const aiService = new AICareerService();
      aiService.setAuthToken(session.access_token);

      const testResponse = await aiService.analyzeBehavioralQuestion(
        'Tell me about yourself',
        {
          userAnswer: 'I am a software engineer with 5 years of experience.',
          questionCategory: 'introduction',
          questionDifficulty: 'fresher',
          keyPoints: ['experience', 'skills'],
        },
        'en'
      );

      newResults.push({
        name: 'Interview Prep AI',
        status: testResponse && testResponse.detailedGuidance ? 'success' : 'error',
        message: testResponse && testResponse.detailedGuidance
          ? 'Interview AI feedback working'
          : 'Interview AI feedback failed',
        details: {
          hasFeedback: !!testResponse?.detailedGuidance,
          hasScore: typeof testResponse?.score === 'number',
        },
      });
    } catch (error: any) {
      newResults.push({
        name: 'Interview Prep AI',
        status: 'error',
        message: `Error: ${error.message}`,
      });
    }
    setResults([...newResults]);

    // Test 9: Resume Insights AI
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No access token');
      }

      const aiService = new AICareerService();
      aiService.setAuthToken(session.access_token);

      const mockResumeData = {
        personalInfo: { fullName: 'Test User', email: 'test@example.com' },
        summary: 'Software engineer',
        experiences: [],
        education: [],
      };

      const testResponse = await aiService.getResumeInsights(mockResumeData, 'en');

      newResults.push({
        name: 'Resume Insights AI',
        status: testResponse && testResponse.strengths ? 'success' : 'error',
        message: testResponse && testResponse.strengths
          ? 'Resume insights AI working'
          : 'Resume insights AI failed',
        details: {
          hasStrengths: !!testResponse?.strengths,
          hasImprovements: !!testResponse?.improvements,
        },
      });
    } catch (error: any) {
      newResults.push({
        name: 'Resume Insights AI',
        status: 'error',
        message: `Error: ${error.message}`,
      });
    }
    setResults([...newResults]);

    setResults([...newResults]);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="size-5 text-green-500" />;
      case 'error':
        return <XCircle className="size-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="size-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="size-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Services & Data Verification</h2>
          <p className="text-gray-600 mt-1">Testing all AI services and Supabase data connections</p>
        </div>
        <Button onClick={runTests} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="size-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                </div>
                {result.status === 'success' && (
                  <span className="text-sm text-green-600 font-medium">✓ Working</span>
                )}
                {result.status === 'error' && (
                  <span className="text-sm text-red-600 font-medium">✗ Failed</span>
                )}
              </div>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            {result.details && (
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(result.details).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-2 text-sm">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
            {result.data && Array.isArray(result.data) && result.data.length > 0 && (
              <CardContent>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Data Preview:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(result.data.slice(0, 2), null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Test Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span>
                      {results.filter(r => r.status === 'success').length} tests passed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-500" />
                    <span>
                      {results.filter(r => r.status === 'error').length} tests failed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="size-4 text-blue-500" />
                    <span>
                      Interview Sessions: {interviewSessions.length} | 
                      Conversations: {conversations.length} | 
                      Resumes: {resumes.length}
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={refetchSessions} variant="outline" size="sm">
                <Database className="size-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

