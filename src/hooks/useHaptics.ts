import { useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { captureError } from '../lib/errorLogger'

/**
 * Hook for haptic feedback on native platforms.
 * Provides different haptic patterns for various interactions.
 * No-ops on web platforms. Errors are silently captured - haptics
 * should never interrupt the user experience.
 */
export function useHaptics() {
  const isNative = Capacitor.isNativePlatform()

  /**
   * Light impact - for subtle interactions (button hover, selection)
   */
  const light = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.impact({ style: ImpactStyle.Light })
    } catch (err) {
      // Silently capture - haptic failures shouldn't disrupt UX
      captureError(err, { component: 'useHaptics', action: 'light' })
    }
  }, [isNative])

  /**
   * Medium impact - for standard interactions (button tap, checkbox)
   */
  const medium = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (err) {
      captureError(err, { component: 'useHaptics', action: 'medium' })
    }
  }, [isNative])

  /**
   * Heavy impact - for important interactions (completing reading, level up)
   */
  const heavy = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch (err) {
      captureError(err, { component: 'useHaptics', action: 'heavy' })
    }
  }, [isNative])

  /**
   * Success notification - for positive actions (achievement unlocked, quest complete)
   */
  const success = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: NotificationType.Success })
    } catch (err) {
      captureError(err, { component: 'useHaptics', action: 'success' })
    }
  }, [isNative])

  /**
   * Warning notification - for important alerts (streak at risk, etc.)
   */
  const warning = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: NotificationType.Warning })
    } catch (err) {
      captureError(err, { component: 'useHaptics', action: 'warning' })
    }
  }, [isNative])

  /**
   * Error notification - for errors (failed to save, etc.)
   */
  const error = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: NotificationType.Error })
    } catch (err) {
      captureError(err, { component: 'useHaptics', action: 'error' })
    }
  }, [isNative])

  /**
   * Selection changed - for discrete value changes (slider, picker)
   */
  const selectionChanged = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.selectionChanged()
    } catch (err) {
      captureError(err, { component: 'useHaptics', action: 'selectionChanged' })
    }
  }, [isNative])

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selectionChanged,
  }
}
