import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    const { error } = await resetPassword(data.email)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-parchment-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card variant="elevated">
            <CardHeader>
              <h1 className="font-pixel text-sm text-ink text-center">
                RESET LINK SENT
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success/20 border-2 border-success flex items-center justify-center">
                  <Mail className="w-8 h-8 text-success" />
                </div>
              </div>
              <p className="font-pixel text-[0.625rem] text-ink">
                Check your email for password reset instructions.
              </p>
              <p className="font-pixel text-[0.5rem] text-ink-muted">
                The link will expire in 1 hour.
              </p>
            </CardContent>

            <CardFooter className="text-center">
              <Link
                to="/login"
                className="font-pixel text-[0.625rem] text-gold hover:underline"
              >
                Return to Login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
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
              RECOVER ACCESS
            </h1>
            <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-2">
              Enter your email to receive reset instructions
            </p>
          </CardHeader>

          <CardContent>
            <AuthForm
              mode="forgot-password"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>

          <CardFooter className="text-center">
            <Link
              to="/login"
              className="font-pixel text-[0.5rem] text-ink-muted hover:text-gold transition-colors"
            >
              ← Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
