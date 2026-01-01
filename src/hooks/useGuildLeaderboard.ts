import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { getStreakRank } from './useStats'
import type { LeaderboardEntry, LeaderboardSortBy, Profile } from '../types'

// Query keys
export const leaderboardKeys = {
  guild: (guildId: string, sortBy: LeaderboardSortBy) =>
    ['guildLeaderboard', guildId, sortBy] as const,
}

// Helper to get week/month date ranges
function getDateRanges() {
  const now = new Date()

  // Start of current week (Sunday)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  // Start of current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    monthStart: monthStart.toISOString().split('T')[0],
  }
}

// Helper to get sort value for an entry
function getSortValue(entry: LeaderboardEntry, sortBy: LeaderboardSortBy): number {
  switch (sortBy) {
    case 'streak':
      return entry.current_streak
    case 'chapters_week':
      return entry.chapters_this_week
    case 'chapters_month':
      return entry.chapters_this_month
    case 'chapters_all':
      return entry.total_chapters_read
    default:
      return entry.current_streak
  }
}

/**
 * Fetch leaderboard data for a guild
 * Computes weekly/monthly chapter counts on demand from daily_progress
 */
export function useGuildLeaderboard(
  guildId: string,
  sortBy: LeaderboardSortBy = 'streak'
) {
  const { user } = useAuth()

  return useQuery({
    queryKey: leaderboardKeys.guild(guildId, sortBy),
    queryFn: async () => {
      console.log('[Leaderboard] Fetching data for guild:', guildId, 'sortBy:', sortBy)

      // 1. Get all guild members with their profiles
      const { data: members, error: membersError } = await supabase
        .from('guild_members')
        .select(`
          user_id,
          profile:profiles(
            id,
            display_name,
            username,
            avatar_url,
            current_streak,
            total_chapters_read
          )
        `)
        .eq('guild_id', guildId)

      if (membersError) {
        console.error('[Leaderboard] Failed to fetch members:', membersError)
        throw membersError
      }

      if (!members || members.length === 0) {
        console.log('[Leaderboard] No members found')
        return []
      }

      // Type for member data
      type MemberData = {
        user_id: string
        profile: Pick<Profile, 'id' | 'display_name' | 'username' | 'avatar_url' | 'current_streak' | 'total_chapters_read'> | null
      }

      const typedMembers = members as MemberData[]
      const memberUserIds = typedMembers.map((m) => m.user_id)
      console.log('[Leaderboard] Found', memberUserIds.length, 'members')

      // 2. Get chapter counts for this week/month from daily_progress
      const { weekStart, monthStart } = getDateRanges()

      const { data: progressData, error: progressError } = await (supabase
        .from('daily_progress') as ReturnType<typeof supabase.from>)
        .select('user_id, date, completed_sections')
        .in('user_id', memberUserIds)
        .gte('date', monthStart)

      if (progressError) {
        console.error('[Leaderboard] Failed to fetch progress:', progressError)
        throw progressError
      }

      // Type for progress data
      type ProgressData = {
        user_id: string
        date: string
        completed_sections: string[] | null
      }

      // Calculate weekly/monthly totals per user
      const chapterCounts: Record<string, { week: number; month: number }> = {}

      for (const progress of (progressData || []) as ProgressData[]) {
        if (!chapterCounts[progress.user_id]) {
          chapterCounts[progress.user_id] = { week: 0, month: 0 }
        }

        // Count completed sections as chapters
        // Note: This is a simplified count; for accurate counts by plan type,
        // we would need to join with user_plans and reading_plans
        const chapters = progress.completed_sections?.length || 0
        chapterCounts[progress.user_id].month += chapters

        if (progress.date >= weekStart) {
          chapterCounts[progress.user_id].week += chapters
        }
      }

      // 3. Build leaderboard entries
      const entries: LeaderboardEntry[] = typedMembers
        .filter((m) => m.profile)
        .map((m) => {
          const profile = m.profile!
          const streak = profile.current_streak || 0
          const { rank } = getStreakRank(streak)

          return {
            user_id: m.user_id,
            rank: 0, // Will be set after sorting
            display_name: profile.display_name || profile.username || 'Unknown',
            avatar_url: profile.avatar_url,
            current_streak: streak,
            streak_rank: rank,
            chapters_this_week: chapterCounts[m.user_id]?.week || 0,
            chapters_this_month: chapterCounts[m.user_id]?.month || 0,
            total_chapters_read: profile.total_chapters_read || 0,
            is_current_user: m.user_id === user?.id,
          }
        })

      // 4. Sort based on selected criteria
      entries.sort((a, b) => {
        const aValue = getSortValue(a, sortBy)
        const bValue = getSortValue(b, sortBy)
        return bValue - aValue // Descending
      })

      // 5. Assign ranks (handle ties)
      let currentRank = 1
      for (let i = 0; i < entries.length; i++) {
        if (i > 0) {
          const prevValue = getSortValue(entries[i - 1], sortBy)
          const currValue = getSortValue(entries[i], sortBy)

          if (currValue < prevValue) {
            currentRank = i + 1
          }
          // If equal, keep same rank (tie)
        }
        entries[i].rank = currentRank
      }

      console.log('[Leaderboard] Built', entries.length, 'leaderboard entries')
      return entries
    },
    enabled: !!guildId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}
