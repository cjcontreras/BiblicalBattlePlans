import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { GuildActivity } from '../types'

// Query keys
export const activityKeys = {
  guild: (guildId: string) => ['guildActivities', guildId] as const,
}

/**
 * Fetch activity feed for a guild
 * Returns recent activities ordered by most recent first
 */
export function useGuildActivities(guildId: string, limit = 20) {
  return useQuery({
    queryKey: activityKeys.guild(guildId),
    queryFn: async () => {
      console.log('[GuildActivity] Fetching activities for guild:', guildId)

      const { data, error } = await supabase
        .from('guild_activities')
        .select(`
          *,
          profile:profiles(id, display_name, username, avatar_url)
        `)
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('[GuildActivity] Failed to fetch activities:', error)
        throw error
      }

      console.log('[GuildActivity] Fetched', data?.length || 0, 'activities')
      return data as GuildActivity[]
    },
    enabled: !!guildId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  })
}
