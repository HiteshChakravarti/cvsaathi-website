import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { AICareerService } from '../services/aiCareerService';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export function EdgeFunctionTest() {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const testEdgeFunction = async () => {
    setTesting(true);
    setResults([]);

    const newResults: TestResult[] = [];

    // Test 1: Check environment variables
    newResults.push({
      name: 'Environment Variables',
      status: 'pending',
      message: 'Checking environment variables...',
    });
    setResults([...newResults]);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      newResults[0] = {
        name: 'Environment Variables',
        status: 'error',
        message: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
        },
      };
      setResults([...newResults]);
      setTesting(false);
      return;
    }

    newResults[0] = {
      name: 'Environment Variables',
      status: 'success',
      message: 'Environment variables configured',
      details: {
        url: supabaseUrl.substring(0, 30) + '...',
        hasKey: !!supabaseKey,
      },
    };
    setResults([...newResults]);

    // Test 2: Check authentication
    newResults.push({
      name: 'Authentication',
      status: 'pending',
      message: 'Checking user authentication...',
    });
    setResults([...newResults]);

    if (!user) {
      newResults[1] = {
        name: 'Authentication',
        status: 'error',
        message: 'User not authenticated',
      };
      setResults([...newResults]);
      setTesting(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      newResults[1] = {
        name: 'Authentication',
        status: 'error',
        message: 'No access token found',
      };
      setResults([...newResults]);
      setTesting(false);
      return;
    }

    newResults[1] = {
      name: 'Authentication',
      status: 'success',
      message: 'User authenticated with valid session',
      details: {
        userId: user.id,
        hasToken: !!session.access_token,
      },
    };
    setResults([...newResults]);

    // Test 3: Check edge function URL construction
    newResults.push({
      name: 'Edge Function URL',
      status: 'pending',
      message: 'Verifying edge function URL...',
    });
    setResults([...newResults]);

    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/ai-career-companion`;
    
    newResults[2] = {
      name: 'Edge Function URL',
      status: 'success',
      message: 'Edge function URL constructed',
      details: {
        url: edgeFunctionUrl,
      },
    };
    setResults([...newResults]);

    // Test 4: Test edge function connectivity
    newResults.push({
      name: 'Edge Function Connectivity',
      status: 'pending',
      message: 'Testing connection to edge function...',
    });
    setResults([...newResults]);

    try {
      const testResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: 'Hello, this is a test message',
          context: {
            language: 'en',
            timestamp: Date.now(),
            requestId: 'test-' + Date.now(),
          },
        }),
      });

      const responseText = await testResponse.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      if (testResponse.ok) {
        newResults[3] = {
          name: 'Edge Function Connectivity',
          status: 'success',
          message: `Edge function responded successfully (${testResponse.status})`,
          details: {
            status: testResponse.status,
            hasItems: !!responseData.items,
            responseType: typeof responseData,
          },
        };
      } else {
        newResults[3] = {
          name: 'Edge Function Connectivity',
          status: 'error',
          message: `Edge function returned error (${testResponse.status})`,
          details: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            response: responseData,
          },
        };
      }
    } catch (error: any) {
      newResults[3] = {
        name: 'Edge Function Connectivity',
        status: 'error',
        message: `Failed to connect to edge function: ${error.message}`,
        details: {
          error: error.message,
          type: error.name,
        },
      };
    }
    setResults([...newResults]);

    // Test 5: Test AI Service integration
    newResults.push({
      name: 'AI Service Integration',
      status: 'pending',
      message: 'Testing AI service wrapper...',
    });
    setResults([...newResults]);

    try {
      const aiService = new AICareerService();
      aiService.setAuthToken(session.access_token);

      const testMessage = 'Test message for AI service';
      const response = await aiService.sendMessage(testMessage, {}, 'en');

      if (response && response.items && response.items.length > 0) {
        newResults[4] = {
          name: 'AI Service Integration',
          status: 'success',
          message: 'AI service working correctly',
          details: {
            itemsCount: response.items.length,
            hasContent: !!response.items[0]?.content,
            contentLength: response.items[0]?.content?.length || 0,
          },
        };
      } else {
        newResults[4] = {
          name: 'AI Service Integration',
          status: 'error',
          message: 'AI service returned invalid response',
          details: {
            response,
          },
        };
      }
    } catch (error: any) {
      newResults[4] = {
        name: 'AI Service Integration',
        status: 'error',
        message: `AI service error: ${error.message}`,
        details: {
          error: error.message,
        },
      };
    }
    setResults([...newResults]);

    // Test 6: Check edge function exists (optional - not critical if connectivity works)
    newResults.push({
      name: 'Edge Function Existence',
      status: 'pending',
      message: 'Checking if edge function is deployed...',
    });
    setResults([...newResults]);

    // Since connectivity test passed, we know the function exists
    // This test is just a bonus check
    const connectivityTestPassed = newResults[3]?.status === 'success';
    
    if (connectivityTestPassed) {
      // If connectivity works, function definitely exists
      newResults[5] = {
        name: 'Edge Function Existence',
        status: 'success',
        message: 'Edge function confirmed (connectivity test passed)',
        details: {
          note: 'Function existence verified through successful connectivity test',
        },
      };
    } else {
      // Only try OPTIONS if connectivity failed
      try {
        const optionsResponse = await fetch(edgeFunctionUrl, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        newResults[5] = {
          name: 'Edge Function Existence',
          status: optionsResponse.status !== 404 ? 'success' : 'error',
          message: optionsResponse.status !== 404
            ? 'Edge function appears to be deployed'
            : 'Edge function not found (404) - may need deployment',
          details: {
            status: optionsResponse.status,
          },
        };
      } catch (error: any) {
        // If connectivity passed, this is not critical
        newResults[5] = {
          name: 'Edge Function Existence',
          status: connectivityTestPassed ? 'success' : 'error',
          message: connectivityTestPassed
            ? 'Function confirmed via connectivity test'
            : `Could not verify function existence: ${error.message}`,
          details: {
            note: connectivityTestPassed 
              ? 'Connectivity test already confirmed function exists'
              : 'Both connectivity and existence checks failed',
          },
        };
      }
    }
    setResults([...newResults]);

    setTesting(false);

    // Show summary toast
    const successCount = newResults.filter(r => r.status === 'success').length;
    const errorCount = newResults.filter(r => r.status === 'error').length;

    if (errorCount === 0) {
      toast.success(`All tests passed! (${successCount}/${newResults.length})`);
    } else {
      toast.warning(`Tests completed: ${successCount} passed, ${errorCount} failed`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="size-5 text-green-500" />;
      case 'error':
        return <XCircle className="size-5 text-red-500" />;
      default:
        return <Loader2 className="size-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-teal-500" />
              Edge Function & AI Service Test
            </CardTitle>
            <CardDescription>
              Verify that Supabase edge functions are connected and AI services are working
            </CardDescription>
          </div>
          <Button
            onClick={testEdgeFunction}
            disabled={testing || !user}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
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
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="size-5" />
              <p>Please sign in to test edge functions</p>
            </div>
          </div>
        )}

        {results.length === 0 && user && (
          <div className="text-center py-8 text-gray-500">
            Click "Run Tests" to verify edge function connectivity
          </div>
        )}

        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)} transition-all`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {result.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {result.message}
                </p>
                {result.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 dark:text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}

        {results.length > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Test Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Tests:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">{results.length}</span>
              </div>
              <div>
                <span className="text-green-600 dark:text-green-400">Passed:</span>
                <span className="ml-2 font-semibold text-green-700 dark:text-green-300">
                  {results.filter(r => r.status === 'success').length}
                </span>
              </div>
              <div>
                <span className="text-red-600 dark:text-red-400">Failed:</span>
                <span className="ml-2 font-semibold text-red-700 dark:text-red-300">
                  {results.filter(r => r.status === 'error').length}
                </span>
              </div>
            </div>
          </div>
        )}

        {results.some(r => r.status === 'error') && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <AlertCircle className="size-5" />
              Troubleshooting Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Ensure your Supabase project has the edge function deployed</li>
              <li>Check that the function name matches: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">ai-career-companion</code></li>
              <li>Verify your <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code> file has correct <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">VITE_SUPABASE_URL</code></li>
              <li>Make sure you're signed in with a valid session</li>
              <li>Check Supabase dashboard for edge function logs</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

