-- Free Reading Chapters - Track individual chapter completions for Free Reading plans
-- This enables granular Bible/Apocrypha tracking with chapter-level checkboxes

-- ============================================
-- FREE READING CHAPTERS TABLE
-- Tracks which specific chapters a user has read
-- ============================================
CREATE TABLE free_reading_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plan_id UUID REFERENCES user_plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book TEXT NOT NULL,           -- e.g., "Genesis", "Tobit"
  chapter INTEGER NOT NULL,     -- e.g., 1, 2, 3...
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_plan_id, book, chapter)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_free_reading_chapters_user_plan ON free_reading_chapters(user_plan_id);
CREATE INDEX idx_free_reading_chapters_user ON free_reading_chapters(user_id);
CREATE INDEX idx_free_reading_chapters_book ON free_reading_chapters(user_plan_id, book);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE free_reading_chapters ENABLE ROW LEVEL SECURITY;

-- Users can only view their own chapter completions
CREATE POLICY "Users can view their own chapter completions"
  ON free_reading_chapters FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own chapter completions (validates user_plan_id ownership)
CREATE POLICY "Users can insert their own chapter completions"
  ON free_reading_chapters FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM user_plans
      WHERE user_plans.id = user_plan_id
      AND user_plans.user_id = auth.uid()
    )
  );

-- Users can delete their own chapter completions (for unchecking)
CREATE POLICY "Users can delete their own chapter completions"
  ON free_reading_chapters FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No UPDATE policy needed - chapters are either completed or not (insert/delete)

-- ============================================
-- OWNERSHIP CONSTRAINT (defense in depth)
-- Ensures user_plan_id belongs to the same user_id
-- ============================================
CREATE OR REPLACE FUNCTION check_free_reading_chapter_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_plans
    WHERE user_plans.id = NEW.user_plan_id
    AND user_plans.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'user_plan_id must belong to the same user_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_free_reading_chapter_owner
  BEFORE INSERT OR UPDATE ON free_reading_chapters
  FOR EACH ROW
  EXECUTE FUNCTION check_free_reading_chapter_owner();


