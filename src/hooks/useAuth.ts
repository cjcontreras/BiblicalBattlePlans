import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { setSentryUser } from '../lib/sentry'
import { captureError } from '../lib/errorLogger'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

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
  const { data, error } = await supabase
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

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isInitialized: false,
  isRecoveryMode: false,

  initialize: async () => {
    try {
      // Check if this is a recovery flow from URL hash BEFORE getting session
      const hash = window.location.hash
      const isRecoveryFromUrl = !!(hash && hash.includes('type=recovery'))

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setSentryUser({ id: session.user.id, email: session.user.email })
        set({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isInitialized: true,
          isRecoveryMode: isRecoveryFromUrl, // Set recovery mode if URL indicates recovery
        })
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

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event, 'Session:', !!session)

        // Check URL hash for recovery token (handles INITIAL_SESSION with recovery)
        const currentHash = window.location.hash
        const isRecoveryFromHash = currentHash && currentHash.includes('type=recovery')

        if ((event === 'PASSWORD_RECOVERY' || (event === 'INITIAL_SESSION' && isRecoveryFromHash)) && session?.user) {
          // User clicked a password reset link - set recovery mode
          setSentryUser({ id: session.user.id, email: session.user.email })
          set({
            user: session.user,
            session,
            isLoading: false,
            isRecoveryMode: true,
          })
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Sync username from user metadata to profile if not set
          const metadata = session.user.user_metadata
          
          // First check if profile already has data
          const existingProfile = await fetchProfile(session.user.id)

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
              await (supabase
                .from('profiles') as ReturnType<typeof supabase.from>)
                .update({
                  username: usernameToSet,
                  display_name: displayNameToSet,
                })
                .eq('id', session.user.id)
            }
          }

          const profile = await fetchProfile(session.user.id)
          setSentryUser({ id: session.user.id, email: session.user.email })
          set({
            user: session.user,
            session,
            profile,
            isLoading: false,
            isRecoveryMode: false,
          })
        } else if (event === 'SIGNED_OUT') {
          setSentryUser(null)
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            isRecoveryMode: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({ session })
        } else if (event === 'USER_UPDATED') {
          // Password was successfully changed, exit recovery mode
          console.log('User updated, exiting recovery mode')
          set({ isRecoveryMode: false })
        }
      })
    } catch (error) {
      captureError(error, { component: 'useAuth', action: 'initialize' }, 'fatal')
      set({ isLoading: false, isInitialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ isLoading: false })
      return { error }
    }

    // Immediately update auth state instead of waiting for onAuthStateChange
    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user.id)
      set({
        user: data.session.user,
        session: data.session,
        profile,
        isLoading: false,
      })
    }

    return { error: null }
  },

  signUp: async (email: string, password: string, username: string, displayName: string) => {
    set({ isLoading: true })

    // Sign up the user - username and display_name stored in user metadata
    // and synced to profile after email confirmation
    const { error } = await supabase.auth.signUp({
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
    const { error } = await supabase.auth.signInWithOAuth({
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
    // Clear state immediately - no loading state needed for sign out
    set({
      user: null,
      session: null,
      profile: null,
    })
    await supabase.auth.signOut()
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error }
    }

    return { error: null }
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { error }
    }

    return { error: null }
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { user } = get()
    if (!user) {
      return { error: new Error('Not authenticated') }
    }

    const { error } = await (supabase
      .from('profiles') as ReturnType<typeof supabase.from>)
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
      const { error } = await supabase.rpc('delete_user_account')

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
        await supabase.auth.signOut({ scope: 'local' })
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
