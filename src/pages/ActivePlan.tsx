import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { Swords, BookOpen, ChevronRight, Archive, ChevronLeft, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import {
  useUserPlan,
  useDailyProgress,
  useProgressForPlanDay,
  useMarkChapterRead,
  useMarkSectionComplete,
  useAdvanceList,
  useAdvanceDay,
  useArchivePlan,
  useMarkPlanComplete,
  useTodaysTotalChapters,
  getCurrentReadings,
  getTodaysReading,
  calculatePlanProgress,
  getChaptersReadToday,
  isPlanAtFinalDay,
  countChaptersInPassage,
} from '../hooks/usePlans'
import {
  useBookCompletionStatus,
  useToggleChapter,
  useToggleBook,
  useSyncDailyProgress,
  useCheckAndCompletePlan,
  getBooksAndTotalForPlan,
} from '../hooks/useFreeReadingChapters'
import { useQuestCompleteAchievement } from '../hooks/useAchievements'
import { useAuth } from '../hooks/useAuth'
import { captureError } from '../lib/errorLogger'
import { ReadingSection, PlanProgress, BibleChapterPicker, BibleProgressDashboard } from '../components/plans'
import { Card, CardHeader, CardContent, Button, LoadingSpinner, Badge } from '../components/ui'
import { queryClient } from '../lib/queryClient'

export function ActivePlan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: userPlan, isLoading: planLoading, error: planError } = useUserPlan(id || '')
  // For cycling plans, use today's progress (tracks by listId:chapterIndex)
  const { data: todayProgress, isLoading: todayProgressLoading, error: todayProgressError } = useDailyProgress(id || '')
  // For sequential/sectional plans, use day_number-based progress to preserve
  // completion status across midnight (fixes the "progress reset" bug)
  const { data: dayNumberProgress, isLoading: dayNumberProgressLoading, error: dayNumberProgressError } = useProgressForPlanDay(
    id || '',
    userPlan?.current_day || 0
  )
  // Choose the right progress based on plan type
  const isCyclingPlan = userPlan?.plan.daily_structure.type === 'cycling_lists'
  const isFreeReadingPlan = userPlan?.plan.daily_structure.type === 'free_reading'
  const progress = isCyclingPlan ? todayProgress : dayNumberProgress
  const progressLoading = isCyclingPlan ? todayProgressLoading : dayNumberProgressLoading
  const progressError = isCyclingPlan ? todayProgressError : dayNumberProgressError

  // Get book data for free reading plans
  const booksAndTotal = userPlan?.plan ? getBooksAndTotalForPlan(userPlan.plan) : { books: [], totalChapters: 0 }
  
  // Free reading chapter tracking
  const {
    bookStatus,
    totalCompleted: freeReadingCompleted,
    totalChapters: freeReadingTotal,
    percentage: freeReadingPercentage,
    isLoading: freeReadingLoading,
    chapters: completedChapters,
  } = useBookCompletionStatus(id || '', booksAndTotal.books)

  const toggleChapter = useToggleChapter()
  const toggleBook = useToggleBook()
  const syncDailyProgress = useSyncDailyProgress()
  const checkAndCompletePlan = useCheckAndCompletePlan()

  const markChapterRead = useMarkChapterRead()
  const markSectionComplete = useMarkSectionComplete()
  const advanceList = useAdvanceList()
  const advanceDay = useAdvanceDay()
  const archivePlan = useArchivePlan()
  const markPlanComplete = useMarkPlanComplete()
  const triggerQuestComplete = useQuestCompleteAchievement()
  const { data: totalChaptersToday = 0 } = useTodaysTotalChapters()

  const isLoading = planLoading || progressLoading || (isFreeReadingPlan && freeReadingLoading)
  const error = planError || progressError
  const isMutating = markChapterRead.isPending || markSectionComplete.isPending ||
                     advanceList.isPending || advanceDay.isPending ||
                     archivePlan.isPending || markPlanComplete.isPending ||
                     toggleChapter.isPending || toggleBook.isPending

  // Achievement effects - must be before early returns to satisfy React hooks rules
  // Auto-mark plan as complete when final day readings are done
  useEffect(() => {
    if (!userPlan || !id) return
    const plan = userPlan.plan
    const isCycling = plan.daily_structure.type === 'cycling_lists'
    const isFree = plan.daily_structure.type === 'free_reading'

    // Only for non-cycling, non-free plans with duration
    if (isCycling || isFree || !plan.duration_days) return

    const isAtFinal = userPlan.current_day >= plan.duration_days
    const todaysReading = getTodaysReading(plan, userPlan.current_day, progress || null)
    const allComplete = todaysReading.length > 0 && todaysReading.every(s => s.isCompleted)

    if (isAtFinal && allComplete && !userPlan.is_completed) {
      markPlanComplete.mutate({ userPlanId: id })
      triggerQuestComplete(plan.name, plan.id)
    }
  }, [userPlan, progress, id, markPlanComplete, triggerQuestComplete])

  // Trigger achievement if plan was already completed (e.g., completed on another device)
  useEffect(() => {
    if (userPlan?.is_completed && userPlan.plan?.id) {
      triggerQuestComplete(userPlan.plan.name, userPlan.plan.id)
    }
  }, [userPlan?.is_completed, userPlan?.plan?.id, userPlan?.plan?.name, triggerQuestComplete])

  // Auto-mark free reading plan as complete when all chapters are read
  useEffect(() => {
    if (!userPlan || !id || userPlan.is_completed) return
    if (userPlan.plan.daily_structure.type !== 'free_reading') return
    if (freeReadingLoading || freeReadingTotal === 0) return

    if (freeReadingCompleted >= freeReadingTotal) {
      checkAndCompletePlan.mutate({
        userPlanId: id,
        completedChaptersCount: freeReadingCompleted,
        totalChapters: freeReadingTotal,
      })
      triggerQuestComplete(userPlan.plan.name, userPlan.plan.id)
    }
  }, [userPlan, id, freeReadingCompleted, freeReadingTotal, freeReadingLoading, checkAndCompletePlan, triggerQuestComplete])

  // Handle toggling a single chapter in the Bible chapter picker
  // Must be defined before early returns to satisfy React hooks rules
  const handleToggleChapter = useCallback(async (book: string, chapter: number, isCompleted: boolean) => {
    if (!id || !userPlan) return

    try {
      const result = await toggleChapter.mutateAsync({
        userPlanId: id,
        book,
        chapter,
        isCurrentlyCompleted: isCompleted,
      })

      // Sync with daily progress for streak tracking (handles both add and remove)
      await syncDailyProgress.mutateAsync({
        userPlanId: id,
        chaptersChanged: 1,
        action: result.action === 'added' ? 'add' : 'remove',
      })

      // Check for plan completion (handles both completing and uncompleting)
      const newTotal = result.action === 'added'
        ? freeReadingCompleted + 1
        : freeReadingCompleted - 1

      await checkAndCompletePlan.mutateAsync({
        userPlanId: id,
        completedChaptersCount: newTotal,
        totalChapters: freeReadingTotal,
      })

      // Show completion toast if plan is now complete
      if (newTotal >= freeReadingTotal && !userPlan.is_completed) {
        triggerQuestComplete(userPlan.plan.name, userPlan.plan.id)
      }
    } catch (err) {
      captureError(err, { component: 'ActivePlan', action: 'toggleChapter', planId: id })
      toast.error('Failed to update chapter. Please try again.')
    }
  }, [id, userPlan, toggleChapter, syncDailyProgress, checkAndCompletePlan, freeReadingCompleted, freeReadingTotal, triggerQuestComplete])

  // Handle toggling all chapters in a book
  // Must be defined before early returns to satisfy React hooks rules
  const handleToggleBook = useCallback(async (book: string, totalChapters: number, completedChapterNumbers: number[]) => {
    if (!id || !userPlan) return

    try {
      const isFullyComplete = completedChapterNumbers.length >= totalChapters
      const chaptersToToggle = isFullyComplete
        ? completedChapterNumbers.length  // Removing all completed chapters
        : totalChapters - completedChapterNumbers.length  // Adding remaining chapters

      await toggleBook.mutateAsync({
        userPlanId: id,
        book,
        totalChapters,
        currentlyCompletedChapters: completedChapterNumbers,
      })

      // Sync with daily progress for streak tracking (handles both add and remove)
      await syncDailyProgress.mutateAsync({
        userPlanId: id,
        chaptersChanged: chaptersToToggle,
        action: isFullyComplete ? 'remove' : 'add',
      })

      // Check for plan completion (handles both completing and uncompleting)
      const newTotal = isFullyComplete
        ? freeReadingCompleted - completedChapterNumbers.length
        : freeReadingCompleted + chaptersToToggle

      await checkAndCompletePlan.mutateAsync({
        userPlanId: id,
        completedChaptersCount: newTotal,
        totalChapters: freeReadingTotal,
      })

      // Show completion toast if plan is now complete
      if (newTotal >= freeReadingTotal && !userPlan.is_completed) {
        triggerQuestComplete(userPlan.plan.name, userPlan.plan.id)
      }

      toast.success(isFullyComplete
        ? `Unmarked all chapters in ${book}`
        : `Marked ${chaptersToToggle} chapter${chaptersToToggle === 1 ? '' : 's'} in ${book} as read!`
      )
    } catch (err) {
      captureError(err, { component: 'ActivePlan', action: 'toggleBook', planId: id })
      toast.error('Failed to update book. Please try again.')
    }
  }, [id, userPlan, toggleBook, syncDailyProgress, checkAndCompletePlan, freeReadingCompleted, freeReadingTotal, triggerQuestComplete])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger">ERROR: Failed to load quest</p>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-2">{error.message}</p>
          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={() => queryClient.refetchQueries()}
              className="font-pixel text-[0.625rem] text-sage hover:text-sage-dark underline"
            >
              Try Again
            </button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger">ERROR: Quest not found</p>
          <Button variant="secondary" onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { plan } = userPlan
  const isFreeReading = plan.daily_structure.type === 'free_reading'
  const isWeeklyPlan = plan.daily_structure.type === 'weekly_sectional'

  // Get readings based on plan type
  const todaysReading = isCyclingPlan
    ? getCurrentReadings(plan, userPlan.list_positions || {}, progress || null)
    : getTodaysReading(plan, userPlan.current_day, progress || null)

  // Calculate week/day for weekly plans
  const weeklyInfo = isWeeklyPlan ? (() => {
    const structure = plan.daily_structure as import('../types').WeeklySectionalStructure
    const currentWeek = Math.ceil(userPlan.current_day / structure.readings_per_week)
    const dayInWeek = ((userPlan.current_day - 1) % structure.readings_per_week) + 1
    return { currentWeek, dayInWeek, totalWeeks: structure.total_weeks }
  })() : null

  // Chapters read in THIS plan's current day (for Today's Progress display)
  const chaptersReadToday = getChaptersReadToday(progress || null, plan, userPlan)

  // Chapters read TODAY for this plan (date-based, for Quest Stats)
  // This preserves the count even after advancing to the next day
  const chaptersReadTodayForPlan = getChaptersReadToday(todayProgress || null, plan, userPlan)

  // Streak is based on TOTAL chapters across ALL plans today
  const streakMinimum = profile?.streak_minimum || 3
  const streakProgress = Math.min(totalChaptersToday, streakMinimum)
  const streakMet = totalChaptersToday >= streakMinimum
  const overallProgress = calculatePlanProgress(userPlan, plan)

  // Check if plan is at its final day (for non-cycling plans)
  const isAtFinalDay = isPlanAtFinalDay(userPlan, plan)
  const allReadingsComplete = todaysReading.length > 0 && todaysReading.every(s => s.isCompleted)
  const isPlanComplete = userPlan.is_completed || (isAtFinalDay && allReadingsComplete)

  // Calculate days on plan (actual elapsed days since start)
  const daysOnPlan = (() => {
    if (!userPlan.start_date) return 1

    // Parse date string in local timezone to avoid UTC offset issues
    const [year, month, day] = userPlan.start_date.split('-').map(Number)
    const startDate = new Date(year, month - 1, day) // month is 0-indexed
    const today = new Date()
    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // +1 because day 1 is the start date
  })()

  const daysAheadBehind = userPlan.current_day - daysOnPlan

  const handleArchive = async () => {
    if (!id) return

    const confirmed = window.confirm(
      'Archive this quest? It will be hidden from Today\'s Quests but all progress will be preserved. You can restore it later from the Quests page.'
    )

    if (confirmed) {
      try {
        await archivePlan.mutateAsync(id)
        toast.success('Quest archived. Restore it under the "New Quest" page.')
        navigate('/plans')
      } catch {
        toast.error('Failed to archive quest. Please try again.')
      }
    }
  }

  const handleToggleSection = async (section: typeof todaysReading[0]) => {
    if (!id || !userPlan) return

    // Check if this will complete all readings for the day
    const isMarkingComplete = !section.isCompleted
    const otherSectionsComplete = todaysReading
      .filter(s => s.id !== section.id)
      .every(s => s.isCompleted)
    const willCompleteDay = isMarkingComplete && otherSectionsComplete

    try {
      if (isCyclingPlan) {
        // For cycling plans, use the chapter-based marking
        await markChapterRead.mutateAsync({
          userPlanId: id,
          listId: section.listId,
          chapterIndex: section.chapterIndex,
          userPlan,
        })
      } else {
        // For sequential/sectional plans, use section-based marking
        await markSectionComplete.mutateAsync({
          userPlanId: id,
          dayNumber: userPlan.current_day,
          sectionId: section.id,
          totalSections: todaysReading.length,
          existingProgress: progress || null,
        })
      }

      // Show toast when all readings for the day are completed
      if (willCompleteDay) {
        toast.success("Today's reading complete!")
      }
    } catch (error) {
      captureError(error, { component: 'ActivePlan', action: 'toggleSection', planId: id })
      toast.error('Failed to update reading. Please try again.')
    }
  }

  const handleContinue = async (section: typeof todaysReading[0]) => {
    if (!id || !userPlan) return

    try {
      if (isCyclingPlan) {
        // For cycling plans, advance to next chapter in this list
        await advanceList.mutateAsync({
          userPlanId: id,
          listId: section.listId,
          userPlan,
        })
      } else {
        // For sequential/sectional plans, advance to next day
        await advanceDay.mutateAsync({
          userPlanId: id,
          userPlan,
        })
      }
    } catch (error) {
      captureError(error, { component: 'ActivePlan', action: 'continue', planId: id })
      toast.error('Failed to continue. Please try again.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-sage transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO HOME
      </Link>

      {/* Campaign Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-pixel text-sm text-ink">
                {plan.name.toUpperCase()}
              </h1>
              <p className="font-pixel text-[0.625rem] text-ink-muted mt-2">
                {isCyclingPlan ? 'Continuous Reading Plan' :
                 isFreeReading ? 'Free Reading - Log as you go' :
                 `Day ${daysOnPlan} on this quest`}
              </p>
            </div>
            {isPlanComplete ? (
              <Badge variant="gold">COMPLETE</Badge>
            ) : streakMet ? (
              <Badge variant="success">GOAL MET</Badge>
            ) : null}
          </div>
        </CardHeader>

        {!isFreeReading && (
          <CardContent>
            <PlanProgress
              currentDay={userPlan.current_day}
              totalDays={plan.duration_days}
              daysOnPlan={daysOnPlan}
              completedToday={
                plan.daily_structure.type === 'sectional'
                  ? todaysReading.filter(s => s.isCompleted).length
                  : plan.daily_structure.type === 'weekly_sectional'
                    ? todaysReading.filter(s => s.isCompleted).reduce((sum, s) => sum + countChaptersInPassage(s.passage), 0)
                    : chaptersReadToday
              }
              totalToday={
                isCyclingPlan
                  ? todaysReading.length  // Number of lists for cycling plans
                  : plan.daily_structure.type === 'weekly_sectional'
                    ? todaysReading.reduce((sum, section) => sum + countChaptersInPassage(section.passage), 0) || 1
                    : plan.daily_structure.type === 'sequential'
                      ? (plan.daily_structure as { chapters_per_day?: number }).chapters_per_day || 3
                      : todaysReading.length  // For sectional plans
              }
              unit={
                plan.daily_structure.type === 'sectional'
                  ? 'readings'
                  : 'chapters'
              }
            />
          </CardContent>
        )}
      </Card>

      {/* Today's Progress */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-[0.75rem] text-ink">
              TODAY'S STREAK PROGRESS
            </h2>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-ink-muted" />
              <span className="font-pixel text-[0.625rem] text-ink">
                {totalChaptersToday} chapter{totalChaptersToday !== 1 ? 's' : ''} read
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between font-pixel text-[0.625rem] text-ink-muted mb-2">
            <span>Daily goal: {streakMinimum} chapters</span>
            <span>{streakProgress}/{streakMinimum}</span>
          </div>
          <div className="h-3 bg-parchment-light border border-border-subtle overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${streakMet ? 'bg-gradient-to-r from-sage to-sage-light' : 'bg-gradient-to-r from-sage to-sage-light'}`}
              style={{ width: `${(streakProgress / streakMinimum) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Current Readings or Free Reading Chapter Picker */}
      {isFreeReading ? (
        <>
          {/* Progress Dashboard for Free Reading */}
          <BibleProgressDashboard
            books={booksAndTotal.books}
            bookStatus={bookStatus}
            totalCompleted={freeReadingCompleted}
            totalChapters={freeReadingTotal}
            percentage={freeReadingPercentage}
            planName={plan.name}
          />

          {/* Chapter Picker */}
          <BibleChapterPicker
            books={booksAndTotal.books}
            completedChapters={completedChapters}
            bookStatus={bookStatus}
            onToggleChapter={handleToggleChapter}
            onToggleBook={handleToggleBook}
            disabled={isMutating}
          />
        </>
      ) : (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              {isCyclingPlan ? 'CONTINUE READING' : "TODAY'S MISSION"}
            </h2>
            <p className="font-pixel text-[0.625rem] text-ink-muted mt-1">
              {isCyclingPlan
                ? 'Mark chapters as you read. Each list progresses independently.'
                : 'Complete all readings to conquer this day'}
            </p>
          </div>

          <div className="p-4 space-y-2">
            {todaysReading.length > 0 ? (
              todaysReading.map((section) => (
                <ReadingSection
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  passage={section.passage}
                  isCompleted={section.isCompleted}
                  onToggle={() => handleToggleSection(section)}
                  onContinue={() => handleContinue(section)}
                  showContinue={isCyclingPlan}
                  continueLabel="Continue to next chapter"
                  disabled={isMutating}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="font-pixel text-[0.625rem] text-ink-muted">No readings configured for this plan</p>
              </div>
            )}
            
            {/* For non-cycling plans, show completion or continue button */}
            {!isCyclingPlan && todaysReading.length > 0 && allReadingsComplete && (
              isPlanComplete ? (
                <div className="mt-4 py-6 px-4 border-2 border-gold bg-gold/10 text-center">
                  <Trophy className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="font-pixel text-[0.75rem] text-gold">QUEST COMPLETE!</p>
                  <p className="font-pixel text-[0.625rem] text-ink-muted mt-2">
                    Congratulations! You have completed this reading plan.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleContinue(todaysReading[0])}
                  disabled={isMutating}
                  className={`
                    w-full mt-4 py-3 px-4 border-2 border-sage
                    bg-sage/20 font-pixel text-[0.625rem] text-sage
                    flex items-center justify-center gap-2
                    hover:bg-sage/30 transition-colors
                    ${isMutating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span>CONTINUE TO NEXT READING</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )
            )}
          </div>

          {isCyclingPlan && chaptersReadToday > 0 && (
            <div className="border-t border-border-subtle p-4">
              <div className="w-full text-center">
                {streakMet ? (
                  <div className="text-success">
                    <div className="flex justify-center mb-2">
                      <Swords className="w-6 h-6" />
                    </div>
                    <p className="font-pixel text-[0.625rem]">DAILY GOAL ACHIEVED!</p>
                    <p className="font-pixel text-[0.625rem] text-ink-muted mt-1">
                      Keep reading or come back tomorrow
                    </p>
                  </div>
                ) : (
                  <p className="font-pixel text-[0.625rem] text-ink-muted">
                    {streakMinimum - chaptersReadToday} more chapter{streakMinimum - chaptersReadToday !== 1 ? 's' : ''} to reach your daily goal
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Campaign Stats */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <h2 className="font-pixel text-[0.75rem] text-ink">
            QUEST STATS
          </h2>
        </div>
        <div className="p-4">
          {isFreeReading ? (
            /* Stats for Free Reading with chapter tracking */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {freeReadingCompleted.toLocaleString()}
                </div>
                <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Chapters Read</div>
              </div>
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {freeReadingTotal.toLocaleString()}
                </div>
                <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Total Chapters</div>
              </div>
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {freeReadingPercentage}%
                </div>
                <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Complete</div>
              </div>
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {bookStatus.filter(b => b.isComplete).length}
                </div>
                <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Books Done</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Days on Campaign - Primary stat for non-cycling plans */}
              {!isCyclingPlan && (
                <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                  <div className="font-pixel text-xl text-ink">
                    {daysOnPlan}
                  </div>
                  <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Days on Quest</div>
                </div>
              )}

              {/* Readings/Chapters Today */}
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {plan.daily_structure.type === 'sectional'
                    ? todaysReading.filter(s => s.isCompleted).length
                    : chaptersReadTodayForPlan}
                </div>
                <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">
                  {plan.daily_structure.type === 'sectional' ? 'Readings Today' : 'Chapters Today'}
                </div>
              </div>

              {/* Overall Progress */}
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {overallProgress}%
                </div>
                <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Overall Progress</div>
              </div>

              {isCyclingPlan ? (
                <>
                  <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                    <div className="font-pixel text-xl text-ink">
                      {todaysReading.filter(s => s.isCompleted).length}
                    </div>
                    <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Lists Done</div>
                  </div>
                  <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                    <div className="font-pixel text-xl text-ink">
                      {todaysReading.length - todaysReading.filter(s => s.isCompleted).length}
                    </div>
                    <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Remaining</div>
                  </div>
                </>
              ) : isWeeklyPlan && weeklyInfo ? (
                <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-pixel text-xl text-ink">
                      W{weeklyInfo.currentWeek}
                    </span>
                    <span className="font-pixel text-sm text-ink-muted">
                      D{weeklyInfo.dayInWeek}
                    </span>
                  </div>
                  <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Reading Position</div>
                </div>
              ) : (
                <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-pixel text-xl text-ink">
                      {userPlan.current_day}
                    </span>
                    {daysAheadBehind !== 0 && (
                      <span className={`font-pixel text-[0.625rem] ${daysAheadBehind > 0 ? 'text-warning' : 'text-danger'}`}>
                        {daysAheadBehind > 0 ? `+${daysAheadBehind}` : daysAheadBehind}
                      </span>
                    )}
                  </div>
                  <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">Reading Position</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Reading Tips for Cycling Plans */}
      {isCyclingPlan && (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              HOW IT WORKS
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Each list tracks your position independently. Read as many chapters as you want from any list.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">When you finish a list, it cycles back to the beginning. Lists repeat at different rates.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Your daily goal is {streakMinimum} chapters (configurable in your profile) to maintain your streak.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Reading Tips for Weekly Plans */}
      {isWeeklyPlan && (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              HOW IT WORKS
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Complete one reading per day from different parts of Scripture: Epistles, Law, History, Psalms, Poetry, Prophecy, and Gospels.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Each week has 7 readings. Go at your own pace—the plan progresses when you mark readings complete.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Complete all 52 weeks to read through the entire Bible with balanced daily variety.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Reading Tips for Free Reading */}
      {isFreeReading && (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.75rem] text-ink">
              HOW IT WORKS
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Use the Chapter Picker to check off specific chapters as you read. Click a book to expand and see all chapters.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Click the checkbox next to a book name to mark all chapters in that book as read at once.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Your reading counts toward your daily goal of {streakMinimum} chapters to maintain your streak.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">Complete all {freeReadingTotal.toLocaleString()} chapters to finish this quest and earn an achievement!</p>
            </div>
          </div>
        </Card>
      )}

      {/* Archive Action */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-pixel text-[0.75rem] text-ink">Archive Quest</h3>
              <p className="font-pixel text-[0.625rem] text-ink-muted mt-1">
                Hide from Today's Quests while preserving all progress
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleArchive}
              isLoading={archivePlan.isPending}
              disabled={isMutating}
              leftIcon={<Archive className="w-4 h-4" />}
            >
              ARCHIVE
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Quest Details */}
      <Link to={`/plans/${plan.id}`}>
        <Button variant="secondary" className="w-full">
          VIEW QUEST DETAILS
        </Button>
      </Link>
    </div>
  )
}
