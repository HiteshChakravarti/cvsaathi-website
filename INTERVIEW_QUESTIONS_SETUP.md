# Interview Questions from Supabase - Setup Guide

## ✅ What Was Changed

The Interview Prep feature now **pulls questions from Supabase** instead of using only hardcoded questions.

### New Hook: `useInterviewQuestions`
- **Location**: `src/hooks/useInterviewQuestions.ts`
- **Functionality**: 
  - Fetches all questions from `interview_questions` table
  - Supports filtering by category, difficulty, role, and industry
  - Handles both array and string formats for roles/industries
  - Provides fallback to hardcoded questions if database is empty

### Updated Component: `AIInterviewPrepPage`
- Now uses `useInterviewQuestions()` hook
- Prioritizes questions from Supabase
- Falls back to hardcoded questions if needed
- Shows loading state while fetching questions
- Displays count of available questions

---

## 📊 Database Schema Expected

The hook expects the `interview_questions` table to have these columns:

```sql
CREATE TABLE interview_questions (
  id SERIAL PRIMARY KEY,
  category TEXT, -- 'introduction', 'technical', 'behavioral', 'situational', 'closing'
  question TEXT NOT NULL,
  difficulty TEXT, -- 'fresher', 'junior', 'mid', 'senior'
  roles TEXT[] OR TEXT, -- Array or comma-separated string: ['Software Engineer', 'Developer'] or 'all'
  industries TEXT[] OR TEXT, -- Array or comma-separated string: ['Technology', 'IT Services'] or 'all'
  hints TEXT[] OR TEXT, -- Array or comma-separated string
  sample_answer TEXT,
  key_points TEXT[] OR TEXT, -- Array or comma-separated string
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Column Details:
- **category**: One of: `introduction`, `technical`, `behavioral`, `situational`, `closing`
- **difficulty**: One of: `fresher`, `junior`, `mid`, `senior`
- **roles**: Can be:
  - Array: `['Software Engineer', 'Developer', 'all']`
  - Comma-separated: `'Software Engineer, Developer, all'`
  - Single value: `'all'`
- **industries**: Same format as roles
- **hints**: Array or comma-separated string
- **key_points**: Array or comma-separated string

---

## 🔍 How It Works

1. **On Page Load**: 
   - Hook automatically fetches all questions from `interview_questions` table
   - Questions are normalized (arrays/strings converted to consistent format)

2. **When Starting Interview**:
   - Filters questions by selected role, industry, and experience level
   - Uses Supabase questions first (if available)
   - Falls back to hardcoded questions if:
     - Database is empty
     - No questions match the filters
     - Less than 10 questions found

3. **Filtering Logic**:
   - Role: Matches if question has `'all'` in roles OR matches selected role
   - Industry: Matches if question has `'all'` in industries OR matches selected industry
   - Difficulty: Matches selected difficulty OR `'fresher'` (as fallback)

---

## ✅ Testing

1. **Check if questions are loading**:
   - Open Interview Prep page
   - Button should show "Loading Questions from Database..." if fetching
   - Button should show count: "(1000+ available)" if loaded

2. **Verify questions are used**:
   - Start an interview
   - Check browser console for: "Interview session created: [id]"
   - Questions should be from database (not hardcoded)

3. **Check Supabase**:
   - Go to Supabase Dashboard → Table Editor → `interview_questions`
   - Verify you have 1000+ questions
   - Check that columns match expected schema

---

## 🐛 Troubleshooting

### No Questions Loading
- **Check**: Supabase connection (Settings → Advanced → Edge Function Test)
- **Check**: Table name is exactly `interview_questions` (case-sensitive)
- **Check**: RLS policies allow SELECT for authenticated users
- **Check**: Browser console for errors

### Questions Not Filtering Correctly
- **Check**: `roles` and `industries` columns format (should be array or comma-separated)
- **Check**: Values match exactly (case-sensitive): `'Software Engineer'` not `'software engineer'`
- **Check**: `'all'` value exists for general questions

### Fallback to Hardcoded Questions
- This is **normal** if:
  - Database is empty
  - No questions match the selected filters
  - Less than 10 questions found after filtering
- The system will automatically use hardcoded questions as backup

---

## 📝 Next Steps

1. **Verify Database Schema**: Run this in Supabase SQL Editor:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'interview_questions'
   ORDER BY ordinal_position;
   ```

2. **Check Question Count**:
   ```sql
   SELECT COUNT(*) as total_questions 
   FROM interview_questions;
   ```

3. **Test Filtering**:
   ```sql
   SELECT * FROM interview_questions 
   WHERE 'Software Engineer' = ANY(roles) 
   OR 'all' = ANY(roles)
   LIMIT 10;
   ```

4. **Update RLS Policies** (if needed):
   ```sql
   -- Allow authenticated users to read questions
   CREATE POLICY "Allow authenticated users to read interview questions"
   ON interview_questions FOR SELECT
   TO authenticated
   USING (true);
   ```

---

## 🎯 Summary

✅ **Questions are now pulled from Supabase**  
✅ **1000+ questions available**  
✅ **Automatic fallback to hardcoded questions**  
✅ **Loading states and error handling**  
✅ **Flexible filtering by role, industry, difficulty**

The Interview Prep feature is now fully integrated with your Supabase database!

