import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { queryClient } from '../lib/queryClient'
import { captureError } from '../lib/errorLogger'

/**
 * Parse a deep link URL and return the path to navigate to.
 * Handles URLs like:
 * - capacitor://localhost/guild/join/XXXXX
 * - biblicalbattleplans://guild/join/XXXXX (custom scheme - host becomes first path segment)
 */
function parseDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url)

    let path: string

    // For custom URL schemes like biblicalbattleplans://guild/join/XXXXX
    // The URL parser treats "guild" as the host, so we need to reconstruct the path
    if (parsed.protocol === 'biblicalbattleplans:') {
      // hostname = "guild", pathname = "/join/XXXXX"
      // Reconstruct: "/guild/join/XXXXX"
      path = '/' + parsed.hostname + parsed.pathname
    } else {
      // For capacitor://localhost/... URLs, pathname is correct
      path = parsed.pathname
    }

    // Validate it's a known route pattern
    if (path.startsWith('/guild/join/')) {
      return path
    }
    if (path.startsWith('/guild/')) {
      return path
    }
    if (path.startsWith('/dashboard')) {
      return path
    }
    if (path.startsWith('/profile')) {
      return path
    }
    if (path.startsWith('/plans')) {
      return path
    }

    // Unknown deep link - go to dashboard
    return null
  } catch {
    return null
  }
}

/**
 * Initializes Capacitor plugins and handles native app lifecycle events.
 * Should be called once at the app root level.
 */
export function useCapacitorApp() {
  const navigate = useNavigate()

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return
    }

    // Track if component is mounted to avoid race conditions
    let isMounted = true

    // Initialize native plugins
    const initializeNative = async () => {
      try {
        // Configure status bar (iOS)
        if (Capacitor.getPlatform() === 'ios') {
          await StatusBar.setStyle({ style: Style.Dark })
        }

        // Check if app was opened with a URL (cold start deep link)
        const launchUrl = await App.getLaunchUrl()
        if (launchUrl?.url && isMounted) {
          const path = parseDeepLink(launchUrl.url)
          if (path) {
            // Small delay to ensure router is ready
            setTimeout(() => {
              if (isMounted) navigate(path)
            }, 100)
          }
        }

        // Hide splash screen after app is ready
        await SplashScreen.hide()
      } catch (error) {
        captureError(error, { component: 'useCapacitorApp', action: 'initializeNative' })
      }
    }

    initializeNative()

    // Handle app state changes (foreground/background)
    // Store listener setup in async function to properly handle cleanup
    let appStateListener: any
    let backButtonListener: any
    let appUrlOpenListener: any

    const setupListeners = async () => {
      if (!isMounted) return

      appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
        // Only invalidate queries if component is still mounted
        if (isActive && isMounted) {
          // App came to foreground - refresh stale data
          // Only invalidate queries that are actually stale to avoid unnecessary refetches
          queryClient.invalidateQueries({ stale: true })
        }
      })

      // Handle back button (primarily for Android, but good to set up)
      backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
        }
        // At root of app - iOS doesn't have back button anyway
      })

      // Handle deep links when app is already running (warm start)
      appUrlOpenListener = await App.addListener('appUrlOpen', ({ url }) => {
        if (!isMounted) return
        const path = parseDeepLink(url)
        if (path) {
          navigate(path)
        }
      })
    }

    setupListeners()

    // Cleanup listeners on unmount
    return () => {
      isMounted = false
      if (appStateListener) appStateListener.remove()
      if (backButtonListener) backButtonListener.remove()
      if (appUrlOpenListener) appUrlOpenListener.remove()
    }
  }, [navigate])
}
