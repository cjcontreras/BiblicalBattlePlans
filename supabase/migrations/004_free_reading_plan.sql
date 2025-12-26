-- Add Free Reading plan type
-- This plan allows users to manually log chapters read without a predetermined schedule

INSERT INTO reading_plans (name, description, duration_days, daily_structure, is_active)
VALUES (
  'Free Reading',
  'Track your personal Bible reading. Log any chapters you read each day toward your daily goal and streak.',
  0,
  '{"type": "free_reading", "allow_notes": true, "require_chapter_count": true}',
  true
);
