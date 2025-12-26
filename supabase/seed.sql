-- Biblical Battle Plans - Seed Data
-- Run this after the initial schema migration

-- ============================================
-- READING PLAN 1: Professor Grant Horner's Bible Reading System
-- 10 chapters/day from 10 different lists, each cycling independently
-- ============================================
INSERT INTO reading_plans (name, description, duration_days, daily_structure)
VALUES (
  'Professor Horner''s System',
  'Read 10 chapters daily from 10 different lists. Each list cycles independently when completed, creating unique combinations. Master warriors complete all 10 lists daily; soldiers can complete any subset.',
  0, -- Continuous/perpetual plan
  '{
    "type": "cycling_lists",
    "lists": [
      {
        "id": "list1",
        "label": "Gospels & Acts",
        "description": "Matthew, Mark, Luke, John, Acts",
        "books": [
          {"book": "Matthew", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]},
          {"book": "Mark", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},
          {"book": "Luke", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]},
          {"book": "John", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]},
          {"book": "Acts", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]}
        ],
        "total_chapters": 89
      },
      {
        "id": "list2",
        "label": "Pentateuch",
        "description": "Genesis, Exodus, Leviticus, Numbers, Deuteronomy",
        "books": [
          {"book": "Genesis", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50]},
          {"book": "Exodus", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40]},
          {"book": "Leviticus", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]},
          {"book": "Numbers", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]},
          {"book": "Deuteronomy", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34]}
        ],
        "total_chapters": 187
      },
      {
        "id": "list3",
        "label": "Romans - Colossians",
        "description": "Paul''s major epistles",
        "books": [
          {"book": "Romans", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},
          {"book": "1 Corinthians", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]},
          {"book": "2 Corinthians", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13]},
          {"book": "Galatians", "chapters": [1,2,3,4,5,6]},
          {"book": "Ephesians", "chapters": [1,2,3,4,5,6]},
          {"book": "Philippians", "chapters": [1,2,3,4]},
          {"book": "Colossians", "chapters": [1,2,3,4]}
        ],
        "total_chapters": 65
      },
      {
        "id": "list4",
        "label": "1 Thess - Philemon",
        "description": "Paul''s shorter epistles",
        "books": [
          {"book": "1 Thessalonians", "chapters": [1,2,3,4,5]},
          {"book": "2 Thessalonians", "chapters": [1,2,3]},
          {"book": "1 Timothy", "chapters": [1,2,3,4,5,6]},
          {"book": "2 Timothy", "chapters": [1,2,3,4]},
          {"book": "Titus", "chapters": [1,2,3]},
          {"book": "Philemon", "chapters": [1]}
        ],
        "total_chapters": 22
      },
      {
        "id": "list5",
        "label": "Hebrews - Jude",
        "description": "General epistles",
        "books": [
          {"book": "Hebrews", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13]},
          {"book": "James", "chapters": [1,2,3,4,5]},
          {"book": "1 Peter", "chapters": [1,2,3,4,5]},
          {"book": "2 Peter", "chapters": [1,2,3]},
          {"book": "1 John", "chapters": [1,2,3,4,5]},
          {"book": "2 John", "chapters": [1]},
          {"book": "3 John", "chapters": [1]},
          {"book": "Jude", "chapters": [1]}
        ],
        "total_chapters": 34
      },
      {
        "id": "list6",
        "label": "Psalms",
        "description": "The Book of Psalms",
        "books": [
          {"book": "Psalms", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150]}
        ],
        "total_chapters": 150
      },
      {
        "id": "list7",
        "label": "Proverbs",
        "description": "The Book of Proverbs - cycles monthly",
        "books": [
          {"book": "Proverbs", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]}
        ],
        "total_chapters": 31
      },
      {
        "id": "list8",
        "label": "History & Wisdom",
        "description": "Joshua through Song of Solomon",
        "books": [
          {"book": "Joshua", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]},
          {"book": "Judges", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]},
          {"book": "Ruth", "chapters": [1,2,3,4]},
          {"book": "1 Samuel", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]},
          {"book": "2 Samuel", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]},
          {"book": "1 Kings", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]},
          {"book": "2 Kings", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]},
          {"book": "1 Chronicles", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]},
          {"book": "2 Chronicles", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36]},
          {"book": "Ezra", "chapters": [1,2,3,4,5,6,7,8,9,10]},
          {"book": "Nehemiah", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13]},
          {"book": "Esther", "chapters": [1,2,3,4,5,6,7,8,9,10]},
          {"book": "Job", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42]},
          {"book": "Ecclesiastes", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12]},
          {"book": "Song of Solomon", "chapters": [1,2,3,4,5,6,7,8]}
        ],
        "total_chapters": 249
      },
      {
        "id": "list9",
        "label": "Prophets",
        "description": "Isaiah through Malachi",
        "books": [
          {"book": "Isaiah", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66]},
          {"book": "Jeremiah", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52]},
          {"book": "Lamentations", "chapters": [1,2,3,4,5]},
          {"book": "Ezekiel", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48]},
          {"book": "Daniel", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12]},
          {"book": "Hosea", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14]},
          {"book": "Joel", "chapters": [1,2,3]},
          {"book": "Amos", "chapters": [1,2,3,4,5,6,7,8,9]},
          {"book": "Obadiah", "chapters": [1]},
          {"book": "Jonah", "chapters": [1,2,3,4]},
          {"book": "Micah", "chapters": [1,2,3,4,5,6,7]},
          {"book": "Nahum", "chapters": [1,2,3]},
          {"book": "Habakkuk", "chapters": [1,2,3]},
          {"book": "Zephaniah", "chapters": [1,2,3]},
          {"book": "Haggai", "chapters": [1,2]},
          {"book": "Zechariah", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14]},
          {"book": "Malachi", "chapters": [1,2,3,4]}
        ],
        "total_chapters": 250
      },
      {
        "id": "list10",
        "label": "Revelation",
        "description": "The Book of Revelation",
        "books": [
          {"book": "Revelation", "chapters": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]}
        ],
        "total_chapters": 22
      }
    ]
  }'::jsonb
);

