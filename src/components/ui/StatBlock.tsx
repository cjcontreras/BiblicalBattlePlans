import type { ReactNode } from 'react'

interface StatBlockProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

interface StatGridProps {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatBlock({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = '',
}: StatBlockProps) {
  const trendColors = {
    up: 'text-terminal-green',
    down: 'text-alert-red',
    neutral: 'text-terminal-gray-400',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <div
      className={`
        bg-terminal-darker
        border-2 border-terminal-gray-500
        p-4
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-terminal-gray-400 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-terminal-green">{icon}</span>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-pixel text-terminal-green">
          {value}
        </span>
        {trend && trendValue && (
          <span className={`text-sm font-mono ${trendColors[trend]}`}>
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}

export function StatGrid({
  children,
  columns = 2,
  className = '',
}: StatGridProps) {
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }

  return (
    <div className={`grid gap-4 ${columnClasses[columns]} ${className}`}>
      {children}
    </div>
  )
}

// RPG-style character stat display
interface CharacterStatsProps {
  stats: {
    label: string
    value: number
    max?: number
  }[]
  className?: string
}

export function CharacterStats({ stats, className = '' }: CharacterStatsProps) {
  return (
    <div className={`space-y-2 font-mono ${className}`}>
      {stats.map(({ label, value, max }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-24 text-terminal-gray-300 text-sm uppercase">
            {label}
          </span>
          <span className="text-terminal-green font-bold min-w-[3ch] text-right">
            {value}
          </span>
          {max !== undefined && (
            <>
              <span className="text-terminal-gray-500">/</span>
              <span className="text-terminal-gray-400">{max}</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
