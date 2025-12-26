import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { ReadingPlan, UserPlan, DailyProgress, CyclingListsStructure, ListPositions, WeeklySectionalStructure } from '../types'

// Helper type for today's reading result
export interface TodaySection {
  id: string
  listId: string
  label: string
  passage: string
  chapterIndex: number // Current chapter index in the list
  isCompleted: boolean
}

// Query keys
export const planKeys = {
  all: ['plans'] as const,
  list: () => [...planKeys.all, 'list'] as const,
  detail: (id: string) => [...planKeys.all, 'detail', id] as const,
  userPlans: (userId: string) => ['userPlans', userId] as const,
  userPlan: (id: string) => ['userPlan', id] as const,
  dailyProgress: (userPlanId: string, date: string) => ['dailyProgress', userPlanId, date] as const,
}

// Get today's date in user's local timezone (YYYY-MM-DD)
export function getLocalDate(): string {
  return new Date().toLocaleDateString('en-CA') // Returns YYYY-MM-DD format
}

// Fetch all available reading plans
export function useReadingPlans() {
  return useQuery({
    queryKey: planKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as ReadingPlan[]
    },
  })
}

// Fetch a single reading plan
export function useReadingPlan(planId: string) {
  return useQuery({
    queryKey: planKeys.detail(planId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) throw error
      return data as ReadingPlan
    },
    enabled: !!planId,
  })
}

