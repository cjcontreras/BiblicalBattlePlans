import { useState, useMemo } from 'react'
import { Trophy, Flame, BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { getStreakRank } from '../../hooks/useStats'
import { LoadingSpinner } from '../ui'
import type { LeaderboardSortBy, GuildMember, Profile } from '../../types'

// Type for the RPC function response
type GuildChapterCountRow = {
  user_id: string
  chapters_week: number
  chapters_month: number
}

// Typed RPC call helper for guild chapter counts
async function getGuildChapterCounts(guildId: string, weekStart: string, monthStart: string) {
  // Use type assertion to work around Supabase's strict RPC typing
  // The function exists in the database but isn't auto-generated in types
  type RpcFn = (
    fn: string,
    args: { p_guild_id: string; p_week_start: string; p_month_start: string }
  ) => Promise<{ data: GuildChapterCountRow[] | null; error: Error | null }>

  const rpc = supabase.rpc as unknown as RpcFn
  const { data, error } = await rpc('get_guild_chapter_counts', {
    p_guild_id: guildId,
    p_week_start: weekStart,
    p_month_start: monthStart,
  })

  if (error) throw error
  return data
}

interface GuildLeaderboardProps {
  guildId: string
  members: (GuildMember & { profile: Profile })[]
}

const sortOptions: { value: LeaderboardSortBy; label: string }[] = [
  { value: 'streak', label: 'STREAK' },
  { value: 'chapters_week', label: 'THIS WEEK' },
  { value: 'chapters_month', label: 'THIS MONTH' },
  { value: 'chapters_all', label: 'ALL TIME' },
]

const rankColors: Record<string, string> = {
  LEGENDARY: 'text-purple-500',
  VETERAN: 'text-blue-500',
  WARRIOR: 'text-gold',
  SOLDIER: 'text-sage',
  RECRUIT: 'text-ink-muted',
}

// Helper to get week/month date ranges
function getDateRanges() {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    monthStart: monthStart.toISOString().split('T')[0],
  }
}

