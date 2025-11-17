# Quick Supabase Connection Guide

Since your Supabase database is already set up, you just need to connect it! Here's the fastest way:

## 🚀 3-Step Setup

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token)

### Step 2: Create `.env` File

Create a file named `.env` in the project root (`C:\Users\Hitesh\Aipoweredresumebuilder\.env`) with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace** `your-project-id` and `your-anon-key-here` with the values from Step 1.

### Step 3: Test the Connection

#### Option A: Use the Test Component (Easiest)

Add this to any route temporarily (e.g., in your dashboard):

```typescript
import { SupabaseTest } from '../components/SupabaseTest';

// In your component:
<SupabaseTest />
```

#### Option B: Check Browser Console

1. Start dev server: `npm run dev`
2. Open browser console (F12)
3. You should see no errors about missing Supabase variables

## ✅ What's Already Done

- ✅ All NPM packages installed
- ✅ Supabase client configured
- ✅ Auth context created
- ✅ Protected routes set up
- ✅ All services connected
- ✅ i18n initialized
- ✅ Edge function URL uses environment variable

## 🔍 Verification Checklist

After creating `.env`, verify:

- [ ] No console errors about missing environment variables
- [ ] Can access protected routes (redirects if not logged in)
- [ ] Can sign up/sign in users
- [ ] Services can query database tables
- [ ] Edge functions are accessible

## 📋 Required Tables (Already in Your DB)

Your Supabase should have these tables:
- `profiles`
- `user_stats`
- `user_preferences`
- `usage_tracking`
- `pricing_plans`
- `subscriptions` or `user_subscriptions`
- `uploaded_resumes`
- `video_resumes`
- `payments`
- `payment_orders`

## ⚙️ Required Functions (Already in Your DB)

Your Supabase should have these RPC functions:
- `can_user_access_feature`
- `log_feature_usage`
- `increment_resumes_created`
- `increment_interviews_practiced`
- `increment_ai_conversations`
- `add_time_spent`

## 🎯 Edge Function

Your edge function should be at:
- `ai-career-companion` (automatically uses your Supabase URL)

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- ✅ Make sure `.env` file is in project root
- ✅ Restart dev server after creating `.env`
- ✅ Check file is named exactly `.env` (not `.env.txt`)

### "Table does not exist"
- Your tables might have different names
- Check `SUPABASE_VERIFICATION_GUIDE.md` for verification script

### "Function does not exist"
- Your functions might have different names or parameters
- Run the verification script to see what's missing

## 📞 Need Help?

If you want me to check your setup:
1. Share your Supabase project URL (safe to share)
2. Or run the verification component and share results
3. I can help identify any missing pieces

---

**That's it!** Once `.env` is set up, everything should work! 🎉

