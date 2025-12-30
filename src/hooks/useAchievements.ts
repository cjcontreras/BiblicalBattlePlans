import { create } from 'zustand'
import type { Achievement } from '../components/AchievementModal'

// Storage key for tracking shown achievements
const SHOWN_ACHIEVEMENTS_KEY = 'bbp_shown_achievements'

// Get shown achievements from localStorage
function getShownAchievements(): Set<string> {
  try {
    const stored = localStorage.getItem(SHOWN_ACHIEVEMENTS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

// Save shown achievement to localStorage
function markAchievementShown(id: string): void {
  try {
    const shown = getShownAchievements()
    shown.add(id)
    localStorage.setItem(SHOWN_ACHIEVEMENTS_KEY, JSON.stringify([...shown]))
  } catch {
    // Ignore storage errors
  }
}

// Check if achievement was already shown
function wasAchievementShown(id: string): boolean {
  return getShownAchievements().has(id)
}

// Achievement definitions
const STREAK_MILESTONES = [7, 30, 60, 90] as const
const CHAPTER_MILESTONES = [100, 500, 1000, 2500, 5000] as const
const RANKS = ['RECRUIT', 'SOLDIER', 'WARRIOR', 'VETERAN', 'LEGENDARY'] as const

interface AchievementStore {
  currentAchievement: Achievement | null
  queue: Achievement[]
  showAchievement: (achievement: Achievement) => void
  dismissAchievement: () => void
  queueAchievement: (achievement: Achievement) => void
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  currentAchievement: null,
  queue: [],

  showAchievement: (achievement) => {
    // Don't show if already shown
    if (wasAchievementShown(achievement.id)) return

    const { currentAchievement, queue } = get()

    if (currentAchievement) {
      // Queue it if one is already showing
      set({ queue: [...queue, achievement] })
    } else {
      // Show immediately
      markAchievementShown(achievement.id)
      set({ currentAchievement: achievement })
    }
  },

  dismissAchievement: () => {
    const { queue } = get()

    if (queue.length > 0) {
      // Show next in queue
      const [next, ...rest] = queue
      markAchievementShown(next.id)
      set({ currentAchievement: next, queue: rest })
    } else {
      set({ currentAchievement: null })
    }
  },

  queueAchievement: (achievement) => {
    if (wasAchievementShown(achievement.id)) return

    const { queue, currentAchievement } = get()

    if (!currentAchievement) {
      markAchievementShown(achievement.id)
      set({ currentAchievement: achievement })
    } else {
      set({ queue: [...queue, achievement] })
    }
  },
}))

// Hook to trigger quest completion achievement
export function useQuestCompleteAchievement() {
  const showAchievement = useAchievementStore((s) => s.showAchievement)

  return (planName: string, planId: string) => {
    showAchievement({
      id: `quest_complete_${planId}`,
      type: 'quest_complete',
      title: planName.toUpperCase(),
      subtitle: 'Victory!',
      description: 'You have conquered this reading plan. Your dedication to Scripture brings glory to the Kingdom!',
    })
  }
}

// Hook to check and trigger streak milestones
export function useStreakMilestoneAchievement() {
  const showAchievement = useAchievementStore((s) => s.showAchievement)

  return (currentStreak: number) => {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak === milestone) {
        showAchievement({
          id: `streak_${milestone}`,
          type: 'streak_milestone',
          title: `${milestone} DAY STREAK`,
          subtitle: getStreakTitle(milestone),
          description: getStreakDescription(milestone),
        })
        break
      }
    }
  }
}

function getStreakTitle(days: number): string {
  switch (days) {
    case 7: return 'Week Warrior'
    case 30: return 'Monthly Master'
    case 60: return 'Steadfast Soldier'
    case 90: return 'Legendary Dedication'
    default: return 'Streak Champion'
  }
}

function getStreakDescription(days: number): string {
  switch (days) {
    case 7:
      return 'A full week of faithful reading! You have proven your commitment to the Word.'
    case 30:
      return 'One month of daily dedication! Your discipline is an inspiration to fellow warriors.'
    case 60:
      return 'Two months of unwavering faith! Few warriors achieve such consistency.'
    case 90:
      return 'Ninety days of legendary commitment! You stand among the elite warriors of Scripture.'
    default:
      return 'Your dedication to daily reading is remarkable!'
  }
}

