import type { ReactNode } from 'react'
import { Flame } from 'lucide-react'
import type { BadgeVariant } from '../../types'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: `
    bg-parchment-light
    text-ink
    border-border-subtle
  `,
  success: `
    bg-sage
    text-white
    border-sage-dark
  `,
  warning: `
    bg-warning
    text-ink
    border-gold-dark
  `,
  danger: `
    bg-danger
    text-white
    border-danger-dark
  `,
  gold: `
    bg-gradient-to-r from-sage to-sage-light
    text-white
    border-sage-dark
  `,
}

const sizeStyles = {
  sm: 'px-2 py-1 text-[0.625rem]',
  md: 'px-3 py-1.5 text-[0.75rem]',
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
        font-pixel
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
    if (days >= 90) return 'LEGENDARY'
    if (days >= 60) return 'VETERAN'
    if (days >= 30) return 'WARRIOR'
    if (days >= 7) return 'SOLDIER'
    return 'RECRUIT'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Badge variant={getVariant()} size="md">
        <Flame className="w-4 h-4 text-orange-500" /> {days} DAY{days !== 1 ? 'S' : ''}
      </Badge>
      <span className="text-[0.625rem] font-pixel text-ink-muted">
        [{getLabel()}]
      </span>
    </div>
  )
}
