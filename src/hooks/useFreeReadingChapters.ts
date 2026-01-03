import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, withTimeout } from '../lib/supabase'
import { useAuth } from './useAuth'
import { getLocalDate, planKeys } from './usePlans'
import type { FreeReadingChapter, BookCompletionStatus, UserPlan, ReadingPlan, FreeReadingStructure, DailyProgress } from '../types'
import { 
  BIBLE_BOOKS, 
  APOCRYPHA_BOOKS, 
  BIBLE_TOTAL_CHAPTERS, 
  APOCRYPHA_TOTAL_CHAPTERS,
  type BibleBook 
} from '../lib/bibleData'

// Type helper for tables not yet in generated types
type SupabaseFrom = ReturnType<typeof supabase.from>

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
        (supabase.from('free_reading_chapters') as SupabaseFrom)
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
        const { error } = await (supabase.from('free_reading_chapters') as SupabaseFrom)
          .delete()
          .eq('user_plan_id', userPlanId)
          .eq('book', book)
          .eq('chapter', chapter)

        if (error) throw error
        return { action: 'removed' as const, book, chapter }
      } else {
        // Add the chapter (check)
        const { error } = await (supabase.from('free_reading_chapters') as SupabaseFrom)
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
        const { error } = await (supabase.from('free_reading_chapters') as SupabaseFrom)
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

          const { error } = await (supabase.from('free_reading_chapters') as SupabaseFrom)
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
 */
export function useSyncDailyProgress() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      userPlanId,
      chaptersAddedToday,
      userPlan,
    }: {
      userPlanId: string
      chaptersAddedToday: number
      userPlan: UserPlan & { plan: ReadingPlan }
    }) => {
      if (!user) throw new Error('Not authenticated')
      if (chaptersAddedToday <= 0) return { synced: false }

      const today = getLocalDate()

      // Get today's progress
      const { data: progressData } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_plan_id', userPlanId)
        .eq('date', today)
        .maybeSingle()

      const existingProgress = progressData as DailyProgress | null

      // Create entries for streak tracking
      const currentCount = existingProgress?.completed_sections?.length || 0
      const newEntries = Array.from({ length: chaptersAddedToday }, (_, i) => `free:${currentCount + i}`)

      const completedSections = [
        ...(existingProgress?.completed_sections || []),
        ...newEntries
      ]

      if (existingProgress) {
        await (supabase.from('daily_progress') as SupabaseFrom)
          .update({
            completed_sections: completedSections,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)
      } else {
        await (supabase.from('daily_progress') as SupabaseFrom)
          .insert({
            user_id: user.id,
            user_plan_id: userPlanId,
            day_number: 1,
            date: today,
            completed_sections: completedSections,
            is_complete: false,
          })
      }

      // Update running total in user_plans
      const currentTotal = userPlan.list_positions?.['free'] || 0
      await (supabase.from('user_plans') as SupabaseFrom)
        .update({ 
          list_positions: { free: currentTotal + chaptersAddedToday } 
        })
        .eq('id', userPlanId)

      return { synced: true, newTotal: currentTotal + chaptersAddedToday }
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

/**
 * Check if a free reading plan is complete and mark it as such
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

      const isComplete = completedChaptersCount >= totalChapters

      if (isComplete) {
        const { error } = await (supabase.from('user_plans') as SupabaseFrom)
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq('id', userPlanId)

        if (error) throw error
        return { completed: true }
      }

      return { completed: false }
    },
    onSuccess: (result, variables) => {
      if (result.completed && user) {
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


