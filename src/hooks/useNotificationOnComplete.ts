import { useEffect, useRef } from 'react'
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
  const lastCheckDateRef = useRef<string>('')

  useEffect(() => {
    if (isLoading || !profile || !isNative) return

    const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    const streakMinimum = profile.streak_minimum || 3
    const isComplete = (totalChaptersToday || 0) >= streakMinimum

    // Reset flag if it's a new day
    if (lastCheckDateRef.current !== today) {
      lastCheckDateRef.current = today
    }

    // Check if we already canceled today
    const lastCanceledDate = localStorage.getItem('lastReadingCompleteDate')
    const alreadyCanceledToday = lastCanceledDate === today
    const reminderEnabled = localStorage.getItem('dailyReminderEnabled') === 'true'

    console.log('[NotificationOnComplete] Check:', {
      today,
      totalChaptersToday,
      streakMinimum,
      isComplete,
      lastCanceledDate,
      alreadyCanceledToday,
      reminderEnabled,
    })

    // Only cancel once per day to avoid repeated cancellations
    if (isComplete && !alreadyCanceledToday && reminderEnabled) {
      console.log('[NotificationOnComplete] ✅ Canceling notification - reading complete!')
      cancelTodaysNotification()
    } else if (isComplete) {
      console.log('[NotificationOnComplete] ⏭️ Skipping cancel:', {
        alreadyCanceledToday,
        reminderEnabled,
      })
    }
  }, [totalChaptersToday, profile, isLoading, cancelTodaysNotification, isNative])
}
