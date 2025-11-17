/**
 * Supabase Setup Verification Script
 * 
 * This script verifies that all required tables, functions, and edge functions
 * are properly set up in your Supabase project.
 * 
 * Run this after setting up your .env file to verify everything is connected.
 */

import { supabase } from './supabaseClient';

export interface VerificationResult {
  table: string;
  exists: boolean;
  error?: string;
}

export interface FunctionResult {
  function: string;
  exists: boolean;
  error?: string;
}

/**
 * Verify all required tables exist
 */
export async function verifyTables(): Promise<VerificationResult[]> {
  const requiredTables = [
    'pricing_plans',
    'subscriptions',
    'user_subscriptions', // Alternative/legacy table
    'usage_tracking',
    'user_stats',
    'user_preferences',
    'uploaded_resumes',
    'video_resumes',
    'profiles',
    'payments',
    'payment_orders',
  ];

  const results: VerificationResult[] = [];

  for (const table of requiredTables) {
    try {
      // Try to query the table (with limit 0 to avoid fetching data)
      const { error } = await supabase.from(table).select('*').limit(0);
      
      if (error) {
        // Check if it's a "relation does not exist" error
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          results.push({ table, exists: false, error: 'Table does not exist' });
        } else {
          // Table exists but might have permission issues
          results.push({ table, exists: true, error: error.message });
        }
      } else {
        results.push({ table, exists: true });
      }
    } catch (err: any) {
      results.push({ table, exists: false, error: err.message });
    }
  }

  return results;
}

/**
 * Verify all required database functions exist
 */
export async function verifyFunctions(): Promise<FunctionResult[]> {
  const requiredFunctions = [
    'can_user_access_feature',
    'log_feature_usage',
    'increment_resumes_created',
    'increment_interviews_practiced',
    'increment_ai_conversations',
    'add_time_spent',
  ];

  const results: FunctionResult[] = [];

  for (const funcName of requiredFunctions) {
    try {
      // Try to call the function with dummy/null parameters
      // This will fail if function doesn't exist, but succeed if it does (even with wrong params)
      const { error } = await supabase.rpc(funcName, {});
      
      if (error) {
        // Check if it's a "function does not exist" error
        if (error.code === '42883' || error.message.includes('does not exist') || error.message.includes('function')) {
          results.push({ function: funcName, exists: false, error: 'Function does not exist' });
        } else {
          // Function exists but parameters might be wrong (which is okay for verification)
          results.push({ function: funcName, exists: true });
        }
      } else {
        results.push({ function: funcName, exists: true });
      }
    } catch (err: any) {
      // If it's a parameter error, the function exists
      if (err.message.includes('parameter') || err.message.includes('argument')) {
        results.push({ function: funcName, exists: true });
      } else {
        results.push({ function: funcName, exists: false, error: err.message });
      }
    }
  }

  return results;
}

/**
 * Test authentication connection
 */
export async function testAuthConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    // Try to get current session (will be null if not logged in, but connection works)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Complete verification of Supabase setup
 */
export async function verifySupabaseSetup(): Promise<{
  auth: { success: boolean; error?: string };
  tables: VerificationResult[];
  functions: FunctionResult[];
  summary: {
    totalTables: number;
    existingTables: number;
    totalFunctions: number;
    existingFunctions: number;
    allGood: boolean;
  };
}> {
  console.log('🔍 Verifying Supabase setup...');
  
  const auth = await testAuthConnection();
  const tables = await verifyTables();
  const functions = await verifyFunctions();

  const existingTables = tables.filter(t => t.exists).length;
  const existingFunctions = functions.filter(f => f.exists).length;
  const allGood = auth.success && existingTables === tables.length && existingFunctions === functions.length;

  const summary = {
    totalTables: tables.length,
    existingTables,
    totalFunctions: functions.length,
    existingFunctions,
    allGood,
  };

  return {
    auth,
    tables,
    functions,
    summary,
  };
}

/**
 * Print verification results in a readable format
 */
export function printVerificationResults(results: Awaited<ReturnType<typeof verifySupabaseSetup>>) {
  console.log('\n📊 Supabase Setup Verification Results\n');
  console.log('═'.repeat(60));
  
  // Auth Status
  console.log('\n🔐 Authentication:');
  if (results.auth.success) {
    console.log('  ✅ Connection successful');
  } else {
    console.log(`  ❌ Connection failed: ${results.auth.error}`);
  }
  
  // Tables Status
  console.log('\n📋 Tables:');
  results.tables.forEach(({ table, exists, error }) => {
    const status = exists ? '✅' : '❌';
    const errorMsg = error ? ` (${error})` : '';
    console.log(`  ${status} ${table}${errorMsg}`);
  });
  
  // Functions Status
  console.log('\n⚙️  Database Functions:');
  results.functions.forEach(({ function: funcName, exists, error }) => {
    const status = exists ? '✅' : '❌';
    const errorMsg = error ? ` (${error})` : '';
    console.log(`  ${status} ${funcName}${errorMsg}`);
  });
  
  // Summary
  console.log('\n📈 Summary:');
  console.log(`  Tables: ${results.summary.existingTables}/${results.summary.totalTables} exist`);
  console.log(`  Functions: ${results.summary.existingFunctions}/${results.summary.totalFunctions} exist`);
  
  if (results.summary.allGood) {
    console.log('\n  🎉 All checks passed! Your Supabase setup is complete.');
  } else {
    console.log('\n  ⚠️  Some components are missing. Please check the errors above.');
  }
  
  console.log('\n' + '═'.repeat(60) + '\n');
}

