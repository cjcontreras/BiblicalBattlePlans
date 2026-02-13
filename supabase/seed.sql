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
  'March through the entire Bible from Genesis to Revelation in canonical book order. Complete the mission in 365 days with 3-4 chapters daily.',
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
-- READING PLAN 3: 52-Week Bible Reading Plan
-- Read through the Bible in a year with 7 readings per week
-- Categories: Epistles, The Law, History, Psalms, Poetry, Prophecy, Gospels
-- ============================================
INSERT INTO reading_plans (name, description, duration_days, daily_structure)
VALUES (
  '52-Week Bible Reading Plan',
  'A balanced one-year journey through Scripture. Each week features 7 readings from different sections: Epistles, The Law, History, Psalms, Poetry, Prophecy, and Gospels. Complete in 52 weeks at your own pace.',
  364,
  '{
    "type": "weekly_sectional",
    "total_weeks": 52,
    "readings_per_week": 7,
    "categories": [
      {"id": "epistles", "label": "Epistles", "dayOfWeek": 1},
      {"id": "law", "label": "The Law", "dayOfWeek": 2},
      {"id": "history", "label": "History", "dayOfWeek": 3},
      {"id": "psalms", "label": "Psalms", "dayOfWeek": 4},
      {"id": "poetry", "label": "Poetry", "dayOfWeek": 5},
      {"id": "prophecy", "label": "Prophecy", "dayOfWeek": 6},
      {"id": "gospels", "label": "Gospels", "dayOfWeek": 7}
    ],
    "weeks": [
      {"week": 1, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 1-2"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 1-3"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Joshua 1-5"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 1-2"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 1-2"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 1-6"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 1-2"}]},
      {"week": 2, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 3-4"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 4-7"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Joshua 6-10"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 3-5"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 3-4"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 7-11"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 3-4"}]},
      {"week": 3, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 5-6"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 8-11"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Joshua 11-15"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 6-8"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 5-6"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 12-17"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 5-7"}]},
      {"week": 4, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 7-8"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 12-15"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Joshua 16-20"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 9-11"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 7-8"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 18-22"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 8-10"}]},
      {"week": 5, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 9-10"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 16-19"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Joshua 21-24"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 12-14"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 9-10"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 23-28"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 11-13"}]},
      {"week": 6, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 11-12"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 20-23"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Judges 1-6"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 15-17"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 11-12"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 29-33"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 14-16"}]},
      {"week": 7, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 13-14"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 24-27"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Judges 7-11"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 18-20"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 13-14"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 34-39"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 17-19"}]},
      {"week": 8, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Romans 15-16"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 28-31"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Judges 12-16"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 21-23"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 15-16"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 40-44"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 20-22"}]},
      {"week": 9, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 1-2"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 32-35"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Judges 17-21"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 24-26"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 17-18"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 45-50"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 23-25"}]},
      {"week": 10, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 3-4"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 36-39"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Ruth"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 27-29"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 19-20"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 51-55"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Matthew 26-28"}]},
      {"week": 11, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 5-6"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 40-43"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Samuel 1-5"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 30-32"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 21-22"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 56-61"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 1-2"}]},
      {"week": 12, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 7-8"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 44-47"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Samuel 6-10"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 33-35"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 23-24"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Isaiah 62-66"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 3-4"}]},
      {"week": 13, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 9-10"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Genesis 48-50"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Samuel 11-15"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 36-38"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 25-26"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 1-6"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 5-6"}]},
      {"week": 14, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 11-12"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 1-4"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Samuel 16-20"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 39-41"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 27-28"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 7-11"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 7-8"}]},
      {"week": 15, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 13-14"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 5-8"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Samuel 21-25"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 42-44"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 29-30"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 12-16"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 9-10"}]},
      {"week": 16, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Corinthians 15-16"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 9-12"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Samuel 26-31"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 45-47"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 31-32"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 17-21"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 11-12"}]},
      {"week": 17, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Corinthians 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 13-16"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Samuel 1-4"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 48-50"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 33-34"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 22-26"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 13-14"}]},
      {"week": 18, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Corinthians 4-5"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 17-20"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Samuel 5-9"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 51-53"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 35-36"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 27-31"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Mark 15-16"}]},
      {"week": 19, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Corinthians 6-8"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 21-24"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Samuel 10-14"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 54-56"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 37-38"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 32-36"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 1-2"}]},
      {"week": 20, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Corinthians 9-10"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 25-28"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Samuel 15-19"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 57-59"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 39-40"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 37-41"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 3-4"}]},
      {"week": 21, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Corinthians 11-13"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 29-32"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Samuel 20-24"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 60-62"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Job 41-42"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 42-46"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 5-6"}]},
      {"week": 22, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Galatians 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 33-36"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Kings 1-4"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 63-65"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 1"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jeremiah 47-52"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 7-8"}]},
      {"week": 23, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Galatians 4-6"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Exodus 37-40"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Kings 5-9"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 66-68"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 2-3"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Lamentations"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 9-10"}]},
      {"week": 24, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Ephesians 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 1-3"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Kings 10-13"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 69-71"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 4"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 1-6"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 11-12"}]},
      {"week": 25, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Ephesians 4-6"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 4-6"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Kings 14-18"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 72-74"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 5-6"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 7-12"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 13-14"}]},
      {"week": 26, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Philippians 1-2"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 7-9"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Kings 19-22"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 75-77"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 7"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 13-18"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 15-16"}]},
      {"week": 27, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Philippians 3-4"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 10-12"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Kings 1-5"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 78-80"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 8-9"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 19-24"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 17-18"}]},
      {"week": 28, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Colossians 1-2"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 13-15"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Kings 6-10"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 81-83"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 10"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 25-30"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 19-20"}]},
      {"week": 29, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Colossians 3-4"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 16-18"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Kings 11-15"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 84-86"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 11-12"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 31-36"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 21-22"}]},
      {"week": 30, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Thessalonians 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 19-21"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Kings 16-20"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 87-89"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 13"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 37-42"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Luke 23-24"}]},
      {"week": 31, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Thessalonians 4-5"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 22-24"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Kings 21-25"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 90-92"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 14-15"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Ezekiel 43-48"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 1-2"}]},
      {"week": 32, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Thessalonians"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Leviticus 25-27"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Chronicles 1-4"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 93-95"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 16"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Daniel 1-6"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 3-4"}]},
      {"week": 33, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Timothy 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 1-4"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Chronicles 5-9"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 96-98"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 17-18"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Daniel 7-12"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 5-6"}]},
      {"week": 34, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Timothy 4-6"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 5-8"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Chronicles 10-14"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 99-101"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 19"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Hosea 1-7"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 7-9"}]},
      {"week": 35, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Timothy 1-2"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 9-12"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Chronicles 15-19"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 102-104"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 20-21"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Hosea 8-14"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 10-12"}]},
      {"week": 36, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Timothy 3-4"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 13-16"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Chronicles 20-24"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 105-107"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 22"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Joel"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 13-15"}]},
      {"week": 37, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Titus"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 17-20"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "1 Chronicles 25-29"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 108-110"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 23-24"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Amos 1-4"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 16-18"}]},
      {"week": 38, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Philemon"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 21-24"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 1-5"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 111-113"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 25"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Amos 5-9"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "John 19-21"}]},
      {"week": 39, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Hebrews 1-4"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 25-28"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 6-10"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 114-116"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 26-27"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Obadiah"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 1-2"}]},
      {"week": 40, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Hebrews 5-7"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 29-32"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 11-15"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 117-118"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 28"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Jonah"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 3-4"}]},
      {"week": 41, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Hebrews 8-10"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Numbers 33-36"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 16-20"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalm 119"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 29-30"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Micah"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 5-6"}]},
      {"week": 42, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Hebrews 11-13"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 1-3"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 21-24"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 120-121"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Proverbs 31"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Nahum"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 7-8"}]},
      {"week": 43, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "James 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 4-6"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 25-28"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 122-124"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Ecclesiastes 1-2"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Habakkuk"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 9-10"}]},
      {"week": 44, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "James 4-5"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 7-9"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 29-32"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 125-127"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Ecclesiastes 3-4"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Zephaniah"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 11-12"}]},
      {"week": 45, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Peter 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 10-12"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "2 Chronicles 33-36"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 128-130"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Ecclesiastes 5-6"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Haggai"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 13-14"}]},
      {"week": 46, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 Peter 4-5"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 13-15"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Ezra 1-5"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 131-133"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Ecclesiastes 7-8"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Zechariah 1-7"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 15-16"}]},
      {"week": 47, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 Peter"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 16-19"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Ezra 6-10"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 134-136"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Ecclesiastes 9-10"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Zechariah 8-14"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 17-18"}]},
      {"week": 48, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 John 1-3"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 20-22"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Nehemiah 1-4"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 137-139"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Ecclesiastes 11-12"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Malachi"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 19-20"}]},
      {"week": 49, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "1 John 4-5"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 23-25"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Nehemiah 5-9"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 140-142"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Song of Solomon 1-2"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Revelation 1-6"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 21-22"}]},
      {"week": 50, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "2 John"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 26-28"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Nehemiah 10-13"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 143-145"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Song of Solomon 3-4"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Revelation 7-11"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 23-24"}]},
      {"week": 51, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "3 John"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 29-31"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Esther 1-5"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 146-148"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Song of Solomon 5-6"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Revelation 12-17"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 25-26"}]},
      {"week": 52, "readings": [{"dayOfWeek": 1, "categoryId": "epistles", "passage": "Jude"}, {"dayOfWeek": 2, "categoryId": "law", "passage": "Deuteronomy 32-34"}, {"dayOfWeek": 3, "categoryId": "history", "passage": "Esther 6-10"}, {"dayOfWeek": 4, "categoryId": "psalms", "passage": "Psalms 149-150"}, {"dayOfWeek": 5, "categoryId": "poetry", "passage": "Song of Solomon 7-8"}, {"dayOfWeek": 6, "categoryId": "prophecy", "passage": "Revelation 18-22"}, {"dayOfWeek": 7, "categoryId": "gospels", "passage": "Acts 27-28"}]}
    ]
  }'::jsonb
);

-- Add a simple welcome message to verify seed worked
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully! 4 reading plans created.';
END $$;
