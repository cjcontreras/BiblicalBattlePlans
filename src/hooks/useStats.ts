import { useQuery } from '@tanstack/react-query'
import { getSupabase, safeQuery } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { UserStats } from '../types'

export const statsKeys = {
  user: (userId: string) => ['stats', userId] as const,
}

/**
 * Hook to get user stats.
 * Stats are now stored on the profile and updated by database triggers.
 * We fetch directly from the database to get fresh values after mutations.
 */
export function useStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: statsKeys.user(user?.id || ''),
    queryFn: async (): Promise<UserStats> => {
      if (!user) {
        return {
          total_chapters_read: 0,
          current_streak: 0,
          longest_streak: 0,
          plans_completed: 0,
          plans_active: 0,
          total_days_reading: 0,
          streak_shields: 0,
          last_shield_used_date: null,
          reading_days_in_streak: 0,
          shields_used_in_streak: 0,
        }
      }

      // Fetch fresh profile stats from database (updated by RPC)
      // Using safeQuery to prevent hanging promises after tab suspension
      const profileResult = await safeQuery(() =>
        getSupabase()
          .from('profiles')
          .select('current_streak, longest_streak, total_chapters_read, total_days_reading, streak_shields, last_shield_used_date, reading_days_in_streak, shields_used_in_streak')
          .eq('id', user.id)
          .single()
      )
      const profileData = profileResult.data

      // Count active/completed plans
      const plansResult = await safeQuery(() =>
        getSupabase()
          .from('user_plans')
          .select('id, is_completed, is_archived')
          .eq('user_id', user.id)
      )
      const userPlans = plansResult.data

      const plans = (userPlans || []) as { id: string; is_completed: boolean; is_archived: boolean }[]
      const plansActive = plans.filter((p) => !p.is_completed && !p.is_archived).length
      const plansCompleted = plans.filter((p) => p.is_completed).length

      const profile = profileData as {
        current_streak: number
        longest_streak: number
        total_chapters_read: number
        total_days_reading: number
        streak_shields: number
        last_shield_used_date: string | null
        reading_days_in_streak: number
        shields_used_in_streak: number
      } | null

      return {
        total_chapters_read: profile?.total_chapters_read ?? 0,
        current_streak: profile?.current_streak ?? 0,
        longest_streak: profile?.longest_streak ?? 0,
        plans_completed: plansCompleted,
        plans_active: plansActive,
        total_days_reading: profile?.total_days_reading ?? 0,
        streak_shields: profile?.streak_shields ?? 0,
        last_shield_used_date: profile?.last_shield_used_date ?? null,
        reading_days_in_streak: profile?.reading_days_in_streak ?? 0,
        shields_used_in_streak: profile?.shields_used_in_streak ?? 0,
      }
    },
    enabled: !!user,
    staleTime: 0, // Always refetch when invalidated for real-time updates
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 min but always check for fresh
  })
}

// Helper to get streak rank
export function getStreakRank(days: number): {
  rank: string
  nextRank: string | null
  daysToNext: number
} {
  if (days >= 90) {
    return { rank: 'LEGENDARY', nextRank: null, daysToNext: 0 }
  }
  if (days >= 60) {
    return { rank: 'VETERAN', nextRank: 'LEGENDARY', daysToNext: 90 - days }
  }
  if (days >= 30) {
    return { rank: 'WARRIOR', nextRank: 'VETERAN', daysToNext: 60 - days }
  }
  if (days >= 7) {
    return { rank: 'SOLDIER', nextRank: 'WARRIOR', daysToNext: 30 - days }
  }
  return { rank: 'RECRUIT', nextRank: 'SOLDIER', daysToNext: 7 - days }
}
