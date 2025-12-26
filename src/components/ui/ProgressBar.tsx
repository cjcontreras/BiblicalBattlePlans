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
  default: 'bg-terminal-green',
  success: 'bg-military-green',
  warning: 'bg-achievement-gold',
  danger: 'bg-alert-red',
}

const sizeStyles = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  label,
  variant = 'default',
  size = 'md',
  showBlocks = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const blockCount = 20 // Number of blocks in the bar
  const filledBlocks = Math.round((percentage / 100) * blockCount)

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-sm font-mono">
          <span className="text-terminal-gray-200">{label || 'Progress'}</span>
          <span className="text-terminal-green">{Math.round(percentage)}%</span>
        </div>
      )}

      {showBlocks ? (
        // Pixel/Block style progress bar
        <div className="flex gap-0.5 font-mono text-xs">
          <span className="text-terminal-gray-400">[</span>
          {Array.from({ length: blockCount }).map((_, i) => (
            <span
              key={i}
              className={`
                ${i < filledBlocks ? 'text-terminal-green' : 'text-terminal-gray-600'}
                transition-colors duration-100
              `}
            >
              {i < filledBlocks ? '█' : '░'}
            </span>
          ))}
          <span className="text-terminal-gray-400">]</span>
        </div>
      ) : (
        // Smooth progress bar
        <div
          className={`
            w-full
            bg-terminal-gray-600
            border border-terminal-gray-500
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
      )}
    </div>
  )
}

// Alternative: Individual block progress for Horner's 10-list tracking
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
            text-xs font-mono
            border-2
            transition-all duration-150
            ${
              i < completed
                ? 'bg-terminal-green border-terminal-green text-terminal-dark'
                : 'bg-transparent border-terminal-gray-500 text-terminal-gray-400'
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
