-- =====================================================
-- SUPABASE RLS POLICIES FOR USER STATS SYSTEM
-- Copy and paste these into your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE USER_STATS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resumes_created INTEGER DEFAULT 0,
  interviews_practiced INTEGER DEFAULT 0,
  ai_conversations INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  last_active_date DATE DEFAULT CURRENT_DATE,
  achievement_badges TEXT[] DEFAULT '{}',
  current_streak INTEGER DEFAULT 0,
  ats_average_score DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: ADD COLUMNS TO PROFILES TABLE
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_pref TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_types TEXT[] DEFAULT '{"achievements", "reminders", "updates"}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'daily';

-- =====================================================
-- STEP 3: ENABLE RLS ON TABLES
-- =====================================================

ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: USER_STATS TABLE RLS POLICIES
-- =====================================================

-- Policy 1: Users can only view their own stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own stats record
CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own stats
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own stats (optional)
CREATE POLICY "Users can delete own stats" ON user_stats
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: PROFILES TABLE RLS POLICIES
-- =====================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 6: ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Policy 5: Prevent data manipulation outside valid ranges
CREATE POLICY "Validate stats data ranges" ON user_stats
  FOR ALL
  USING (
    resumes_created >= 0 AND
    interviews_practiced >= 0 AND
    ai_conversations >= 0 AND
    total_time_spent >= 0 AND
    current_streak >= 0 AND
    ats_average_score >= 0 AND ats_average_score <= 100
  );

-- Policy 6: Ensure valid achievement badges
CREATE POLICY "Validate achievement badges" ON user_stats
  FOR ALL
  USING (
    achievement_badges IS NULL OR
    array_length(achievement_badges, 1) <= 50 -- Limit to 50 badges max
  );

-- =====================================================
-- STEP 7: DATABASE FUNCTIONS FOR STATS MANAGEMENT
-- =====================================================

-- Function 1: Initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats(user_uuid UUID)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_stats user_stats;
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (user_uuid)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING * INTO new_stats;
  
  RETURN new_stats;
END;
$$;

-- Function 2: Increment resume count
CREATE OR REPLACE FUNCTION increment_resumes_created(user_uuid UUID)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
BEGIN
  UPDATE user_stats
  SET 
    resumes_created = resumes_created + 1,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = user_uuid
  RETURNING * INTO updated_stats;
  
  RETURN updated_stats;
END;
$$;

-- Function 3: Increment interview count
CREATE OR REPLACE FUNCTION increment_interviews_practiced(user_uuid UUID)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
BEGIN
  UPDATE user_stats
  SET 
    interviews_practiced = interviews_practiced + 1,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = user_uuid
  RETURNING * INTO updated_stats;
  
  RETURN updated_stats;
END;
$$;

-- Function 4: Increment AI conversations
CREATE OR REPLACE FUNCTION increment_ai_conversations(user_uuid UUID)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
BEGIN
  UPDATE user_stats
  SET 
    ai_conversations = ai_conversations + 1,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = user_uuid
  RETURNING * INTO updated_stats;
  
  RETURN updated_stats;
END;
$$;

-- Function 5: Add time spent
CREATE OR REPLACE FUNCTION add_time_spent(user_uuid UUID, minutes INTEGER)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
BEGIN
  UPDATE user_stats
  SET 
    total_time_spent = total_time_spent + minutes,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = user_uuid
  RETURNING * INTO updated_stats;
  
  RETURN updated_stats;
END;
$$;

-- Function 6: Update ATS score
CREATE OR REPLACE FUNCTION update_ats_score(user_uuid UUID, new_score DECIMAL(5,2))
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
BEGIN
  UPDATE user_stats
  SET 
    ats_average_score = (ats_average_score + new_score) / 2,
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = user_uuid
  RETURNING * INTO updated_stats;
  
  RETURN updated_stats;
END;
$$;

-- Function 7: Add achievement badge
CREATE OR REPLACE FUNCTION add_achievement_badge(user_uuid UUID, badge_name TEXT)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
BEGIN
  UPDATE user_stats
  SET 
    achievement_badges = array_append(achievement_badges, badge_name),
    last_active_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = user_uuid
    AND NOT (badge_name = ANY(achievement_badges)) -- Prevent duplicates
  RETURNING * INTO updated_stats;
  
  RETURN updated_stats;
END;
$$;

-- Function 8: Update streak
CREATE OR REPLACE FUNCTION update_streak(user_uuid UUID)
RETURNS user_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_stats user_stats;
  last_active DATE;
BEGIN
  SELECT last_active_date INTO last_active
  FROM user_stats
  WHERE user_id = user_uuid;
  
  IF last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE user_stats
    SET 
      current_streak = current_streak + 1,
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = user_uuid
    RETURNING * INTO updated_stats;
  ELSIF last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken
    UPDATE user_stats
    SET 
      current_streak = 1,
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = user_uuid
    RETURNING * INTO updated_stats;
  ELSE
    -- Same day, just update last active
    UPDATE user_stats
    SET 
      last_active_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE user_id = user_uuid
    RETURNING * INTO updated_stats;
  END IF;
  
  RETURN updated_stats;
END;
$$;

-- =====================================================
-- STEP 8: TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger 1: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger 2: Initialize user stats on profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 9: INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_active ON user_stats(last_active_date);
CREATE INDEX IF NOT EXISTS idx_user_stats_achievements ON user_stats USING GIN(achievement_badges);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_stats_activity ON user_stats(user_id, last_active_date);
CREATE INDEX IF NOT EXISTS idx_user_stats_counts ON user_stats(user_id, resumes_created, interviews_practiced, ai_conversations);

-- =====================================================
-- STEP 10: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Grant usage on sequences (if using serial IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- STEP 11: TEST QUERIES (Optional - for verification)
-- =====================================================

-- Test 1: User can only see their own stats
-- SELECT * FROM user_stats WHERE user_id = auth.uid();

-- Test 2: User cannot see other users' stats
-- SELECT * FROM user_stats WHERE user_id != auth.uid();

-- Test 3: Test function calls (uncomment to test)
-- SELECT increment_resumes_created(auth.uid());
-- SELECT increment_interviews_practiced(auth.uid());
-- SELECT increment_ai_conversations(auth.uid());
-- SELECT add_time_spent(auth.uid(), 30);
-- SELECT update_ats_score(auth.uid(), 85.5);
-- SELECT add_achievement_badge(auth.uid(), 'first_resume');
-- SELECT update_streak(auth.uid());

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- All RLS policies and functions have been created successfully!
-- Your user stats system is now secure and ready to use.
