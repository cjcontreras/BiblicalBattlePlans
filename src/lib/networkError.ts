/**
 * Classifies errors as network/connectivity failures vs application errors.
 *
 * Covers:
 * - Chrome/Edge: "TypeError: Failed to fetch"
 * - Safari: "TypeError: Load failed"
 * - Firefox: "TypeError: NetworkError when attempting to fetch resource"
 * - AbortError from fetch timeouts
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('failed to fetch') ||
    message.includes('load failed') ||
    message.includes('networkerror') ||
    error.name === 'AbortError'
  )
}

/**
 * Pings the Supabase REST endpoint to check if the server is reachable.
 * Returns true if healthy, false if unreachable.
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) return false

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}
