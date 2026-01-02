import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, withTimeout } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { ReadingPlan, UserPlan, DailyProgress, DailyStructure, CyclingListsStructure, ListPositions, WeeklySectionalStructure } from '../types'

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
  todaysTotalProgress: (userId: string, date: string) => ['todaysTotalProgress', userId, date] as const,
}

// Get today's date in user's local timezone (YYYY-MM-DD)
export function getLocalDate(): string {
  return new Date().toLocaleDateString('en-CA') // Returns YYYY-MM-DD format
}

// Parse a passage string and count the chapters
// Examples: "Genesis 1" → 1, "Genesis 1-3" → 3, "Romans 7-8" → 2, "Psalm 119" → 1
export function countChaptersInPassage(passage: string): number {
  // Match patterns like "Book N-M" or "Book N"
  const rangeMatch = passage.match(/(\d+)\s*-\s*(\d+)/)
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10)
    const end = parseInt(rangeMatch[2], 10)
    return Math.max(1, end - start + 1)
  }

  // Single chapter
  const singleMatch = passage.match(/\d+/)
  if (singleMatch) {
    return 1
  }

  // Fallback - assume 1 chapter
  return 1
}

// Fetch all available reading plans
export function useReadingPlans() {
  return useQuery({
    queryKey: planKeys.list(),
    queryFn: async () => {
      // Using withTimeout to prevent hanging promises after tab suspension
      const { data, error } = await withTimeout(() =>
        supabase
          .from('reading_plans')
          .select('*')
          .eq('is_active', true)
          .order('name')
      )

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
      // Using withTimeout to prevent hanging promises after tab suspension
      const { data, error } = await withTimeout(() =>
        supabase
          .from('reading_plans')
          .select('*')
          .eq('id', planId)
          .single()
      )

      if (error) throw error
      return data as ReadingPlan
    },
    enabled: !!planId,
  })
}

