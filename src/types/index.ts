// Database Types

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
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

export interface UserPlan {
  id: string
  user_id: string
  plan_id: string
  start_date: string
  current_day: number
  is_completed: boolean
  completed_at: string | null
  created_at: string
  // Joined data
  plan?: ReadingPlan
}

export interface DailyProgress {
  id: string
  user_id: string
  user_plan_id: string
  day_number: number
  date: string
  completed_sections: string[] // Array of section IDs
  is_complete: boolean
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
