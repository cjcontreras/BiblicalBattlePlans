-- Iron Clad Challenge: F3 Muletown's 3-Month New Testament Reading Plan
-- 3 chapters per day through the entire New Testament (260 chapters)
-- Approximately 87 days to complete

INSERT INTO reading_plans (name, description, duration_days, daily_structure, is_active)
VALUES (
  'Iron Clad Challenge',
  'F3 Muletown''s 3-month challenge to read through the entire New Testament. Complete 3 chapters daily and conquer the NT in about 87 days. Designed for the Iron Clad Challenge - embrace the grind, finish strong.',
  87, -- 87-day challenge
  '{
    "type": "sequential",
    "chapters_per_day": 3,
    "total_chapters": 260,
    "books": [
      {"book": "Matthew", "chapters": 28},
      {"book": "Mark", "chapters": 16},
      {"book": "Luke", "chapters": 24},
      {"book": "John", "chapters": 21},
      {"book": "Acts", "chapters": 28},
      {"book": "Romans", "chapters": 16},
      {"book": "1 Corinthians", "chapters": 16},
      {"book": "2 Corinthians", "chapters": 13},
      {"book": "Galatians", "chapters": 6},
      {"book": "Ephesians", "chapters": 6},
      {"book": "Philippians", "chapters": 4},
      {"book": "Colossians", "chapters": 4},
      {"book": "1 Thessalonians", "chapters": 5},
      {"book": "2 Thessalonians", "chapters": 3},
      {"book": "1 Timothy", "chapters": 6},
      {"book": "2 Timothy", "chapters": 4},
      {"book": "Titus", "chapters": 3},
      {"book": "Philemon", "chapters": 1},
      {"book": "Hebrews", "chapters": 13},
      {"book": "James", "chapters": 5},
      {"book": "1 Peter", "chapters": 5},
      {"book": "2 Peter", "chapters": 3},
      {"book": "1 John", "chapters": 5},
      {"book": "2 John", "chapters": 1},
      {"book": "3 John", "chapters": 1},
      {"book": "Jude", "chapters": 1},
      {"book": "Revelation", "chapters": 22}
    ]
  }'::jsonb,
  true
);
