import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
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

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        set({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isInitialized: true,
        })
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Sync username from user metadata to profile if not set
          const metadata = session.user.user_metadata
          if (metadata?.username) {
            await (supabase
              .from('profiles') as ReturnType<typeof supabase.from>)
              .update({
                username: metadata.username,
                display_name: metadata.display_name || metadata.username,
              })
              .eq('id', session.user.id)
          }

          const profile = await fetchProfile(session.user.id)
          set({
            user: session.user,
            session,
            profile,
            isLoading: false,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({ session })
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
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

  signUp: async (email: string, password: string, username: string) => {
    set({ isLoading: true })

    // Sign up the user - username will be stored in user metadata
    // and synced to profile after email confirmation
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
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
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
    })
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
}))

// Selector hooks for convenience
export const useUser = () => useAuth((state) => state.user)
export const useProfile = () => useAuth((state) => state.profile)
export const useIsAuthenticated = () => useAuth((state) => !!state.user)
export const useIsLoading = () => useAuth((state) => state.isLoading)