-- ============================================
-- READING PLAN 2: Canonical One-Year Plan
-- Genesis to Revelation in order, ~3-4 chapters/day
-- ============================================
INSERT INTO reading_plans (name, description, duration_days, daily_structure)
VALUES (
  'Canonical One-Year Campaign',
  'March through the entire Bible from Genesis to Revelation in chronological book order. Complete the mission in 365 days with approximately 3-4 chapters daily.',
  365,
  '{
    "type": "sequential",
    "chapters_per_day": 3,
    "total_chapters": 1189,
    "books": [
      {"book": "Genesis", "chapters": 50},
      {"book": "Exodus", "chapters": 40},
      {"book": "Leviticus", "chapters": 27},
      {"book": "Numbers", "chapters": 36},
      {"book": "Deuteronomy", "chapters": 34},
      {"book": "Joshua", "chapters": 24},
      {"book": "Judges", "chapters": 21},
      {"book": "Ruth", "chapters": 4},
      {"book": "1 Samuel", "chapters": 31},
      {"book": "2 Samuel", "chapters": 24},
      {"book": "1 Kings", "chapters": 22},
      {"book": "2 Kings", "chapters": 25},
      {"book": "1 Chronicles", "chapters": 29},
      {"book": "2 Chronicles", "chapters": 36},
      {"book": "Ezra", "chapters": 10},
      {"book": "Nehemiah", "chapters": 13},
      {"book": "Esther", "chapters": 10},
      {"book": "Job", "chapters": 42},
      {"book": "Psalms", "chapters": 150},
      {"book": "Proverbs", "chapters": 31},
      {"book": "Ecclesiastes", "chapters": 12},
      {"book": "Song of Solomon", "chapters": 8},
      {"book": "Isaiah", "chapters": 66},
      {"book": "Jeremiah", "chapters": 52},
      {"book": "Lamentations", "chapters": 5},
      {"book": "Ezekiel", "chapters": 48},
      {"book": "Daniel", "chapters": 12},
      {"book": "Hosea", "chapters": 14},
      {"book": "Joel", "chapters": 3},
      {"book": "Amos", "chapters": 9},
      {"book": "Obadiah", "chapters": 1},
      {"book": "Jonah", "chapters": 4},
      {"book": "Micah", "chapters": 7},
      {"book": "Nahum", "chapters": 3},
      {"book": "Habakkuk", "chapters": 3},
      {"book": "Zephaniah", "chapters": 3},
      {"book": "Haggai", "chapters": 2},
      {"book": "Zechariah", "chapters": 14},
      {"book": "Malachi", "chapters": 4},
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
  }'::jsonb
);

-- ============================================
-- READING PLAN 3: Discipleship Journal Plan
-- 25 readings/month with built-in catch-up days
-- 4 sections daily: OT, NT, Psalms, Proverbs
-- ============================================
INSERT INTO reading_plans (name, description, duration_days, daily_structure)
VALUES (
  'Discipleship Journal Campaign',
  'A strategic 25-day monthly battle plan with 6 catch-up days built in. Each day covers 4 fronts: Old Testament, New Testament, Psalms, and Proverbs. Complete the Bible in one year while maintaining flexibility.',
  365,
  '{
    "type": "sectional",
    "sections_per_day": 4,
    "days_per_month": 25,
    "catchup_days": 6,
    "sections": [
      {"id": "ot", "label": "Old Testament", "color": "military-green"},
      {"id": "nt", "label": "New Testament", "color": "terminal-green"},
      {"id": "psalms", "label": "Psalms", "color": "achievement-gold"},
      {"id": "proverbs", "label": "Proverbs", "color": "terminal-gray-300"}
    ],
    "description": "Read from 4 sections daily. Six days each month are designated as catch-up days for missed readings."
  }'::jsonb
);

-- Add a simple welcome message to verify seed worked
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully! 3 reading plans created.';
END $$;
