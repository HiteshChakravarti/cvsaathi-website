/**
 * Supabase Connection Test Component
 * 
 * Use this component to verify your Supabase connection and setup.
 * Add it temporarily to your dashboard or create a test route.
 */

import { useEffect, useState } from 'react';
import { verifySupabaseSetup, printVerificationResults } from '../lib/verifySupabaseSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface VerificationState {
  loading: boolean;
  results: Awaited<ReturnType<typeof verifySupabaseSetup>> | null;
  error: string | null;
}

export function SupabaseTest() {
  const [state, setState] = useState<VerificationState>({
    loading: false,
    results: null,
    error: null,
  });

  const runVerification = async () => {
    setState({ loading: true, results: null, error: null });
    
    try {
      const results = await verifySupabaseSetup();
      printVerificationResults(results); // Also log to console
      setState({ loading: false, results, error: null });
    } catch (error: any) {
      console.error('Verification failed:', error);
      setState({ loading: false, results: null, error: error.message });
    }
  };

  useEffect(() => {
    // Auto-run on mount
    runVerification();
  }, []);

  const { loading, results, error } = state;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Verify that all required tables, functions, and connections are working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runVerification} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Run Verification'
          )}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-2">
              Make sure your .env file is set up correctly with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* Auth Status */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                Authentication
                {results.auth.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </h3>
              {results.auth.success ? (
                <p className="text-sm text-green-600">✅ Connection successful</p>
              ) : (
                <p className="text-sm text-red-600">❌ {results.auth.error}</p>
              )}
            </div>

            {/* Tables Status */}
            <div>
              <h3 className="font-semibold mb-2">
                Tables ({results.summary.existingTables}/{results.summary.totalTables})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {results.tables.map(({ table, exists, error }) => (
                  <div
                    key={table}
                    className={`p-2 rounded text-sm flex items-center gap-2 ${
                      exists ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {exists ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="font-mono text-xs">{table}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Functions Status */}
            <div>
              <h3 className="font-semibold mb-2">
                Database Functions ({results.summary.existingFunctions}/{results.summary.totalFunctions})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {results.functions.map(({ function: funcName, exists, error }) => (
                  <div
                    key={funcName}
                    className={`p-2 rounded text-sm flex items-center gap-2 ${
                      exists ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {exists ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <span className="font-mono text-xs">{funcName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-md border-2">
              {results.summary.allGood ? (
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-green-700">
                    🎉 All checks passed!
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your Supabase setup is complete and ready to use.
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-yellow-700">
                    ⚠️ Some components are missing
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Check the tables and functions above. Missing items may need to be created.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

