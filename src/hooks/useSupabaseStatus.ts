import { create } from 'zustand'
import { checkSupabaseHealth } from '../lib/networkError'
import { queryClient } from '../lib/queryClient'

interface SupabaseStatusState {
  isOutage: boolean
  lastHealthy: Date | null
  isChecking: boolean
}

interface SupabaseStatusActions {
  reportNetworkError: () => void
  checkHealth: () => Promise<boolean>
  startRecoveryPolling: () => () => void
}

type SupabaseStatusStore = SupabaseStatusState & SupabaseStatusActions

export const useSupabaseStatus = create<SupabaseStatusStore>((set, get) => ({
  isOutage: false,
  lastHealthy: null,
  isChecking: false,

  reportNetworkError: () => {
    const { isChecking } = get()
    if (isChecking) return
    get().checkHealth()
  },

  checkHealth: async () => {
    set({ isChecking: true })
    const healthy = await checkSupabaseHealth()

    const wasOutage = get().isOutage

    if (healthy) {
      set({
        isOutage: false,
        lastHealthy: new Date(),
        isChecking: false,
      })

      // On recovery, invalidate all queries so they refetch
      if (wasOutage) {
        queryClient.invalidateQueries()
      }
    } else {
      set({
        isOutage: true,
        isChecking: false,
      })
    }

    return healthy
  },

  startRecoveryPolling: () => {
    const interval = setInterval(() => {
      const { isOutage, isChecking } = get()
      if (!isOutage) {
        clearInterval(interval)
        return
      }
      if (!isChecking) {
        get().checkHealth()
      }
    }, 15_000)

    return () => clearInterval(interval)
  },
}))

// Selector for components that only need the boolean
export const useIsOutage = () => useSupabaseStatus((s) => s.isOutage)
