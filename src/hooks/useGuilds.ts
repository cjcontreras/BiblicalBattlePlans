import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Guild, GuildMember, GuildWithMembers, UserGuildMembership, Profile, ReadingPlan } from '../types'

// Query keys
export const guildKeys = {
  all: ['guilds'] as const,
  myGuilds: (userId: string) => [...guildKeys.all, 'myGuilds', userId] as const,
  detail: (id: string) => [...guildKeys.all, 'detail', id] as const,
  members: (guildId: string) => [...guildKeys.all, 'members', guildId] as const,
  byInviteCode: (code: string) => [...guildKeys.all, 'byInviteCode', code] as const,
  // Leaderboard and activity keys (for cross-query invalidation)
  leaderboard: (guildId: string) => ['guildLeaderboard', guildId] as const,
  activities: (guildId: string) => ['guildActivities', guildId] as const,
}

// Helper to invalidate all guild-related queries (members, leaderboard, activities, list)
function invalidateGuildData(queryClient: ReturnType<typeof useQueryClient>, guildId: string) {
  queryClient.invalidateQueries({ queryKey: guildKeys.detail(guildId) })
  // Invalidate all leaderboard queries for this guild (regardless of sortBy)
  queryClient.invalidateQueries({ queryKey: guildKeys.leaderboard(guildId) })
  queryClient.invalidateQueries({ queryKey: guildKeys.activities(guildId) })
  // Invalidate all myGuilds queries so member counts update on the list page
  queryClient.invalidateQueries({ queryKey: ['guilds', 'myGuilds'] })
}

/**
 * Get all guilds the current user is a member of
 */
