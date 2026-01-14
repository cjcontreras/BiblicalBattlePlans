import { useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

/**
 * Hook for haptic feedback on native platforms.
 * Provides different haptic patterns for various interactions.
 * No-ops on web platforms.
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
    } catch (error) {
      console.error('Haptics error:', error)
    }
  }, [isNative])

  /**
   * Medium impact - for standard interactions (button tap, checkbox)
   */
  const medium = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.impact({ style: ImpactStyle.Medium })
    } catch (error) {
      console.error('Haptics error:', error)
    }
  }, [isNative])

  /**
   * Heavy impact - for important interactions (completing reading, level up)
   */
  const heavy = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch (error) {
      console.error('Haptics error:', error)
    }
  }, [isNative])

  /**
   * Success notification - for positive actions (achievement unlocked, quest complete)
   */
  const success = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: NotificationType.Success })
    } catch (error) {
      console.error('Haptics error:', error)
    }
  }, [isNative])

  /**
   * Warning notification - for important alerts (streak at risk, etc.)
   */
  const warning = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: NotificationType.Warning })
    } catch (error) {
      console.error('Haptics error:', error)
    }
  }, [isNative])

  /**
   * Error notification - for errors (failed to save, etc.)
   */
  const error = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: NotificationType.Error })
    } catch (error) {
      console.error('Haptics error:', error)
    }
  }, [isNative])

  /**
   * Selection changed - for discrete value changes (slider, picker)
   */
  const selectionChanged = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.selectionChanged()
    } catch (error) {
      console.error('Haptics error:', error)
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
