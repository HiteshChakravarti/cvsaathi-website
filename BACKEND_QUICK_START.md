# Backend Integration - Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Supabase
```bash
cd C:\Users\Hitesh\Aipoweredresumebuilder
npm install @supabase/supabase-js
```

### Step 2: Create Environment File
Create `.env` in project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get your keys from:**
- Supabase Dashboard → Settings → API
- Copy "Project URL" → `VITE_SUPABASE_URL`
- Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

### Step 3: Run Database Migrations
1. Go to Supabase Dashboard → SQL Editor
2. Run these files **in order**:
   - `supabase/migrations/20250108_user_preferences.sql`
   - `supabase/migrations/20250109_usage_tracking.sql`
   - `supabase/migrations/20250117120000-uploaded-resumes.sql`
   - `supabase/migrations/20250130150000-video-resumes-table.sql`
   - `supabase/SUPABASE_RLS_POLICIES.sql`
   - `supabase/COMPLETE_RAZORPAY_SETUP.sql` (if using payments)
   - `supabase/FINAL_SUBSCRIPTION_FIX.sql` (if using subscriptions)

### Step 4: Create Supabase Client
Create `src/lib/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### Step 5: Verify Setup
```bash
npm run dev
```

Check browser console for:
- ✅ No Supabase connection errors
- ✅ Environment variables loaded

---

## 📋 Database Tables Created

After running migrations, you'll have:

1. **user_preferences** - User settings
2. **usage_tracking** - Feature usage limits
3. **uploaded_resumes** - ATS analysis storage
4. **video_resumes** - Video resume storage
5. **user_stats** - User activity stats
6. **profiles** - User profiles (extended)
7. **payment_orders** - Razorpay orders
8. **user_subscriptions** - Subscription management
9. **payments** - Payment records

---

## ✅ Verification Checklist

- [ ] Supabase package installed
- [ ] `.env` file created with valid keys
- [ ] All SQL migrations run successfully
- [ ] Tables visible in Supabase Dashboard
- [ ] RLS policies enabled (check in Dashboard)
- [ ] `supabaseClient.ts` created
- [ ] No console errors on dev server start

---

## 🔧 Next Steps

1. **Create Auth Context** (see `BACKEND_INTEGRATION_PLAN.md` Phase 3)
2. **Update ProtectedRoute** to use real auth
3. **Create Database Hooks** for data fetching
4. **Test Authentication** flow

---

## 🆘 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Verify variable names start with `VITE_`
- Restart dev server after creating `.env`

### "Connection refused" or "Invalid API key"
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure `.env` file is not in `.gitignore` issues

### "Table does not exist"
- Run SQL migrations in Supabase Dashboard
- Check migrations ran in correct order
- Verify table names in Supabase Dashboard → Table Editor

---

**For detailed instructions, see `BACKEND_INTEGRATION_PLAN.md`**

