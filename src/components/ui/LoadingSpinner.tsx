interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        border-4 border-parchment-light
        border-t-gold
        animate-spin
        ${className}
      `}
      style={{ borderRadius: '0' }}
    />
  )
}

// Pixel-style ASCII spinner
export function AsciiSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`font-pixel text-gold animate-spin-pixel ${className}`}>
      ◢
    </div>
  )
}

// Full-screen loading overlay
interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'LOADING...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-parchment-dark flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        {/* Pixel-style loading animation */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gold"
              style={{
                animation: `pulse-subtle 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        
        <p className="font-pixel text-[0.75rem] text-ink animate-pulse-subtle">
          {message}
        </p>
      </div>
    </div>
  )
}

// Inline loading indicator
export function InlineLoading({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted ${className}`}>
      <span className="animate-pulse-subtle">●</span>
      <span className="animate-pulse-subtle" style={{ animationDelay: '0.2s' }}>●</span>
      <span className="animate-pulse-subtle" style={{ animationDelay: '0.4s' }}>●</span>
    </span>
  )
}
