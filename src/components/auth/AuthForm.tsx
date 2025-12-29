import { useState, type FormEvent } from 'react'
import { Input, Button } from '../ui'

interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password' | 'reset-password'
  onSubmit: (data: AuthFormData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export interface AuthFormData {
  email: string
  password?: string
  username?: string
  displayName?: string
}

export function AuthForm({ mode, onSubmit, isLoading = false, error }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validation
    if (mode !== 'reset-password' && !email) {
      setValidationError('Email is required')
      return
    }

    if (mode !== 'forgot-password' && mode !== 'reset-password' && !password) {
      setValidationError('Password is required')
      return
    }

    if (mode === 'reset-password') {
      if (!password) {
        setValidationError('Password is required')
        return
      }

      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match')
        return
      }
    }

    if (mode === 'signup') {
      if (!displayName) {
        setValidationError('Display name is required')
        return
      }

      if (!username) {
        setValidationError('Username is required')
        return
      }

      if (username.length < 3) {
        setValidationError('Username must be at least 3 characters')
        return
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setValidationError('Username can only contain letters, numbers, and underscores')
        return
      }

      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters')
        return
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match')
        return
      }
    }

    await onSubmit({
      email,
      password: mode !== 'forgot-password' ? password : undefined,
      username: mode === 'signup' ? username : undefined,
      displayName: mode === 'signup' ? displayName : undefined,
    })
  }

  const displayError = validationError || error

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <>
          <Input
            label="Display Name"
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, ''))}
            placeholder="The_Rock"
            disabled={isLoading}
            required
            hint="Your nickname (use underscores, no spaces)"
          />
          <Input
            label="Username"
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''))}
            placeholder="firstname_lastname"
            disabled={isLoading}
            required
            hint="Your name (e.g., simon_peter, no spaces)"
          />
        </>
      )}

      {mode !== 'reset-password' && (
        <Input
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isLoading}
          required
        />
      )}

      {mode !== 'forgot-password' && (
        <Input
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          required
        />
      )}

      {(mode === 'signup' || mode === 'reset-password') && (
        <Input
          label="Confirm Password"
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isLoading}
          required
        />
      )}

      {displayError && (
        <div className="p-3 bg-danger/10 border border-danger">
          <p className="font-pixel text-[0.5rem] text-danger">
            ERROR: {displayError}
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        {mode === 'login' && 'LOGIN'}
        {mode === 'signup' && 'ENLIST'}
        {mode === 'forgot-password' && 'SEND RESET LINK'}
        {mode === 'reset-password' && 'RESET PASSWORD'}
      </Button>
    </form>
  )
}
