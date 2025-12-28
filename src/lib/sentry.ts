import * as Sentry from '@sentry/react'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: `biblical-battle-plans@${__APP_VERSION__}`,

    // Performance monitoring (disabled for now to reduce overhead)
    tracesSampleRate: 0,

    // Session replay (disabled - not needed for error tracking)
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    // Only send errors, not all transactions
    beforeSend(event) {
      // Filter out non-error events
      if (!event.exception) {
        return null
      }
      return event
    },

    // Ignore common non-actionable errors
    ignoreErrors: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      // Network errors that aren't actionable
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // User-caused navigation
      'ResizeObserver loop',
      // Auth-related expected errors
      'Invalid login credentials',
      'Email not confirmed',
      // Service worker errors
      'Rejected',
      /ServiceWorker/i,
    ],

    // Limit breadcrumbs to reduce noise
    maxBreadcrumbs: 50,
  })
}

// Set user context when authenticated
export function setSentryUser(user: { id: string; email?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    })
  } else {
    Sentry.setUser(null)
  }
}

// Add custom context for debugging
export function setSentryContext(name: string, context: Record<string, unknown>) {
  Sentry.setContext(name, context)
}

// Re-export Sentry for direct access when needed
export { Sentry }
