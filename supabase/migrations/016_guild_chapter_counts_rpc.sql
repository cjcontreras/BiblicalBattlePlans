-- RPC function to calculate accurate chapter counts for guild leaderboard
-- Uses calculate_chapters_for_progress to get real chapter counts from daily_progress

CREATE OR REPLACE FUNCTION get_guild_chapter_counts(
  p_guild_id UUID,
  p_week_start DATE,
  p_month_start DATE
)
RETURNS TABLE (
  user_id UUID,
  chapters_week INTEGER,
  chapters_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gm.user_id,
    COALESCE(SUM(
      CASE WHEN dp.date >= p_week_start
      THEN calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)
      ELSE 0 END
    )::INTEGER, 0) as chapters_week,
    COALESCE(SUM(
      CASE WHEN dp.date >= p_month_start
      THEN calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)
      ELSE 0 END
    )::INTEGER, 0) as chapters_month
  FROM guild_members gm
  LEFT JOIN daily_progress dp ON dp.user_id = gm.user_id
    AND dp.date >= LEAST(p_week_start, p_month_start)
  WHERE gm.guild_id = p_guild_id
  GROUP BY gm.user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_guild_chapter_counts(UUID, DATE, DATE) TO authenticated;

COMMENT ON FUNCTION get_guild_chapter_counts(UUID, DATE, DATE) IS
  'Calculates accurate weekly and monthly chapter counts for all members of a guild using the calculate_chapters_for_progress function';
