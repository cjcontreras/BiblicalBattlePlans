import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, GoogleAuthButton, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  // Auto-redirect when user becomes authenticated
  useEffect(() => {
    if (user && !error) {
      navigate(from, { replace: true })
    }
  }, [user, error, navigate, from])

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(data.email, data.password!)

      if (error) {
        // Provide helpful error messages
        let errorMessage = error.message

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Please check your inbox and click the confirmation link before logging in.'
        } else if (error.message.includes('Email not verified')) {
          errorMessage = 'Email not verified. Please check your inbox and click the verification link before logging in.'
        } else if ('status' in error && error.status === 400 || error.message.includes('400')) {
          errorMessage = 'Unable to sign in. This may be because your email is not confirmed yet. Please check your inbox for a confirmation link.'
        }

        setError(errorMessage)
        setIsLoading(false)
      }
    } catch (err) {
      // Catch any unexpected errors
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
    }
    // Don't navigate here - let the useEffect handle it when user state updates
  }

  return (
    <div className="min-h-screen bg-parchment-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Placeholder */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-gold to-bronze border-2 border-gold-dark flex items-center justify-center shadow-[0_4px_12px_var(--shadow-color)] mb-4">
            <span className="font-pixel text-sm text-ink">BBP</span>
          </div>
          <h1 className="font-pixel text-[0.75rem] text-ink text-center">BIBLICAL BATTLE PLANS</h1>
          <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-1">"The sword of the Spirit"</p>
        </div>

        <Card variant="elevated">
          <CardHeader>
            <h1 className="font-pixel text-sm text-ink text-center">
              HERO LOGIN
            </h1>
            <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-2">
              Enter your credentials to continue
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <AuthForm
              mode="login"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-subtle" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-parchment font-pixel text-[0.5rem] text-ink-muted">
                  OR
                </span>
              </div>
            </div>

            <GoogleAuthButton />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center">
            <Link
              to="/forgot-password"
              className="font-pixel text-[0.5rem] text-ink-muted hover:text-gold transition-colors"
            >
              Forgot password?
            </Link>
            <p className="font-pixel text-[0.5rem] text-ink-muted">
              New hero?{' '}
              <Link
                to="/signup"
                className="text-gold hover:underline"
              >
                Enlist here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-6">
          "Put on the full armor of God" — Ephesians 6:11
        </p>
      </div>
    </div>
  )
}
