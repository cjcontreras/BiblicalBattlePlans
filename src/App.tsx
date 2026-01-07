import { useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/auth'
import { Layout } from './components/Layout'
import { Landing, Login, Signup, ForgotPassword, ResetPassword, Dashboard, Plans, PlanDetail, ActivePlan, Profile, Acknowledgements, About, Feedback, GuildHub, Guild, GuildJoin } from './pages'
import { LoadingOverlay } from './components/ui'
import { queryClient } from './lib/queryClient'

/**
 * Handle tab visibility changes by invalidating stale queries.
 *
 * When a tab returns from background after 5+ seconds, we invalidate the
 * React Query cache to trigger refetches of potentially stale data.
 *
 * Token refresh is handled automatically by the Supabase client when needed -
 * even with autoRefreshToken disabled, it will refresh on API calls if expired.
 *
 * See: https://github.com/supabase/supabase-js/issues/1594
 */
function useTabRecoveryHandler() {
  const hiddenAtRef = useRef<number | null>(null)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
      } else if (document.visibilityState === 'visible' && hiddenAtRef.current) {
        const hiddenDuration = Date.now() - hiddenAtRef.current
        hiddenAtRef.current = null

        // If hidden for more than 5 seconds, invalidate queries to refresh stale data
        if (hiddenDuration > 5000) {
          queryClient.invalidateQueries()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
}

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  // Set scroll restoration to manual immediately on mount
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Scroll to top synchronously on route change using useLayoutEffect
  useLayoutEffect(() => {
    // Use multiple methods to ensure scroll works across all browsers
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0 // For Safari
  }, [pathname])

  return null
}

function App() {
  const { initialize, isInitialized, user } = useAuth()

  // Handle tab visibility changes with tiered recovery strategy
  useTabRecoveryHandler()

  useEffect(() => {
    initialize()
  }, [initialize])

  // Show loading only while initializing auth (not during sign in/out operations)
  if (!isInitialized) {
    return <LoadingOverlay message="INITIALIZING..." />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <SpeedInsights />
      <Analytics />
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: 'font-pixel text-[0.625rem]',
          style: {
            background: 'var(--color-parchment)',
            border: '2px solid var(--color-border)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-pixel)',
          },
        }}
      />
      <Routes>
        {/* Public landing page - redirect to dashboard if authenticated */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
        />

        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public info page */}
        <Route path="/about" element={<About />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/:id" element={<PlanDetail />} />
          <Route path="/campaign/:id" element={<ActivePlan />} />
          <Route path="/guild" element={<GuildHub />} />
          <Route path="/guild/:id" element={<Guild />} />
          <Route path="/guild/join/:code" element={<GuildJoin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/acknowledgements" element={<Acknowledgements />} />
          <Route path="/feedback" element={<Feedback />} />
        </Route>

        {/* Catch all - redirect appropriately */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
