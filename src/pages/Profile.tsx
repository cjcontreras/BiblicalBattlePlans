import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { ProfileHeader, ProfileStats, CampaignHistory } from '../components/profile'
import { Card, CardHeader, CardContent, CardFooter, Button, Input, LoadingSpinner } from '../components/ui'

// Rank definitions
const RANKS = [
  { name: 'LEGENDARY', minDays: 90, description: '90+ days' },
  { name: 'VETERAN', minDays: 60, description: '60-89 days' },
  { name: 'WARRIOR', minDays: 30, description: '30-59 days' },
  { name: 'SOLDIER', minDays: 7, description: '7-29 days' },
  { name: 'RECRUIT', minDays: 0, description: '0-6 days' },
]

function getCurrentRank(streak: number) {
  return RANKS.find(r => streak >= r.minDays) || RANKS[RANKS.length - 1]
}

function getNextRank(streak: number) {
  const currentIdx = RANKS.findIndex(r => streak >= r.minDays)
  return currentIdx > 0 ? RANKS[currentIdx - 1] : null
}

function getRankProgress(streak: number) {
  const current = getCurrentRank(streak)
  const next = getNextRank(streak)
  if (!next) return 100
  
  const currentMin = current.minDays
  const nextMin = next.minDays
  const progress = ((streak - currentMin) / (nextMin - currentMin)) * 100
  return Math.min(progress, 100)
}

export function Profile() {
  const { profile, updateProfile } = useAuth()
  const { data: stats, isLoading: statsLoading } = useStats()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [streakMinimumInput, setStreakMinimumInput] = useState(String(profile?.streak_minimum || 3))
  const [isSaving, setIsSaving] = useState(false)

  // Parse streak minimum with validation, clamping between 1-20
  const getValidStreakMinimum = (value: string): number => {
    const parsed = parseInt(value, 10)
    if (isNaN(parsed) || parsed < 1) return 1
    if (parsed > 20) return 20
    return parsed
  }

  const handleSave = async () => {
    setIsSaving(true)
    const validStreakMinimum = getValidStreakMinimum(streakMinimumInput)
    try {
      await updateProfile({
        display_name: displayName,
        streak_minimum: validStreakMinimum
      })
      setStreakMinimumInput(String(validStreakMinimum))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    }
    setIsSaving(false)
    setIsEditing(false)
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const userStats = stats || {
    total_chapters_read: 0,
    current_streak: 0,
    longest_streak: 0,
    plans_completed: 0,
    plans_active: 0,
    total_days_reading: 0,
  }

  const currentRank = getCurrentRank(userStats.current_streak)
  const nextRank = getNextRank(userStats.current_streak)
  const rankProgress = getRankProgress(userStats.current_streak)
  const daysToNext = nextRank ? nextRank.minDays - userStats.current_streak : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <h1 className="font-pixel text-sm text-ink">
        HERO STATUS
      </h1>

      {/* Profile Header */}
      <ProfileHeader currentStreak={userStats.current_streak} />

      {/* Edit Profile */}
      {isEditing ? (
        <Card>
          <CardHeader>
            <h2 className="font-pixel text-[0.625rem] text-ink">
              EDIT PROFILE
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="font-pixel text-[0.5rem] text-ink-muted">
                <span className="text-ink-faint">Username:</span>{' '}
                <span className="text-sage">@{profile?.username}</span>
                <span className="text-ink-faint ml-2">(set at enlistment)</span>
              </div>
            </div>
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              hint="This is how your name appears to other heroes"
            />
            <Input
              label="Streak Minimum (Chapters/Day)"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              max="20"
              value={streakMinimumInput}
              onChange={(e) => setStreakMinimumInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => {
                // Validate and correct on blur
                const valid = getValidStreakMinimum(streakMinimumInput)
                setStreakMinimumInput(String(valid))
              }}
              placeholder="Minimum chapters per day for streak"
            />
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
            >
              SAVE CHANGES
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false)
                setDisplayName(profile?.display_name || '')
                setStreakMinimumInput(String(profile?.streak_minimum || 3))
              }}
            >
              CANCEL
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          EDIT PROFILE
        </Button>
      )}

      {/* Stats */}
      <ProfileStats stats={userStats} />

      {/* Rank Progress */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="font-pixel text-[0.625rem] text-ink">
            RANK PROGRESS
          </div>
        </div>
        <div className="p-4">
          <div className="p-4 bg-parchment-light border border-border-subtle">
            <div className="flex justify-between items-center mb-3">
                <span className="font-pixel text-[0.5rem] text-ink-muted">
                  CURRENT: <span className="text-sage">{currentRank.name}</span>
                </span>
              {nextRank && (
                <span className="font-pixel text-[0.5rem] text-ink-muted">
                  NEXT: <span className="text-ink">{nextRank.name}</span>
                </span>
              )}
            </div>
            
            <div className="h-3 bg-parchment border border-border-subtle overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-sage to-sage-light transition-all duration-500"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
            
            {nextRank ? (
              <p className="font-pixel text-[0.5rem] text-ink-muted">
                {daysToNext} day{daysToNext !== 1 ? 's' : ''} until next rank
              </p>
            ) : (
              <p className="font-pixel text-[0.5rem] text-sage">
                MAX RANK ACHIEVED!
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Rank Ladder */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="font-pixel text-[0.625rem] text-ink">
            RANK LADDER
          </div>
        </div>
        <div className="p-4 space-y-2">
          {RANKS.map((rank) => {
            const isCurrentRank = rank.name === currentRank.name
            return (
              <div
                key={rank.name}
                className={`flex items-center gap-3 px-3 py-3 border ${
                  isCurrentRank
                    ? 'border-sage bg-sage/10'
                    : 'border-border-subtle bg-parchment-light'
                }`}
              >
                <div
                  className={`w-4 h-4 border-2 flex items-center justify-center ${
                    isCurrentRank
                      ? 'border-sage-dark bg-sage'
                      : 'border-border bg-parchment'
                  }`}
                >
                  {isCurrentRank && (
                    <div className="w-1.5 h-1.5 bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={`font-pixel text-[0.625rem] ${isCurrentRank ? 'text-sage' : 'text-ink'}`}>
                    {rank.name}
                  </span>
                </div>
                <span className="font-pixel text-[0.5rem] text-ink-muted">
                  {rank.description}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Campaign History */}
      <CampaignHistory />
    </div>
  )
}
