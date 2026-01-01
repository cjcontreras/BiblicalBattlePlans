interface ProgressBarProps {
  value: number // 0-100
  max?: number
  showLabel?: boolean
  label?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showBlocks?: boolean
  className?: string
}

const variantColors = {
  default: 'bg-gradient-to-r from-sage to-sage-light',
  success: 'bg-gradient-to-r from-sage to-sage-light',
  warning: 'bg-gradient-to-r from-warning to-gold',
  danger: 'bg-gradient-to-r from-danger to-danger-dark',
}

const sizeStyles = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  label,
  variant = 'default',
  size = 'md',
  showBlocks = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  // Block-style progress (optional retro look)
  if (showBlocks) {
    const blockCount = 10
    const filledBlocks = Math.round((percentage / 100) * blockCount)

    return (
      <div className={`w-full ${className}`}>
        {(showLabel || label) && (
          <div className="flex justify-between mb-1 text-[0.625rem] font-pixel">
            <span className="text-ink-muted">{label || 'PROGRESS'}</span>
            <span className="text-sage">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className="flex gap-0.5">
          {Array.from({ length: blockCount }).map((_, i) => (
            <div
              key={i}
              className={`
                flex-1 h-3
                border border-border-subtle
                transition-colors duration-150
                ${i < filledBlocks 
                  ? variant === 'success' 
                    ? 'bg-sage' 
                    : variant === 'warning'
                    ? 'bg-warning'
                    : variant === 'danger'
                    ? 'bg-danger'
                    : 'bg-sage'
                  : 'bg-parchment-light'
                }
              `}
            />
          ))}
        </div>
      </div>
    )
  }

  // Smooth progress bar (default)
  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-[0.625rem] font-pixel">
          <span className="text-ink-muted">{label || 'PROGRESS'}</span>
          <span className="text-sage">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`
          w-full
          bg-parchment-light
          border border-border-subtle
          overflow-hidden
          ${sizeStyles[size]}
        `}
      >
        <div
          className={`
            h-full
            ${variantColors[variant]}
            transition-all duration-300 ease-out
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Block Progress for multi-item tracking (like reading lists)
interface BlockProgressProps {
  completed: number
  total: number
  labels?: string[]
  className?: string
}

export function BlockProgress({
  completed,
  total,
  labels,
  className = '',
}: BlockProgressProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`
            w-6 h-6
            flex items-center justify-center
            text-[0.625rem] font-pixel
            border
            transition-all duration-150
            ${
              i < completed
                ? 'bg-sage border-sage-dark text-white'
                : 'bg-parchment-light border-border-subtle text-ink-muted'
            }
          `}
          title={labels?.[i]}
        >
          {i < completed ? '✓' : i + 1}
        </div>
      ))}
    </div>
  )
}
