import { useEffect, useRef } from 'react'
import { useStats } from '../hooks/useStats'
import {
  useStreakMilestoneAchievement,
  useRankPromotionAchievement,
  useChapterMilestoneAchievement,
  useShieldUsedAchievement,
} from '../hooks/useAchievements'

const PREVIOUS_STATS_KEY = 'bbp_previous_stats'

interface PreviousStats {
  streak: number
  chapters: number
  lastShieldUsedDate: string | null
}

function getPreviousStats(): PreviousStats {
  try {
    const stored = localStorage.getItem(PREVIOUS_STATS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore
  }
  return { streak: 0, chapters: 0, lastShieldUsedDate: null }
}

function savePreviousStats(stats: PreviousStats): void {
  try {
    localStorage.setItem(PREVIOUS_STATS_KEY, JSON.stringify(stats))
  } catch {
    // Ignore
  }
}

/**
 * MilestoneWatcher - Watches for stat changes and triggers achievements
 * This component doesn't render anything, it just watches for milestone crossings
 */
export function MilestoneWatcher() {
  const { data: stats } = useStats()
  const triggerStreakMilestone = useStreakMilestoneAchievement()
  const triggerRankPromotion = useRankPromotionAchievement()
  const triggerChapterMilestone = useChapterMilestoneAchievement()
  const triggerShieldUsed = useShieldUsedAchievement()

  // Track if we've done initial load (to avoid triggering on first render)
  const hasInitialized = useRef(false)
  const previousStatsRef = useRef<PreviousStats | null>(null)

  useEffect(() => {
    if (!stats) return

    const currentStreak = stats.current_streak
    const currentChapters = stats.total_chapters_read
    const currentShieldUsedDate = stats.last_shield_used_date

    // On first load, just store the current values
    if (!hasInitialized.current) {
      hasInitialized.current = true
      previousStatsRef.current = getPreviousStats()

      // If this is truly the first time (no stored stats), just save and return
      if (previousStatsRef.current.streak === 0 && previousStatsRef.current.chapters === 0) {
        savePreviousStats({ streak: currentStreak, chapters: currentChapters, lastShieldUsedDate: currentShieldUsedDate })
        return
      }
    }

    const previous = previousStatsRef.current || { streak: 0, chapters: 0, lastShieldUsedDate: null }

    // Check for streak milestone (exact match on milestone values)
    if (currentStreak > previous.streak) {
      triggerStreakMilestone(currentStreak)
    }

    // Check for rank promotion (streak crossed a rank threshold)
    if (currentStreak > previous.streak) {
      triggerRankPromotion(previous.streak, currentStreak)
    }

    // Check for chapter milestones
    if (currentChapters > previous.chapters) {
      triggerChapterMilestone(previous.chapters, currentChapters)
    }

    // Check if a shield was used (new shield used date that differs from previous)
    if (currentShieldUsedDate && currentShieldUsedDate !== previous.lastShieldUsedDate) {
      triggerShieldUsed(currentShieldUsedDate)
    }

    // Update stored values if they changed
    if (currentStreak !== previous.streak || currentChapters !== previous.chapters || currentShieldUsedDate !== previous.lastShieldUsedDate) {
      const newStats = { streak: currentStreak, chapters: currentChapters, lastShieldUsedDate: currentShieldUsedDate }
      previousStatsRef.current = newStats
      savePreviousStats(newStats)
    }
  }, [stats, triggerStreakMilestone, triggerRankPromotion, triggerChapterMilestone, triggerShieldUsed])

  // This component doesn't render anything
  return null
}
