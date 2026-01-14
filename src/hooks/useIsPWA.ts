import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

/**
 * Detects if the app is running as an installed PWA (standalone mode)
 * or as a native Capacitor app vs running in a browser tab.
 *
 * Returns true if running as PWA or native app, false if running in browser
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(() => {
    // Native apps are always considered "installed"
    return Capacitor.isNativePlatform()
  })

  useEffect(() => {
    // Native apps are always "installed" - no need for detection
    if (Capacitor.isNativePlatform()) {
      setIsPWA(true)
      return
    }
    // Check if running in standalone mode (PWA)
    const isStandalone =
      // Standard check for most browsers
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari specific check
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
      // Check URL parameters (some PWAs launch with specific params)
      document.referrer.includes('android-app://') ||
      // Fullscreen mode (less common but possible PWA configuration)
      window.matchMedia('(display-mode: fullscreen)').matches

    setIsPWA(isStandalone)

    // Listen for display mode changes (e.g., if user installs while using)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handler = (e: MediaQueryListEvent) => setIsPWA(e.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isPWA
}
