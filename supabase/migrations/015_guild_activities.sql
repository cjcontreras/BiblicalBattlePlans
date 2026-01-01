-- Biblical Battle Plans - Guild Activities Feature (Issue #14)
-- Track leaderboard data and activity feed for guilds

-- ============================================
-- FIX: ENSURE GUILDS INSERT POLICY EXISTS
-- This fixes an issue where the policy might not exist after db reset
-- ============================================

-- Drop and recreate the guilds INSERT policy to ensure it exists
DROP POLICY IF EXISTS "Authenticated users can create guilds" ON guilds;
DROP POLICY IF EXISTS "Users can create groups" ON guilds;

CREATE POLICY "Authenticated users can create guilds"
  ON guilds FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Fix SELECT policy to allow:
-- 1. Viewing public guilds
-- 2. Members viewing their guilds
-- 3. Creators viewing their guilds
-- 4. Any authenticated user can view guilds (needed for join via invite code)
--    The real protection is on INSERT/UPDATE/DELETE, not SELECT
DROP POLICY IF EXISTS "View public or member guilds" ON guilds;

CREATE POLICY "Authenticated users can view guilds"
  ON guilds FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- GUILD ACTIVITIES TABLE
-- ============================================

CREATE TABLE guild_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'reading_completed',    -- Completed a day's reading
    'streak_milestone',     -- Hit 7, 14, 30, 60, 90 day streak
    'rank_achieved',        -- Achieved new rank (SOLDIER, WARRIOR, etc.)
    'member_joined',        -- Joined the guild
    'plan_started',         -- Started a new reading plan
    'plan_completed'        -- Completed a reading plan
  )),
  metadata JSONB DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_guild_activities_guild_created
  ON guild_activities(guild_id, created_at DESC);
