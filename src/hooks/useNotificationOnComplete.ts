import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { useTodaysTotalChapters } from './usePlans'
import { useLocalNotifications } from './useLocalNotifications'

/**
 * Hook that automatically cancels today's notification when daily reading goal is met.
 * Watches total chapters read today and compares against streak minimum.
 */
export function useNotificationOnComplete() {
  const { profile } = useAuth()
  const { data: totalChaptersToday, isLoading } = useTodaysTotalChapters()
  const { cancelTodaysNotification, isNative } = useLocalNotifications()

  useEffect(() => {
    if (isLoading || !profile || !isNative) return

    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    const streakMinimum = profile.streak_minimum || 3
    const isComplete = (totalChaptersToday || 0) >= streakMinimum

    // Check if we already canceled today (stored in localStorage by cancelTodaysNotification)
    const lastCanceledDate = localStorage.getItem('lastReadingCompleteDate')
    const alreadyCanceledToday = lastCanceledDate === today
    const reminderEnabled = localStorage.getItem('dailyReminderEnabled') === 'true'

    // Only cancel once per day to avoid repeated cancellations
    if (isComplete && !alreadyCanceledToday && reminderEnabled) {
      cancelTodaysNotification()
    }
  }, [totalChaptersToday, profile, isLoading, cancelTodaysNotification, isNative])
}
