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

    const { error } = await signIn(data.email, data.password!)

    if (error) {
      // Provide helpful error messages
      let errorMessage = error.message

      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (error.message.includes('Email not confirmed') || error.message.includes('400')) {
        errorMessage = 'Email not confirmed. Please check your inbox and click the confirmation link before logging in.'
      }

      setError(errorMessage)
      setIsLoading(false)
    }
    // Don't navigate here - let the useEffect handle it when user state updates
  }

  return (
    <div className="min-h-screen bg-terminal-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ASCII Art Logo */}
        <pre className="text-terminal-green text-xs mb-6 text-center font-mono overflow-hidden">
{`
 ╔══════════════════════════════════╗
 ║   BIBLICAL BATTLE PLANS          ║
 ║   ━━━━━━━━━━━━━━━━━━━━           ║
 ║   "The sword of the Spirit"      ║
 ╚══════════════════════════════════╝
`}
        </pre>

        <Card>
          <CardHeader>
            <h1 className="text-xl font-pixel text-terminal-green text-center">
              SOLDIER LOGIN
            </h1>
            <p className="text-terminal-gray-400 text-sm text-center mt-2">
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
                <div className="w-full border-t border-terminal-gray-500" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-terminal-darker text-terminal-gray-400">
                  OR
                </span>
              </div>
            </div>

            <GoogleAuthButton />
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-terminal-gray-400 hover:text-terminal-green transition-colors"
            >
              {'> Forgot password?'}
            </Link>
            <p className="text-terminal-gray-400">
              New recruit?{' '}
              <Link
                to="/signup"
                className="text-terminal-green hover:underline"
              >
                Enlist here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-terminal-gray-500 text-xs text-center mt-6">
          "Put on the full armor of God" - Ephesians 6:11
        </p>
      </div>
    </div>
  )
}
