# Backend Integration Plan - Supabase Setup
**Date:** Today  
**Project:** Aipoweredresumebuilder (Website)  
**Source:** CVSaathi (Mobile App Backend)  
**Objective:** Integrate Supabase backend from CVSaathi into the website project

---

## 🎯 Overview

This plan outlines the steps to integrate the Supabase backend from `CVSaathi` into `Aipoweredresumebuilder` to enable:
- User authentication
- Database operations
- File storage
- Real-time features
- Subscription management
- Usage tracking

---

## 📋 Phase 1: Setup & Configuration

### Step 1.1: Install Dependencies

**Action:** Add Supabase client library and i18n packages to `package.json`

```bash
npm install @supabase/supabase-js i18next react-i18next
```

**Files to Modify:**
- `package.json`

**Dependencies Needed:**
- `@supabase/supabase-js` - Supabase JavaScript client
- `i18next` - Internationalization framework
- `react-i18next` - React bindings for i18next

---

### Step 1.2: Create Environment Configuration

**Action:** Set up environment variables for Supabase

**Create:** `.env` file in project root

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Optional: For production
VITE_APP_ENV=development
VITE_DEBUG_MODE=false
```

**Create:** `.env.example` file (template without actual keys)

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Optional
VITE_APP_ENV=development
VITE_DEBUG_MODE=false
```

**Files to Create:**
- `.env` (add to `.gitignore`)
- `.env.example` (commit to git)

**Note:** Use `VITE_` prefix for Vite environment variables (not `EXPO_PUBLIC_`)

---

### Step 1.3: Create Supabase Client Configuration

**Action:** Create web-compatible Supabase client (not Expo-specific)

**Create:** `src/lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Important for web apps
  },
});

// Export types (will be generated later)
export type Database = any; // TODO: Generate types from Supabase
```

**Files to Create:**
- `src/lib/supabaseClient.ts`

---

### Step 1.4: Create Secure Config Helper (Optional)

**Action:** Create a secure configuration helper similar to CVSaathi but for web

**Create:** `src/lib/config.ts`

