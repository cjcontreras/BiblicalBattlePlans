export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reading_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          duration_days: number
          daily_structure: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_days: number
          daily_structure: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_days?: number
          daily_structure?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          start_date: string
          current_day: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          start_date: string
          current_day?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          start_date?: string
          current_day?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      daily_progress: {
        Row: {
          id: string
          user_id: string
          user_plan_id: string
          day_number: number
          date: string
          completed_sections: string[]
          is_complete: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_plan_id: string
          day_number: number
          date: string
          completed_sections?: string[]
          is_complete?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_plan_id?: string
          day_number?: number
          date?: string
          completed_sections?: string[]
          is_complete?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guilds: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          created_by: string
          invite_code: string
          is_public: boolean
          is_active: boolean
          member_count: number
          recommended_plan_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: string
          created_by: string
          invite_code?: string | null
          is_public?: boolean
          is_active?: boolean
          member_count?: number
          recommended_plan_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          created_by?: string
          invite_code?: string | null
          is_public?: boolean
          is_active?: boolean
          member_count?: number
          recommended_plan_id?: string | null
          created_at?: string
        }
      }
      guild_members: {
        Row: {
          id: string
          guild_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      guild_activities: {
        Row: {
          id: string
          guild_id: string
          user_id: string
          activity_type: 'reading_completed' | 'streak_milestone' | 'rank_achieved' | 'member_joined' | 'plan_started' | 'plan_completed'
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          user_id: string
          activity_type: 'reading_completed' | 'streak_milestone' | 'rank_achieved' | 'member_joined' | 'plan_started' | 'plan_completed'
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          user_id?: string
          activity_type?: 'reading_completed' | 'streak_milestone' | 'rank_achieved' | 'member_joined' | 'plan_started' | 'plan_completed'
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