// Hook to check and trigger rank promotions
export function useRankPromotionAchievement() {
  const showAchievement = useAchievementStore((s) => s.showAchievement)

  return (previousStreak: number, newStreak: number) => {
    const previousRank = getRankForStreak(previousStreak)
    const newRank = getRankForStreak(newStreak)

    if (newRank !== previousRank && RANKS.indexOf(newRank) > RANKS.indexOf(previousRank)) {
      showAchievement({
        id: `rank_${newRank.toLowerCase()}`,
        type: 'rank_promotion',
        title: 'PROMOTED',
        subtitle: newRank,
        description: getRankDescription(newRank),
      })
    }
  }
}

function getRankForStreak(days: number): typeof RANKS[number] {
  if (days >= 90) return 'LEGENDARY'
  if (days >= 60) return 'VETERAN'
  if (days >= 30) return 'WARRIOR'
  if (days >= 7) return 'SOLDIER'
  return 'RECRUIT'
}

function getRankDescription(rank: string): string {
  switch (rank) {
    case 'SOLDIER':
      return 'You have earned your place among the faithful. Keep marching forward, Soldier!'
    case 'WARRIOR':
      return 'A true Warrior of the Word! Your dedication sets you apart from the ranks.'
    case 'VETERAN':
      return 'Battle-tested and proven! Veterans like you are the backbone of the Kingdom.'
    case 'LEGENDARY':
      return 'You have achieved Legendary status! Your commitment to Scripture is unmatched.'
    default:
      return 'Welcome to the ranks! Your journey through Scripture begins now.'
  }
}

// Hook to check and trigger chapter milestones
export function useChapterMilestoneAchievement() {
  const showAchievement = useAchievementStore((s) => s.showAchievement)

  return (previousChapters: number, newChapters: number) => {
    for (const milestone of CHAPTER_MILESTONES) {
      if (previousChapters < milestone && newChapters >= milestone) {
        showAchievement({
          id: `chapters_${milestone}`,
          type: 'chapter_milestone',
          title: `${milestone.toLocaleString()} CHAPTERS`,
          subtitle: getChapterTitle(milestone),
          description: getChapterDescription(milestone),
        })
        break // Only show one milestone at a time
      }
    }
  }
}

function getChapterTitle(chapters: number): string {
  switch (chapters) {
    case 100: return 'Century Reader'
    case 500: return 'Scripture Scholar'
    case 1000: return 'Thousand Chapter Champion'
    case 2500: return 'Word Warrior'
    case 5000: return 'Biblical Master'
    default: return 'Chapter Champion'
  }
}

function getChapterDescription(chapters: number): string {
  switch (chapters) {
    case 100:
      return 'Your first hundred chapters! You are building a strong foundation in the Word.'
    case 500:
      return 'Five hundred chapters conquered! Your knowledge of Scripture grows ever deeper.'
    case 1000:
      return 'A thousand chapters! You have traversed vast territories of holy ground.'
    case 2500:
      return 'Twenty-five hundred chapters! Your dedication is truly remarkable.'
    case 5000:
      return 'Five thousand chapters! You are a true master of the Scriptures.'
    default:
      return 'Another milestone reached! Keep pressing forward.'
  }
}

// Hook to trigger shield used notification
export function useShieldUsedAchievement() {
  const showAchievement = useAchievementStore((s) => s.showAchievement)

  return (shieldUsedDate: string) => {
    showAchievement({
      id: `shield_used_${shieldUsedDate}`,
      type: 'shield_used',
      title: 'SHIELD ACTIVATED',
      subtitle: 'Streak Protected!',
      description: 'A streak shield was automatically used to protect your streak. Keep up the faithful reading!',
    })
  }
}

// Selector hooks
export const useCurrentAchievement = () => useAchievementStore((s) => s.currentAchievement)
export const useDismissAchievement = () => useAchievementStore((s) => s.dismissAchievement)
