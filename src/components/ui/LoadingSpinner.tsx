interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

interface LoadingOverlayProps {
  message?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  return (
    <div
      className={`font-mono text-terminal-green ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="animate-pulse">
        {'['}
        <span className="inline-block animate-spin" style={{ animationDuration: '1s' }}>
          |
        </span>
        {']'}
      </span>
    </div>
  )
}

// Alternative ASCII-style spinner
export function AsciiSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`font-mono text-terminal-green ${className}`}>
      <div className="flex items-center gap-1">
        <span>[</span>
        <span className="animate-pulse">LOADING</span>
        <span className="cursor-blink"></span>
        <span>]</span>
      </div>
    </div>
  )
}

// Full-screen loading overlay
export function LoadingOverlay({ message = 'INITIALIZING...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-terminal-dark/90 flex flex-col items-center justify-center z-50">
      <div className="text-center space-y-4">
        <div className="font-pixel text-terminal-green text-lg animate-pulse">
          {message}
        </div>
        <div className="font-mono text-terminal-green text-sm">
          {'['}
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.1}s infinite`,
              }}
            >
              ░
            </span>
          ))}
          {']'}
        </div>
      </div>
    </div>
  )
}

// Inline loading state for buttons/text
export function InlineLoading({ text = 'Processing' }: { text?: string }) {
  return (
    <span className="font-mono text-terminal-green">
      {text}
      <span className="animate-pulse">...</span>
    </span>
  )
}