export function GuildLeaderboard({ guildId, members }: GuildLeaderboardProps) {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('streak')

  // Fetch chapter counts using RPC function (accurate chapter calculation from daily_progress)
  const { data: chapterCounts, isLoading: loadingChapters } = useQuery({
    queryKey: ['guildChapterCounts', guildId],
    queryFn: async () => {
      const { weekStart, monthStart } = getDateRanges()
      const data = await getGuildChapterCounts(guildId, weekStart, monthStart)

      // Convert array result to lookup object
      const counts: Record<string, { week: number; month: number }> = {}
      for (const row of data || []) {
        counts[row.user_id] = {
          week: row.chapters_week || 0,
          month: row.chapters_month || 0,
        }
      }

      console.log('[Leaderboard] Chapter counts from RPC:', counts)
      return counts
    },
    enabled: !!guildId,
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for leaderboard data
    refetchOnWindowFocus: true,
  })

  // Build leaderboard entries from members (passed from parent)
  const entries = useMemo(() => {
    const result = members
      .filter((m) => m.profile)
      .map((m) => {
        const profile = m.profile
        const streak = profile.current_streak || 0
        const { rank } = getStreakRank(streak)

        return {
          user_id: m.user_id,
          rank: 0,
          display_name: profile.display_name || profile.username || 'Unknown',
          avatar_url: profile.avatar_url,
          current_streak: streak,
          streak_rank: rank,
          chapters_this_week: chapterCounts?.[m.user_id]?.week || 0,
          chapters_this_month: chapterCounts?.[m.user_id]?.month || 0,
          total_chapters_read: profile.total_chapters_read || 0,
          is_current_user: m.user_id === user?.id,
        }
      })

    // Sort based on selected criteria
    result.sort((a, b) => {
      const getValue = (entry: typeof a) => {
        switch (sortBy) {
          case 'streak': return entry.current_streak
          case 'chapters_week': return entry.chapters_this_week
          case 'chapters_month': return entry.chapters_this_month
          case 'chapters_all': return entry.total_chapters_read
          default: return entry.current_streak
        }
      }
      return getValue(b) - getValue(a)
    })

    // Assign ranks with tie handling
    let currentRank = 1
    for (let i = 0; i < result.length; i++) {
      if (i > 0) {
        const getValue = (entry: typeof result[0]) => {
          switch (sortBy) {
            case 'streak': return entry.current_streak
            case 'chapters_week': return entry.chapters_this_week
            case 'chapters_month': return entry.chapters_this_month
            case 'chapters_all': return entry.total_chapters_read
            default: return entry.current_streak
          }
        }
        if (getValue(result[i]) < getValue(result[i - 1])) {
          currentRank = i + 1
        }
      }
      result[i].rank = currentRank
    }

    return result
  }, [members, chapterCounts, sortBy, user?.id])

  if (members.length === 0) {
    return (
      <p className="font-pixel text-[0.625rem] text-ink-muted text-center py-8">
        No members to display
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Selector */}
      <div className="flex gap-1 flex-wrap">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`
              px-3 py-1.5 font-pixel text-[0.5rem] border transition-colors
              ${sortBy === option.value
                ? 'bg-sage text-white border-sage-dark'
                : 'bg-parchment-light text-ink border-border hover:bg-parchment-dark'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Loading indicator for chapter counts */}
      {loadingChapters && (sortBy === 'chapters_week' || sortBy === 'chapters_month') && (
        <div className="flex justify-center py-2">
          <LoadingSpinner />
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`
              flex items-center gap-3 p-3 border transition-colors
              ${entry.is_current_user
                ? 'bg-sage/10 border-sage'
                : 'bg-parchment-light border-border-subtle'
              }
              ${index < 3 ? 'ring-1 ring-gold/30' : ''}
            `}
          >
            {/* Rank Position */}
            <div className="w-8 text-center flex-shrink-0">
              {entry.rank <= 3 ? (
                <Trophy
                  className={`w-5 h-5 mx-auto ${
                    entry.rank === 1
                      ? 'text-gold'
                      : entry.rank === 2
                      ? 'text-gray-400'
                      : 'text-amber-700'
                  }`}
                />
              ) : (
                <span className="font-pixel text-[0.75rem] text-ink-muted">
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-parchment-dark border-2 border-border-subtle flex items-center justify-center flex-shrink-0">
              {entry.avatar_url ? (
                <img
                  src={entry.avatar_url}
                  alt={entry.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-pixel text-[0.75rem] text-ink">
                  {entry.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Name and Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-pixel text-[0.625rem] text-ink truncate">
                  {entry.display_name.toUpperCase()}
                  {entry.is_current_user && (
                    <span className="text-ink-muted ml-1">(YOU)</span>
                  )}
                </span>
                <span
                  className={`font-pixel text-[0.5rem] ${rankColors[entry.streak_rank]}`}
                >
                  [{entry.streak_rank}]
                </span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="font-pixel text-[0.5rem] text-ink-muted">
                    {entry.current_streak}d
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-sage" />
                  <span className="font-pixel text-[0.5rem] text-ink-muted">
                    {entry.total_chapters_read} total
                  </span>
                </div>
              </div>
            </div>

            {/* Highlight Value Based on Sort */}
            <div className="text-right flex-shrink-0">
              <span className="font-pixel text-[0.875rem] text-ink">
                {sortBy === 'streak'
                  ? entry.current_streak
                  : sortBy === 'chapters_week'
                  ? entry.chapters_this_week
                  : sortBy === 'chapters_month'
                  ? entry.chapters_this_month
                  : entry.total_chapters_read}
              </span>
              <div className="font-pixel text-[0.5rem] text-ink-muted">
                {sortBy === 'streak' ? 'DAYS' : 'CHAPTERS'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
