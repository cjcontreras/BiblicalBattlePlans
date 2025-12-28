import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Toaster } from 'sonner'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/auth'
import { Layout } from './components/Layout'
import { Landing, Login, Signup, ForgotPassword, ResetPassword, Dashboard, Plans, PlanDetail, ActivePlan, Profile, Acknowledgements } from './pages'
import { LoadingOverlay } from './components/ui'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    // Scroll to top on initial mount
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Scroll to top immediately and after a small delay to handle async content
    window.scrollTo(0, 0)
    // Use requestAnimationFrame to ensure scroll happens after render
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })
  }, [pathname])

  return null
}

function App() {
  const { initialize, isInitialized, user } = useAuth()

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/acknowledgements" element={<Acknowledgements />} />
        </Route>

        {/* Catch all - redirect appropriately */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
