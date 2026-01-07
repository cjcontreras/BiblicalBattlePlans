import { create } from 'zustand'
import { getSupabase } from '../lib/supabase'
import { setSentryUser } from '../lib/sentry'
import { captureError } from '../lib/errorLogger'
import { clearUserCache } from '../lib/queryClient'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

/**
 * AUTH ARCHITECTURE
 *
 * We manage auth state ourselves in Zustand instead of relying on GoTrueClient's
 * internal state management. This avoids issues with:
 * - navigator.locks deadlocks after tab suspension
 * - Multiple GoTrueClient instances warnings from HMR
 * - Unpredictable onAuthStateChange timing
 *
 * Auth flow:
 * 1. On app init: Check localStorage for existing session via getSession()
 * 2. On sign in/out: Update Zustand state directly after the operation
 * 3. On tab visibility change: App.tsx invalidates the React Query cache after inactivity; tokens are refreshed on-demand when API calls detect expiry
 * 4. URL auth flows (OAuth, password reset): Handled in initialize()
 */

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  isRecoveryMode: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  deleteAccount: () => Promise<{ error: Error | null }>
}

type AuthStore = AuthState & AuthActions

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    captureError(error, { component: 'useAuth', action: 'fetchProfile', userId })
    return null
  }

  return data
}

/**
 * Sync profile data from user metadata (for OAuth sign-ins).
 * This sets username and display_name if not already set.
 */
const syncProfileFromMetadata = async (user: User): Promise<void> => {
  const metadata = user.user_metadata
  const existingProfile = await fetchProfile(user.id)

  // Only update if username is not set
  if (!existingProfile?.username) {
    let usernameToSet: string | null = null
    let displayNameToSet: string | null = null

    if (metadata?.username) {
      // Email signup - use provided username
      usernameToSet = metadata.username
      displayNameToSet = existingProfile?.display_name || metadata.display_name || metadata.username
    } else if (metadata?.full_name) {
      // Google OAuth - generate username from full_name (e.g., "Chris Bunce" -> "chris_bunce")
      usernameToSet = metadata.full_name.toLowerCase().replace(/\s+/g, '_')
      displayNameToSet = existingProfile?.display_name || metadata.full_name
    }

    if (usernameToSet) {
      await (getSupabase()
        .from('profiles') as ReturnType<ReturnType<typeof getSupabase>['from']>)
        .update({
          username: usernameToSet,
          display_name: displayNameToSet,
        })
        .eq('id', user.id)
    }
  }

  // Clear cached data from previous user/session to prevent stale data
  clearUserCache()
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  isRecoveryMode: false,

  initialize: async () => {
    try {
      // Check URL hash for special auth flows (OAuth callback, password recovery)
      const hash = window.location.hash
      const isRecoveryFromUrl = !!(hash && hash.includes('type=recovery'))
      const hasAccessToken = !!(hash && hash.includes('access_token'))

      // If URL contains auth tokens (OAuth or recovery), let Supabase process them
      // This happens automatically via detectSessionInUrl: true in client config
      // We just need to wait a moment for it to process
      if (hasAccessToken) {
        // Small delay to let Supabase process the URL tokens
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Get session (from localStorage or freshly processed from URL)
      const { data: { session } } = await getSupabase().auth.getSession()

      if (session?.user) {
        // Handle new OAuth sign-ins (sync profile data)
        if (hasAccessToken && !isRecoveryFromUrl) {
          await syncProfileFromMetadata(session.user)
        }

        const profile = await fetchProfile(session.user.id)
        setSentryUser({ id: session.user.id, email: session.user.email })
        set({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isInitialized: true,
          isRecoveryMode: isRecoveryFromUrl,
        })

        // Clear URL hash after processing to prevent re-processing on refresh
        if (hasAccessToken) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      } else {
        setSentryUser(null)
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
          isRecoveryMode: false,
        })
      }
    } catch (error) {
      captureError(error, { component: 'useAuth', action: 'initialize' }, 'fatal')
      set({ isLoading: false, isInitialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ isLoading: false })
      return { error }
    }

    if (data.session?.user) {
      // Clear cached data from previous user/session to prevent stale data
      clearUserCache()

      const profile = await fetchProfile(data.session.user.id)
      setSentryUser({ id: data.session.user.id, email: data.session.user.email })
      set({
        user: data.session.user,
        session: data.session,
        profile,
        isLoading: false,
        isRecoveryMode: false,
      })
    }

    return { error: null }
  },

  signUp: async (email: string, password: string, username: string, displayName: string) => {
    set({ isLoading: true })

    // Sign up the user - username and display_name stored in user metadata
    // and synced to profile after email confirmation
    const { error } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    })

    if (error) {
      set({ isLoading: false })
      return { error }
    }

    // Note: Profile update happens after email confirmation
    // The profile will be created/updated when the user confirms their email
    // and the auth state change handler runs

    set({ isLoading: false })
    return { error: null }
  },

  signInWithGoogle: async () => {
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) {
      return { error }
    }

    return { error: null }
  },

  signOut: async () => {
    // Clear cached user data to prevent stale data on next login
    clearUserCache()
    setSentryUser(null)

    // Clear state immediately - no loading state needed for sign out
    set({
      user: null,
      session: null,
      profile: null,
      isRecoveryMode: false,
    })
    await getSupabase().auth.signOut()
  },

  resetPassword: async (email: string) => {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error }
    }

    return { error: null }
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await getSupabase().auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { error }
    }

    // Password updated successfully - exit recovery mode
    set({ isRecoveryMode: false })
    return { error: null }
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { user } = get()
    if (!user) {
      return { error: new Error('Not authenticated') }
    }

    const { error } = await (getSupabase()
      .from('profiles') as ReturnType<ReturnType<typeof getSupabase>['from']>)
      .update({
        username: data.username,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        streak_minimum: data.streak_minimum,
      })
      .eq('id', user.id)

    if (error) {
      return { error }
    }

    // Refresh profile data
    await get().refreshProfile()
    return { error: null }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    const profile = await fetchProfile(user.id)
    set({ profile })
  },

  deleteAccount: async () => {
    const { user } = get()
    if (!user) {
      return { error: new Error('Not authenticated') }
    }

    try {
      // Call the Supabase RPC function to delete the user account
      // This cascades to delete all user data (profiles, user_plans, daily_progress)
      const { error } = await getSupabase().rpc('delete_user_account')

      if (error) {
        captureError(error, { component: 'useAuth', action: 'deleteAccount', userId: user.id })
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed to delete account'
        return { error: new Error(errorMessage) }
      }

      // Clear local state first
      setSentryUser(null)
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isRecoveryMode: false,
      })

      // Try to sign out to clear local session storage, but don't fail if it errors
      // (the user no longer exists on the server, so this may return 403)
      try {
        await getSupabase().auth.signOut({ scope: 'local' })
      } catch {
        // Ignore signOut errors - user is already deleted
      }

      return { error: null }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to delete account')
      captureError(err, { component: 'useAuth', action: 'deleteAccount', userId: user.id })
      return { error: err }
    }
  },
}))

// Selector hooks for convenience
export const useUser = () => useAuth((state) => state.user)
export const useProfile = () => useAuth((state) => state.profile)
export const useIsAuthenticated = () => useAuth((state) => !!state.user)
export const useIsLoading = () => useAuth((state) => state.isLoading)
export const useIsRecoveryMode = () => useAuth((state) => state.isRecoveryMode)