export function useMyGuilds() {
  const { user } = useAuth()

  return useQuery({
    queryKey: guildKeys.myGuilds(user?.id || ''),
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('guild_members')
        .select(`
          *,
          guild:guilds(*)
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (error) throw error
      return data as UserGuildMembership[]
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Get a single guild with its members
 */
export function useGuild(guildId: string) {
  return useQuery({
    queryKey: guildKeys.detail(guildId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guilds')
        .select(`
          *,
          members:guild_members(
            *,
            profile:profiles(id, username, display_name, avatar_url, current_streak, total_chapters_read)
          ),
          recommended_plan:reading_plans(*)
        `)
        .eq('id', guildId)
        .single()

      if (error) throw error

      // Sort members: admins first, then by streak
      const guild = data as GuildWithMembers & {
        members: (GuildMember & { profile: Profile })[]
      } & { recommended_plan: ReadingPlan | null }

      guild.members.sort((a, b) => {
        // Admins first
        if (a.role === 'admin' && b.role !== 'admin') return -1
        if (b.role === 'admin' && a.role !== 'admin') return 1
        // Then by streak
        return (b.profile?.current_streak || 0) - (a.profile?.current_streak || 0)
      })

      return guild
    },
    enabled: !!guildId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

/**
 * Get a guild by its invite code (for preview before joining)
 * Uses secure RPC function that returns limited guild info (no invite_code exposed)
 */
export function useGuildByInviteCode(code: string) {
  return useQuery({
    queryKey: guildKeys.byInviteCode(code.toUpperCase()),
    queryFn: async () => {
      // Use secure RPC function for guild preview
      type GuildPreviewRow = {
        id: string
        name: string
        description: string | null
        member_count: number
        is_public: boolean
        created_at: string
      }

      type GetGuildRpcFn = (
        fn: string,
        args: { p_invite_code: string }
      ) => Promise<{ data: GuildPreviewRow[] | null; error: Error | null }>

      const rpc = supabase.rpc as unknown as GetGuildRpcFn
      const { data, error } = await rpc('get_guild_by_invite_code', {
        p_invite_code: code,
      })

      if (error) throw error
      if (!data || data.length === 0) throw new Error('Guild not found')

      // Return as Guild type (some fields won't be present but that's ok for preview)
      return data[0] as unknown as Guild
    },
    enabled: !!code && code.length >= 6,
  })
}

/**
 * Check if current user is an admin of a guild
 */
export function useIsGuildAdmin(guildId: string): boolean {
  const { user } = useAuth()
  const { data: guild } = useGuild(guildId)

  if (!user || !guild) return false
  return guild.members.some((m) => m.user_id === user.id && m.role === 'admin')
}

/**
 * Get the current user's membership in a guild
 */
export function useMyGuildMembership(guildId: string) {
  const { user } = useAuth()
  const { data: guild } = useGuild(guildId)

  if (!user || !guild) return null
  return guild.members.find((m) => m.user_id === user.id) || null
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new guild (always private/invite-only)
 */
export function useCreateGuild() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      name,
      description,
    }: {
      name: string
      description?: string
    }) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await (supabase
        .from('guilds') as ReturnType<typeof supabase.from>)
        .insert({
          name,
          description: description || null,
          type: 'custom',
          created_by: user.id,
          is_public: false, // All guilds are invite-only
        })
        .select()
        .single()

      if (error) throw error
      return data as Guild
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: guildKeys.myGuilds(user.id) })
      }
    },
  })
}

/**
 * Join a guild via invite code
 * Uses secure RPC function that validates invite code at database level
 */
export function useJoinGuild() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Not authenticated')

      // Use secure RPC function that validates invite code
      type JoinGuildRpcFn = (
        fn: string,
        args: { p_invite_code: string }
      ) => Promise<{ data: { guild_id: string; guild_name: string }[] | null; error: Error | null }>

      const rpc = supabase.rpc as unknown as JoinGuildRpcFn
      const { data, error } = await rpc('join_guild_by_invite_code', {
        p_invite_code: inviteCode,
      })

      if (error) {
        // Extract user-friendly message from database error
        const message = error.message || 'Failed to join guild'
        throw new Error(message)
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to join guild')
      }

      return { guildId: data[0].guild_id, guildName: data[0].guild_name }
    },
    onSuccess: (data) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: guildKeys.myGuilds(user.id) })
        invalidateGuildData(queryClient, data.guildId)
      }
    },
  })
}

/**
 * Leave a guild
 * Uses atomic RPC function to prevent race conditions
 */
export function useLeaveGuild() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (guildId: string) => {
      if (!user) throw new Error('Not authenticated')

      // Use atomic RPC function
      type LeaveGuildRpcFn = (
        fn: string,
        args: { p_guild_id: string }
      ) => Promise<{ data: null; error: Error | null }>

      const rpc = supabase.rpc as unknown as LeaveGuildRpcFn
      const { error } = await rpc('leave_guild', { p_guild_id: guildId })

      if (error) {
        throw new Error(error.message || 'Failed to leave guild')
      }

      return { guildId }
    },
    onSuccess: (data) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: guildKeys.myGuilds(user.id) })
        invalidateGuildData(queryClient, data.guildId)
      }
    },
  })
}

/**
 * Update guild settings (admin only)
 */
export function useUpdateGuild() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guildId,
      name,
      description,
    }: {
      guildId: string
      name?: string
      description?: string
    }) => {
      const updates: Record<string, unknown> = {}
      if (name !== undefined) updates.name = name
      if (description !== undefined) updates.description = description

      const { data, error } = await (supabase
        .from('guilds') as ReturnType<typeof supabase.from>)
        .update(updates)
        .eq('id', guildId)
        .select()
        .single()

      if (error) throw error
      return data as Guild
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guildKeys.detail(data.id) })
    },
  })
}

/**
 * Set recommended plan for guild (admin only)
 */
export function useSetGuildRecommendedPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guildId,
      planId,
    }: {
      guildId: string
      planId: string | null
    }) => {
      const { data, error } = await (supabase
        .from('guilds') as ReturnType<typeof supabase.from>)
        .update({ recommended_plan_id: planId })
        .eq('id', guildId)
        .select()
        .single()

      if (error) throw error
      return data as Guild
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guildKeys.detail(data.id) })
      // Also invalidate myGuilds so recommendation shows in guild list
      queryClient.invalidateQueries({ queryKey: ['guilds', 'myGuilds'] })
    },
  })
}

/**
 * Delete a guild (admin only, must be last member)
 * Uses atomic RPC function to prevent race conditions
 */
export function useDeleteGuild() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (guildId: string) => {
      if (!user) throw new Error('Not authenticated')

      // Use atomic RPC function
      type DeleteGuildRpcFn = (
        fn: string,
        args: { p_guild_id: string }
      ) => Promise<{ data: null; error: Error | null }>

      const rpc = supabase.rpc as unknown as DeleteGuildRpcFn
      const { error } = await rpc('delete_guild', { p_guild_id: guildId })

      if (error) {
        throw new Error(error.message || 'Failed to delete guild')
      }

      return { guildId }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: guildKeys.myGuilds(user.id) })
      }
    },
  })
}

/**
 * Remove a member from guild (admin only)
 */
export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guildId,
      userId,
    }: {
      guildId: string
      userId: string
    }) => {
      const { error } = await (supabase
        .from('guild_members') as ReturnType<typeof supabase.from>)
        .delete()
        .eq('guild_id', guildId)
        .eq('user_id', userId)

      if (error) throw error
      return { guildId, userId }
    },
    onSuccess: (data) => {
      invalidateGuildData(queryClient, data.guildId)
    },
  })
}

/**
 * Promote a member to admin (admin only)
 */
export function usePromoteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guildId,
      userId,
    }: {
      guildId: string
      userId: string
    }) => {
      const { error } = await (supabase
        .from('guild_members') as ReturnType<typeof supabase.from>)
        .update({ role: 'admin' })
        .eq('guild_id', guildId)
        .eq('user_id', userId)

      if (error) throw error
      return { guildId, userId }
    },
    onSuccess: (data) => {
      invalidateGuildData(queryClient, data.guildId)
    },
  })
}

/**
 * Demote an admin to member (admin only)
 * Uses atomic RPC function to prevent race conditions
 */
export function useDemoteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      guildId,
      userId,
    }: {
      guildId: string
      userId: string
    }) => {
      // Use atomic RPC function
      type DemoteMemberRpcFn = (
        fn: string,
        args: { p_guild_id: string; p_user_id: string }
      ) => Promise<{ data: null; error: Error | null }>

      const rpc = supabase.rpc as unknown as DemoteMemberRpcFn
      const { error } = await rpc('demote_guild_member', {
        p_guild_id: guildId,
        p_user_id: userId,
      })

      if (error) {
        throw new Error(error.message || 'Failed to demote member')
      }

      return { guildId, userId }
    },
    onSuccess: (data) => {
      invalidateGuildData(queryClient, data.guildId)
    },
  })
}

/**
 * Regenerate invite code (admin only)
 */
export function useRegenerateInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (guildId: string) => {
      // Set invite_code to null so the database trigger generates a new one
      const { data, error } = await (supabase
        .from('guilds') as ReturnType<typeof supabase.from>)
        .update({ invite_code: null })
        .eq('id', guildId)
        .select()
        .single()

      if (error) throw error
      return data as Guild
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: guildKeys.detail(data.id) })
    },
  })
}

/**
 * Get the shareable invite link for a guild
 */
export function getInviteLink(inviteCode: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/guild/join/${inviteCode}`
}
