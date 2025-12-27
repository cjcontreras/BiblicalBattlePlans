import { BookOpen, Flame, Star, Calendar, Swords, Trophy, type LucideIcon } from 'lucide-react'
import { Card } from '../ui'
import type { UserStats } from '../../types'

interface ProfileStatsProps {
  stats: UserStats
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <Card noPadding>
      <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
        <div className="font-pixel text-[0.625rem] text-ink">
          STATS
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard
            label="CHAPTERS READ"
            value={stats.total_chapters_read}
            icon={BookOpen}
          />
          <StatCard
            label="CURRENT STREAK"
            value={stats.current_streak}
            suffix=" days"
            icon={Flame}
          />
          <StatCard
            label="LONGEST STREAK"
            value={stats.longest_streak}
            suffix=" days"
            icon={Star}
          />
          <StatCard
            label="DAYS READING"
            value={stats.total_days_reading}
            icon={Calendar}
          />
          <StatCard
            label="ACTIVE QUESTS"
            value={stats.plans_active}
            icon={Swords}
          />
          <StatCard
            label="QUESTS COMPLETE"
            value={stats.plans_completed}
            icon={Trophy}
          />
        </div>
      </div>
    </Card>
  )
}

function StatCard({
  label,
  value,
  suffix = '',
  icon: Icon,
}: {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
}) {
  return (
    <div className="p-4 bg-parchment-light border border-border-subtle text-center shadow-[0_2px_4px_var(--shadow-color)]">
      <div className="flex justify-center mb-2">
        <Icon className="w-5 h-5 text-ink-muted" />
      </div>
      <div className="font-pixel text-lg text-ink">
        {value}
        {suffix && <span className="text-[0.625rem]">{suffix}</span>}
      </div>
      <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">{label}</div>
    </div>
  )
}
