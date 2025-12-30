-- Fix chapter counting for weekly_sectional and sectional plans
-- Previously, these plan types counted each section as 1 chapter
-- Now we parse the actual passage strings to count real chapters

-- Helper function to count chapters from a passage string
-- Examples: "Genesis 1" → 1, "Genesis 1-3" → 3, "Joshua 1-5" → 5
CREATE OR REPLACE FUNCTION count_chapters_in_passage(p_passage TEXT)
RETURNS INTEGER AS $$
DECLARE
  range_match TEXT[];
  start_ch INTEGER;
  end_ch INTEGER;
BEGIN
  -- Try to match range pattern like "Book N-M"
  range_match := regexp_match(p_passage, '(\d+)\s*-\s*(\d+)');
  IF range_match IS NOT NULL THEN
    start_ch := range_match[1]::INTEGER;
    end_ch := range_match[2]::INTEGER;
    RETURN GREATEST(1, end_ch - start_ch + 1);
  END IF;

  -- Single chapter or fallback
  IF p_passage ~ '\d+' THEN
    RETURN 1;
  END IF;

  -- Default fallback
  RETURN 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Updated function to calculate chapters from a daily_progress record
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

  -- Get plan type, chapters_per_day, and full structure from the user_plan's reading_plan
  SELECT
    rp.daily_structure->>'type',
    COALESCE((rp.daily_structure->>'chapters_per_day')::INTEGER, 3),
    rp.daily_structure
  INTO plan_type, chapters_per_day, plan_structure
  FROM user_plans up
  JOIN reading_plans rp ON up.plan_id = rp.id
  WHERE up.id = p_user_plan_id;

  -- For sequential plans, multiply by chapters_per_day
  IF plan_type = 'sequential' THEN
    RETURN sections_count * chapters_per_day;
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

-- Recalculate stats for all users to apply the fix
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    PERFORM recalculate_user_stats(user_record.id);
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON FUNCTION count_chapters_in_passage(TEXT) IS 'Parses passage strings like "Genesis 1-3" and returns the chapter count (3 in this case)';
COMMENT ON FUNCTION calculate_chapters_for_progress(TEXT[], UUID) IS 'Calculates total chapters from completed sections, properly parsing passage ranges for weekly_sectional and sectional plans';
