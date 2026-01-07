import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabase, withTimeout } from '../lib/supabase'
import { useAuth } from './useAuth'
import { getLocalDate, planKeys } from './usePlans'
import type { FreeReadingChapter, BookCompletionStatus, ReadingPlan, FreeReadingStructure, DailyProgress } from '../types'
import { 
  BIBLE_BOOKS, 
  APOCRYPHA_BOOKS, 
  BIBLE_TOTAL_CHAPTERS, 
  APOCRYPHA_TOTAL_CHAPTERS,
  type BibleBook 
} from '../lib/bibleData'

// Type helper for tables not yet in generated types
type SupabaseFrom = ReturnType<ReturnType<typeof getSupabase>['from']>

// Query keys for free reading chapters
export const freeReadingKeys = {
  all: ['freeReadingChapters'] as const,
  chapters: (userPlanId: string) => [...freeReadingKeys.all, 'chapters', userPlanId] as const,
  progress: (userPlanId: string) => [...freeReadingKeys.all, 'progress', userPlanId] as const,
}

/**
 * Get the book type for a free reading plan
 */
export function getBookTypeForPlan(plan: ReadingPlan): 'bible' | 'apocrypha' {
  const structure = plan.daily_structure as FreeReadingStructure
  return structure.book_type || 'bible'
}

/**
 * Get the books and total chapters for a plan
 */
export function getBooksAndTotalForPlan(plan: ReadingPlan): { books: BibleBook[], totalChapters: number } {
  const bookType = getBookTypeForPlan(plan)
  return {
    books: bookType === 'bible' ? BIBLE_BOOKS : APOCRYPHA_BOOKS,
    totalChapters: bookType === 'bible' ? BIBLE_TOTAL_CHAPTERS : APOCRYPHA_TOTAL_CHAPTERS,
  }
}

/**
 * Fetch all completed chapters for a user's free reading plan
 */
export function useFreeReadingChapters(userPlanId: string) {
  return useQuery({
    queryKey: freeReadingKeys.chapters(userPlanId),
    queryFn: async () => {
      const result = await withTimeout(() =>
        (getSupabase().from('free_reading_chapters') as SupabaseFrom)
          .select('*')
          .eq('user_plan_id', userPlanId)
          .order('book')
          .order('chapter')
      ) as { data: FreeReadingChapter[] | null; error: Error | null }

      if (result.error) throw result.error
      return result.data as FreeReadingChapter[]
    },
    enabled: !!userPlanId,
  })
}

/**
 * Calculate book completion status from completed chapters
 */
export function calculateBookCompletionStatus(
  completedChapters: FreeReadingChapter[],
  books: BibleBook[]
): BookCompletionStatus[] {
  // Create a map of book -> completed chapter numbers
  const completedMap = new Map<string, Set<number>>()
  for (const chapter of completedChapters) {
    if (!completedMap.has(chapter.book)) {
      completedMap.set(chapter.book, new Set())
    }
    completedMap.get(chapter.book)!.add(chapter.chapter)
  }

  // Build status for each book
  return books.map(book => {
    const completed = completedMap.get(book.name) || new Set<number>()
    return {
      book: book.name,
      totalChapters: book.chapters,
      completedChapters: completed.size,
      completedChapterNumbers: Array.from(completed).sort((a, b) => a - b),
      isComplete: completed.size >= book.chapters,
    }
  })
}

/**
 * Calculate overall progress for a free reading plan
 */
export function calculateFreeReadingProgress(
  completedChapters: FreeReadingChapter[],
  totalChapters: number
): { completed: number, total: number, percentage: number } {
  const completed = completedChapters.length
  return {
    completed,
    total: totalChapters,
    percentage: totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0,
  }
}

/**
 * Toggle a single chapter (mark as read or unread)
 */
