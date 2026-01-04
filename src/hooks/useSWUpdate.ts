import { useState, useEffect, useCallback, useRef } from 'react'
import { registerSW } from 'virtual:pwa-register'

interface SWUpdateState {
  needRefresh: boolean
  offlineReady: boolean
  updateServiceWorker: () => Promise<void>
  close: () => void
}

/**
 * Hook to detect and handle service worker updates.
 *
 * When a new version of the app is available, `needRefresh` becomes true.
 * Call `updateServiceWorker()` to apply the update and reload the page.
 * Call `close()` to dismiss the update prompt (user can update later).
 */
export function useSWUpdate(): SWUpdateState {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const updateSWRef = useRef<(() => Promise<void>) | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true)
      },
      onOfflineReady() {
        setOfflineReady(true)
      },
      onRegisteredSW(_swUrl, registration) {
        // Check for updates periodically (every 60 minutes)
        if (registration) {
          intervalRef.current = setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        }
      },
    })

    updateSWRef.current = updateServiceWorker

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleUpdate = useCallback(async () => {
    if (updateSWRef.current) {
      await updateSWRef.current()
    }
  }, [])

  const close = useCallback(() => {
    setNeedRefresh(false)
    setOfflineReady(false)
  }, [])

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: handleUpdate,
    close,
  }
}
