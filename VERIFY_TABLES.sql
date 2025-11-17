-- =====================================================
-- COMPREHENSIVE TABLE VERIFICATION FOR WEBSITE
-- Run this in Supabase SQL Editor to check all tables
-- =====================================================

-- =====================================================
-- 1. CHECK IF ALL REQUIRED TABLES EXIST
-- =====================================================
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'user_stats', 'user_preferences', 
            'usage_tracking', 'pricing_plans', 'subscriptions', 
            'user_subscriptions', 'uploaded_resumes', 'video_resumes',
            'payments', 'payment_orders'
        ) THEN '✅ REQUIRED'
        ELSE '⚠️ OPTIONAL'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'user_stats', 'user_preferences', 
    'usage_tracking', 'pricing_plans', 'subscriptions', 
    'user_subscriptions', 'uploaded_resumes', 'video_resumes',
    'payments', 'payment_orders'
  )
ORDER BY 
    CASE 
        WHEN table_name IN (
            'profiles', 'user_stats', 'user_preferences', 
            'usage_tracking', 'pricing_plans', 'subscriptions', 
            'user_subscriptions', 'uploaded_resumes', 'video_resumes',
            'payments', 'payment_orders'
        ) THEN 0 
        ELSE 1 
    END,
    table_name;

-- =====================================================
-- 2. CHECK PRICING_PLANS TABLE SCHEMA
-- =====================================================
SELECT 
    'pricing_plans' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pricing_plans'
ORDER BY ordinal_position;

-- Required columns for pricing_plans:
-- id, plan_id, name, display_name, description, price_monthly, price_yearly, 
-- currency, features, limits, is_active, sort_order, trial_days

-- =====================================================
-- 3. CHECK SUBSCRIPTIONS TABLE SCHEMA
-- =====================================================
SELECT 
    'subscriptions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Required columns for subscriptions:
-- id, user_id, plan_name, status, billing_cycle, current_period_start, 
-- current_period_end, external_subscription_id, metadata, created_at, updated_at

-- =====================================================
-- 4. CHECK USER_SUBSCRIPTIONS TABLE (Alternative)
-- =====================================================
SELECT 
    'user_subscriptions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- =====================================================
-- 5. CHECK USAGE_TRACKING TABLE SCHEMA
-- =====================================================
SELECT 
    'usage_tracking' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'usage_tracking'
ORDER BY ordinal_position;

-- Required columns for usage_tracking:
-- id, user_id, resource_type, resource_subtype, usage_count,
-- billing_period_start, billing_period_end, metadata, created_at, updated_at

-- =====================================================
-- 6. CHECK USER_STATS TABLE SCHEMA
-- =====================================================
SELECT 
    'user_stats' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_stats'
ORDER BY ordinal_position;

-- Required columns for user_stats:
-- id, user_id, resumes_created, interviews_practiced, ai_conversations,
-- total_time_spent, last_active_date, achievement_badges, current_streak,
-- ats_average_score, created_at, updated_at

-- =====================================================
-- 7. CHECK USER_PREFERENCES TABLE SCHEMA
-- =====================================================
SELECT 
    'user_preferences' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_preferences'
ORDER BY ordinal_position;

-- =====================================================
-- 8. CHECK UPLOADED_RESUMES TABLE SCHEMA
-- =====================================================
SELECT 
    'uploaded_resumes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'uploaded_resumes'
ORDER BY ordinal_position;

-- =====================================================
-- 9. CHECK VIDEO_RESUMES TABLE SCHEMA
-- =====================================================
SELECT 
    'video_resumes' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'video_resumes'
ORDER BY ordinal_position;

-- =====================================================
-- 10. CHECK PROFILES TABLE SCHEMA
-- =====================================================
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- 11. CHECK PAYMENTS TABLE SCHEMA
-- =====================================================
SELECT 
    'payments' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- =====================================================
-- 12. CHECK PAYMENT_ORDERS TABLE SCHEMA
-- =====================================================
SELECT 
    'payment_orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payment_orders'
ORDER BY ordinal_position;

-- =====================================================
-- 13. CHECK REQUIRED DATABASE FUNCTIONS (RPC)
-- =====================================================
SELECT 
    routine_name as function_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'can_user_access_feature',
    'log_feature_usage',
    'increment_resumes_created',
    'increment_interviews_practiced',
    'increment_ai_conversations',
    'add_time_spent'
  )
ORDER BY routine_name;

-- =====================================================
-- 14. CHECK RLS POLICIES ARE ENABLED
-- =====================================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'user_stats', 'user_preferences', 
    'usage_tracking', 'pricing_plans', 'subscriptions', 
    'user_subscriptions', 'uploaded_resumes', 'video_resumes',
    'payments', 'payment_orders'
  )
ORDER BY tablename;

-- =====================================================
-- 15. QUICK SUMMARY - MISSING TABLES
-- =====================================================
WITH required_tables AS (
    SELECT unnest(ARRAY[
        'profiles', 'user_stats', 'user_preferences', 
        'usage_tracking', 'pricing_plans', 'subscriptions', 
        'user_subscriptions', 'uploaded_resumes', 'video_resumes',
        'payments', 'payment_orders'
    ]) as table_name
),
existing_tables AS (
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
)
SELECT 
    rt.table_name,
    CASE 
        WHEN et.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.table_name = et.table_name
ORDER BY status, rt.table_name;

-- =====================================================
-- 16. QUICK SUMMARY - MISSING FUNCTIONS
-- =====================================================
WITH required_functions AS (
    SELECT unnest(ARRAY[
        'can_user_access_feature',
        'log_feature_usage',
        'increment_resumes_created',
        'increment_interviews_practiced',
        'increment_ai_conversations',
        'add_time_spent'
    ]) as function_name
),
existing_functions AS (
    SELECT routine_name as function_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
)
SELECT 
    rf.function_name,
    CASE 
        WHEN ef.function_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM required_functions rf
LEFT JOIN existing_functions ef ON rf.function_name = ef.function_name
ORDER BY status, rf.function_name;

