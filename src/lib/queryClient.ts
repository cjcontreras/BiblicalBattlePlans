import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep cached data longer for persistence)
      retry: 2, // Retry twice on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      refetchOnWindowFocus: true, // Refresh data when user returns to tab
      networkMode: 'offlineFirst', // Don't fail immediately if offline
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
})

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