export function useToggleChapter() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      book,
      chapter,
      isCurrentlyCompleted,
    }: {
      userPlanId: string
      book: string
      chapter: number
      isCurrentlyCompleted: boolean
    }) => {
      if (!user) throw new Error('Not authenticated')

      if (isCurrentlyCompleted) {
        // Remove the chapter (uncheck)
        const { error } = await (getSupabase().from('free_reading_chapters') as SupabaseFrom)
          .delete()
          .eq('user_plan_id', userPlanId)
          .eq('book', book)
          .eq('chapter', chapter)

        if (error) throw error
        return { action: 'removed' as const, book, chapter }
      } else {
        // Add the chapter (check)
        const { error } = await (getSupabase().from('free_reading_chapters') as SupabaseFrom)
          .insert({
            user_plan_id: userPlanId,
            user_id: user.id,
            book,
            chapter,
          })

        if (error) throw error
        return { action: 'added' as const, book, chapter }
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: freeReadingKeys.chapters(variables.userPlanId) })
      queryClient.invalidateQueries({ queryKey: freeReadingKeys.progress(variables.userPlanId) })
    },
  })
}

/**
 * Toggle all chapters in a book (select all / deselect all)
 */
export function useToggleBook() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      book,
      totalChapters,
      currentlyCompletedChapters,
    }: {
      userPlanId: string
      book: string
      totalChapters: number
      currentlyCompletedChapters: number[]
    }) => {
      if (!user) throw new Error('Not authenticated')

      const isFullyComplete = currentlyCompletedChapters.length >= totalChapters

      if (isFullyComplete) {
        // Remove all chapters for this book (uncheck all)
        const { error } = await (getSupabase().from('free_reading_chapters') as SupabaseFrom)
          .delete()
          .eq('user_plan_id', userPlanId)
          .eq('book', book)

        if (error) throw error
        return { action: 'removed_all' as const, book, count: currentlyCompletedChapters.length }
      } else {
        // Add all missing chapters for this book (check all)
        const allChapters = Array.from({ length: totalChapters }, (_, i) => i + 1)
        const missingChapters = allChapters.filter(ch => !currentlyCompletedChapters.includes(ch))

        if (missingChapters.length > 0) {
          const inserts = missingChapters.map(chapter => ({
            user_plan_id: userPlanId,
            user_id: user.id,
            book,
            chapter,
          }))

          const { error } = await (getSupabase().from('free_reading_chapters') as SupabaseFrom)
            .insert(inserts)

          if (error) throw error
        }

        return { action: 'added_all' as const, book, count: missingChapters.length }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: freeReadingKeys.chapters(variables.userPlanId) })
      queryClient.invalidateQueries({ queryKey: freeReadingKeys.progress(variables.userPlanId) })
    },
  })
}

/**
 * Sync chapter completions with daily_progress for streak tracking
 * This should be called after toggling chapters to update the streak system
 * Handles both additions and removals of chapters
 */
