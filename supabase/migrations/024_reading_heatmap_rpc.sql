-- RPC function to get reading heatmap data (chapters per day over a date range)
-- Uses calculate_chapters_for_progress to get accurate chapter counts from daily_progress

CREATE OR REPLACE FUNCTION get_reading_heatmap(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  reading_date DATE,
  chapter_count INTEGER
) AS $$
BEGIN
  -- Security check: only allow users to query their own data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: you can only view your own heatmap data';
  END IF;

  RETURN QUERY
  SELECT
    dp.date AS reading_date,
    COALESCE(SUM(
      calculate_chapters_for_progress(dp.completed_sections, dp.user_plan_id)
    )::INTEGER, 0) AS chapter_count
  FROM daily_progress dp
  WHERE dp.user_id = p_user_id
    AND dp.date >= p_start_date
    AND dp.date <= p_end_date
  GROUP BY dp.date
  ORDER BY dp.date ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_reading_heatmap(UUID, DATE, DATE) TO authenticated;

COMMENT ON FUNCTION get_reading_heatmap(UUID, DATE, DATE) IS
  'Returns chapter counts per day for a user over a date range, used for the reading heatmap (Campaign Log)';
