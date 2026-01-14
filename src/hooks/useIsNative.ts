import { Capacitor } from '@capacitor/core'

/**
 * Detects if the app is running in a native Capacitor context (iOS/Android)
 * vs running in a browser (PWA or regular web).
 */
export function useIsNative(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Gets the current native platform ('ios', 'android', or 'web')
 */
export function useNativePlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
}

/**
 * Synchronous check for native platform (for use outside React components)
 */
export const isNative = Capacitor.isNativePlatform()
export const nativePlatform = Capacitor.getPlatform()
