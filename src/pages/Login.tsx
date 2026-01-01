import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, GoogleAuthButton, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  // Auto-redirect when user becomes authenticated
  useEffect(() => {
    if (user && !error) {
      // Blur active element to close mobile keyboard before navigating
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      navigate(from, { replace: true })
    }
  }, [user, error, navigate, from])

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)
    setEmailNotConfirmed(false)

    try {
      const { error } = await signIn(data.email, data.password!)

      if (error) {
        // Check if this is an email confirmation issue
        const errorMessage = error.message?.toLowerCase() || ''
        const isEmailNotConfirmed =
          errorMessage.includes('email not confirmed') ||
          errorMessage.includes('email not verified') ||
          errorMessage.includes('confirm your email')

        if (isEmailNotConfirmed) {
          setEmailNotConfirmed(true)
          setIsLoading(false)
          return
        }

        // For "Invalid login credentials", this could be wrong password OR unconfirmed email
        // Supabase returns this generic message for security (prevent email enumeration)
        if (errorMessage.includes('invalid login credentials')) {
          setError('Invalid email or password. If you recently signed up, make sure you confirmed your email first.')
          setIsLoading(false)
          return
        }

        // Show any other error message
        setError(error.message || 'An error occurred. Please try again.')
        setIsLoading(false)
      }
      // Success case: isLoading will remain true while useEffect handles navigation
      // This is intentional - keeps the button in loading state during redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  if (emailNotConfirmed) {
    return (
      <div className="fixed inset-0 bg-parchment-dark flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <Card variant="elevated">
            <CardHeader>
              <h1 className="font-pixel text-sm text-ink text-center">
                EMAIL NOT CONFIRMED
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-warning/20 border-2 border-warning flex items-center justify-center">
                  <Mail className="w-8 h-8 text-warning" />
                </div>
              </div>

              <div className="p-4 bg-warning/10 border border-warning text-left space-y-2">
                <p className="font-pixel text-[0.625rem] text-warning">
                  ACTION REQUIRED
                </p>
                <p className="font-pixel text-[0.625rem] text-ink">
                  You must confirm your email address before you can login.
                </p>
                <p className="font-pixel text-[0.625rem] text-ink-muted">
                  Check your inbox (and spam folder) for a confirmation link from us.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 text-center">
              <button
                onClick={() => setEmailNotConfirmed(false)}
                className="font-pixel text-[0.625rem] text-gold hover:underline"
              >
                I've confirmed my email — Try again
              </button>
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                Didn't receive an email?{' '}
                <Link
                  to="/signup"
                  className="text-gold hover:underline"
                >
                  Try signing up again
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-parchment-dark flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Logo - links back to landing page */}
        <Link to="/" className="flex flex-col items-center mb-8 group">
          <div className="w-20 h-20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <img src="/BiblicalBattlePlansLogo.png" alt="Biblical Battle Plans" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-pixel text-[0.75rem] text-ink text-center group-hover:text-sage transition-colors">BIBLICAL BATTLE PLANS</h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted text-center mt-1">"The sword of the Spirit"</p>
        </Link>

        <Card variant="elevated">
          <CardHeader>
            <h1 className="font-pixel text-sm text-ink text-center">
              HERO LOGIN
            </h1>
            <p className="font-pixel text-[0.625rem] text-ink-muted text-center mt-2">
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
                <span className="px-3 bg-parchment font-pixel text-[0.625rem] text-ink-muted">
                  OR
                </span>
              </div>
            </div>

            <GoogleAuthButton />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center">
            <Link
              to="/forgot-password"
              className="font-pixel text-[0.625rem] text-ink-muted hover:text-gold transition-colors"
            >
              Forgot password?
            </Link>
            <p className="font-pixel text-[0.625rem] text-ink-muted">
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

        <p className="font-pixel text-[0.625rem] text-ink-muted text-center mt-6">
          "Put on the full armor of God" — Ephesians 6:11
        </p>
      </div>
    </div>
  )
}
