-- Fix: Log guild reading activity on UPDATE as well as INSERT
-- This ensures that Free Reading chapter picker contributions are logged to guild activity
-- IMPROVED: Aggregates activities per user/plan/date instead of creating duplicates
-- IMPROVED: For day-based plans, only log "completed" when is_complete = true

-- Drop the existing trigger (INSERT only)
DROP TRIGGER IF EXISTS guild_reading_activity_trigger ON daily_progress;

-- Create improved function that handles both INSERT and UPDATE
-- Key improvement: Updates existing activity for same user/plan/date instead of creating duplicates
CREATE OR REPLACE FUNCTION log_guild_reading_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_guild RECORD;
  v_plan_name TEXT;
  v_plan_type TEXT;
  v_total_chapters INTEGER;
  v_existing_activity_id UUID;
  v_activity_date TEXT;
  v_should_log BOOLEAN;
BEGIN
  BEGIN
    -- Get the plan name and type for context
    SELECT rp.name, rp.daily_structure->>'type' INTO v_plan_name, v_plan_type
    FROM user_plans up
    JOIN reading_plans rp ON up.plan_id = rp.id
    WHERE up.id = NEW.user_plan_id;

    -- Calculate TOTAL chapters in the current progress (not delta)
    v_total_chapters := calculate_chapters_for_progress(NEW.completed_sections, NEW.user_plan_id);
    v_activity_date := NEW.date::TEXT;

    -- Determine if we should log this activity:
    -- For Free Reading plans: always log progress (chapter count)
    -- For day-based plans (sectional, sequential, etc.): only log when day is complete
    v_should_log := FALSE;
    IF v_plan_type = 'free_reading' THEN
      -- Free reading plans: log any progress
      v_should_log := v_total_chapters > 0;
    ELSE
      -- Day-based plans: only log when the day is complete
      v_should_log := NEW.is_complete = TRUE;
    END IF;

    -- For each guild the user is a member of
    FOR v_guild IN
      SELECT guild_id FROM guild_members WHERE user_id = NEW.user_id
    LOOP
      -- Check if an activity already exists for this user/guild/plan/date
      SELECT id INTO v_existing_activity_id
      FROM guild_activities
      WHERE guild_id = v_guild.guild_id
        AND user_id = NEW.user_id
        AND activity_type = 'reading_completed'
        AND metadata->>'date' = v_activity_date
        AND metadata->>'plan_name' = v_plan_name
      LIMIT 1;

      IF v_should_log THEN
        IF v_existing_activity_id IS NOT NULL THEN
          -- UPDATE existing activity with new total chapter count
          UPDATE guild_activities
          SET metadata = jsonb_build_object(
                'plan_name', v_plan_name,
                'day_number', NEW.day_number,
                'chapters_read', v_total_chapters,
                'date', v_activity_date
              ),
              created_at = NOW()  -- Update timestamp so it appears recent
          WHERE id = v_existing_activity_id;
        ELSE
          -- INSERT new activity
          INSERT INTO guild_activities (guild_id, user_id, activity_type, metadata)
          VALUES (
            v_guild.guild_id,
            NEW.user_id,
            'reading_completed',
            jsonb_build_object(
              'plan_name', v_plan_name,
              'day_number', NEW.day_number,
              'chapters_read', v_total_chapters,
              'date', v_activity_date
            )
          );
        END IF;
      ELSE
        -- No progress to log - DELETE existing activity if it exists
        -- This handles the case where chapters were removed/unchecked
        IF v_existing_activity_id IS NOT NULL THEN
          DELETE FROM guild_activities WHERE id = v_existing_activity_id;
        END IF;
      END IF;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[GuildActivity] Failed to log reading_completed for user % (plan %): % (SQLSTATE: %)',
      NEW.user_id, NEW.user_plan_id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires on both INSERT and UPDATE
CREATE TRIGGER guild_reading_activity_trigger
AFTER INSERT OR UPDATE OF completed_sections ON daily_progress
FOR EACH ROW
EXECUTE FUNCTION log_guild_reading_activity();

-- Add index to speed up the lookup for existing activities
CREATE INDEX IF NOT EXISTS idx_guild_activities_reading_lookup
  ON guild_activities(guild_id, user_id, activity_type, (metadata->>'date'), (metadata->>'plan_name'))
  WHERE activity_type = 'reading_completed';

-- Add comment documenting the change
COMMENT ON FUNCTION log_guild_reading_activity IS
  'Logs reading activity to guild_activities when daily_progress is inserted or updated.
   Aggregates by user/plan/date - updates existing activity instead of creating duplicates.
   Deletes activity when progress is reverted to zero (handles chapter unchecking).
   This ensures Free Reading chapter picker shows one clean entry per plan per day.';

