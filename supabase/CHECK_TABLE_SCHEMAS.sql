-- =====================================================
-- CHECK TABLE SCHEMAS FOR SUBSCRIPTION SYSTEM
-- =====================================================
-- Run these queries in Supabase SQL Editor to verify your setup
-- =====================================================

-- ============================================
-- 1. CHECK PAYMENTS TABLE SCHEMA
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
ORDER BY ordinal_position;

-- ❓ KEY QUESTION: What is the data_type for 'amount' column?
-- If INTEGER → amount is in PAISE (multiply by 100)
-- If NUMERIC(10,2) → amount is in RUPEES (no conversion needed)

-- ============================================
-- 2. CHECK USER_SUBSCRIPTIONS TABLE
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- ✅ REQUIRED COLUMNS:
-- user_id, plan_id, plan_name, status, billing_cycle,
-- current_period_start, current_period_end, 
-- external_subscription_id, metadata, cancelled_at, updated_at

-- ============================================
-- 3. CHECK SUBSCRIPTIONS TABLE (Legacy)
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ✅ REQUIRED COLUMNS:
-- user_id, plan_name, status, billing_cycle,
-- external_subscription_id, created_at, updated_at

-- ============================================
-- 4. VERIFY UNIQUE CONSTRAINT ON SUBSCRIPTIONS
-- ============================================
SELECT 
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'subscriptions'
  AND tc.constraint_type = 'UNIQUE';

-- ✅ SHOULD HAVE: user_id UNIQUE constraint

-- ============================================
-- 5. CHECK ACTIVATE_USER_SUBSCRIPTION FUNCTION
-- ============================================
SELECT 
    p.parameter_name,
    p.data_type,
    p.parameter_mode,
    p.ordinal_position
FROM information_schema.parameters p
JOIN information_schema.routines r 
  ON p.specific_name = r.specific_name
WHERE r.routine_schema = 'public'
  AND r.routine_name = 'activate_user_subscription'
ORDER BY p.ordinal_position;

-- ✅ SHOULD SHOW 9 PARAMETERS:
-- 1. p_user_id (UUID)
-- 2. p_plan_id (TEXT)
-- 3. p_plan_name (TEXT)  ← CRITICAL
-- 4. p_payment_id (TEXT)
-- 5. p_order_id (TEXT)
-- 6. p_amount (NUMERIC)
-- 7. p_billing_cycle (TEXT)
-- 8. p_start_date (TIMESTAMP WITH TIME ZONE)
-- 9. p_end_date (TIMESTAMP WITH TIME ZONE)

-- =====================================================
-- RESULTS INTERPRETATION
-- =====================================================
-- After running these, tell me:
-- 1. What is the data_type for payments.amount?
-- 2. Do all required columns exist?
-- 3. Does user_id have UNIQUE constraint on subscriptions?
-- 4. Does the function show 9 parameters?
-- =====================================================
