-- Migration: Incremental Streak Tracking + Progress Bug Fixes
-- Combines former migrations 023 (progress bugs) and 024 (incremental streaks).
--
-- From 023:
--   Bug 4: daily_progress unique constraint fix (multiple days on same date)
--   Bug 3: Prevent current_day regression on user_plans
--   Bug 1: Even chapter distribution for sequential plans
-- From 024:
--   Per-record streak_minimum stamping
--   Incremental O(1) streak updates via sync_reading_stats() RPC
--   recalculate_user_stats() kept as repair/undo fallback only

-- ============================================
-- PHASE 1: FIX daily_progress UNIQUE CONSTRAINT
-- Allow multiple day_numbers per date while preventing true duplicates.
-- ============================================

ALTER TABLE daily_progress
DROP CONSTRAINT IF EXISTS daily_progress_user_plan_id_date_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_progress_user_plan_id_date_day_number_key'
  ) THEN
    ALTER TABLE daily_progress
    ADD CONSTRAINT daily_progress_user_plan_id_date_day_number_key
      UNIQUE (user_plan_id, date, day_number);
  END IF;
END $$;

-- ============================================
-- PHASE 2: PREVENT current_day REGRESSION
-- ============================================

CREATE OR REPLACE FUNCTION prevent_current_day_regression()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_day < OLD.current_day THEN
    RAISE WARNING 'Blocked current_day regression on user_plan %: % -> %',
      OLD.id, OLD.current_day, NEW.current_day;
    NEW.current_day := OLD.current_day;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_current_day_regression_trigger ON user_plans;
CREATE TRIGGER prevent_current_day_regression_trigger
BEFORE UPDATE ON user_plans
FOR EACH ROW
EXECUTE FUNCTION prevent_current_day_regression();

