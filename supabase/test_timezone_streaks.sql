-- Test Data for Timezone Streak Calculations
-- Run this in Supabase SQL Editor to create test scenarios
-- IMPORTANT: This will create test users and data - safe to run on local dev database

-- ============================================
-- CLEANUP (Run first to reset test data)
-- ============================================
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Find and delete test users
  FOR test_user_id IN
    SELECT id FROM auth.users WHERE email LIKE 'test-streak-%@example.com'
  LOOP
    DELETE FROM daily_progress WHERE user_id = test_user_id;
    DELETE FROM user_plans WHERE user_id = test_user_id;
    DELETE FROM profiles WHERE id = test_user_id;
    DELETE FROM auth.users WHERE id = test_user_id;
  END LOOP;
END $$;

-- ============================================
-- TEST SCENARIO 1: Perfect Streak (No Travel)
-- User reads consecutively for 30 days
-- Expected: 30-day streak, 2 shields earned (14 + 28 days)
-- ============================================

-- Create test user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test-streak-1@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"test_perfect_streak","display_name":"Perfect Streak User"}',
  'authenticated',
  'authenticated'
);

-- Create profile (trigger should handle this, but being explicit)
INSERT INTO profiles (id, username, display_name, streak_minimum)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test_perfect_streak',
  'Perfect Streak User',
  3
) ON CONFLICT (id) DO NOTHING;

-- Create a user plan
INSERT INTO user_plans (id, user_id, plan_id, start_date)
SELECT
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  id,
  CURRENT_DATE - 30
FROM reading_plans LIMIT 1;

-- Insert 30 consecutive days of reading (3 chapters per day)
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  day_num,
  CURRENT_DATE - (30 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(1, 30) AS day_num;

-- ============================================
-- TEST SCENARIO 2: Streak with Shield Bridge
-- User reads for 20 days, misses 1 day, then continues
-- Expected: Shield auto-bridges the gap, streak continues
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'test-streak-2@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"test_shield_bridge","display_name":"Shield Bridge User"}',
  'authenticated',
  'authenticated'
);

INSERT INTO profiles (id, username, display_name, streak_minimum)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'test_shield_bridge',
  'Shield Bridge User',
  3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_plans (id, user_id, plan_id, start_date)
SELECT
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  id,
  CURRENT_DATE - 25
FROM reading_plans LIMIT 1;

