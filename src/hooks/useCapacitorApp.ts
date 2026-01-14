import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import { queryClient } from '../lib/queryClient'

/**
 * Initializes Capacitor plugins and handles native app lifecycle events.
 * Should be called once at the app root level.
 */
export function useCapacitorApp() {
  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return
    }

    // Initialize native plugins
    const initializeNative = async () => {
      try {
        // Configure status bar (iOS)
        if (Capacitor.getPlatform() === 'ios') {
          await StatusBar.setStyle({ style: Style.Dark })
        }

        // Hide splash screen after app is ready
        await SplashScreen.hide()
      } catch (error) {
        console.error('Error initializing native plugins:', error)
      }
    }

    initializeNative()

    // Handle app state changes (foreground/background)
    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App came to foreground - refresh stale data
        queryClient.invalidateQueries()
      }
    })

    // Handle back button (primarily for Android, but good to set up)
    const backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      }
      // At root of app - iOS doesn't have back button anyway
    })

    // Handle keyboard events (for proper input focus management)
    let keyboardShowListener: Promise<{ remove: () => void }> | null = null
    let keyboardHideListener: Promise<{ remove: () => void }> | null = null

    if (Capacitor.isPluginAvailable('Keyboard')) {
      keyboardShowListener = Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
      })

      keyboardHideListener = Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.setProperty('--keyboard-height', '0px')
      })
    }

    // Cleanup listeners on unmount
    return () => {
      appStateListener.then((listener) => listener.remove())
      backButtonListener.then((listener) => listener.remove())
      keyboardShowListener?.then((listener) => listener.remove())
      keyboardHideListener?.then((listener) => listener.remove())
    }
  }, [])
}
