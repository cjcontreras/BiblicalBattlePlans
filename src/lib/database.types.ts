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
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          created_by: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: string
          created_by: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          created_by?: string
          is_active?: boolean
          created_at?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          joined_at?: string
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