-- Days 1-14: Consecutive reading (earns 1 shield at day 14)
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  day_num,
  CURRENT_DATE - (25 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(1, 14) AS day_num;

-- Day 15: MISSED (gap of 1 day)
-- Day 16-20: Continue reading (shield should bridge day 15)
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  day_num,
  CURRENT_DATE - (25 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(16, 20) AS day_num;

-- ============================================
-- TEST SCENARIO 3: Streak Broken (No Shield)
-- User reads for 10 days, misses 1 day, continues
-- Expected: Streak breaks (no shield earned yet), new streak starts
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'test-streak-3@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"test_broken_streak","display_name":"Broken Streak User"}',
  'authenticated',
  'authenticated'
);

INSERT INTO profiles (id, username, display_name, streak_minimum)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'test_broken_streak',
  'Broken Streak User',
  3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_plans (id, user_id, plan_id, start_date)
SELECT
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  id,
  CURRENT_DATE - 20
FROM reading_plans LIMIT 1;

-- Days 1-10: Consecutive reading
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  day_num,
  CURRENT_DATE - (20 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(1, 10) AS day_num;

-- Day 11: MISSED
-- Days 12-15: New streak starts
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  day_num,
  CURRENT_DATE - (20 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(12, 15) AS day_num;

-- ============================================
-- TEST SCENARIO 4: Simulated Travel Scenario
-- User reads consistently but dates appear "weird" due to timezone
-- This simulates traveling from LA (UTC-8) to Tokyo (UTC+9)
-- Expected: Streak should NOT break despite timezone changes
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'test-streak-4@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"test_traveler","display_name":"World Traveler"}',
  'authenticated',
  'authenticated'
);

INSERT INTO profiles (id, username, display_name, streak_minimum)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'test_traveler',
  'World Traveler',
  3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_plans (id, user_id, plan_id, start_date)
SELECT
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  id,
  CURRENT_DATE - 20
FROM reading_plans LIMIT 1;

-- Days 1-10: Reading in LA (normal consecutive dates)
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000004',
  day_num,
  CURRENT_DATE - (20 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(1, 10) AS day_num;

-- Days 11-15: User travels to Tokyo (continues consecutive, local dates)
-- The dates are still consecutive in user's local timezone
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000004',
  day_num,
  CURRENT_DATE - (20 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(11, 15) AS day_num;

-- ============================================
-- TEST SCENARIO 5: Current Active Streak
-- User reading up to yesterday (should show active streak)
-- Expected: Current streak = number of days, available today
-- ============================================

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'test-streak-5@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"test_active_streak","display_name":"Active Streak User"}',
  'authenticated',
  'authenticated'
);

INSERT INTO profiles (id, username, display_name, streak_minimum)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'test_active_streak',
  'Active Streak User',
  3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_plans (id, user_id, plan_id, start_date)
SELECT
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005',
  id,
  CURRENT_DATE - 7
FROM reading_plans LIMIT 1;

-- Reading from 7 days ago up to yesterday
INSERT INTO daily_progress (user_id, user_plan_id, day_number, date, completed_sections, is_complete)
SELECT
  '00000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000005',
  day_num,
  CURRENT_DATE - (8 - day_num),
  ARRAY['list1:' || (day_num * 3 - 2)::text, 'list1:' || (day_num * 3 - 1)::text, 'list1:' || (day_num * 3)::text],
  true
FROM generate_series(1, 7) AS day_num;

-- ============================================
-- VERIFICATION QUERIES
-- Run these to check the results
-- ============================================

-- Show all test users with their calculated streaks
SELECT
  p.username,
  p.display_name,
  p.current_streak,
  p.longest_streak,
  p.streak_shields,
  p.total_chapters_read,
  p.total_days_reading,
  p.last_reading_date,
  p.last_shield_used_date
FROM profiles p
WHERE p.username LIKE 'test_%'
ORDER BY p.username;

-- Show detailed reading history for each test user
SELECT
  p.username,
  dp.date,
  array_length(dp.completed_sections, 1) as sections_completed,
  dp.is_complete
FROM profiles p
JOIN daily_progress dp ON dp.user_id = p.id
WHERE p.username LIKE 'test_%'
ORDER BY p.username, dp.date;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
/*
SCENARIO 1 (test_perfect_streak):
  - current_streak: 30
  - longest_streak: 30
  - streak_shields: 2 (earned at 14 and 28 days)
  - total_chapters_read: 90 (30 days × 3 chapters)
  - total_days_reading: 30

SCENARIO 2 (test_shield_bridge):
  - current_streak: 20 (days 1-14, gap bridged by shield, days 16-20)
  - longest_streak: 20
  - streak_shields: 0 (1 earned at day 14, 1 used to bridge gap)
  - total_chapters_read: 57 (19 actual reading days × 3)
  - total_days_reading: 19
  - last_shield_used_date: Should be the missed day

SCENARIO 3 (test_broken_streak):
  - current_streak: 4 (days 12-15, the new streak after break)
  - longest_streak: 10 (days 1-10 before the break)
  - streak_shields: 0 (never reached 14 consecutive days)
  - total_chapters_read: 42 (14 days × 3)
  - total_days_reading: 14

SCENARIO 4 (test_traveler):
  - current_streak: 15
  - longest_streak: 15
  - streak_shields: 1 (earned at day 14)
  - total_chapters_read: 45 (15 days × 3)
  - total_days_reading: 15
  - NOTE: Streak should NOT break despite "timezone travel"

SCENARIO 5 (test_active_streak):
  - current_streak: 7 (last read yesterday, still active)
  - longest_streak: 7
  - streak_shields: 0 (hasn't reached 14 days yet)
  - total_chapters_read: 21 (7 days × 3)
  - total_days_reading: 7
*/
