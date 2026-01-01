import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { captureError } from './errorLogger'

// Global error handler for queries
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Only capture errors that have exhausted retries
    captureError(error, {
      component: 'QueryCache',
      action: query.queryKey.join('/'),
      extra: {
        queryKey: query.queryKey,
        state: query.state.status,
      },
    })
  },
})

// Global error handler for mutations
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    captureError(error, {
      component: 'MutationCache',
      action: mutation.options.mutationKey?.join('/') || 'unknown',
      extra: {
        mutationKey: mutation.options.mutationKey,
      },
    })
  },
})

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep cached data longer for persistence)
      retry: 2, // Retry twice on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      refetchOnWindowFocus: true, // Refresh data when user returns to tab
      // Use 'online' instead of 'offlineFirst' to prevent stale cache issues on PWA
      // This ensures queries fetch fresh data when network is available
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      // Use 'always' so mutations are queued when offline and run when back online
      networkMode: 'always',
    },
  },
})

/**
 * Clear all user-specific cached data.
 * Call this on auth state changes (sign in, sign out) to prevent stale data issues.
 * 
 * Issue: Query keys use user?.id || '' which can cache data with empty user IDs.
 * When a new user logs in, they might see stale cached data from previous sessions
 * or from the brief moment when user was null during auth initialization.
 */
export function clearUserCache() {
  // Remove all queries from the cache
  // This is the safest approach since user-specific data is tied to query keys
  // that include the user ID, and we want a fresh start on auth changes
  queryClient.clear()
  
  // Also clear the persisted cache to prevent stale data on next app load
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('biblical-battle-plans-cache')
    }
  } catch {
    // Ignore localStorage errors (e.g., in private browsing)
  }
}

// No-op storage fallback for environments without localStorage
const noopStorage: Storage = {
  length: 0,
  clear: () => {},
  getItem: () => null,
  key: () => null,
  removeItem: () => {},
  setItem: () => {},
}

// Safe storage getter for environments where localStorage might not be available
const getStorage = (): Storage => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test that localStorage actually works (can fail in private browsing)
      const testKey = '__storage_test__'
      window.localStorage.setItem(testKey, testKey)
      window.localStorage.removeItem(testKey)
      return window.localStorage
    }
  } catch {
    // localStorage not available or blocked
  }
  return noopStorage
}

// Persister to save cache to localStorage
export const persister = createSyncStoragePersister({
  storage: getStorage(),
  key: 'biblical-battle-plans-cache',
})

// Cache version - increment this to invalidate all user caches on deploy
// Changed: v2 - Fixed chapter counting for sectional/weekly plans
export const CACHE_BUSTER = 'v2'
