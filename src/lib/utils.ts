import { type ClassValue, clsx } from 'clsx'

// Simple classname utility (we can add clsx later if needed)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Format date to display string
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(d)
}

// Calculate streak from dates
export function calculateStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0

  const sortedDates = [...completionDates]
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if most recent activity is today or yesterday
  const mostRecent = sortedDates[0]
  mostRecent.setHours(0, 0, 0, 0)

  if (mostRecent.getTime() !== today.getTime() && mostRecent.getTime() !== yesterday.getTime()) {
    return 0 // Streak broken
  }

  let streak = 1
  let currentDate = mostRecent

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate)
    prevDate.setDate(prevDate.getDate() - 1)

    const checkDate = sortedDates[i]
    checkDate.setHours(0, 0, 0, 0)

    if (checkDate.getTime() === prevDate.getTime()) {
      streak++
      currentDate = checkDate
    } else if (checkDate.getTime() < prevDate.getTime()) {
      break // Gap found
    }
    // Same date, continue
  }

  return streak
}

// Generate a readable passage reference
export function formatPassage(book: string, chapter: number): string {
  return `${book} ${chapter}`
}

// Parse passage reference (e.g., "Matthew 5" -> { book: "Matthew", chapter: 5 })
export function parsePassage(passage: string): { book: string; chapter: number } | null {
  const match = passage.match(/^(.+?)\s+(\d+)$/)
  if (!match) return null
  return {
    book: match[1],
    chapter: parseInt(match[2], 10),
  }
}

// Campaign/Battle themed messages
export const battleMessages = {
  dayComplete: [
    'Day Conquered!',
    'Victory Achieved!',
    'Mission Complete!',
    'Territory Secured!',
  ],
  streakMilestone: (days: number) => {
    if (days >= 30) return `${days}-Day Legend Status Unlocked!`
    if (days >= 14) return `${days}-Day Veteran Rank Achieved!`
    if (days >= 7) return `${days}-Day Warrior Status!`
    if (days >= 3) return `${days}-Day Soldier Promotion!`
    return `${days}-Day Campaign Started!`
  },
  encouragement: [
    'The battle continues...',
    'Stand firm, soldier.',
    'Press on to victory.',
    'Your mission awaits.',
  ],
  getRandomMessage: (type: 'dayComplete' | 'encouragement') => {
    const messages = battleMessages[type]
    return messages[Math.floor(Math.random() * messages.length)]
  },
}
