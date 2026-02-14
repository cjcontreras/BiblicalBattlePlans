import { lazy, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/auth'
import { Layout } from './components/Layout'
import { Landing, Login, Signup, ForgotPassword, ResetPassword, About } from './pages'
import { LoadingOverlay, LoadingSpinner } from './components/ui'
import { OutageBanner } from './components/OutageBanner'
import { RouteErrorBoundary } from './components/ErrorBoundary'
import { queryClient } from './lib/queryClient'

// Lazy-loaded protected routes (code-split into separate chunks)
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Plans = lazy(() => import('./pages/Plans').then(m => ({ default: m.Plans })))
const PlanDetail = lazy(() => import('./pages/PlanDetail').then(m => ({ default: m.PlanDetail })))
const ActivePlan = lazy(() => import('./pages/ActivePlan').then(m => ({ default: m.ActivePlan })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const Acknowledgements = lazy(() => import('./pages/Acknowledgements').then(m => ({ default: m.Acknowledgements })))
const Feedback = lazy(() => import('./pages/Feedback').then(m => ({ default: m.Feedback })))
const GuildHub = lazy(() => import('./pages/GuildHub').then(m => ({ default: m.GuildHub })))
const Guild = lazy(() => import('./pages/Guild').then(m => ({ default: m.Guild })))
const GuildJoin = lazy(() => import('./pages/GuildJoin').then(m => ({ default: m.GuildJoin })))

const lazyFallback = (
  <div className="flex justify-center pt-16">
    <LoadingSpinner size="lg" />
  </div>
)

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={lazyFallback}>
        {children}
      </Suspense>
    </RouteErrorBoundary>
  )
}

/**
 * Handle tab visibility changes by invalidating stale queries.
 *
 * When a tab returns from background after 5+ seconds, we invalidate the
 * React Query cache to trigger refetches of potentially stale data.
 *
 * Token refresh is handled on-demand by safeQuery() - when a query fails
 * due to an expired token, it calls refreshSession() and retries.
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
    return (
      <>
        <OutageBanner />
        <LoadingOverlay message="INITIALIZING..." />
      </>
    )
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <SpeedInsights />
      <Analytics />
      <OutageBanner />
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
          <Route path="/dashboard" element={<LazyRoute><Dashboard /></LazyRoute>} />
          <Route path="/plans" element={<LazyRoute><Plans /></LazyRoute>} />
          <Route path="/plans/:id" element={<LazyRoute><PlanDetail /></LazyRoute>} />
          <Route path="/campaign/:id" element={<LazyRoute><ActivePlan /></LazyRoute>} />
          <Route path="/guild" element={<LazyRoute><GuildHub /></LazyRoute>} />
          <Route path="/guild/:id" element={<LazyRoute><Guild /></LazyRoute>} />
          <Route path="/guild/join/:code" element={<LazyRoute><GuildJoin /></LazyRoute>} />
          <Route path="/profile" element={<LazyRoute><Profile /></LazyRoute>} />
          <Route path="/acknowledgements" element={<LazyRoute><Acknowledgements /></LazyRoute>} />
          <Route path="/feedback" element={<LazyRoute><Feedback /></LazyRoute>} />
        </Route>

        {/* Catch all - redirect appropriately */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
