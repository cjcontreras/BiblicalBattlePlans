-- Migration: Fix Streak Timezone Issues
-- Updates streak calculation to use user's local dates instead of server CURRENT_DATE
-- This prevents streaks from breaking when users travel across timezones

-- ============================================
-- UPDATE RECALCULATE_USER_STATS FUNCTION
-- ============================================
-- Modified to accept reference_date parameter (user's local "today")
-- Falls back to most recent reading date if not provided
CREATE OR REPLACE FUNCTION recalculate_user_stats(
  p_user_id UUID,
  p_reference_date DATE DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_streak_minimum INTEGER;
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
  -- Get user's streak minimum preference
  SELECT COALESCE(streak_minimum, 3)
  INTO v_streak_minimum
  FROM profiles WHERE id = p_user_id;

  -- Drop temp table if it exists
  DROP TABLE IF EXISTS temp_daily_chapters;

  -- Aggregate chapters by date
  CREATE TEMP TABLE temp_daily_chapters AS
  SELECT
    dp.date,
    SUM(calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)) as chapters
  FROM daily_progress dp
  WHERE dp.user_id = p_user_id
  GROUP BY dp.date
  ORDER BY dp.date ASC; -- Oldest first

  -- Calculate totals
  SELECT
    COALESCE(SUM(chapters), 0),
    COUNT(*) FILTER (WHERE chapters >= v_streak_minimum)
  INTO v_total_chapters, v_total_days
  FROM temp_daily_chapters;

  -- Get last reading date
  SELECT date INTO v_last_reading_date
  FROM temp_daily_chapters
  WHERE chapters >= v_streak_minimum
  ORDER BY date DESC
  LIMIT 1;

  -- Use provided reference date, or fall back to last reading date
  -- This allows the function to work with user's local timezone
  IF p_reference_date IS NOT NULL THEN
    v_today := p_reference_date;
  ELSIF v_last_reading_date IS NOT NULL THEN
    v_today := v_last_reading_date;
  ELSE
    -- No reading data at all, use server date as fallback
    v_today := CURRENT_DATE;
  END IF;

  v_yesterday := v_today - 1;

  -- Calculate streaks iterating OLDEST to NEWEST
  -- This way we accumulate reading days before hitting gaps
  -- and know how many shields are available when a gap is encountered

  v_prev_date := NULL;
  v_streak_count := 0;
  v_reading_days_count := 0;
  v_shields_used := 0;
  v_streak_end_date := NULL;

  FOR rec IN
    SELECT date FROM temp_daily_chapters
    WHERE chapters >= v_streak_minimum
    ORDER BY date ASC -- Oldest first!
  LOOP
    IF v_prev_date IS NULL THEN
      -- First date (oldest)
      v_streak_count := 1;
      v_reading_days_count := 1;
      v_streak_end_date := rec.date;
    ELSE
      v_gap_days := rec.date - v_prev_date;

      IF v_gap_days = 1 THEN
        -- Consecutive day - no shield needed
        v_streak_count := v_streak_count + 1;
        v_reading_days_count := v_reading_days_count + 1;
        v_streak_end_date := rec.date;
      ELSIF v_gap_days = 2 THEN
        -- Gap of 1 day - check if we have a shield to use
        -- Shields earned = reading_days accumulated so far / 14
        v_shields_available := (v_reading_days_count / 14) - v_shields_used;

        IF v_shields_available > 0 THEN
          -- Use a shield to bridge the gap
          v_shields_used := v_shields_used + 1;
          v_shield_used_date := v_prev_date + 1; -- The missed day
          v_streak_count := v_streak_count + 2; -- Count missed day + this reading day
          v_reading_days_count := v_reading_days_count + 1; -- Only count actual reading day
          v_streak_end_date := rec.date;
        ELSE
          -- No shield available - streak breaks, start new one
          v_longest_streak := GREATEST(v_longest_streak, v_streak_count);
          v_streak_count := 1;
          v_reading_days_count := 1;
          v_shields_used := 0; -- Reset for new streak
          v_shield_used_date := NULL;
          v_streak_end_date := rec.date;
        END IF;
      ELSE
        -- Gap too large (2+ days missed) - streak breaks
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

  -- Update longest streak with final streak
  v_longest_streak := GREATEST(v_longest_streak, v_streak_count);

  -- Determine current streak
  -- Current streak is the streak that extends to today or yesterday
  IF v_streak_end_date = v_today OR v_streak_end_date = v_yesterday THEN
    v_current_streak := v_streak_count;
  ELSE
    -- Last reading was more than 1 day ago, current streak is 0
    v_current_streak := 0;
    v_shields_used := 0; -- No active streak, no shields used
    v_reading_days_count := 0;
  END IF;

  -- Calculate final shield count for current streak
  -- Shields earned from current streak's reading days, minus shields used
  IF v_current_streak > 0 THEN
    v_shields_available := GREATEST(0, (v_reading_days_count / 14) - v_shields_used);
  ELSE
    v_shields_available := 0;
  END IF;

  -- Update profile with new stats and shields
  UPDATE profiles SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    total_chapters_read = v_total_chapters,
    total_days_reading = v_total_days,
    last_reading_date = v_last_reading_date,
    streak_shields = LEAST(v_shields_available, 3), -- Max 3 shields
    last_shield_used_date = v_shield_used_date,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- UPDATE TRIGGER FUNCTION
-- ============================================
-- Pass the user's local date to recalculate_user_stats
CREATE OR REPLACE FUNCTION update_user_stats_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- On delete, recalculate without reference date (will use remaining data)
    PERFORM recalculate_user_stats(OLD.user_id, NULL);
    RETURN OLD;
  ELSE
    -- On insert/update, use the date from the record as reference
    -- This is the user's local "today"
    PERFORM recalculate_user_stats(NEW.user_id, NEW.date);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger is already created, just need to ensure it uses the updated function
-- (DROP and recreate to be safe)
DROP TRIGGER IF EXISTS daily_progress_stats_trigger ON daily_progress;
CREATE TRIGGER daily_progress_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON daily_progress
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_trigger();

-- Add documentation
COMMENT ON FUNCTION recalculate_user_stats(UUID, DATE) IS
  'Recalculates user stats using provided reference date (user''s local today) to avoid timezone issues. Falls back to most recent reading date if reference_date is NULL.';