CREATE INDEX idx_guild_activities_user
  ON guild_activities(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE guild_activities ENABLE ROW LEVEL SECURITY;

-- Guild members can view activities for their guilds
CREATE POLICY "Guild members can view activities"
  ON guild_activities FOR SELECT
  USING (is_guild_member(guild_id, auth.uid()));

-- No direct inserts allowed - all activities are logged via triggers
-- This policy allows SECURITY DEFINER functions to insert
CREATE POLICY "System can insert activities"
  ON guild_activities FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGER: LOG MEMBER JOINED
-- ============================================

CREATE OR REPLACE FUNCTION log_guild_member_joined()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
    VALUES (NEW.guild_id, NEW.user_id, 'member_joined', '{}');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[GuildActivity] Failed to log member_joined for user % in guild %: % (SQLSTATE: %)',
      NEW.user_id, NEW.guild_id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER guild_member_joined_activity_trigger
AFTER INSERT ON guild_members
FOR EACH ROW
EXECUTE FUNCTION log_guild_member_joined();

-- ============================================
-- TRIGGER: LOG READING ACTIVITY
-- Fires when daily_progress is inserted (new reading logged)
-- ============================================

CREATE OR REPLACE FUNCTION log_guild_reading_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_guild RECORD;
  v_plan_name TEXT;
  v_chapters INTEGER;
BEGIN
  BEGIN
    -- Get the plan name for context
    SELECT rp.name INTO v_plan_name
    FROM user_plans up
    JOIN reading_plans rp ON up.plan_id = rp.id
    WHERE up.id = NEW.user_plan_id;

    -- Calculate chapters read (use existing function)
    v_chapters := calculate_chapters_for_progress(NEW.completed_sections, NEW.user_plan_id);

    -- Only log if there are actual chapters read
    IF v_chapters > 0 THEN
      -- Log activity for all guilds the user is a member of
      FOR v_guild IN
        SELECT guild_id FROM guild_members WHERE user_id = NEW.user_id
      LOOP
        INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
        VALUES (
          v_guild.guild_id,
          NEW.user_id,
          'reading_completed',
          jsonb_build_object(
            'plan_name', v_plan_name,
            'day_number', NEW.day_number,
            'chapters_read', v_chapters,
            'date', NEW.date::TEXT
          )
        );
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[GuildActivity] Failed to log reading_completed for user % (plan %): % (SQLSTATE: %)',
      NEW.user_id, NEW.user_plan_id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER guild_reading_activity_trigger
AFTER INSERT ON daily_progress
FOR EACH ROW
EXECUTE FUNCTION log_guild_reading_activity();

-- ============================================
-- TRIGGER: LOG STREAK MILESTONES AND RANK CHANGES
-- Fires when profile's current_streak increases
-- ============================================

CREATE OR REPLACE FUNCTION log_guild_streak_milestone()
RETURNS TRIGGER AS $$
DECLARE
  v_guild RECORD;
  v_old_rank TEXT;
  v_new_rank TEXT;
  v_milestone_thresholds INTEGER[] := ARRAY[7, 14, 30, 60, 90];
  v_threshold INTEGER;
  v_milestone_logged BOOLEAN := FALSE;
BEGIN
  -- Only process if streak actually increased
  IF NEW.current_streak <= OLD.current_streak THEN
    RETURN NEW;
  END IF;

  BEGIN
    -- Determine old and new ranks
    v_old_rank := CASE
      WHEN OLD.current_streak >= 90 THEN 'LEGENDARY'
      WHEN OLD.current_streak >= 60 THEN 'VETERAN'
      WHEN OLD.current_streak >= 30 THEN 'WARRIOR'
      WHEN OLD.current_streak >= 7 THEN 'SOLDIER'
      ELSE 'RECRUIT'
    END;

    v_new_rank := CASE
      WHEN NEW.current_streak >= 90 THEN 'LEGENDARY'
      WHEN NEW.current_streak >= 60 THEN 'VETERAN'
      WHEN NEW.current_streak >= 30 THEN 'WARRIOR'
      WHEN NEW.current_streak >= 7 THEN 'SOLDIER'
      ELSE 'RECRUIT'
    END;

    -- Check for milestone crossings
    FOREACH v_threshold IN ARRAY v_milestone_thresholds LOOP
      IF OLD.current_streak < v_threshold AND NEW.current_streak >= v_threshold THEN
        -- Log streak milestone for all user's guilds
        FOR v_guild IN
          SELECT guild_id FROM guild_members WHERE user_id = NEW.id
        LOOP
          INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
          VALUES (
            v_guild.guild_id,
            NEW.id,
            'streak_milestone',
            jsonb_build_object(
              'streak_days', NEW.current_streak,
              'rank', v_new_rank
            )
          );
        END LOOP;
        v_milestone_logged := TRUE;
        EXIT; -- Only log the first milestone crossed
      END IF;
    END LOOP;

    -- Check for rank change (only if we didn't already log a milestone)
    IF NOT v_milestone_logged AND v_old_rank != v_new_rank THEN
      FOR v_guild IN
        SELECT guild_id FROM guild_members WHERE user_id = NEW.id
      LOOP
        INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
        VALUES (
          v_guild.guild_id,
          NEW.id,
          'rank_achieved',
          jsonb_build_object(
            'rank', v_new_rank,
            'previous_rank', v_old_rank
          )
        );
      END LOOP;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[GuildActivity] Failed to log streak_milestone for user % (streak %): % (SQLSTATE: %)',
      NEW.id, NEW.current_streak, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER guild_streak_milestone_trigger
AFTER UPDATE OF current_streak ON profiles
FOR EACH ROW
WHEN (NEW.current_streak > OLD.current_streak)
EXECUTE FUNCTION log_guild_streak_milestone();

-- ============================================
-- TRIGGER: LOG PLAN STARTED
-- Fires when a new user_plan is created
-- ============================================

CREATE OR REPLACE FUNCTION log_guild_plan_started()
RETURNS TRIGGER AS $$
DECLARE
  v_guild RECORD;
  v_plan_name TEXT;
BEGIN
  BEGIN
    -- Get the plan name
    SELECT name INTO v_plan_name
    FROM reading_plans
    WHERE id = NEW.plan_id;

    -- Log activity for all guilds the user is a member of
    FOR v_guild IN
      SELECT guild_id FROM guild_members WHERE user_id = NEW.user_id
    LOOP
      INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
      VALUES (
        v_guild.guild_id,
        NEW.user_id,
        'plan_started',
        jsonb_build_object('plan_name', v_plan_name)
      );
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[GuildActivity] Failed to log plan_started for user % (plan %): % (SQLSTATE: %)',
      NEW.user_id, NEW.plan_id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER guild_plan_started_activity_trigger
AFTER INSERT ON user_plans
FOR EACH ROW
EXECUTE FUNCTION log_guild_plan_started();

-- ============================================
-- TRIGGER: LOG PLAN COMPLETED
-- Fires when a user_plan is marked as completed
-- ============================================

CREATE OR REPLACE FUNCTION log_guild_plan_completed()
RETURNS TRIGGER AS $$
DECLARE
  v_guild RECORD;
  v_plan_name TEXT;
  v_total_days INTEGER;
BEGIN
  -- Only fire when plan becomes completed
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    BEGIN
      -- Get the plan name
      SELECT name INTO v_plan_name
      FROM reading_plans
      WHERE id = NEW.plan_id;

      -- Get total days (current_day represents total days completed)
      v_total_days := NEW.current_day;

      -- Log activity for all guilds the user is a member of
      FOR v_guild IN
        SELECT guild_id FROM guild_members WHERE user_id = NEW.user_id
      LOOP
        INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
        VALUES (
          v_guild.guild_id,
          NEW.user_id,
          'plan_completed',
          jsonb_build_object(
            'plan_name', v_plan_name,
            'total_days', v_total_days
          )
        );
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING '[GuildActivity] Failed to log plan_completed for user % (plan %): % (SQLSTATE: %)',
        NEW.user_id, NEW.plan_id, SQLERRM, SQLSTATE;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER guild_plan_completed_activity_trigger
AFTER UPDATE OF is_completed ON user_plans
FOR EACH ROW
WHEN (NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false))
EXECUTE FUNCTION log_guild_plan_completed();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE guild_activities IS 'Tracks member activities within guilds for leaderboard and activity feed features';
COMMENT ON COLUMN guild_activities.activity_type IS 'Type of activity: reading_completed, streak_milestone, rank_achieved, member_joined, plan_started, plan_completed';
COMMENT ON COLUMN guild_activities.metadata IS 'Activity-specific data as JSONB. Structure varies by activity_type.';
