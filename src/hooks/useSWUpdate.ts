import { useState, useEffect, useCallback } from 'react'
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
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null)

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
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)
        }
      },
    })

    setUpdateSW(() => updateServiceWorker)
  }, [])

  const handleUpdate = useCallback(async () => {
    if (updateSW) {
      await updateSW()
    }
  }, [updateSW])

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
