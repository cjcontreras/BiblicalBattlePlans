import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Trash2, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { captureError } from '../lib/errorLogger'
import { ProfileHeader, ProfileStats, CampaignHistory } from '../components/profile'
import { Card, CardHeader, CardContent, CardFooter, Button, Input, LoadingSpinner, Modal } from '../components/ui'

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
  const navigate = useNavigate()
  const { profile, updateProfile, deleteAccount } = useAuth()
  const { data: stats, isLoading: statsLoading } = useStats()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [streakMinimumInput, setStreakMinimumInput] = useState(String(profile?.streak_minimum || 3))
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return

    setIsDeleting(true)
    try {
      const { error } = await deleteAccount()

      if (error) {
        captureError(error, { component: 'Profile', action: 'deleteAccount' })
        toast.error('Failed to delete account. Please try again.')
        setIsDeleting(false)
        return
      }

      toast.success('Your account has been deleted.')
      navigate('/')
    } catch (error) {
      captureError(error, { component: 'Profile', action: 'deleteAccount' })
      toast.error('Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
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
    streak_shields: 0,
    last_shield_used_date: null,
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
              <div className="font-pixel text-[0.625rem] text-ink-muted">
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

      {/* Streak Shields */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="font-pixel text-[0.625rem] text-ink">
            STREAK SHIELDS
          </div>
        </div>
        <div className="p-4">
          <div className="p-4 bg-parchment-light border border-border-subtle">
            {/* Shield Icons Display */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`
                    w-12 h-12 flex items-center justify-center border-2
                    ${index < userStats.streak_shields
                      ? 'border-sage bg-sage/20'
                      : 'border-border-subtle bg-parchment'
                    }
                  `}
                >
                  <Shield
                    className={`w-6 h-6 ${
                      index < userStats.streak_shields ? 'text-sage' : 'text-ink-faint'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Shield Count */}
            <div className="text-center mb-4">
              <span className="font-pixel text-[0.75rem] text-ink">
                {userStats.streak_shields} / 3 SHIELDS
              </span>
            </div>

            {/* Shield Info */}
            <div className="space-y-2 text-center">
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                Earn 1 shield for every 14 consecutive days of reading.
              </p>
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                Shields automatically protect your streak if you miss a day.
              </p>
              {userStats.streak_shields > 0 && (
                <p className="font-pixel text-[0.625rem] text-sage mt-2">
                  Your streak is protected!
                </p>
              )}
            </div>

            {/* Progress to next shield */}
            {userStats.streak_shields < 3 && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-pixel text-[0.625rem] text-ink-muted">
                    PROGRESS TO NEXT SHIELD
                  </span>
                  <span className="font-pixel text-[0.625rem] text-ink-muted">
                    {userStats.current_streak % 14} / 14 DAYS
                  </span>
                </div>
                <div className="h-2 bg-parchment border border-border-subtle overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sage to-sage-light transition-all duration-500"
                    style={{ width: `${((userStats.current_streak % 14) / 14) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

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
                <span className="font-pixel text-[0.625rem] text-ink-muted">
                  CURRENT: <span className="text-sage">{currentRank.name}</span>
                </span>
              {nextRank && (
                <span className="font-pixel text-[0.625rem] text-ink-muted">
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
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                {daysToNext} day{daysToNext !== 1 ? 's' : ''} until next rank
              </p>
            ) : (
              <p className="font-pixel text-[0.625rem] text-sage">
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
                <span className="font-pixel text-[0.625rem] text-ink-muted">
                  {rank.description}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Campaign History */}
      <CampaignHistory />

      {/* Account Management */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="font-pixel text-[0.625rem] text-ink">
            ACCOUNT
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-pixel text-[0.5rem] text-ink-muted">
              Delete your account and all data
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="font-pixel text-[0.5rem] text-danger hover:text-danger-dark hover:underline transition-colors inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" />
              Delete Account
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
        }}
        title="DELETE ACCOUNT"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-danger/10 border border-danger/30">
            <p className="font-pixel text-[0.625rem] text-danger mb-2">
              WARNING: This action is permanent!
            </p>
            <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
              Deleting your account will permanently remove:
            </p>
            <ul className="font-pixel text-[0.625rem] text-ink-muted mt-2 space-y-1">
              <li>- All your reading progress</li>
              <li>- Your streak history</li>
              <li>- All quests and campaigns</li>
              <li>- Your profile and settings</li>
            </ul>
          </div>

          <div>
            <label className="font-pixel text-[0.625rem] text-ink-muted block mb-2">
              Type DELETE to confirm:
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              isLoading={isDeleting}
              className="flex-1"
            >
              DELETE ACCOUNT
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
              }}
              disabled={isDeleting}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
