# Supabase Setup Verification Guide

Since your Supabase database is already set up with all tables and edge functions, let's verify everything is properly connected!

## Quick Setup

### Step 1: Create `.env` File

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Step 2: Verify Connection

I've created a verification script that checks all required tables and functions. You can use it in two ways:

#### Option A: Add to a Component (Recommended for Testing)

Create a test page or add to your dashboard:

```typescript
import { useEffect, useState } from 'react';
import { verifySupabaseSetup, printVerificationResults } from '../lib/verifySupabaseSetup';

export function SupabaseVerification() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifySupabaseSetup()
      .then((results) => {
        setResults(results);
        printVerificationResults(results);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Verification failed:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Verifying...</div>;
  if (!results) return <div>Verification failed</div>;

  return (
    <div>
      <h2>Supabase Verification</h2>
      <p>Auth: {results.auth.success ? '✅' : '❌'}</p>
      <p>Tables: {results.summary.existingTables}/{results.summary.totalTables}</p>
      <p>Functions: {results.summary.existingFunctions}/{results.summary.totalFunctions}</p>
    </div>
  );
}
```

#### Option B: Run in Browser Console

After starting your dev server, open browser console and run:

```javascript
import { verifySupabaseSetup, printVerificationResults } from './src/lib/verifySupabaseSetup';
verifySupabaseSetup().then(printVerificationResults);
```

## Required Tables

The verification script checks for these tables:

### Core Tables
- ✅ `profiles` - User profiles
- ✅ `user_stats` - User statistics
- ✅ `user_preferences` - User preferences

### Subscription Tables
- ✅ `pricing_plans` - Available subscription plans
- ✅ `subscriptions` - User subscriptions (legacy)
- ✅ `user_subscriptions` - User subscriptions (new)

### Usage Tracking
- ✅ `usage_tracking` - Feature usage tracking

### Feature Tables
- ✅ `uploaded_resumes` - ATS analysis resumes
- ✅ `video_resumes` - Video resume storage

### Payment Tables
- ✅ `payments` - Payment records
- ✅ `payment_orders` - Razorpay orders

## Required Database Functions

The verification script checks for these RPC functions:

- ✅ `can_user_access_feature` - Check feature access
- ✅ `log_feature_usage` - Log feature usage
- ✅ `increment_resumes_created` - Increment resume count
- ✅ `increment_interviews_practiced` - Increment interview count
- ✅ `increment_ai_conversations` - Increment AI conversations
- ✅ `add_time_spent` - Add time spent tracking

## Edge Functions

The code also expects this edge function:

- ✅ `ai-career-companion` - AI Career Companion service
  - URL: `https://your-project-id.supabase.co/functions/v1/ai-career-companion`

## What to Check

After running verification:

1. **If all tables exist** ✅ - You're good to go!
2. **If some tables are missing** ⚠️ - Run the corresponding migration files from `supabase/migrations/`
3. **If functions are missing** ⚠️ - Check the SQL files for function definitions
4. **If auth fails** ❌ - Check your `.env` file and Supabase project status

## Common Issues

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Restart dev server after creating `.env`

### "Table does not exist"
- Run the migration file for that table from `supabase/migrations/`

### "Function does not exist"
- Check `SUPABASE_RLS_POLICIES.sql` or other SQL files for function definitions
- Run the SQL to create the function

### "Permission denied"
- Check RLS policies are set up correctly
- Verify your anon key has proper permissions

## Next Steps

Once verification passes:

1. ✅ Test authentication (sign up/sign in)
2. ✅ Test protected routes
3. ✅ Test subscription service
4. ✅ Test usage tracking
5. ✅ Test user stats

---

**Need help?** Share the verification results and I can help identify what's missing!

