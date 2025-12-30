// Database Types

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  streak_minimum: number // Min chapters/day for streak (default 3)
  // Computed stats (updated by database trigger)
  current_streak: number
  longest_streak: number
  total_chapters_read: number
  total_days_reading: number
  last_reading_date: string | null
  // Streak shields (earned every 14 consecutive days, max 3)
  streak_shields: number
  last_shield_used_date: string | null
  created_at: string
  updated_at: string
}

// Reading Plan Types

export interface ReadingPlan {
  id: string
  name: string
  description: string | null
  duration_days: number
  daily_structure: DailyStructure
  is_active: boolean
  created_at: string
}

export type DailyStructure =
  | CyclingListsStructure
  | SequentialStructure
  | SectionalStructure
  | WeeklySectionalStructure
  | FreeReadingStructure

export interface CyclingListsStructure {
  type: 'cycling_lists'
  lists: ReadingList[]
}

export interface SequentialStructure {
  type: 'sequential'
  readings: DayReading[]
}

export interface SectionalStructure {
  type: 'sectional'
  sections_per_day: number
  readings: DayReading[]
}

export interface WeeklySectionalStructure {
  type: 'weekly_sectional'
  total_weeks: number
  readings_per_week: number
  categories: WeeklyCategory[]
  weeks: WeekReading[]
}

export interface FreeReadingStructure {
  type: 'free_reading'
  allow_notes: boolean
  require_chapter_count: boolean
}

export interface WeeklyCategory {
  id: string
  label: string
  dayOfWeek: number // 1-7 (just for ordering, not actual calendar day)
}

export interface WeekReading {
  week: number
  readings: WeekDayReading[]
}

export interface WeekDayReading {
  dayOfWeek: number // 1-7
  categoryId: string
  passage: string // e.g., "Rom 1-2"
}

export interface ReadingList {
  id: string
  label: string
  books: BookChapters[]
  total_chapters: number
}

export interface BookChapters {
  book: string
  chapters: number[]
}

export interface DayReading {
  day: number
  sections: ReadingSection[]
}

export interface ReadingSection {
  id: string
  label: string
  passages: string[] // e.g., ["Matthew 1", "Matthew 2"]
}

// User Plan Types

// Maps list_id to current chapter index (0-based)
export type ListPositions = Record<string, number>

export interface UserPlan {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  current_day: number // Legacy - still used for non-cycling plans
  list_positions: ListPositions // For cycling plans: position in each list
  is_completed: boolean
  completed_at: string | null
  is_archived: boolean
  archived_at: string | null
  created_at: string
  // Joined data
  plan?: ReadingPlan
}

export interface DailyProgress {
  id: string
  user_id: string
  user_plan_id: string
  day_number: number // Legacy - kept for backwards compatibility
  date: string // Primary key for tracking - user's local date
  completed_sections: string[] // Format: ["listId:chapterIndex", ...] e.g. ["list1:5", "list1:6", "list2:0"]
  is_complete: boolean // For non-cycling plans; cycling plans ignore this
  notes: string | null
  created_at: string
  updated_at: string
}

// For Horner's plan - tracks position in each cycling list
export interface ListProgress {
  list_id: string
  current_chapter_index: number
  cycles_completed: number
}

// Group Types (for future use)

export interface Group {
  id: string
  name: string
  description: string | null
  type: 'custom' | 'national' | 'church'
  created_by: string
  is_active: boolean
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  joined_at: string
  // Joined data
  profile?: Profile
}

// Stats Types

export interface UserStats {
  total_chapters_read: number
  current_streak: number
  longest_streak: number
  plans_completed: number
  plans_active: number
  total_days_reading: number
  streak_shields: number
  last_shield_used_date: string | null
}

// Auth Types

export interface AuthState {
  user: import('@supabase/supabase-js').User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
}

// UI Component Types

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'gold'
