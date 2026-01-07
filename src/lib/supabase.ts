import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

/**
 * No-op lock implementation to fix Supabase promise hangs after tab visibility changes.
 *
 * Issue: GoTrueClient uses navigator.locks API with infinite timeouts, which causes
 * deadlocks when browser tabs are suspended/throttled. The lock is never released,
 * so all subsequent auth operations (and queries waiting on auth) hang forever.
 *
 * See: https://github.com/supabase/supabase-js/issues/1594
 *
 * This workaround bypasses the problematic navigator.locks entirely by providing
 * a no-op lock that immediately executes the function without acquiring a lock.
 * Safe for single-tab usage (our use case).
 */
const noOpLock = async <T>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>
): Promise<T> => {
  return await fn()
}

/**
 * Lightweight Supabase client configuration.
 *
 * Key design decisions:
 * 1. autoRefreshToken: false - We manually refresh tokens on tab visibility change
 *    to avoid GoTrueClient's internal timer/state management issues
 * 2. persistSession: true - Tokens stored in localStorage for session persistence
 * 3. detectSessionInUrl: true - Required for OAuth and password reset flows
 * 4. lock: noOpLock - Bypasses navigator.locks that cause deadlocks
 *
 * Auth state is managed by our Zustand store, not GoTrueClient's internal state.
 * We use Supabase only for: auth operations, token storage, and database queries.
 */
function createSupabaseClient() {
  return createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      auth: {
        autoRefreshToken: false, // We handle refresh manually
        persistSession: true,
        detectSessionInUrl: true,
        lock: noOpLock,
      },
    }
  )
}

// Use window to store client reference to survive HMR in development
// This prevents "Multiple GoTrueClient instances" warnings during hot reload
declare global {
  interface Window {
    __supabaseClient?: SupabaseClient<Database>
  }
}

function getOrCreateClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined' && window.__supabaseClient) {
    return window.__supabaseClient
  }

  const client = createSupabaseClient()

  if (typeof window !== 'undefined') {
    window.__supabaseClient = client
  }

  return client
}

const supabaseClient = getOrCreateClient()

/**
 * Get the Supabase client instance.
 *
 * This is the primary way to access Supabase throughout the app.
 * The client is lightweight - we disabled autoRefreshToken and manage
 * auth state in our Zustand store. Use this for:
 * - Auth operations (signIn, signUp, etc.)
 * - Database queries
 */
export function getSupabase(): SupabaseClient<Database> {
  return supabaseClient
}

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await getSupabase().auth.getUser()
  if (error) throw error
  return user
}

// Helper to get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return session
}

/**
 * Wrap any async operation with a timeout to prevent infinite hangs.
 *
 * After browser tab suspension, Supabase promises can hang forever even though
 * the HTTP request completes successfully. This wrapper ensures queries fail
 * fast instead of hanging.
 *
 * On timeout, we throw an error and let React Query retry. The retry will
 * use the same client but make a fresh request.
 *
 * Usage: await withTimeout(() => getSupabase().from('table').select('*'))
 */
export async function withTimeout<T>(
  queryFn: () => PromiseLike<T>,
  timeoutMs = 8000,
  errorMessage = 'Request timed out'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([queryFn(), timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}