```typescript
/**
 * Configuration helper for web environment
 * Handles environment variables with validation
 */

function getEnvVar(key: string, required = true): string {
  const value = import.meta.env[key];
  
  if (required && !value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

export const Config = {
  // Supabase
  get SUPABASE_URL() {
    return getEnvVar('VITE_SUPABASE_URL', true);
  },
  
  get SUPABASE_ANON_KEY() {
    return getEnvVar('VITE_SUPABASE_ANON_KEY', true);
  },
  
  // App
  get APP_ENV() {
    return getEnvVar('VITE_APP_ENV', false) || 'development';
  },
  
  get DEBUG_MODE() {
    return getEnvVar('VITE_DEBUG_MODE', false) === 'true';
  },
  
  // Validation
  validate() {
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = required.filter(key => !Config[key as keyof typeof Config]);
    
    if (missing.length > 0) {
      console.error(`❌ Missing required configuration: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  },
};
```

**Files to Create:**
- `src/lib/config.ts`

---

## 📋 Phase 2: Database Schema Migration

### Step 2.1: Copy SQL Migration Files

**Action:** Copy all SQL migration files from CVSaathi to Aipoweredresumebuilder

**Create Directory:** `supabase/migrations/`

**Files to Copy:**
1. `supabase/migrations/20250108_user_preferences.sql`
2. `supabase/migrations/20250109_usage_tracking.sql`
3. `supabase/migrations/20250117120000-uploaded-resumes.sql`
4. `supabase/migrations/20250130150000-video-resumes-table.sql`

**Additional SQL Files to Copy:**
1. `SUPABASE_RLS_POLICIES.sql` → `supabase/SUPABASE_RLS_POLICIES.sql`
2. `CHECK_TABLE_SCHEMAS.sql` → `supabase/CHECK_TABLE_SCHEMAS.sql`
3. `FINAL_SUBSCRIPTION_FIX.sql` → `supabase/FINAL_SUBSCRIPTION_FIX.sql` (if exists)
4. `COMPLETE_RAZORPAY_SETUP.sql` → `supabase/COMPLETE_RAZORPAY_SETUP.sql` (if exists)

**Directory Structure:**
```
supabase/
├── migrations/
│   ├── 20250108_user_preferences.sql
│   ├── 20250109_usage_tracking.sql
│   ├── 20250117120000-uploaded-resumes.sql
│   └── 20250130150000-video-resumes-table.sql
├── SUPABASE_RLS_POLICIES.sql
├── CHECK_TABLE_SCHEMAS.sql
└── [other SQL files]
```

---

### Step 2.2: Database Tables Summary

**Tables to Create (from migrations):**

1. **user_preferences**
   - User notification and privacy settings
   - RLS enabled

2. **usage_tracking**
   - Feature usage tracking for subscription limits
   - Monthly billing period support
   - RLS enabled

3. **uploaded_resumes**
   - ATS analysis resume storage
   - RLS enabled

4. **video_resumes**
   - Video resume storage
   - Storage bucket policies
   - RLS enabled

5. **user_stats** (from SUPABASE_RLS_POLICIES.sql)
   - User activity statistics
   - Achievement badges
   - Streak tracking
   - RLS enabled

6. **profiles** (extended in SUPABASE_RLS_POLICIES.sql)
   - User profile data
   - Notification preferences
   - RLS enabled

**Additional Tables (from subscription/payment SQL):**
- `payments`
- `user_subscriptions`
- `subscriptions`

---

### Step 2.3: Apply Migrations to Supabase

**Action:** Run SQL migrations in Supabase Dashboard

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - `20250108_user_preferences.sql`
   - `20250109_usage_tracking.sql`
   - `20250117120000-uploaded-resumes.sql`
   - `20250130150000-video-resumes-table.sql`
   - `SUPABASE_RLS_POLICIES.sql`
   - Any subscription/payment SQL files

3. Verify tables created:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

4. Verify RLS enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

---

## 📋 Phase 3: Authentication Setup

### Step 3.1: Create Auth Context

**Action:** Create React context for authentication state

**Create:** `src/contexts/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Files to Create:**
- `src/contexts/AuthContext.tsx`

---

### Step 3.2: Update ProtectedRoute

**Action:** Connect ProtectedRoute to real authentication

**Modify:** `src/routes/ProtectedRoute.tsx`

```typescript
import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
```

**Files to Modify:**
- `src/routes/ProtectedRoute.tsx`

---

### Step 3.3: Wrap App with AuthProvider

**Action:** Add AuthProvider to main App component

**Modify:** `src/App.tsx`

```typescript
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LandingPage } from "./pages/LandingPage";
import { DashboardRoutes } from "./dashboard/DashboardRoutes";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <DashboardRoutes />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

**Files to Modify:**
- `src/App.tsx`

---

## 📋 Phase 4: Database Hooks & Utilities

### Step 4.1: Create Database Hooks

**Action:** Create React hooks for common database operations

**Create:** `src/hooks/useUserStats.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface UserStats {
  id: string;
  user_id: string;
  resumes_created: number;
  interviews_practiced: number;
  ai_conversations: number;
  total_time_spent: number;
  last_active_date: string;
  achievement_badges: string[];
  current_streak: number;
  ats_average_score: number;
  created_at: string;
  updated_at: string;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setStats(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading, error };
};
```

**Create:** `src/hooks/useUserProfile.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  notifications_enabled?: boolean;
  language_pref?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
};
```

**Files to Create:**
- `src/hooks/useUserStats.ts`
- `src/hooks/useUserProfile.ts`
- `src/hooks/useUserPreferences.ts` (similar pattern)
- `src/hooks/useUsageTracking.ts` (similar pattern)

---

## 📋 Phase 5: Testing & Verification

### Step 5.1: Create Test Scripts

**Action:** Create SQL verification queries

**Use:** `supabase/CHECK_TABLE_SCHEMAS.sql` (already copied)

**Test Queries:**
1. Verify all tables exist
2. Verify RLS is enabled
3. Verify policies are created
4. Test authentication flow
5. Test database operations

---

### Step 5.2: Create Integration Tests

**Action:** Test authentication and database operations

**Create:** `src/utils/testSupabase.ts` (development only)

```typescript
import { supabase } from '../lib/supabaseClient';