// Fetch user's plans (active and completed)
export function useUserPlans() {
  const { user, isInitialized } = useAuth()

  return useQuery({
    queryKey: planKeys.userPlans(user?.id || ''),
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await withTimeout(() =>
        supabase
          .from('user_plans')
          .select(`
            *,
            plan:reading_plans(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      )

      if (error) throw error
      return data as (UserPlan & { plan: ReadingPlan })[]
    },
    enabled: !!user && isInitialized,
  })
}

// Fetch a single user plan with details
export function useUserPlan(userPlanId: string) {
  return useQuery({
    queryKey: planKeys.userPlan(userPlanId),
    queryFn: async () => {
      // Using withTimeout to prevent hanging promises after tab suspension
      const { data, error } = await withTimeout(() =>
        supabase
          .from('user_plans')
          .select(`
            *,
            plan:reading_plans(*)
          `)
          .eq('id', userPlanId)
          .single()
      )

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
      // Using withTimeout to prevent hanging promises after tab suspension
      const { data, error } = await withTimeout(() =>
        supabase
          .from('daily_progress')
          .select('*')
          .eq('user_plan_id', userPlanId)
          .eq('date', targetDate)
          .maybeSingle()
      )

      if (error) throw error
      return data as DailyProgress | null
    },
    enabled: !!userPlanId,
  })
}

/**
 * Fetch progress for a specific plan day (by day_number, not date).
 *
 * Use this for sequential/sectional plans to preserve completion status
 * across midnight. Returns the most recent progress for the specified day_number.
 */
export function useProgressForPlanDay(userPlanId: string, dayNumber: number) {
  return useQuery({
    queryKey: ['progressForPlanDay', userPlanId, dayNumber],
    queryFn: async () => {
      // Using withTimeout to prevent hanging promises after tab suspension
      const { data, error } = await withTimeout(() =>
        supabase
          .from('daily_progress')
          .select('*')
          .eq('user_plan_id', userPlanId)
          .eq('day_number', dayNumber)
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle()
      )

      if (error) throw error
      return data as DailyProgress | null
    },
    enabled: !!userPlanId && dayNumber > 0,
  })
}

// Fetch all daily progress records for today (for dashboard display)
// NOTE: This is still useful for streak tracking and cycling plans
export function useAllTodayProgress() {
  const { user, isInitialized } = useAuth()
  const today = getLocalDate()

  return useQuery({
    queryKey: ['allTodayProgress', user?.id || '', today],
    queryFn: async () => {
      if (!user) return {}

      const { data, error } = await withTimeout(() =>
        supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
      )

      if (error) throw error

      // Create a map of userPlanId -> DailyProgress
      const progressMap: Record<string, DailyProgress> = {}
      for (const progress of (data || []) as DailyProgress[]) {
        progressMap[progress.user_plan_id] = progress
      }
      return progressMap
    },
    enabled: !!user && isInitialized,
  })
}

/**
 * Fetch progress by day_number for displaying completion status.
 *
 * This solves the bug where progress appears reset after midnight:
 * - User completes Day 1 on Jan 1, doesn't click "Continue"
 * - On Jan 2, current_day is still 1
 * - Old query looked for progress with date='Jan 2' (found nothing)
 * - This query looks for progress with day_number=1 (finds yesterday's completion)
 *
 * Returns a map of userPlanId -> { dayNumber -> DailyProgress }
 * The consumer matches progress using their plan's current_day.
 */
export function useProgressByDayNumber() {
  const { user, isInitialized } = useAuth()

  return useQuery({
    queryKey: ['progressByDayNumber', user?.id || ''],
    queryFn: async () => {
      if (!user) return {}

      // Fetch recent progress (last 30 days covers edge cases)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30)
      const cutoff = cutoffDate.toISOString().split('T')[0]

      const { data, error } = await withTimeout(() =>
        supabase
          .from('daily_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', cutoff)
          .order('date', { ascending: false })
      )

      if (error) throw error

      // Create nested map: userPlanId -> { dayNumber -> DailyProgress }
      // Only keep the most recent progress for each day_number (first one due to descending order)
      const progressMap: Record<string, Record<number, DailyProgress>> = {}
      for (const progress of (data || []) as DailyProgress[]) {
        if (!progressMap[progress.user_plan_id]) {
          progressMap[progress.user_plan_id] = {}
        }
        // Only store if we haven't seen this day_number yet (most recent wins)
        if (!progressMap[progress.user_plan_id][progress.day_number]) {
          progressMap[progress.user_plan_id][progress.day_number] = progress
        }
      }
      return progressMap
    },
    enabled: !!user && isInitialized,
  })
}

/**
 * Helper to get progress for a specific plan's current day from the progress map.
 * Use with useProgressByDayNumber() for sectional/sequential plans.
 */
export function getProgressForCurrentDay(
  progressMap: Record<string, Record<number, DailyProgress>> | undefined,
  userPlanId: string,
  currentDay: number
): DailyProgress | null {
  if (!progressMap || !progressMap[userPlanId]) return null
  return progressMap[userPlanId][currentDay] || null
}

// Fetch total chapters read today across ALL plans (for global streak tracking)
export function useTodaysTotalChapters() {
  const { user, isInitialized } = useAuth()
  const today = getLocalDate()

  return useQuery({
    queryKey: planKeys.todaysTotalProgress(user?.id || '', today),
    queryFn: async () => {
      if (!user) return 0

      type ProgressWithPlan = {
        completed_sections?: string[]
        user_plan?: {
          current_day?: number
          plan?: {
            daily_structure?: DailyStructure
          }
        }
      }

      // Fetch all progress for today across all plans
      const result = await withTimeout(() =>
        (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .select('*, user_plan:user_plans(current_day, plan:reading_plans(daily_structure))')
          .eq('user_id', user.id)
          .eq('date', today)
      ) as { data: ProgressWithPlan[] | null; error: Error | null }

      if (result.error) throw result.error
      if (!result.data || result.data.length === 0) return 0

      const progressData = result.data

      // Calculate total chapters based on plan types
      let totalChapters = 0
      for (const progress of progressData) {
        const completedSections = progress.completed_sections || []
        const dailyStructure = progress.user_plan?.plan?.daily_structure
        const currentDay = progress.user_plan?.current_day || 1

        if (!dailyStructure) {
          totalChapters += completedSections.length
          continue
        }

        const planType = dailyStructure.type

        // For cycling plans, each completed section is one chapter
        if (planType === 'cycling_lists') {
          totalChapters += completedSections.length
          continue
        }

        // For sequential plans, look up passages and count chapters
        if (planType === 'sequential') {
          const structure = dailyStructure as import('../types').SequentialStructure
          const dayReading = structure.readings?.find(r => r.day === currentDay)

          if (dayReading && completedSections.length > 0) {
            for (const section of dayReading.sections) {
              const sectionId = `day-${currentDay}`
              if (completedSections.includes(sectionId)) {
                for (const passage of section.passages) {
                  totalChapters += countChaptersInPassage(passage)
                }
              }
            }
          } else {
            // Fallback
            const legacyStructure = dailyStructure as unknown as { chapters_per_day?: number }
            totalChapters += completedSections.length * (legacyStructure.chapters_per_day || 3)
          }
          continue
        }

        // For sectional plans, parse day from completed section IDs
        if (planType === 'sectional') {
          const structure = dailyStructure as import('../types').SectionalStructure
          let dayChapters = 0

          for (const sectionStr of completedSections) {
            // Extract day number from section ID (e.g., "day3-family1" -> 3)
            const dayMatch = sectionStr.match(/^day(\d+)-(.+)$/)
            if (!dayMatch) continue

            const dayNum = parseInt(dayMatch[1], 10)
            const sectionId = dayMatch[2]

            const dayReading = structure.readings?.find(r => r.day === dayNum)
            if (!dayReading) continue

            const section = dayReading.sections.find(s => s.id === sectionId)
            if (section) {
              for (const passage of section.passages) {
                dayChapters += countChaptersInPassage(passage)
              }
            }
          }

          totalChapters += dayChapters > 0 ? dayChapters : completedSections.length
          continue
        }

        // For weekly_sectional plans, parse week/day from completed section IDs
        if (planType === 'weekly_sectional') {
          const structure = dailyStructure as import('../types').WeeklySectionalStructure
          let weekChapters = 0

          for (const sectionStr of completedSections) {
            // Extract week and day from section ID (e.g., "week1-day3" -> week 1, day 3)
            const match = sectionStr.match(/^week(\d+)-day(\d+)$/)
            if (!match) continue

            const weekNum = parseInt(match[1], 10)
            const dayOfWeek = parseInt(match[2], 10)

            const weekReading = structure.weeks?.find(w => w.week === weekNum)
            if (!weekReading) continue

            const reading = weekReading.readings.find(r => r.dayOfWeek === dayOfWeek)
            if (reading) {
              weekChapters += countChaptersInPassage(reading.passage)
            }
          }

          totalChapters += weekChapters > 0 ? weekChapters : completedSections.length
          continue
        }

        // Fallback for free reading and unknown types
        totalChapters += completedSections.length
      }

      return totalChapters
    },
    enabled: !!user && isInitialized,
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
          start_date: startDate || getLocalDate(),
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

/**
 * Helper to toggle a section in completed_sections array
 */
function toggleSection(sections: string[], sectionId: string): string[] {
  if (sections.includes(sectionId)) {
    return sections.filter((s) => s !== sectionId)
  }
  return [...sections, sectionId]
}

/**
 * Helper to handle duplicate key errors when inserting daily_progress.
 * If insert fails due to duplicate key, fetches existing record and updates it.
 * This handles race conditions where progress query timed out but record exists.
 */
async function handleDuplicateKeyAndUpdate(
  insertError: { code?: string; message?: string } | null,
  userPlanId: string,
  date: string,
  sectionId: string,
  isCompleteCalculator?: (sections: string[]) => boolean
): Promise<DailyProgress | null> {
  // Check if this is a duplicate key error
  if (insertError?.code !== '23505' && !insertError?.message?.includes('duplicate key')) {
    return null // Not a duplicate key error
  }

  // Fetch the existing record
  const { data: actualExisting, error: fetchError } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_plan_id', userPlanId)
    .eq('date', date)
    .single()

  if (fetchError || !actualExisting) {
    // Record was deleted between insert and fetch, or fetch failed
    // Throw original error with more context
    throw new Error(
      `Duplicate key error occurred but could not fetch existing record. ` +
      `Original error: ${insertError?.message || 'Unknown'}`
    )
  }

  const existing = actualExisting as DailyProgress
  // Re-calculate toggle based on actual existing data
  const actualSections = toggleSection(existing.completed_sections || [], sectionId)
  const isComplete = isCompleteCalculator ? isCompleteCalculator(actualSections) : existing.is_complete

  const { data: updatedData, error: updateError } = await (supabase
    .from('daily_progress') as ReturnType<typeof supabase.from>)
    .update({
      completed_sections: actualSections,
      is_complete: isComplete,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single()

  if (updateError) {
    throw updateError
  }

  return updatedData as DailyProgress
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
      const completedSections = toggleSection(existingProgress?.completed_sections || [], chapterKey)

      // 2. Update or create daily_progress
      if (existingProgress) {
        const { error: updateError } = await (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .update({
            completed_sections: completedSections,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)

        if (updateError) throw updateError
      } else {
        // Try INSERT, handle duplicate key error gracefully
        const { error: insertError } = await (supabase
          .from('daily_progress') as ReturnType<typeof supabase.from>)
          .insert({
            user_id: user.id,
            user_plan_id: userPlanId,
            day_number: userPlan.current_day,
            date: today,
            completed_sections: completedSections,
            is_complete: false,
          })

        if (insertError) {
          // Try to handle duplicate key error
          const handled = await handleDuplicateKeyAndUpdate(
            insertError,
            userPlanId,
            today,
            chapterKey
          )
          if (handled) {
            return { completedSections: handled.completed_sections }
          }
          // Not a duplicate key error, throw it
          throw insertError
        }
      }

      // Note: We do NOT advance list_positions here - that's done explicitly
      // via useAdvanceList when the user wants to continue to the next chapter

      return { completedSections }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      // Also invalidate the day_number-based progress queries (used by ActivePlan and Dashboard)
      queryClient.invalidateQueries({ queryKey: ['progressForPlanDay', variables.userPlanId] })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
        queryClient.invalidateQueries({ queryKey: ['allTodayProgress', user.id, today] })
        queryClient.invalidateQueries({ queryKey: ['progressByDayNumber', user.id] })
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
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
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

      // Check if plan is now complete (reached the final day)
      const isNowComplete = newDay >= maxDay

      await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .update({
          current_day: newDay,
          is_completed: isNowComplete,
          completed_at: isNowComplete ? new Date().toISOString() : null,
        })
        .eq('id', userPlanId)

      return { newDay, isComplete: isNowComplete }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
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
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
      }
    },
  })
}

// Mark a plan as complete
export function useMarkPlanComplete() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ userPlanId }: { userPlanId: string }) => {
      if (!user) throw new Error('Not authenticated')

      await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', userPlanId)

      return { completed: true }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
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
      const newCompletedSections = toggleSection(existingProgress?.completed_sections || [], sectionId)
      const isComplete = newCompletedSections.length >= totalSections
      const isCompleteCalculator = (sections: string[]) => sections.length >= totalSections

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
      }

      // Try INSERT, handle duplicate key error gracefully
      // This can happen if progress query timed out but record actually exists
      const { data, error: insertError } = await (supabase
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

      if (insertError) {
        // Try to handle duplicate key error
        const handled = await handleDuplicateKeyAndUpdate(
          insertError,
          userPlanId,
          today,
          sectionId,
          isCompleteCalculator
        )
        if (handled) {
          return handled
        }
        // Not a duplicate key error, throw it
        throw insertError
      }

      return data as DailyProgress
    },
    onSuccess: (data, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({
        queryKey: planKeys.dailyProgress(variables.userPlanId, today),
      })
      // Also invalidate the day_number-based progress queries (used by ActivePlan and Dashboard)
      queryClient.invalidateQueries({ queryKey: ['progressForPlanDay', variables.userPlanId] })

      // Always invalidate stats, allTodayProgress, and todaysTotalProgress when sections are marked
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
        queryClient.invalidateQueries({ queryKey: ['allTodayProgress', user.id, today] })
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
        queryClient.invalidateQueries({ queryKey: ['progressByDayNumber', user.id] })
      }

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

// Helper to check if a plan is at its final day (for non-cycling plans with duration)
export function isPlanAtFinalDay(userPlan: UserPlan, plan: ReadingPlan): boolean {
  // Cycling plans and free reading don't have a final day
  if (plan.daily_structure.type === 'cycling_lists') return false
  if (plan.daily_structure.type === 'free_reading') return false

  // Plans with 0 duration run indefinitely
  if (!plan.duration_days || plan.duration_days === 0) return false

  // Check if current day is at or past the duration
  return userPlan.current_day >= plan.duration_days
}

// Get count of chapters read today
export function getChaptersReadToday(
  progress: DailyProgress | null,
  plan?: ReadingPlan | null,
  userPlan?: { current_day: number } | null
): number {
  if (!progress) return 0

  // For cycling plans or when no plan info, each completed section is one chapter
  if (!plan || plan.daily_structure.type === 'cycling_lists') {
    return progress.completed_sections.length
  }

  // For sequential plans, count chapters from the passages for this day
  if (plan.daily_structure.type === 'sequential') {
    const structure = plan.daily_structure as import('../types').SequentialStructure
    const currentDay = userPlan?.current_day || 1
    const dayReading = structure.readings?.find(r => r.day === currentDay)

    if (dayReading && progress.completed_sections.length > 0) {
      // Count total chapters from all sections' passages
      let totalChapters = 0
      for (const section of dayReading.sections) {
        const sectionId = `day-${currentDay}`
        if (progress.completed_sections.includes(sectionId)) {
          for (const passage of section.passages) {
            totalChapters += countChaptersInPassage(passage)
          }
        }
      }
      // If we found passages, return the count, otherwise fall back to default
      if (totalChapters > 0) return totalChapters
    }

    // Fallback: use chapters_per_day if available
    const legacyStructure = plan.daily_structure as unknown as { chapters_per_day?: number }
    return progress.completed_sections.length * (legacyStructure.chapters_per_day || 3)
  }

  // For sectional plans, count chapters from completed sections
  // Parse the day number from each completed section (format: "day{N}-{sectionId}")
  if (plan.daily_structure.type === 'sectional') {
    const structure = plan.daily_structure as import('../types').SectionalStructure
    let totalChapters = 0

    for (const sectionStr of progress.completed_sections) {
      // Extract day number from section ID (e.g., "day3-family1" -> 3)
      const dayMatch = sectionStr.match(/^day(\d+)-(.+)$/)
      if (!dayMatch) continue

      const dayNum = parseInt(dayMatch[1], 10)
      const sectionId = dayMatch[2]

      const dayReading = structure.readings?.find(r => r.day === dayNum)
      if (!dayReading) continue

      const section = dayReading.sections.find(s => s.id === sectionId)
      if (section) {
        for (const passage of section.passages) {
          totalChapters += countChaptersInPassage(passage)
        }
      }
    }

    return totalChapters > 0 ? totalChapters : progress.completed_sections.length
  }

  // For weekly_sectional plans, count chapters from completed readings
  // Parse the week/day from each completed section (format: "week{W}-day{D}")
  if (plan.daily_structure.type === 'weekly_sectional') {
    const structure = plan.daily_structure as import('../types').WeeklySectionalStructure
    let totalChapters = 0

    for (const sectionStr of progress.completed_sections) {
      // Extract week and day from section ID (e.g., "week1-day3" -> week 1, day 3)
      const match = sectionStr.match(/^week(\d+)-day(\d+)$/)
      if (!match) continue

      const weekNum = parseInt(match[1], 10)
      const dayOfWeek = parseInt(match[2], 10)

      const weekReading = structure.weeks?.find(w => w.week === weekNum)
      if (!weekReading) continue

      const reading = weekReading.readings.find(r => r.dayOfWeek === dayOfWeek)
      if (reading) {
        totalChapters += countChaptersInPassage(reading.passage)
      }
    }

    return totalChapters > 0 ? totalChapters : progress.completed_sections.length
  }

  return progress.completed_sections.length
}

// Archive a user plan (hide from Today's Missions)
export function useArchivePlan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (userPlanId: string) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
        })
        .eq('id', userPlanId)
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

// Unarchive a user plan (restore to Today's Missions)
export function useUnarchivePlan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (userPlanId: string) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error} = await (supabase
        .from('user_plans') as ReturnType<typeof supabase.from>)
        .update({
          is_archived: false,
          archived_at: null,
        })
        .eq('id', userPlanId)
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
