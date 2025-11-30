-- =====================================================
-- CHECK INTERVIEW_SESSIONS TABLE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor to check for constraints
-- that might be blocking 'mid' and 'senior' experience levels
-- =====================================================

-- 1. Check table structure and constraints
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'interview_sessions'
  AND column_name = 'experience_level'
ORDER BY ordinal_position;

-- 2. Check for CHECK constraints on experience_level
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.interview_sessions'::regclass
  AND contype = 'c'  -- 'c' = CHECK constraint
  AND pg_get_constraintdef(oid) LIKE '%experience_level%';

-- 3. Check all constraints on interview_sessions table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.interview_sessions'::regclass
ORDER BY contype, conname;

-- 4. Check what experience_level values currently exist in the table
SELECT 
    experience_level,
    COUNT(*) as count
FROM public.interview_sessions
GROUP BY experience_level
ORDER BY experience_level;

-- 5. Try to see if there's a trigger that might be blocking inserts
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'interview_sessions';

