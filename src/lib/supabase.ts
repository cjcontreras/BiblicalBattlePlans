import { createClient } from '@supabase/supabase-js'
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
 * See: https://github.com/supabase/auth-js/issues/1594
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

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      lock: noOpLock,
    },
  }
)

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper to get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/**
 * Wrap any async operation with a timeout to prevent infinite hangs.
 *
 * After browser tab suspension, Supabase promises can hang forever even though
 * the HTTP request completes successfully. This wrapper ensures queries fail
 * fast instead of hanging, allowing React Query's retry logic to recover.
 *
 * Usage: await withTimeout(() => supabase.from('table').select('*'))
 */
export async function withTimeout<T>(
  queryFn: () => PromiseLike<T>,
  timeoutMs = 10000,
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
