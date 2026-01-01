export type Platform = 'ios' | 'android' | 'desktop'

/**
 * Detects the user's platform (iOS, Android, or Desktop)
 * Detection is done synchronously to avoid flicker on initial render
 */
function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'ios'

  const userAgent = navigator.userAgent || navigator.vendor || ''

  // iOS detection - includes iPhone, iPad, iPod
  // Also check for iPad on iOS 13+ which reports as Mac
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (isIOS) return 'ios'

  // Android detection
  if (/android/i.test(userAgent)) return 'android'

  return 'ios'
}

/**
 * Detects the user's platform (iOS, Android, or Desktop)
 * Useful for showing platform-specific installation instructions
 */
export function usePlatform(): Platform {
  return detectPlatform()
}
