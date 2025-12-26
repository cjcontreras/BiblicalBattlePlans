-- Biblical Battle Plans - Initial Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extended user data beyond Supabase Auth
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- READING PLANS TABLE
-- Predefined reading plan templates
-- ============================================
CREATE TABLE reading_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  daily_structure JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PLANS TABLE
-- User's active/completed plans
-- ============================================
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES reading_plans(id) NOT NULL,
  start_date DATE NOT NULL,
  current_day INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id, start_date)
);

-- ============================================
-- DAILY PROGRESS TABLE
-- Per-day completion tracking with partial completion support
-- ============================================
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_plan_id UUID REFERENCES user_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  completed_sections TEXT[] DEFAULT '{}',
  is_complete BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_plan_id, day_number)
);

CREATE TRIGGER daily_progress_updated_at
  BEFORE UPDATE ON daily_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- GROUPS TABLE (Future feature)
-- ============================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'custom',
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GROUP MEMBERS TABLE (Future feature)
-- ============================================
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_plans_user ON user_plans(user_id);
CREATE INDEX idx_user_plans_plan ON user_plans(plan_id);
CREATE INDEX idx_daily_progress_user_plan ON daily_progress(user_plan_id);
CREATE INDEX idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Reading Plans: All authenticated users can read
CREATE POLICY "Reading plans are viewable by authenticated users"
  ON reading_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Plans: Users can only access their own plans
CREATE POLICY "Users can view their own plans"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON user_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Daily Progress: Users can only access their own progress
CREATE POLICY "Users can view their own progress"
  ON daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON daily_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON daily_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Groups: Members can view their groups
CREATE POLICY "Group members can view their groups"
  ON groups FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = groups.id
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Group Members: Users can see members of groups they belong to
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM group_members gm WHERE gm.group_id = group_members.group_id
    )
  );
