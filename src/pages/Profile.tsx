import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Trash2, Shield, Bell, BellOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { useLocalNotifications } from '../hooks'
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
  const notifications = useLocalNotifications()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [streakMinimumInput, setStreakMinimumInput] = useState(String(profile?.streak_minimum || 3))
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [reminderHour, setReminderHour] = useState('09')
  const [reminderMinute, setReminderMinute] = useState('00')

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Load saved notification time from localStorage on mount
  useEffect(() => {
    if (!notifications.isNative) return

    const savedHour = localStorage.getItem('dailyReminderHour')
    const savedMinute = localStorage.getItem('dailyReminderMinute')

    if (savedHour) setReminderHour(savedHour.padStart(2, '0'))
    if (savedMinute) setReminderMinute(savedMinute.padStart(2, '0'))
  }, [notifications.isNative])

  // Check if notifications are scheduled on mount
  useEffect(() => {
    const checkNotifications = async () => {
      if (!notifications.isNative || !notifications.hasPermission) return
      const pending = await notifications.getPending()
      setNotificationEnabled(pending.length > 0)
    }
    checkNotifications()
  }, [notifications.isNative, notifications.hasPermission])

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

  const handleEnableNotifications = async () => {
    if (!notifications.isNative) {
      toast.error('Notifications are only available on the native app')
      return
    }

    if (!notifications.hasPermission) {
      const granted = await notifications.requestPermission()
      if (!granted) {
        toast.error('Notification permission denied')
        return
      }
    }

    // Pad hour and minutes to ensure 2 digits
    const hour = parseInt(reminderHour, 10)
    const minute = parseInt(reminderMinute, 10)
    setReminderHour(hour.toString().padStart(2, '0'))
    setReminderMinute(minute.toString().padStart(2, '0'))

    const success = await notifications.scheduleDailyReminder(hour, minute)

    if (success) {
      setNotificationEnabled(true)
      toast.success(`Daily reminder set for ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    } else {
      toast.error('Failed to schedule notification')
    }
  }

  const handleDisableNotifications = async () => {
    await notifications.cancelDailyReminder()
    setNotificationEnabled(false)
    toast.success('Daily reminder disabled')
  }

  const handleTestNotification = async () => {
    if (!notifications.hasPermission) {
      const granted = await notifications.requestPermission()
      if (!granted) {
        toast.error('Notification permission denied')
        return
      }
    }

    const success = await notifications.sendNow(
      'Daily Quest Awaits',
      "Time to continue your journey through God's Word"
    )

    if (success) {
      toast.success('Test notification sent!')
    } else {
      toast.error('Failed to send notification')
    }
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

      {/* Notification Settings */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="font-pixel text-[0.625rem] text-ink">
              DAILY REMINDERS
            </div>
            {notifications.isNative ? (
              notificationEnabled ? (
                <Bell className="w-4 h-4 text-sage" />
              ) : (
                <BellOff className="w-4 h-4 text-ink-muted" />
              )
            ) : (
              <span className="font-pixel text-[0.5rem] text-ink-muted">WEB ONLY</span>
            )}
          </div>
        </div>
        <div className="p-4">
          {!notifications.isNative ? (
            <div className="p-4 bg-parchment-light border border-border-subtle">
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
                Daily notifications are only available in the native iOS app. Download the app to enable reminders.
              </p>
            </div>
          ) : notificationEnabled ? (
            /* ENABLED STATE */
            <div className="space-y-4">
              {/* Active Status */}
              <div className="p-4 bg-sage/10 border-2 border-sage">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-5 h-5 text-sage" />
                  <span className="font-pixel text-[0.75rem] text-sage">
                    REMINDER ACTIVE
                  </span>
                </div>
                <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
                  You'll receive a daily notification at {reminderHour.padStart(2, '0')}:{reminderMinute.padStart(2, '0')} to continue your Bible reading quest.
                </p>
              </div>

              {/* Edit Time */}
              <div className="space-y-3">
                <label className="font-pixel text-[0.625rem] text-ink">
                  CHANGE REMINDER TIME
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="23"
                    value={reminderHour}
                    onChange={(e) => setReminderHour(e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) {
                        setReminderHour(val.toString().padStart(2, '0'))
                      }
                    }}
                    className="flex-1"
                    placeholder="Hour"
                  />
                  <span className="font-pixel text-ink text-lg">:</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="59"
                    value={reminderMinute}
                    onChange={(e) => setReminderMinute(e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) {
                        setReminderMinute(val.toString().padStart(2, '0'))
                      }
                    }}
                    className="flex-1"
                    placeholder="Min"
                  />
                </div>
                <p className="font-pixel text-[0.5rem] text-ink-muted">
                  Example: 9:00 for 9:00 AM, 21:00 for 9:00 PM
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleEnableNotifications}
                  leftIcon={<Bell className="w-4 h-4" />}
                >
                  UPDATE REMINDER
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleTestNotification}
                  leftIcon={<Bell className="w-4 h-4" />}
                  size="sm"
                >
                  SEND TEST NOTIFICATION
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDisableNotifications}
                  leftIcon={<BellOff className="w-4 h-4" />}
                  size="sm"
                >
                  TURN OFF REMINDER
                </Button>
              </div>
            </div>
          ) : (
            /* DISABLED STATE */
            <div className="space-y-4">
              {/* Inactive Status */}
              <div className="p-4 bg-parchment-light border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <BellOff className="w-5 h-5 text-ink-muted" />
                  <span className="font-pixel text-[0.75rem] text-ink-muted">
                    NO REMINDER SET
                  </span>
                </div>
                {!notifications.hasPermission && (
                  <div className="mb-3 p-2 bg-warning/10 border border-warning/30">
                    <span className="font-pixel text-[0.5rem] text-warning">
                      PERMISSION NEEDED
                    </span>
                  </div>
                )}
                <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
                  Set a daily reminder to help you stay consistent with Bible reading.
                </p>
              </div>

              {/* Time Picker */}
              <div className="space-y-3">
                <label className="font-pixel text-[0.625rem] text-ink">
                  SET REMINDER TIME
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="23"
                    value={reminderHour}
                    onChange={(e) => setReminderHour(e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) {
                        setReminderHour(val.toString().padStart(2, '0'))
                      }
                    }}
                    className="flex-1"
                    placeholder="Hour"
                  />
                  <span className="font-pixel text-ink text-lg">:</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    max="59"
                    value={reminderMinute}
                    onChange={(e) => setReminderMinute(e.target.value)}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val)) {
                        setReminderMinute(val.toString().padStart(2, '0'))
                      }
                    }}
                    className="flex-1"
                    placeholder="Min"
                  />
                </div>
                <p className="font-pixel text-[0.5rem] text-ink-muted">
                  Example: 9:00 for 9:00 AM, 21:00 for 9:00 PM
                </p>
              </div>

              {/* Actions */}
              <Button
                variant="primary"
                onClick={handleEnableNotifications}
                leftIcon={<Bell className="w-4 h-4" />}
                className="w-full"
              >
                ENABLE REMINDER
              </Button>
            </div>
          )}
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
