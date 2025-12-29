import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { AuthForm, GoogleAuthButton, type AuthFormData } from '../components/auth'
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui'

export function Signup() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setError(null)

    const { error } = await signUp(data.email, data.password!, data.username!, data.displayName!)

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
      <div className="fixed inset-0 bg-parchment-dark flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <Card variant="elevated">
            <CardHeader>
              <h1 className="font-pixel text-sm text-ink text-center">
                ENLISTMENT RECEIVED
              </h1>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-success/20 border-2 border-success flex items-center justify-center">
                  <Mail className="w-8 h-8 text-success" />
                </div>
              </div>
              <p className="font-pixel text-[0.625rem] text-ink">
                Check your email to confirm your account!
              </p>

              <div className="p-4 bg-warning/10 border border-warning text-left space-y-2">
                <p className="font-pixel text-[0.625rem] text-warning">
                  IMPORTANT
                </p>
                <p className="font-pixel text-[0.5rem] text-ink">
                  You must click the confirmation link in your email before you can login.
                </p>
                <p className="font-pixel text-[0.5rem] text-ink-muted">
                  Check your spam folder if you don't see it within a few minutes.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 text-center">
              <Link
                to="/login"
                className="font-pixel text-[0.625rem] text-gold hover:underline"
              >
                I've confirmed my email — Go to Login
              </Link>
              <p className="font-pixel text-[0.5rem] text-ink-muted">
                Didn't receive an email? Check spam or try signing up again.
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
          <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-1">"The sword of the Spirit"</p>
        </Link>

        <Card variant="elevated">
          <CardHeader>
            <h1 className="font-pixel text-sm text-ink text-center">
              ENLIST NOW
            </h1>
            <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-2">
              Join the ranks and begin your quest
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <AuthForm
              mode="signup"
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

          <CardFooter className="text-center">
            <p className="font-pixel text-[0.5rem] text-ink-muted">
              Already enlisted?{' '}
              <Link
                to="/login"
                className="text-gold hover:underline"
              >
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="font-pixel text-[0.5rem] text-ink-muted text-center mt-6">
          "Fight the good fight of faith" — 1 Timothy 6:12
        </p>
      </div>
    </div>
  )
}