export function useSyncDailyProgress() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      chaptersChanged,
      action,
    }: {
      userPlanId: string
      chaptersChanged: number
      action: 'add' | 'remove'
    }) => {
      if (!user) throw new Error('Not authenticated')
      if (chaptersChanged <= 0) return { synced: false }

      const today = getLocalDate()

      // Get today's progress
      const { data: progressData, error: fetchError } = await getSupabase()
        .from('daily_progress')
        .select('*')
        .eq('user_plan_id', userPlanId)
        .eq('date', today)
        .maybeSingle()

      if (fetchError) {
        console.error('[syncDailyProgress] Error fetching progress:', fetchError)
        throw fetchError
      }

      const existingProgress = progressData as DailyProgress | null
      const currentSections = existingProgress?.completed_sections || []

      let completedSections: string[]

      if (action === 'add') {
        // Create entries for streak tracking
        const currentCount = currentSections.length
        const newEntries = Array.from({ length: chaptersChanged }, (_, i) => `free:${currentCount + i}`)
        completedSections = [...currentSections, ...newEntries]
      } else {
        // Remove entries from the end (LIFO - removes most recent entries)
        completedSections = currentSections.slice(0, Math.max(0, currentSections.length - chaptersChanged))
      }

      if (existingProgress) {
        const { error: updateError } = await (getSupabase().from('daily_progress') as SupabaseFrom)
          .update({
            completed_sections: completedSections,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)

        if (updateError) {
          console.error('[syncDailyProgress] Error updating progress:', updateError)
          throw updateError
        }
      } else if (action === 'add') {
        const { error: insertError } = await (getSupabase().from('daily_progress') as SupabaseFrom)
          .insert({
            user_id: user.id,
            user_plan_id: userPlanId,
            day_number: 1,
            date: today,
            completed_sections: completedSections,
            is_complete: false,
          })

        if (insertError) {
          console.error('[syncDailyProgress] Error inserting progress:', insertError)
          throw insertError
        }
      }

      // Update running total in user_plans
      const { data: currentPlan, error: planFetchError } = await getSupabase()
        .from('user_plans')
        .select('list_positions')
        .eq('id', userPlanId)
        .single()

      if (planFetchError) {
        console.error('[syncDailyProgress] Error fetching plan:', planFetchError)
        throw planFetchError
      }

      const currentPositions = ((currentPlan as unknown as { list_positions?: Record<string, number> } | null)?.list_positions) || {}
      const currentTotal = currentPositions['free'] || 0
      const newTotal = action === 'add'
        ? currentTotal + chaptersChanged
        : Math.max(0, currentTotal - chaptersChanged)

      const { error: updatePlanError } = await (getSupabase().from('user_plans') as SupabaseFrom)
        .update({
          list_positions: { ...currentPositions, free: newTotal }
        })
        .eq('id', userPlanId)

      if (updatePlanError) {
        console.error('[syncDailyProgress] Error updating plan:', updatePlanError)
        throw updatePlanError
      }

      console.log('[syncDailyProgress] Success:', { action, chaptersChanged, newTotal, completedSections: completedSections.length })
      return { synced: true, newTotal }
    },
    onSuccess: (_, variables) => {
      const today = getLocalDate()
      queryClient.invalidateQueries({ queryKey: planKeys.dailyProgress(variables.userPlanId, today) })
      // Also invalidate progressForPlanDay since free reading plans use this query
      queryClient.invalidateQueries({ queryKey: ['progressForPlanDay', variables.userPlanId] })
      queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
        queryClient.invalidateQueries({ queryKey: planKeys.todaysTotalProgress(user.id, today) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
        // Invalidate guild data (user may be in multiple guilds)
        queryClient.invalidateQueries({ queryKey: ['guildChapterCounts'] })
        queryClient.invalidateQueries({ queryKey: ['guilds', 'detail'] })
      }
    },
  })
}

/**
 * Check if a free reading plan is complete and update its status accordingly.
 * Handles both completing and uncompleting a plan when chapters are added/removed.
 */
export function useCheckAndCompletePlan() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      completedChaptersCount,
      totalChapters,
    }: {
      userPlanId: string
      completedChaptersCount: number
      totalChapters: number
    }) => {
      if (!user) throw new Error('Not authenticated')

      const shouldBeComplete = completedChaptersCount >= totalChapters

      // Update completion status (handles both completing and uncompleting)
      const { error } = await (getSupabase().from('user_plans') as SupabaseFrom)
        .update({
          is_completed: shouldBeComplete,
          completed_at: shouldBeComplete ? new Date().toISOString() : null,
        })
        .eq('id', userPlanId)

      if (error) throw error
      return { completed: shouldBeComplete }
    },
    onSuccess: (_, variables) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: planKeys.userPlan(variables.userPlanId) })
        queryClient.invalidateQueries({ queryKey: planKeys.userPlans(user.id) })
        queryClient.invalidateQueries({ queryKey: ['stats', user.id] })
      }
    },
  })
}

/**
 * Hook to get book completion status for UI rendering
 */
export function useBookCompletionStatus(userPlanId: string, books: BibleBook[]) {
  const { data: chapters = [], isLoading } = useFreeReadingChapters(userPlanId)
  
  const bookStatus = calculateBookCompletionStatus(chapters, books)
  const totalCompleted = chapters.length
  const totalChapters = books.reduce((sum, book) => sum + book.chapters, 0)
  
  return {
    bookStatus,
    totalCompleted,
    totalChapters,
    percentage: totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0,
    isLoading,
    chapters,
  }
}

/**
 * Check if a specific chapter is completed
 */
export function isChapterCompleted(
  completedChapters: FreeReadingChapter[],
  book: string,
  chapter: number
): boolean {
  return completedChapters.some(ch => ch.book === book && ch.chapter === chapter)
}


