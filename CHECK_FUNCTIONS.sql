-- Check if all required database functions exist
SELECT 
    routine_name as function_name,
    routine_type,
    CASE 
        WHEN routine_name IN (
            'can_user_access_feature',
            'log_feature_usage',
            'increment_resumes_created',
            'increment_interviews_practiced',
            'increment_ai_conversations',
            'add_time_spent'
        ) THEN '✅ REQUIRED'
        ELSE 'OTHER'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY status DESC, routine_name;