// Fetch user's plans (active and completed)
export function useUserPlans() {
  const { user } = useAuth()

  return useQuery({
    queryKey: planKeys.userPlans(user?.id || ''),
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('user_plans')
        .select(`
          *,
          plan:reading_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (UserPlan & { plan: ReadingPlan })[]
    },
    enabled: !!user,
  })
}

// Fetch a single user plan with details
export function useUserPlan(userPlanId: string) {
  return useQuery({
    queryKey: planKeys.userPlan(userPlanId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_plans')
        .select(`
          *,
          plan:reading_plans(*)
        `)
        .eq('id', userPlanId)
        .single()

      if (error) throw error
      return data as UserPlan & { plan: ReadingPlan }
    },
    enabled: !!userPlanId,
  })
}

// Fetch daily progress for a specific date
export function useDailyProgress(userPlanId: string, date?: string) {
  const targetDate = date || getLocalDate()

  return useQuery({
    queryKey: planKeys.dailyProgress(userPlanId, targetDate),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_plan_id', userPlanId)
        .eq('date', targetDate)
        .maybeSingle()

      if (error) throw error
      return data as DailyProgress | null
    },
    enabled: !!userPlanId,
  })
}

// Start a new plan
export function useStartPlan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ planId, startDate }: { planId: string; startDate?: string }) => {
      if (!user) throw new Error('Not authenticated')

      // Fetch the plan to get list structure for initial positions
      const { data: planData, error: planError } = await supabase
        .from('reading_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (planError) throw planError
      const plan = planData as ReadingPlan

      // Initialize list_positions for cycling plans
      let listPositions: ListPositions = {}
      if (plan.daily_structure.type === 'cycling_lists') {
        const structure = plan.daily_structure as CyclingListsStructure
        structure.lists.forEach(list => {
          listPositions[list.id] = 0 // Start at chapter index 0
        })
      }

      const { data, error } = await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .insert({
          user_id: user.id,
          plan_id: planId,
          start_date: startDate || new Date().toISOString().split('T')[0],
          current_day: 1,
          list_positions: listPositions,
          is_completed: false,
        })
        .select()
        .single()

      if (error) throw error
      return data as UserPlan
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
      }
    },
  })
}

// Mark a chapter as read (for cycling plans)
export function useMarkChapterRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      listId,
      chapterIndex,
      userPlan,
    }: {
      userPlanId: string
      listId: string
      chapterIndex: number
      userPlan: UserPlan & { plan: ReadingPlan }
    }) => {
      if (!user) throw new Error('Not authenticated')

      const today = getLocalDate()
      const chapterKey = `${listId}:${chapterIndex}`

      // 1. Get or create today's progress
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_plan_id', userPlanId)
        .eq('date', today)
        .maybeSingle()

      const existingProgress = progressData as DailyProgress | null
      let completedSections = existingProgress?.completed_sections || []

      // Toggle: add if not present, remove if present
      if (completedSections.includes(chapterKey)) {
        completedSections = completedSections.filter((s: string) => s !== chapterKey)
      } else {
        completedSections = [...completedSections, chapterKey]
      }

      // 2. Update or create daily_progress
      if (existingProgress) {
        await (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .update({
            completed_sections: completedSections,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)
      } else {
        await (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .insert({
            user_id: user.id,
            user_plan_id: userPlanId,
            day_number: userPlan.current_day, // Legacy field
            date: today,
            completed_sections: completedSections,
            is_complete: false,
          })
      }

      // Note: We do NOT advance list_positions here - that's done explicitly
      // via useAdvanceList when the user wants to continue to the next chapter

      return { completedSections }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
      }
    },
  })
}

// Advance to next chapter in a list (just moves position, doesn't mark as read)
export function useAdvanceList() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      listId,
      userPlan,
    }: {
      userPlanId: string
      listId: string
      userPlan: UserPlan & { plan: ReadingPlan }
    }) => {
      if (!user) throw new Error('Not authenticated')

      const structure = userPlan.plan.daily_structure as CyclingListsStructure
      const list = structure.lists.find(l => l.id === listId)

      if (!list) throw new Error('List not found')

      const currentPosition = userPlan.list_positions[listId] || 0

      // Advance list position (cycles when reaching end)
      const newPosition = (currentPosition + 1) % list.total_chapters
      const newPositions = {
        ...userPlan.list_positions,
        [listId]: newPosition,
      }

      await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .update({ list_positions: newPositions })
        .eq('id', userPlanId)

      return {
        newPosition,
        cycleCompleted: newPosition === 0 && currentPosition > 0
      }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
      }
    },
  })
}

// Advance to next day (for sequential/sectional plans)
export function useAdvanceDay() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      userPlan,
    }: {
      userPlanId: string
      userPlan: UserPlan & { plan: ReadingPlan }
    }) => {
      if (!user) throw new Error('Not authenticated')

      const maxDay = userPlan.plan.duration_days || 365
      const newDay = Math.min(userPlan.current_day + 1, maxDay)

      await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .update({ current_day: newDay })
        .eq('id', userPlanId)

      return { newDay }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
      }
    },
  })
}

// Log free reading entry (for free_reading plans)
export function useLogFreeReading() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      chapters,
      notes,
      userPlan,
    }: {
      userPlanId: string
      chapters: number
      notes?: string
      userPlan: UserPlan & { plan: ReadingPlan }
    }) => {
      if (!user) throw new Error('Not authenticated')
      if (chapters <= 0) throw new Error('Must log at least 1 chapter')

      const today = getLocalDate()

      // Get today's progress
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_plan_id', userPlanId)
        .eq('date', today)
        .maybeSingle()

      const existingProgress = progressData as DailyProgress | null

      // Create entries: each chapter gets "free:N" identifier
      const currentCount = existingProgress?.completed_sections.length || 0
      const newEntries = Array.from({ length: chapters }, (_, i) => `free:${currentCount + i}`)

      const completedSections = [
        ...(existingProgress?.completed_sections || []),
        ...newEntries
      ]

      // Update or create daily_progress
      if (existingProgress) {
        await (supabase.from('daily_progress') as ReturnType<typeof supabase.from>)
          .update({
            completed_sections: completedSections,
            notes: notes || existingProgress.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)
      } else {
        await (supabase.from('daily_progress') as ReturnType<typeof supabase.from>)
          .insert({
            user_id: user.id,
            user_plan_id: userPlanId,
            day_number: 1,
            date: today,
            completed_sections: completedSections,
            notes: notes || null,
            is_complete: false,
          })
      }

      // Update running total
      const totalLogged = (userPlan.list_positions?.['free'] || 0) + chapters
      await (supabase.from('user_plans') as ReturnType<typeof supabase.from>)
        .update({ list_positions: { free: totalLogged } })
        .eq('id', userPlanId)

      return { completedSections, totalLogged }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
      }
    },
  })
}

// Legacy: Mark a section complete (for non-cycling plans)
export function useMarkSectionComplete() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      dayNumber,
      sectionId,
      totalSections,
      existingProgress,
    }: {
      userPlanId: string
      dayNumber: number
      sectionId: string
      totalSections: number
      existingProgress: DailyProgress | null
    }) => {
      if (!user) throw new Error('Not authenticated')

      const today = getLocalDate()
      const completedSections = existingProgress?.completed_sections || []

      // Toggle section - add if not present, remove if present
      const newCompletedSections = completedSections.includes(sectionId)
        ? completedSections.filter((s) => s !== sectionId)
        : [...completedSections, sectionId]

      const isComplete = newCompletedSections.length >= totalSections

      if (existingProgress) {
        const { data, error } = await (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .update({
            completed_sections: newCompletedSections,
            is_complete: isComplete,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)
          .select()
          .single()

        if (error) throw error
        return data as DailyProgress
      } else {
        const { data, error } = await (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .insert({
            user_id: user.id,
            user_plan_id: userPlanId,
            day_number: dayNumber,
            date: today,
            completed_sections: newCompletedSections,
            is_complete: isComplete,
          })
          .select()
          .single()

        if (error) throw error
        return data as DailyProgress
      }
    },
    onSuccess: (data, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({
        queryKey: planKeys.dailyProgress(variables.userPlanId, today),
      })

      if (data.is_complete && user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
      }
    },
  })
}

// Helper type for sequential plan structure
interface SequentialPlanStructure {
  type: 'sequential'
  chapters_per_day: number
  total_chapters: number
  books: { book: string; chapters: number }[]
}

// Helper type for sectional plan structure
interface SectionalPlanStructure {
  type: 'sectional'
  sections_per_day: number
  // Legacy format with top-level sections
  sections?: { id: string; label: string; color?: string }[]
  // New format with day-specific readings (like M'Cheyne)
  section_labels?: { id: string; label: string }[]
  readings?: {
    day: number
    sections: { id: string; label: string; passages: string[] }[]
  }[]
}

// Get the passage text for a specific chapter in a list
function getPassageForChapter(list: CyclingListsStructure['lists'][0], chapterIndex: number): string {
  let currentIndex = 0

  for (const book of list.books) {
    if (currentIndex + book.chapters.length > chapterIndex) {
      const chapterInBook = chapterIndex - currentIndex
      return `${book.book} ${book.chapters[chapterInBook]}`
    }
    currentIndex += book.chapters.length
  }

  return 'Unknown'
}

// Helper function to get current reading for a cycling plan (based on list positions)
export function getCurrentReadings(
  plan: ReadingPlan,
  listPositions: ListPositions,
  todayProgress?: DailyProgress | null
): TodaySection[] {
  const structure = plan.daily_structure

  if (structure.type === 'free_reading') {
    return [] // No predefined readings for free reading
  }

  if (structure.type !== 'cycling_lists') {
    return []
  }

  const cyclingStructure = structure as CyclingListsStructure
  const completedSections = todayProgress?.completed_sections || []

  return cyclingStructure.lists.map((list) => {
    const chapterIndex = listPositions[list.id] || 0
    const chapterKey = `${list.id}:${chapterIndex}`

    return {
      id: chapterKey,
      listId: list.id,
      label: list.label,
      passage: getPassageForChapter(list, chapterIndex),
      chapterIndex,
      isCompleted: completedSections.includes(chapterKey),
    }
  })
}

// Helper function to get today's reading for a plan (legacy for non-cycling plans)
export function getTodaysReading(
  plan: ReadingPlan,
  dayNumber: number,
  progress?: DailyProgress | null
): TodaySection[] {
  const structure = plan.daily_structure
  const completedSections = progress?.completed_sections || []

  if (structure.type === 'free_reading') {
    return [] // No predefined readings for free reading
  }

  if (structure.type === 'cycling_lists') {
    // For cycling plans, use getCurrentReadings with list positions instead
    // This is kept for backwards compatibility but shouldn't be used for cycling plans
    const cyclingStructure = structure as CyclingListsStructure
    return cyclingStructure.lists.map((list) => {
      const chapterIndex = (dayNumber - 1) % list.total_chapters
      return {
        id: list.id,
        listId: list.id,
        label: list.label,
        passage: getPassageForChapter(list, chapterIndex),
        chapterIndex,
        isCompleted: false,
      }
    })
  }

  if (structure.type === 'sequential') {
    const seqStructure = structure as unknown as SequentialPlanStructure
    const chaptersPerDay = seqStructure.chapters_per_day || 3
    const startChapter = (dayNumber - 1) * chaptersPerDay + 1
    const endChapter = startChapter + chaptersPerDay - 1

    let currentChapter = 0
    const passages: string[] = []

    for (const book of seqStructure.books || []) {
      const bookStart = currentChapter + 1
      const bookEnd = currentChapter + book.chapters

      if (endChapter >= bookStart && startChapter <= bookEnd) {
        const readStart = Math.max(startChapter - currentChapter, 1)
        const readEnd = Math.min(endChapter - currentChapter, book.chapters)

        if (readStart === readEnd) {
          passages.push(`${book.book} ${readStart}`)
        } else {
          passages.push(`${book.book} ${readStart}-${readEnd}`)
        }
      }

      currentChapter += book.chapters
      if (currentChapter >= endChapter) break
    }

    const sectionId = `day-${dayNumber}`
    return [{
      id: sectionId,
      listId: 'sequential',
      label: "Today's Reading",
      passage: passages.join(', ') || 'Reading complete',
      chapterIndex: dayNumber - 1,
      isCompleted: completedSections.includes(sectionId),
    }]
  }

  if (structure.type === 'sectional') {
    const sectStructure = structure as unknown as SectionalPlanStructure
    
    // If the structure has a readings array with day-specific data (like M'Cheyne)
    if (sectStructure.readings && Array.isArray(sectStructure.readings)) {
      const dayReading = sectStructure.readings.find(
        (r: { day: number }) => r.day === dayNumber
      )
      
      if (dayReading && dayReading.sections) {
        return dayReading.sections.map((section: { id: string; label: string; passages: string[] }) => {
          // Make section ID unique per day to prevent cross-day completion issues
          const sectionId = `day${dayNumber}-${section.id}`
          return {
            id: sectionId,
            listId: section.id,
            label: section.label,
            passage: section.passages.join(', '),
            chapterIndex: dayNumber - 1,
            isCompleted: completedSections.includes(sectionId),
          }
        })
      }
    }
    
    // Fallback for older sectional structure with top-level sections
    return (sectStructure.sections || []).map((section) => {
      const sectionId = `day${dayNumber}-${section.id}`
      return {
        id: sectionId,
        listId: section.id,
        label: section.label,
        passage: `${section.label} reading for day ${dayNumber}`,
        chapterIndex: dayNumber - 1,
        isCompleted: completedSections.includes(sectionId),
      }
    })
  }

  if (structure.type === 'weekly_sectional') {
    const weeklyStructure = structure as WeeklySectionalStructure
    // Calculate which week and day within that week
    const weekNumber = Math.ceil(dayNumber / weeklyStructure.readings_per_week)
    const dayInWeek = ((dayNumber - 1) % weeklyStructure.readings_per_week) + 1
    
    const weekData = weeklyStructure.weeks.find(w => w.week === weekNumber)
    if (!weekData) {
      return []
    }

    const todaysReading = weekData.readings.find(r => r.dayOfWeek === dayInWeek)
    if (!todaysReading) {
      return []
    }

    const category = weeklyStructure.categories.find(c => c.id === todaysReading.categoryId)
    const sectionId = `week${weekNumber}-day${dayInWeek}`

    return [{
      id: sectionId,
      listId: todaysReading.categoryId,
      label: category?.label || todaysReading.categoryId,
      passage: todaysReading.passage,
      chapterIndex: dayNumber - 1,
      isCompleted: completedSections.includes(sectionId),
    }]
  }

  return []
}

// Helper to calculate plan progress percentage
export function calculatePlanProgress(userPlan: UserPlan, plan: ReadingPlan): number {
  const structure = plan.daily_structure

  // For free reading, return total chapters logged (not a percentage)
  if (structure.type === 'free_reading') {
    return userPlan.list_positions?.['free'] || 0
  }

  // For cycling plans, use the longest list as the completion target
  if (structure.type === 'cycling_lists') {
    const cyclingStructure = structure as CyclingListsStructure
    const longestList = Math.max(...cyclingStructure.lists.map(list => list.total_chapters))
    if (longestList === 0) return 0

    // Find the list with the most chapters read (highest position)
    const maxPosition = Math.max(
      ...cyclingStructure.lists.map(list => userPlan.list_positions[list.id] || 0)
    )

    return Math.min(100, Math.round((maxPosition / longestList) * 100))
  }

  // For weekly_sectional plans, calculate based on total readings
  if (structure.type === 'weekly_sectional') {
    const weeklyStructure = structure as WeeklySectionalStructure
    const totalReadings = weeklyStructure.total_weeks * weeklyStructure.readings_per_week
    if (totalReadings === 0) return 0
    return Math.min(100, Math.round(((userPlan.current_day - 1) / totalReadings) * 100))
  }

  // For other plans with fixed duration
  if (plan.duration_days === 0) return 0
  return Math.min(100, Math.round(((userPlan.current_day - 1) / plan.duration_days) * 100))
}

// Get count of chapters read today
export function getChaptersReadToday(
  progress: DailyProgress | null,
  plan?: ReadingPlan | null
): number {
  if (!progress) return 0

  // For cycling plans or when no plan info, each completed section is one chapter
  if (!plan || plan.daily_structure.type === 'cycling_lists') {
    return progress.completed_sections.length
  }

  // For sequential plans, each completed section represents chapters_per_day chapters
  if (plan.daily_structure.type === 'sequential') {
    const structure = plan.daily_structure as unknown as {
      type: 'sequential'
      chapters_per_day: number
    }
    return progress.completed_sections.length * (structure.chapters_per_day || 3)
  }

  // For sectional plans, each section typically represents one reading
  // but we count the number of sections completed
  if (plan.daily_structure.type === 'sectional') {
    return progress.completed_sections.length
  }

  // For weekly_sectional plans, each reading is typically 1-6 chapters
  // We count completed readings as 1 each for simplicity
  if (plan.daily_structure.type === 'weekly_sectional') {
    return progress.completed_sections.length
  }

  return progress.completed_sections.length
}
