import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatBlockProps {
  value: string | number
  label: string
  icon?: LucideIcon
  className?: string
}

export function StatBlock({ value, label, icon: Icon, className = '' }: StatBlockProps) {
  return (
    <div
      className={`
        bg-parchment-light
        border border-border-subtle
        p-4
        text-center
        shadow-[0_2px_4px_var(--shadow-color)]
        ${className}
      `}
    >
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon className="w-5 h-5 text-ink-muted" />
        </div>
      )}
      <div className="font-pixel text-xl text-ink mb-1">
        {value}
      </div>
      <div className="text-[0.5rem] font-pixel text-ink-muted uppercase tracking-wide">
        {label}
      </div>
    </div>
  )
}

// Grid wrapper for multiple stats
interface StatGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4 | 6
  className?: string
}

export function StatGrid({ children, columns = 3, className = '' }: StatGridProps) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }

  return (
    <div className={`grid ${colsClass[columns]} gap-3 ${className}`}>
      {children}
    </div>
  )
}

// Character-style stats display (like RPG character sheet)
interface CharacterStatsProps {
  stats: {
    label: string
    value: number | string
    max?: number
  }[]
  className?: string
}

export function CharacterStats({ stats, className = '' }: CharacterStatsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-[0.625rem] font-pixel text-ink-muted w-24 uppercase">
            {stat.label}
          </span>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-2 bg-parchment-light border border-border-subtle">
              {stat.max && (
                <div
                  className="h-full bg-gradient-to-r from-gold to-bronze"
                  style={{
                    width: `${(Number(stat.value) / stat.max) * 100}%`,
                  }}
                />
              )}
            </div>
            <span className="text-[0.625rem] font-pixel text-ink w-12 text-right">
              {stat.value}{stat.max ? `/${stat.max}` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
