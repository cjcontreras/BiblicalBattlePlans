import type { ReactNode } from 'react'
import type { BadgeVariant } from '../../types'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-terminal-gray-600
    text-terminal-gray-200
    border-terminal-gray-500
  `,
  success: `
    bg-military-green
    text-terminal-gray-100
    border-terminal-green
  `,
  warning: `
    bg-achievement-gold/20
    text-achievement-gold
    border-achievement-gold
  `,
  danger: `
    bg-alert-red-dim
    text-terminal-gray-100
    border-alert-red
  `,
  gold: `
    bg-achievement-gold
    text-terminal-dark
    border-achievement-gold
    shadow-[0_0_10px_var(--color-achievement-gold)]
  `,
}

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        font-mono font-medium
        border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

// Streak badge with special styling
interface StreakBadgeProps {
  days: number
  className?: string
}

export function StreakBadge({ days, className = '' }: StreakBadgeProps) {
  // Determine badge variant based on streak length
  const getVariant = (): BadgeVariant => {
    if (days >= 30) return 'gold'
    if (days >= 7) return 'success'
    if (days >= 3) return 'warning'
    return 'default'
  }

  const getLabel = (): string => {
    if (days >= 30) return 'LEGENDARY'
    if (days >= 14) return 'VETERAN'
    if (days >= 7) return 'WARRIOR'
    if (days >= 3) return 'SOLDIER'
    return 'RECRUIT'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getVariant()} size="md">
        {days} DAY{days !== 1 ? 'S' : ''}
      </Badge>
      <span className="text-xs font-mono text-terminal-gray-400">
        [{getLabel()}]
      </span>
    </div>
  )
}
