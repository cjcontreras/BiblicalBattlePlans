import { useAuth } from '../../hooks/useAuth'
import { StreakBadge } from '../ui'

interface ProfileHeaderProps {
  currentStreak: number
}

// Rank definitions
const RANKS = [
  { name: 'LEGENDARY', minDays: 30 },
  { name: 'VETERAN', minDays: 14 },
  { name: 'WARRIOR', minDays: 7 },
  { name: 'SOLDIER', minDays: 3 },
  { name: 'RECRUIT', minDays: 0 },
]

function getCurrentRank(streak: number) {
  return RANKS.find(r => streak >= r.minDays) || RANKS[RANKS.length - 1]
}

export function ProfileHeader({ currentStreak }: ProfileHeaderProps) {
  const { profile, user } = useAuth()

  // Display name is the friendly name, falls back to username if not set
  const displayName = profile?.display_name || profile?.username || 'Hero'
  // Username is the unique identifier (handle)
  const username = profile?.username || user?.email?.split('@')[0] || 'anonymous'
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown'

  const currentRank = getCurrentRank(currentStreak)

  return (
    <div className="bg-gradient-to-br from-parchment to-parchment-light border-2 border-border-subtle p-6 shadow-[0_4px_12px_var(--shadow-color)]">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 bg-gradient-to-br from-sage to-sage-dark border-2 border-sage-dark flex items-center justify-center shadow-[0_2px_4px_var(--shadow-color)]">
          <span className="font-pixel text-2xl text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-pixel text-sm text-ink">
            {displayName.toUpperCase()}
          </h2>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
            @{username}
          </p>
          <p className="font-pixel text-[0.5rem] text-ink-faint mt-2">
            Enlisted: {joinDate}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
            <div className="px-3 py-1 bg-sage border border-sage-dark">
              <span className="font-pixel text-[0.5rem] text-white">{currentRank.name}</span>
            </div>
            <StreakBadge days={currentStreak} />
          </div>
        </div>
      </div>
    </div>
  )
}
