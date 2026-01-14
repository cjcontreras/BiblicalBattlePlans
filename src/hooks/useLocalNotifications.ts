import { useEffect, useState, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { ScheduleOptions } from '@capacitor/local-notifications'

/**
 * Hook for managing local notifications (daily reading reminders).
 * Only works on native platforms.
 */
export function useLocalNotifications() {
  const isNative = Capacitor.isNativePlatform()
  const [hasPermission, setHasPermission] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)

  // Check and request permissions on mount
  useEffect(() => {
    if (!isNative) return

    const checkPermissions = async () => {
      try {
        const result = await LocalNotifications.checkPermissions()
        if (result.display === 'granted') {
          setHasPermission(true)
        }
      } catch (error) {
        console.error('Error checking notification permissions:', error)
      }
    }

    checkPermissions()
  }, [isNative])

  // Check if user has enabled reminders (persisted in localStorage)
  useEffect(() => {
    if (!isNative) return
    const enabled = localStorage.getItem('dailyReminderEnabled') === 'true'
    setReminderEnabled(enabled)
  }, [isNative])

  /**
   * Request notification permissions from the user
   */
  const requestPermission = useCallback(async () => {
    if (!isNative) return false

    try {
      const result = await LocalNotifications.requestPermissions()
      const granted = result.display === 'granted'
      setHasPermission(granted)
      return granted
    } catch (error) {
      console.error('Error requesting notification permissions:', error)
      return false
    }
  }, [isNative])

  /**
   * Schedule a daily reading reminder notification
   * @param hour - Hour of day (0-23)
   * @param minute - Minute of hour (0-59)
   */
  const scheduleDailyReminder = useCallback(
    async (hour: number, minute: number) => {
      if (!isNative || !hasPermission) {
        console.warn('Cannot schedule notification: native platform required and permission granted')
        return false
      }

      try {
        // Cancel any existing daily reminder
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] })

        // Schedule new daily reminder
        const notifications: ScheduleOptions = {
          notifications: [
            {
              id: 1,
              title: 'Daily Quest Awaits',
              body: "Keep your streak alive! Time to continue your journey through God's Word",
              schedule: {
                on: {
                  hour,
                  minute,
                },
                repeats: true,
                allowWhileIdle: true,
              },
              sound: undefined, // Use system default
              actionTypeId: 'DAILY_REMINDER',
              extra: {
                type: 'daily_reminder',
              },
            },
          ],
        }

        await LocalNotifications.schedule(notifications)

        // Store that reminder is enabled
        localStorage.setItem('dailyReminderEnabled', 'true')
        localStorage.setItem('dailyReminderHour', hour.toString())
        localStorage.setItem('dailyReminderMinute', minute.toString())
        setReminderEnabled(true)

        // Clear the "already canceled today" flag so notification can be canceled when reading completes
        localStorage.removeItem('lastReadingCompleteDate')
        console.log('[Notifications] Scheduled daily reminder, cleared completion flag')

        return true
      } catch (error) {
        console.error('Error scheduling daily reminder:', error)
        return false
      }
    },
    [isNative, hasPermission]
  )

  /**
   * Cancel the daily reading reminder
   */
  const cancelDailyReminder = useCallback(async () => {
    if (!isNative) return

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] })

      // Remove reminder enabled flag
      localStorage.removeItem('dailyReminderEnabled')
      localStorage.removeItem('dailyReminderHour')
      localStorage.removeItem('dailyReminderMinute')
      setReminderEnabled(false)
    } catch (error) {
      console.error('Error canceling daily reminder:', error)
    }
  }, [isNative])

  /**
   * Send an immediate notification (for testing or one-off alerts)
   */
  const sendNow = useCallback(
    async (title: string, body: string) => {
      if (!isNative || !hasPermission) {
        console.warn('Cannot send notification: native platform required and permission granted')
        return false
      }

      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 100000),
              title,
              body,
              schedule: {
                at: new Date(Date.now() + 1000), // 1 second from now
              },
            },
          ],
        })
        return true
      } catch (error) {
        console.error('Error sending notification:', error)
        return false
      }
    },
    [isNative, hasPermission]
  )

  /**
   * Get all pending notifications
   */
  const getPending = useCallback(async () => {
    if (!isNative) return []

    try {
      const result = await LocalNotifications.getPending()
      return result.notifications
    } catch (error) {
      console.error('Error getting pending notifications:', error)
      return []
    }
  }, [isNative])

  /**
   * Mark that reading is complete for today, so notification won't fire.
   * Cancels the notification and stores completion date.
   * Notification will be rescheduled tomorrow when app opens.
   */
  const cancelTodaysNotification = useCallback(async () => {
    if (!isNative) return

    // Check localStorage directly instead of relying on state
    const enabled = localStorage.getItem('dailyReminderEnabled') === 'true'
    if (!enabled) return

    try {
      const today = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

      // Cancel the notification
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] })

      // Store that reading was completed today
      localStorage.setItem('lastReadingCompleteDate', today)

      console.log('[Notifications] Canceled notification for today (reading complete)')
    } catch (error) {
      console.error('Error canceling today\'s notification:', error)
    }
  }, [isNative])

  /**
   * Check if notification needs to be rescheduled (called when app opens).
   * If reading wasn't complete yesterday and reminder is enabled, reschedule.
   */
  const recheckAndReschedule = useCallback(async () => {
    if (!isNative || !reminderEnabled || !hasPermission) return

    try {
      const today = new Date().toLocaleDateString('en-CA')
      const lastCompleteDate = localStorage.getItem('lastReadingCompleteDate')
      const storedHour = localStorage.getItem('dailyReminderHour')
      const storedMinute = localStorage.getItem('dailyReminderMinute')

      // Check if we have pending notifications
      const pending = await getPending()

      // If reading was completed on a different day (or never), and no notification is scheduled, reschedule
      if (lastCompleteDate !== today && pending.length === 0 && storedHour && storedMinute) {
        const hour = parseInt(storedHour, 10)
        const minute = parseInt(storedMinute, 10)

        // Reschedule the notification
        const notifications: ScheduleOptions = {
          notifications: [
            {
              id: 1,
              title: 'Daily Quest Awaits',
              body: "Keep your streak alive! Time to continue your journey through God's Word",
              schedule: {
                on: {
                  hour,
                  minute,
                },
                repeats: true,
                allowWhileIdle: true,
              },
              sound: undefined,
              actionTypeId: 'DAILY_REMINDER',
              extra: {
                type: 'daily_reminder',
              },
            },
          ],
        }

        await LocalNotifications.schedule(notifications)

        // Clear the completion flag for the new day
        localStorage.removeItem('lastReadingCompleteDate')
        console.log('[Notifications] Rescheduled notification for new day, cleared completion flag')
      }
    } catch (error) {
      console.error('Error rechecking/rescheduling notification:', error)
    }
  }, [isNative, reminderEnabled, hasPermission, getPending])

  // Auto-recheck when app mounts
  useEffect(() => {
    recheckAndReschedule()
  }, [recheckAndReschedule])

  return {
    isNative,
    hasPermission,
    requestPermission,
    scheduleDailyReminder,
    cancelDailyReminder,
    cancelTodaysNotification,
    sendNow,
    getPending,
  }
}
