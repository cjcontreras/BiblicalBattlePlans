import { useParams, useNavigate, Link } from 'react-router-dom'
import { Swords, BookOpen, ChevronRight, Archive, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  useUserPlan,
  useDailyProgress,
  useMarkChapterRead,
  useMarkSectionComplete,
  useAdvanceList,
  useAdvanceDay,
  useLogFreeReading,
  useArchivePlan,
  getCurrentReadings,
  getTodaysReading,
  calculatePlanProgress,
  getChaptersReadToday,
} from '../hooks/usePlans'
import { useAuth } from '../hooks/useAuth'
import { ReadingSection, PlanProgress, FreeReadingInput } from '../components/plans'
import { Card, CardHeader, CardContent, Button, LoadingSpinner, Badge } from '../components/ui'

export function ActivePlan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const { data: userPlan, isLoading: planLoading } = useUserPlan(id || '')
  const { data: progress, isLoading: progressLoading } = useDailyProgress(id || '')
  const markChapterRead = useMarkChapterRead()
  const markSectionComplete = useMarkSectionComplete()
  const advanceList = useAdvanceList()
  const advanceDay = useAdvanceDay()
  const logFreeReading = useLogFreeReading()
  const archivePlan = useArchivePlan()

  const isLoading = planLoading || progressLoading
  const isMutating = markChapterRead.isPending || markSectionComplete.isPending ||
                     advanceList.isPending || advanceDay.isPending ||
                     logFreeReading.isPending || archivePlan.isPending

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (!userPlan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger">ERROR: Quest not found</p>
          <Button variant="secondary" onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { plan } = userPlan
  const isCyclingPlan = plan.daily_structure.type === 'cycling_lists'
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

  const chaptersReadToday = getChaptersReadToday(progress || null, plan)
  const streakMinimum = profile?.streak_minimum || 3
  const streakProgress = Math.min(chaptersReadToday, streakMinimum)
  const streakMet = chaptersReadToday >= streakMinimum
  const overallProgress = calculatePlanProgress(userPlan, plan)

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
      } catch (error) {
        toast.error('Failed to archive quest. Please try again.')
      }
    }
  }

  const handleToggleSection = async (section: typeof todaysReading[0]) => {
    if (!id || !userPlan) return

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
  }

  const handleContinue = async (section: typeof todaysReading[0]) => {
    if (!id || !userPlan) return

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
  }

  const handleLogFreeReading = async (chapters: number, notes?: string) => {
    if (!id || !userPlan) return

    await logFreeReading.mutateAsync({
      userPlanId: id,
      chapters,
      notes,
      userPlan,
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-sage transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO DASHBOARD
      </Link>

      {/* Campaign Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-pixel text-sm text-ink">
                {plan.name.toUpperCase()}
              </h1>
              <p className="font-pixel text-[0.5rem] text-ink-muted mt-2">
                {isCyclingPlan ? 'Continuous Reading Plan' :
                 isFreeReading ? 'Free Reading - Log as you go' :
                 `Day ${daysOnPlan} on this quest`}
              </p>
            </div>
            {streakMet && (
              <Badge variant="success">GOAL MET</Badge>
            )}
          </div>
        </CardHeader>

        {!isFreeReading && (
          <CardContent>
            <PlanProgress
              currentDay={userPlan.current_day}
              totalDays={plan.duration_days}
              daysOnPlan={daysOnPlan}
              completedToday={chaptersReadToday}
              totalToday={
                isCyclingPlan
                  ? streakMinimum
                  : plan.daily_structure.type === 'sequential'
                    ? (plan.daily_structure as any).chapters_per_day || 3
                    : todaysReading.length
              }
              unit={
                plan.daily_structure.type === 'sequential' || plan.daily_structure.type === 'cycling_lists'
                  ? 'chapters'
                  : 'readings'
              }
            />
          </CardContent>
        )}
      </Card>

      {/* Today's Progress */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              TODAY'S PROGRESS
            </h2>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-ink-muted" />
              <span className="font-pixel text-[0.5rem] text-ink">
                {chaptersReadToday} chapter{chaptersReadToday !== 1 ? 's' : ''} read
              </span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between font-pixel text-[0.5rem] text-ink-muted mb-2">
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

      {/* Current Readings or Free Reading Input */}
      {isFreeReading ? (
        <FreeReadingInput
          onSubmit={handleLogFreeReading}
          isLoading={isMutating}
          chaptersReadToday={chaptersReadToday}
        />
      ) : (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              {isCyclingPlan ? 'CONTINUE READING' : "TODAY'S MISSION"}
            </h2>
            <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
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
            
            {/* For non-cycling plans, show a single "Continue to next day" button when all sections are done */}
            {!isCyclingPlan && todaysReading.length > 0 && todaysReading.every(s => s.isCompleted) && (
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
                <span>CONTINUE TO NEXT DAY</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
                    <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
                      Keep reading or come back tomorrow
                    </p>
                  </div>
                ) : (
                  <p className="font-pixel text-[0.5rem] text-ink-muted">
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
          <h2 className="font-pixel text-[0.625rem] text-ink">
            QUEST STATS
          </h2>
        </div>
        <div className="p-4">
          {isFreeReading ? (
            /* Simplified stats for Free Reading */
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {chaptersReadToday}
                </div>
                <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Chapters Today</div>
              </div>
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {userPlan.list_positions?.['free'] || 0}
                </div>
                <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Total Logged</div>
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
                  <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Days on Quest</div>
                </div>
              )}
              
              {/* Readings/Chapters Today */}
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {chaptersReadToday}
                </div>
                <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">
                  {isCyclingPlan ? 'Chapters Today' : 'Readings Today'}
                </div>
              </div>

              {/* Overall Progress */}
              <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                <div className="font-pixel text-xl text-ink">
                  {overallProgress}%
                </div>
                <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Overall Progress</div>
              </div>

              {isCyclingPlan ? (
                <>
                  <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                    <div className="font-pixel text-xl text-ink">
                      {todaysReading.filter(s => s.isCompleted).length}
                    </div>
                    <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Lists Done</div>
                  </div>
                  <div className="text-center p-4 bg-parchment-light border border-border-subtle">
                    <div className="font-pixel text-xl text-ink">
                      {todaysReading.length - todaysReading.filter(s => s.isCompleted).length}
                    </div>
                    <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Remaining</div>
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
                  <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Reading Position</div>
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
                  <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">Reading Position</div>
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
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Each list tracks your position independently. Read as many chapters as you want from any list.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">When you finish a list, it cycles back to the beginning. Lists repeat at different rates.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Your daily goal is {streakMinimum} chapters (configurable in your profile) to maintain your streak.</p>
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
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Complete one reading per day from different parts of Scripture: Epistles, Law, History, Psalms, Poetry, Prophecy, and Gospels.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Each week has 7 readings. Go at your own pace—the plan progresses when you mark readings complete.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Complete all 52 weeks to read through the entire Bible with balanced daily variety.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Reading Tips for Free Reading */}
      {isFreeReading && (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              HOW IT WORKS
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Log chapters as you read them. There's no predetermined schedule - read what you want, when you want.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Your entries count toward your daily goal of {streakMinimum} chapters to maintain your streak.</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Use the notes field to track what you read (e.g., "Psalms 23-25, Romans 8").</p>
            </div>
            <div className="flex items-start gap-3">
              <ChevronRight className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
              <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">Entries are for today only - you cannot backdate reading to maintain streak integrity.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Archive Action */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-pixel text-[0.625rem] text-ink">Archive Quest</h3>
              <p className="font-pixel text-[0.5rem] text-ink-muted mt-1">
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

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to={`/plans/${plan.id}`} className="flex-1">
          <Button variant="ghost" className="w-full">
            View Quest Details
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button variant="ghost" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
