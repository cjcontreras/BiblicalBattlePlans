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

/**
 * Handle tab visibility changes to prevent Supabase client corruption.
 *
 * Issue: Supabase JS client promises hang after browser tab is suspended/backgrounded.
 * HTTP requests complete successfully but the JS promise never resolves due to
 * internal client state corruption from browser throttling.
 *
 * The ONLY reliable fix is a full page reload to get a fresh Supabase client.
 * See: https://github.com/supabase/auth-js/issues/1594
 */
function useTabVisibilityHandler() {
  const hiddenAtRef = useRef<number | null>(null)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now()
      } else if (document.visibilityState === 'visible' && hiddenAtRef.current) {
        const hiddenDuration = Date.now() - hiddenAtRef.current
        hiddenAtRef.current = null

        // Reload on any meaningful tab switch to get fresh Supabase client
        // Even very short switches (< 1 second) can corrupt the client
        if (hiddenDuration > 300) {
          window.location.reload()
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

  // Handle tab visibility changes to prevent Supabase client corruption
  useTabVisibilityHandler()

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