-- ============================================
-- PHASE 3: EVEN CHAPTER DISTRIBUTION FOR SEQUENTIAL PLANS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_chapters_for_progress(
  p_completed_sections TEXT[],
  p_user_plan_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  sections_count INTEGER;
  plan_type TEXT;
  chapters_per_day INTEGER;
  plan_structure JSONB;
  plan_duration INTEGER;
  plan_total_chapters INTEGER;
  total_chapters INTEGER := 0;
  section_id TEXT;
  week_num INTEGER;
  day_num INTEGER;
  week_data JSONB;
  reading JSONB;
  passage TEXT;
  section_parts TEXT[];
BEGIN
  sections_count := COALESCE(array_length(p_completed_sections, 1), 0);

  IF sections_count = 0 THEN
    RETURN 0;
  END IF;

  -- Get plan type, chapters_per_day, duration_days, and full structure
  SELECT
    rp.daily_structure->>'type',
    COALESCE((rp.daily_structure->>'chapters_per_day')::INTEGER, 3),
    rp.daily_structure,
    rp.duration_days,
    COALESCE((rp.daily_structure->>'total_chapters')::INTEGER, 0)
  INTO plan_type, chapters_per_day, plan_structure, plan_duration, plan_total_chapters
  FROM user_plans up
  JOIN reading_plans rp ON up.plan_id = rp.id
  WHERE up.id = p_user_plan_id;

  -- For sequential plans, use even distribution if duration_days is available
  IF plan_type = 'sequential' THEN
    IF plan_duration IS NOT NULL AND plan_duration > 0 AND plan_total_chapters > 0 THEN
      -- Parse day number from each section ID (format: "day-{N}")
      FOREACH section_id IN ARRAY p_completed_sections
      LOOP
        section_parts := regexp_match(section_id, 'day-(\d+)');
        IF section_parts IS NOT NULL THEN
          day_num := section_parts[1]::INTEGER;
          -- Even distribution: chapters for day N =
          --   floor(N * total / duration) - floor((N-1) * total / duration)
          total_chapters := total_chapters +
            (floor(day_num::NUMERIC * plan_total_chapters / plan_duration) -
             floor((day_num - 1)::NUMERIC * plan_total_chapters / plan_duration))::INTEGER;
        ELSE
          -- Fallback for unparseable section IDs
          total_chapters := total_chapters + chapters_per_day;
        END IF;
      END LOOP;
      RETURN total_chapters;
    ELSE
      -- Fallback: no duration info, use chapters_per_day
      RETURN sections_count * chapters_per_day;
    END IF;
  END IF;

  -- For weekly_sectional plans, parse the section IDs and look up passages
  -- Section ID format: "week{N}-day{M}" e.g., "week1-day3"
  IF plan_type = 'weekly_sectional' THEN
    FOREACH section_id IN ARRAY p_completed_sections
    LOOP
      -- Parse week and day from section ID
      section_parts := regexp_match(section_id, 'week(\d+)-day(\d+)');
      IF section_parts IS NOT NULL THEN
        week_num := section_parts[1]::INTEGER;
        day_num := section_parts[2]::INTEGER;

        -- Look up the passage from the plan structure
        -- weeks array is 0-indexed, readings array is also 0-indexed
        week_data := plan_structure->'weeks'->(week_num - 1);
        IF week_data IS NOT NULL THEN
          -- Find the reading with matching dayOfWeek
          FOR reading IN SELECT * FROM jsonb_array_elements(week_data->'readings')
          LOOP
            IF (reading->>'dayOfWeek')::INTEGER = day_num THEN
              passage := reading->>'passage';
              IF passage IS NOT NULL THEN
                total_chapters := total_chapters + count_chapters_in_passage(passage);
              ELSE
                total_chapters := total_chapters + 1;
              END IF;
              EXIT; -- Found the reading, move to next section
            END IF;
          END LOOP;
        ELSE
          -- Fallback if week not found
          total_chapters := total_chapters + 1;
        END IF;
      ELSE
        -- Fallback for unparseable section IDs
        total_chapters := total_chapters + 1;
      END IF;
    END LOOP;

    RETURN total_chapters;
  END IF;

  -- For sectional plans (like M'Cheyne), parse section IDs and look up passages
  -- Section ID format: "day{N}-{section_id}" e.g., "day1-family" or "day1-secret"
  IF plan_type = 'sectional' THEN
    FOREACH section_id IN ARRAY p_completed_sections
    LOOP
      -- Parse day number from section ID
      section_parts := regexp_match(section_id, 'day(\d+)-(.+)');
      IF section_parts IS NOT NULL THEN
        day_num := section_parts[1]::INTEGER;

        -- Look up the passage from the plan structure
        -- readings array contains objects with day and sections
        FOR reading IN SELECT * FROM jsonb_array_elements(plan_structure->'readings')
        LOOP
          IF (reading->>'day')::INTEGER = day_num THEN
            -- Find the section with matching id
            FOR week_data IN SELECT * FROM jsonb_array_elements(reading->'sections')
            LOOP
              IF week_data->>'id' = section_parts[2] THEN
                -- Sum up all passages in this section
                FOR passage IN SELECT * FROM jsonb_array_elements_text(week_data->'passages')
                LOOP
                  total_chapters := total_chapters + count_chapters_in_passage(passage);
                END LOOP;
                EXIT;
              END IF;
            END LOOP;
            EXIT;
          END IF;
        END LOOP;
      ELSE
        -- Fallback for unparseable section IDs
        total_chapters := total_chapters + 1;
      END IF;
    END LOOP;

    -- If we couldn't parse any, fall back to section count
    IF total_chapters = 0 THEN
      RETURN sections_count;
    END IF;

    RETURN total_chapters;
  END IF;

  -- For cycling_lists and other types, each section is one chapter
  RETURN sections_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PHASE 4: NEW COLUMNS FOR INCREMENTAL TRACKING
-- ============================================

-- Stamp each daily_progress record with the active streak_minimum.
-- Nullable: pre-migration records may be NULL until backfilled (Phase 5).
-- All new records are stamped by the client, so NULL is transitional only.
ALTER TABLE daily_progress
ADD COLUMN IF NOT EXISTS streak_minimum INTEGER;

-- Persist reading-days and shields-used for incremental updates
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reading_days_in_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS shields_used_in_streak INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- PHASE 5: BACKFILL streak_minimum ON EXISTING RECORDS
-- ============================================

UPDATE daily_progress dp
SET streak_minimum = p.streak_minimum
FROM profiles p
WHERE dp.user_id = p.id
  AND dp.streak_minimum IS NULL;

-- ============================================
-- PHASE 6: DROP AUTO-RECALCULATION TRIGGERS
-- ============================================

-- The full-scan trigger on every daily_progress write
DROP TRIGGER IF EXISTS daily_progress_stats_trigger ON daily_progress;
DROP FUNCTION IF EXISTS update_user_stats_trigger();

-- The trigger that recalculated on streak_minimum change
DROP TRIGGER IF EXISTS streak_minimum_stats_trigger ON profiles;
DROP FUNCTION IF EXISTS recalculate_stats_on_streak_minimum_change();

-- Drop stale single-argument overload if it exists (from older migrations)
DROP FUNCTION IF EXISTS recalculate_user_stats(UUID);

-- ============================================
-- PHASE 7: UPDATE recalculate_user_stats() (KEPT AS REPAIR TOOL)
-- Now uses per-record streak_minimum instead of global profile minimum.
-- Writes reading_days_in_streak and shields_used_in_streak.
-- NO LONGER triggered automatically — only called for undo/repair.
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_user_stats(
  p_user_id UUID,
  p_reference_date DATE DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_profile_minimum INTEGER;
  v_total_chapters INTEGER := 0;
  v_total_days INTEGER := 0;
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_last_reading_date DATE;
  v_today DATE;
  v_yesterday DATE;
  rec RECORD;
  v_prev_date DATE;
  v_streak_count INTEGER := 0;
  v_shields_used INTEGER := 0;
  v_shields_available INTEGER := 0;
  v_gap_days INTEGER;
  v_shield_used_date DATE := NULL;
  v_reading_days_count INTEGER := 0;
  v_streak_end_date DATE := NULL;
BEGIN
  -- Get user's current streak minimum (fallback for records without stamped minimum)
  SELECT COALESCE(streak_minimum, 3)
  INTO v_profile_minimum
  FROM profiles WHERE id = p_user_id;

  -- Aggregate chapters by date, using per-record minimum.
  -- ON COMMIT DROP ensures cleanup even if the session is reused (pgbouncer).
  DROP TABLE IF EXISTS temp_daily_chapters;
  CREATE TEMP TABLE temp_daily_chapters ON COMMIT DROP AS
  SELECT
    dp.date,
    SUM(calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)) as chapters,
    MIN(COALESCE(dp.streak_minimum, v_profile_minimum)) as day_minimum
  FROM daily_progress dp
  WHERE dp.user_id = p_user_id
  GROUP BY dp.date
  ORDER BY dp.date ASC;

  -- Calculate totals: use per-day minimum for qualification
  SELECT
    COALESCE(SUM(chapters), 0),
    COUNT(*) FILTER (WHERE chapters >= day_minimum)
  INTO v_total_chapters, v_total_days
  FROM temp_daily_chapters;

  -- Get last reading date (using per-day minimum)
  SELECT date INTO v_last_reading_date
  FROM temp_daily_chapters
  WHERE chapters >= day_minimum
  ORDER BY date DESC
  LIMIT 1;

  -- Use provided reference date, or fall back to last reading date
  IF p_reference_date IS NOT NULL THEN
    v_today := p_reference_date;
  ELSIF v_last_reading_date IS NOT NULL THEN
    v_today := v_last_reading_date;
  ELSE
    v_today := CURRENT_DATE;
  END IF;

  v_yesterday := v_today - 1;

  -- Calculate streaks iterating OLDEST to NEWEST using per-record minimums
  v_prev_date := NULL;
  v_streak_count := 0;
  v_reading_days_count := 0;
  v_shields_used := 0;
  v_streak_end_date := NULL;

  FOR rec IN
    SELECT date FROM temp_daily_chapters
    WHERE chapters >= day_minimum
    ORDER BY date ASC
  LOOP
    IF v_prev_date IS NULL THEN
      v_streak_count := 1;
      v_reading_days_count := 1;
      v_streak_end_date := rec.date;
    ELSE
      v_gap_days := rec.date - v_prev_date;

      IF v_gap_days = 1 THEN
        v_streak_count := v_streak_count + 1;
        v_reading_days_count := v_reading_days_count + 1;
        v_streak_end_date := rec.date;
      ELSIF v_gap_days = 2 THEN
        v_shields_available := (v_reading_days_count / 14) - v_shields_used;

        IF v_shields_available > 0 THEN
          v_shields_used := v_shields_used + 1;
          v_shield_used_date := v_prev_date + 1;
          v_streak_count := v_streak_count + 2;
          v_reading_days_count := v_reading_days_count + 1;
          v_streak_end_date := rec.date;
        ELSE
          v_longest_streak := GREATEST(v_longest_streak, v_streak_count);
          v_streak_count := 1;
          v_reading_days_count := 1;
          v_shields_used := 0;
          v_shield_used_date := NULL;
          v_streak_end_date := rec.date;
        END IF;
      ELSE
        v_longest_streak := GREATEST(v_longest_streak, v_streak_count);
        v_streak_count := 1;
        v_reading_days_count := 1;
        v_shields_used := 0;
        v_shield_used_date := NULL;
        v_streak_end_date := rec.date;
      END IF;
    END IF;
    v_prev_date := rec.date;
  END LOOP;

  v_longest_streak := GREATEST(v_longest_streak, v_streak_count);

  -- Determine current streak
  IF v_streak_end_date = v_today OR v_streak_end_date = v_yesterday THEN
    v_current_streak := v_streak_count;
  ELSIF v_streak_end_date IS NOT NULL
        AND (v_today - v_streak_end_date) = 2
        AND ((v_reading_days_count / 14) - v_shields_used) > 0 THEN
    -- 1-day gap but shield available: streak stays alive.
    -- Don't consume the shield yet — it gets consumed in the loop
    -- when a qualifying reading day follows the gap.
    v_current_streak := v_streak_count;
  ELSE
    v_current_streak := 0;
    v_shields_used := 0;
    v_reading_days_count := 0;
  END IF;

  -- Calculate final shield count
  IF v_current_streak > 0 THEN
    v_shields_available := GREATEST(0, (v_reading_days_count / 14) - v_shields_used);
  ELSE
    v_shields_available := 0;
  END IF;

  -- Update profile with stats INCLUDING new columns
  UPDATE profiles SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    total_chapters_read = v_total_chapters,
    total_days_reading = v_total_days,
    last_reading_date = v_last_reading_date,
    streak_shields = LEAST(v_shields_available, 3),
    last_shield_used_date = v_shield_used_date,
    reading_days_in_streak = v_reading_days_count,
    shields_used_in_streak = v_shields_used,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 8: BACKFILL reading_days_in_streak / shields_used_in_streak
-- Run updated recalculate for all users to populate new columns
-- ============================================

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM recalculate_user_stats(user_record.id, NULL::DATE);
  END LOOP;
END $$;

-- ============================================
-- PHASE 9: CREATE sync_reading_stats() RPC
-- Incremental O(1) streak update — no temp tables, no historical scan.
-- Returns JSONB so the client can update its cache directly.
-- ============================================

CREATE OR REPLACE FUNCTION sync_reading_stats(
  p_user_id UUID,
  p_today DATE,
  p_streak_minimum INTEGER DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
  v_profile RECORD;
  v_today_chapters INTEGER;
  v_total_chapters INTEGER;
  v_total_days INTEGER;
  v_gap_days INTEGER;
  v_met_minimum_today BOOLEAN;
  v_was_counted_today BOOLEAN;
  v_new_streak INTEGER;
  v_new_longest INTEGER;
  v_new_reading_days INTEGER;
  v_new_shields_used INTEGER;
  v_new_shields INTEGER;
  v_new_last_reading DATE;
  v_new_shield_used_date DATE;
  v_stamped_min INTEGER;
BEGIN
  -- 1. Read current profile state
  SELECT
    current_streak,
    longest_streak,
    total_chapters_read,
    total_days_reading,
    last_reading_date,
    streak_shields,
    last_shield_used_date,
    reading_days_in_streak,
    shields_used_in_streak
  INTO v_profile
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'User not found');
  END IF;

  -- 2. Compute today's total chapters (1-5 rows per user per day)
  SELECT COALESCE(SUM(calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)), 0)
  INTO v_today_chapters
  FROM daily_progress dp
  WHERE dp.user_id = p_user_id
    AND dp.date = p_today;

  v_met_minimum_today := v_today_chapters >= p_streak_minimum;

  -- Check if today was already counted as a reading day
  -- (last_reading_date = p_today means we already incremented the streak for today)
  -- Use COALESCE to handle NULL last_reading_date (first-ever reading)
  v_was_counted_today := COALESCE(v_profile.last_reading_date = p_today, FALSE);

  -- 3. Compute gap_days from last reading date
  IF v_profile.last_reading_date IS NOT NULL THEN
    v_gap_days := p_today - v_profile.last_reading_date;
  ELSE
    v_gap_days := NULL; -- No previous reading
  END IF;

  -- Initialize from current profile values
  v_new_streak := v_profile.current_streak;
  v_new_longest := v_profile.longest_streak;
  v_new_reading_days := v_profile.reading_days_in_streak;
  v_new_shields_used := v_profile.shields_used_in_streak;
  v_new_shields := v_profile.streak_shields;
  v_new_last_reading := v_profile.last_reading_date;
  v_new_shield_used_date := v_profile.last_shield_used_date;

  -- 4. Branch on cases
  IF v_met_minimum_today AND v_was_counted_today THEN
    -- Already counted today, just update total chapters
    -- (user marked more chapters but was already above minimum)
    NULL; -- No streak change needed

  ELSIF v_met_minimum_today AND NOT v_was_counted_today THEN
    -- Meeting minimum for the first time today
    IF v_gap_days = 0 THEN
      -- Same day (shouldn't happen given v_was_counted_today check, but be safe)
      -- Treat as consecutive
      v_new_streak := v_new_streak + 1;
      v_new_reading_days := v_new_reading_days + 1;
      v_new_last_reading := p_today;
    ELSIF v_gap_days = 1 THEN
      -- Consecutive day — O(1) incremental update
      v_new_streak := v_new_streak + 1;
      v_new_reading_days := v_new_reading_days + 1;
      v_new_last_reading := p_today;
    ELSE
      -- gap_days IS NULL (first reading ever), gap=2 (shield logic),
      -- or gap>=3 (streak break). All non-trivial cases fall back to
      -- recalculate for correctness. This handles undo+redo cycles
      -- where reading_days_in_streak may be stale.
      PERFORM recalculate_user_stats(p_user_id, p_today);

      -- Re-read the updated profile
      SELECT
        current_streak, longest_streak, total_chapters_read, total_days_reading,
        last_reading_date, streak_shields, last_shield_used_date,
        reading_days_in_streak, shields_used_in_streak
      INTO v_profile
      FROM profiles
      WHERE id = p_user_id;

      -- Return the recalculated values directly
      RETURN jsonb_build_object(
        'current_streak', v_profile.current_streak,
        'longest_streak', v_profile.longest_streak,
        'total_chapters_read', v_profile.total_chapters_read,
        'total_days_reading', v_profile.total_days_reading,
        'last_reading_date', v_profile.last_reading_date,
        'streak_shields', v_profile.streak_shields,
        'last_shield_used_date', v_profile.last_shield_used_date,
        'reading_days_in_streak', v_profile.reading_days_in_streak,
        'shields_used_in_streak', v_profile.shields_used_in_streak
      );
    END IF;

  ELSIF NOT v_met_minimum_today AND v_was_counted_today THEN
    -- Possible UNDO case: was counted today, now below the passed-in minimum.
    -- But is this a genuine undo (user un-marked chapters) or just a minimum change?
    -- Check if today's chapters still meet the stamped minimum from daily_progress.
    SELECT COALESCE(MIN(dp.streak_minimum), p_streak_minimum)
    INTO v_stamped_min
    FROM daily_progress dp
    WHERE dp.user_id = p_user_id AND dp.date = p_today
      AND dp.streak_minimum IS NOT NULL;

    IF v_today_chapters >= v_stamped_min THEN
      -- Still meets the stamped minimum. Not a real undo.
      -- This is just a minimum change — streak should be preserved.
      NULL;
    ELSE
      -- Genuinely below even the stamped minimum. Real undo.
      PERFORM recalculate_user_stats(p_user_id, p_today);

      -- Re-read the updated profile
      SELECT
        current_streak, longest_streak, total_chapters_read, total_days_reading,
        last_reading_date, streak_shields, last_shield_used_date,
        reading_days_in_streak, shields_used_in_streak
      INTO v_profile
      FROM profiles
      WHERE id = p_user_id;

      -- Return the recalculated values directly
      RETURN jsonb_build_object(
        'current_streak', v_profile.current_streak,
        'longest_streak', v_profile.longest_streak,
        'total_chapters_read', v_profile.total_chapters_read,
        'total_days_reading', v_profile.total_days_reading,
        'last_reading_date', v_profile.last_reading_date,
        'streak_shields', v_profile.streak_shields,
        'last_shield_used_date', v_profile.last_shield_used_date,
        'reading_days_in_streak', v_profile.reading_days_in_streak,
        'shields_used_in_streak', v_profile.shields_used_in_streak
      );
    END IF;

  ELSE
    -- Not meeting minimum, not previously counted today
    IF v_gap_days IS NOT NULL AND v_gap_days >= 3 THEN
      -- Stale streak detection: 3+ days without reading, break streak
      v_new_streak := 0;
      v_new_reading_days := 0;
      v_new_shields_used := 0;
      v_new_shields := 0;
      v_new_shield_used_date := NULL;
    END IF;
    -- gap < 3: no change (user might still read today/tomorrow)
  END IF;

  -- 5. Compute shields for current streak
  IF v_new_streak > 0 THEN
    v_new_shields := LEAST(3, GREATEST(0, (v_new_reading_days / 14) - v_new_shields_used));
  ELSE
    v_new_shields := 0;
  END IF;

  -- Update longest streak
  v_new_longest := GREATEST(v_new_longest, v_new_streak);

  -- 6. Compute total_chapters_read and total_days_reading
  SELECT
    COALESCE(SUM(calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)), 0)
  INTO v_total_chapters
  FROM daily_progress dp
  WHERE dp.user_id = p_user_id;

  SELECT COUNT(*)
  INTO v_total_days
  FROM (
    SELECT
      dp.date,
      SUM(calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)) AS day_chapters,
      MIN(COALESCE(dp.streak_minimum, p_streak_minimum)) AS day_minimum
    FROM daily_progress dp
    WHERE dp.user_id = p_user_id
    GROUP BY dp.date
  ) per_day
  WHERE per_day.day_chapters >= per_day.day_minimum;

  -- 7. Update profile
  UPDATE profiles SET
    current_streak = v_new_streak,
    longest_streak = v_new_longest,
    total_chapters_read = v_total_chapters,
    total_days_reading = v_total_days,
    last_reading_date = v_new_last_reading,
    streak_shields = v_new_shields,
    last_shield_used_date = v_new_shield_used_date,
    reading_days_in_streak = v_new_reading_days,
    shields_used_in_streak = v_new_shields_used,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Return updated stats as JSONB
  RETURN jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', v_new_longest,
    'total_chapters_read', v_total_chapters,
    'total_days_reading', v_total_days,
    'last_reading_date', v_new_last_reading,
    'streak_shields', v_new_shields,
    'last_shield_used_date', v_new_shield_used_date,
    'reading_days_in_streak', v_new_reading_days,
    'shields_used_in_streak', v_new_shields_used
  );
END;
$$ LANGUAGE plpgsql;

-- Add documentation
COMMENT ON FUNCTION prevent_current_day_regression() IS
  'Prevents current_day from decreasing on user_plans updates to guard against progress erasure.';

COMMENT ON FUNCTION sync_reading_stats(UUID, DATE, INTEGER) IS
  'Incremental streak update. O(1) for consecutive days (gap 0-1). '
  'Falls back to recalculate_user_stats() for gap>=2, first reading, and genuine undo cases. '
  'Smart UNDO detection: checks stamped minimum to distinguish minimum changes from real undos. '
  'Returns JSONB with all updated stats.';

COMMENT ON FUNCTION recalculate_user_stats(UUID, DATE) IS
  'Full-scan streak recalculation using per-record streak_minimum. '
  'No longer triggered automatically — used as a repair tool and undo fallback.';
