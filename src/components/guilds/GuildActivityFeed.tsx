import { useMemo } from 'react'
import { BookOpen, Flame, Shield, UserPlus, Trophy, RefreshCw } from 'lucide-react'
import { useGuildActivities } from '../../hooks/useGuildActivities'
import { LoadingSpinner } from '../ui'
import type { GuildActivity, GuildActivityType, GuildMember, Profile } from '../../types'

interface GuildActivityFeedProps {
  guildId: string
  members: (GuildMember & { profile: Profile })[]
}

// Activity type configurations
const activityConfig: Record<
  GuildActivityType,
  {
    icon: typeof BookOpen
    color: string
    getMessage: (activity: GuildActivity) => string
  }
> = {
  reading_completed: {
    icon: BookOpen,
    color: 'text-sage',
    getMessage: (a) => {
      const { plan_name, day_number, chapters_read } = a.metadata
      const chapterCount = chapters_read || 1
      const chapterText = `${chapterCount} chapter${chapterCount > 1 ? 's' : ''}`
      
      // For Free Reading / Apocrypha Reading plans, show chapter count instead of day
      if (plan_name && (plan_name.includes('Free Reading') || plan_name.includes('Apocrypha'))) {
        return `read ${chapterText} in ${plan_name}`
      }
      
      // For day-based plans, show day number
      if (plan_name && day_number) {
        return `completed Day ${day_number} of ${plan_name}`
      }
      
      return `read ${chapterText}`
    },
  },
  streak_milestone: {
    icon: Flame,
    color: 'text-orange-500',
    getMessage: (a) => `hit a ${a.metadata.streak_days}-day streak!`,
  },
  rank_achieved: {
    icon: Shield,
    color: 'text-gold',
    getMessage: (a) => `achieved ${a.metadata.rank} rank!`,
  },
  member_joined: {
    icon: UserPlus,
    color: 'text-sage',
    getMessage: () => `joined the guild`,
  },
  plan_started: {
    icon: BookOpen,
    color: 'text-blue-500',
    getMessage: (a) => `started ${a.metadata.plan_name || 'a new reading plan'}`,
  },
  plan_completed: {
    icon: Trophy,
    color: 'text-gold',
    getMessage: (a) => `completed ${a.metadata.plan_name || 'a reading plan'}!`,
  },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function GuildActivityFeed({ guildId, members }: GuildActivityFeedProps) {
  const { data: activities, isLoading, error, refetch } = useGuildActivities(guildId)

  // Get current member user IDs to identify former members
  const memberUserIds = useMemo(() => new Set(members.map((m) => m.user_id)), [members])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="font-pixel text-[0.625rem] text-danger mb-3">
          Failed to load activity
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-parchment-light border-2 border-border hover:bg-parchment-dark transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="font-pixel text-[0.5rem]">TRY AGAIN</span>
        </button>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-pixel text-[0.625rem] text-ink-muted">
          No activity yet
        </p>
        <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
          Start reading to see updates here!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const config = activityConfig[activity.activity_type]
        if (!config) {
          console.warn('[GuildActivity] Unknown activity type:', activity.activity_type)
          return null
        }

        const Icon = config.icon
        const isFormerMember = !memberUserIds.has(activity.user_id)
        const displayName =
          activity.profile?.display_name ||
          activity.profile?.username ||
          'Unknown'

        return (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 border border-border-subtle ${
              isFormerMember ? 'bg-parchment-dark/50' : 'bg-parchment-light'
            }`}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${isFormerMember ? 'text-ink-muted' : config.color}`}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-pixel text-[0.625rem] leading-relaxed ${isFormerMember ? 'text-ink-muted' : 'text-ink'}`}>
                <span className="font-bold">{displayName}</span>
                {isFormerMember && (
                  <span className="font-normal text-[0.5rem] text-ink-faint ml-1">(former member)</span>
                )}{' '}
                {config.getMessage(activity)}
              </p>
              <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
                {formatTimeAgo(activity.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