export const testSupabaseConnection = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

export const testAuth = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    console.log('✅ Authentication successful');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    return false;
  }
};
```

---

## 📋 Phase 6: Documentation

### Step 6.1: Update README

**Action:** Add backend setup instructions to README

**Add Section:**
- Environment setup
- Supabase configuration
- Database migration steps
- Authentication setup

---

## ✅ Implementation Checklist

### Phase 1: Setup & Configuration
- [ ] Install `@supabase/supabase-js`
- [ ] Create `.env` file with Supabase credentials
- [ ] Create `.env.example` template
- [ ] Create `src/lib/supabaseClient.ts`
- [ ] Create `src/lib/config.ts` (optional)

### Phase 2: Database Schema
- [ ] Copy all SQL migration files
- [ ] Create `supabase/migrations/` directory
- [ ] Run migrations in Supabase Dashboard
- [ ] Verify all tables created
- [ ] Verify RLS policies enabled

### Phase 3: Authentication
- [ ] Create `src/contexts/AuthContext.tsx`
- [ ] Update `src/routes/ProtectedRoute.tsx`
- [ ] Wrap App with `AuthProvider`
- [ ] Test authentication flow

### Phase 4: Database Hooks
- [ ] Create `useUserStats` hook
- [ ] Create `useUserProfile` hook
- [ ] Create `useUserPreferences` hook
- [ ] Create `useUsageTracking` hook

### Phase 5: Testing
- [ ] Test Supabase connection
- [ ] Test authentication (sign in/up/out)
- [ ] Test database queries
- [ ] Test RLS policies
- [ ] Test protected routes

### Phase 6: Documentation
- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Document database schema
- [ ] Document authentication flow

---

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit `.env` file
   - Use `VITE_` prefix for client-side variables
   - Store secrets in Supabase Edge Functions (not client)

2. **Row Level Security (RLS):**
   - All tables must have RLS enabled
   - Policies must restrict access to user's own data
   - Test policies thoroughly

3. **Authentication:**
   - Use Supabase Auth (secure by default)
   - Implement proper session management
   - Handle token refresh automatically

4. **API Keys:**
   - Only use `anon` key in client
   - Never expose `service_role` key
   - Use Edge Functions for sensitive operations

---

## 🚀 Next Steps After Integration

1. **Generate TypeScript Types:**
   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
   ```

2. **Update Supabase Client with Types:**
   ```typescript
   import { Database } from '../types/database.types';
   export const supabase = createClient<Database>(url, key);
   ```

3. **Implement Features:**
   - User profile management
   - Resume builder data persistence
   - ATS checker results storage
   - Usage tracking
   - Subscription management

4. **Add Error Handling:**
   - Global error boundary
   - API error handling
   - User-friendly error messages

5. **Add Loading States:**
   - Skeleton loaders
   - Progress indicators
   - Optimistic updates

---

## 📝 Notes

- **Vite vs Expo:** Use `VITE_` prefix instead of `EXPO_PUBLIC_`
- **Session Management:** Supabase handles sessions automatically for web
- **Storage:** Use Supabase Storage for file uploads (resumes, videos)
- **Real-time:** Can enable real-time subscriptions for live updates
- **Edge Functions:** Use for server-side operations (payments, webhooks)

---

**End of Integration Plan**

