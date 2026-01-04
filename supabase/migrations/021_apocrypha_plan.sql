-- Add Apocrypha Reading plan
-- This plan allows users to track reading of the Deuterocanonical/Apocrypha books
-- Functions identically to Free Reading but with a different book set

INSERT INTO reading_plans (name, description, duration_days, daily_structure, is_active)
VALUES (
  'Apocrypha Reading',
  'Track your reading of the Deuterocanonical/Apocrypha books. Check off chapters as you read through Tobit, Judith, Wisdom, Sirach, Maccabees, and more.',
  0,
  '{"type": "free_reading", "allow_notes": true, "require_chapter_count": true, "book_type": "apocrypha"}',
  true
);


