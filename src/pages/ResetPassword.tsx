import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword, isRecoveryMode } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: AuthFormData) => {
    if (!data.password) return

    setIsLoading(true)
    setError(null)

    const { error } = await updatePassword(data.password)

    if (error) {
      // Provide helpful error messages
      let errorMessage = error.message

      if (error.message.includes('Auth session missing') || error.message.includes('session')) {
        errorMessage = 'Your password reset link has expired or is invalid. Please request a new password reset link from the login page.'
      } else if (error.message.includes('same password')) {
        errorMessage = 'New password must be different from your current password.'
      }

      setError(errorMessage)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }

  // Show error if not in recovery mode (user navigated directly without reset link)
  if (!isRecoveryMode && !success) {
    return (
      <div className="fixed inset-0 bg-parchment-dark flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <Card variant="elevated">
            <CardHeader>
              <h1 className="font-pixel text-sm text-ink text-center">
                INVALID SESSION
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="font-pixel text-[0.625rem] text-ink">
                No valid password reset session found.
              </p>
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                Please request a new password reset link from the login page.
              </p>
            </CardContent>

            <CardFooter className="text-center">
              <Link
                to="/forgot-password"
                className="font-pixel text-[0.625rem] text-gold hover:underline"
              >
                Request Password Reset
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-parchment-dark flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <Card variant="elevated">
            <CardHeader>
              <h1 className="font-pixel text-sm text-ink text-center">
                PASSWORD RESET
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success/20 border-2 border-success flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
              </div>
              <p className="font-pixel text-[0.625rem] text-ink">
                Your password has been reset successfully!
              </p>
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                Redirecting to login...
              </p>
            </CardContent>
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
              SET NEW PASSWORD
            </h1>
            <p className="font-pixel text-[0.625rem] text-ink-muted text-center mt-2">
              Enter your new password below
            </p>
          </CardHeader>

          <CardContent>
            <AuthForm
              mode="reset-password"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>

          <CardFooter className="text-center">
            <Link
              to="/login"
              className="font-pixel text-[0.625rem] text-ink-muted hover:text-gold transition-colors"
            >
              ← Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
