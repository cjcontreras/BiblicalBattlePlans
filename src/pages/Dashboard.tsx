import { Link } from 'react-router-dom'
import { BookOpen, Swords, Trophy, Plus, Book } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUserPlans, getCurrentReadings, getTodaysReading, calculatePlanProgress } from '../hooks/usePlans'
import { useStats } from '../hooks/useStats'
import { Card, CardContent, Button, StreakBadge, LoadingSpinner, ProgressBar } from '../components/ui'

// Daily verses for inspiration
const DAILY_VERSES = [
  { text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."', reference: 'Jeremiah 29:11' },
  { text: '"Your word is a lamp for my feet, a light on my path."', reference: 'Psalm 119:105' },
  { text: '"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness."', reference: '2 Timothy 3:16' },
  { text: '"Do not let this Book of the Law depart from your mouth; meditate on it day and night."', reference: 'Joshua 1:8' },
  { text: '"The grass withers and the flowers fall, but the word of our God endures forever."', reference: 'Isaiah 40:8' },
]

function getDailyVerse() {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length]
}

export function Dashboard() {
  const { profile, user } = useAuth()
  const { data: userPlans, isLoading: plansLoading } = useUserPlans()
  const { data: stats, isLoading: statsLoading } = useStats()

  const isLoading = plansLoading || statsLoading
  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Hero'
  const dailyVerse = getDailyVerse()

  // Get active campaigns (not completed AND not archived)
  const activeCampaigns = userPlans?.filter((up) => !up.is_completed && !up.is_archived) || []

  // Use actual stats
  const userStats = stats || {
    total_chapters_read: 0,
    current_streak: 0,
    plans_active: 0,
    plans_completed: 0,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card variant="elevated">
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-pixel text-base text-ink mb-3">
                WELCOME, {displayName.toUpperCase()}
              </h1>
              <StreakBadge days={userStats.current_streak} />
            </div>
            <Link to="/plans">
              <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                NEW QUEST
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-parchment-light border border-border-subtle p-5 text-center shadow-[0_2px_4px_var(--shadow-color)]">
          <div className="flex justify-center mb-3">
            <BookOpen className="w-8 h-8 text-ink-muted" />
          </div>
          <div className="font-pixel text-2xl text-ink mb-1">
            {userStats.total_chapters_read}
          </div>
          <div className="font-pixel text-[0.625rem] text-ink-muted uppercase">
            CHAPTERS
          </div>
        </div>

        <div className="bg-parchment-light border border-border-subtle p-5 text-center shadow-[0_2px_4px_var(--shadow-color)]">
          <div className="flex justify-center mb-3">
            <Swords className="w-8 h-8 text-ink-muted" />
          </div>
          <div className="font-pixel text-2xl text-ink mb-1">
            {userStats.plans_active}
          </div>
          <div className="font-pixel text-[0.625rem] text-ink-muted uppercase">
            QUESTS
          </div>
        </div>

        <div className="bg-parchment-light border border-border-subtle p-5 text-center shadow-[0_2px_4px_var(--shadow-color)]">
          <div className="flex justify-center mb-3">
            <Trophy className="w-8 h-8 text-ink-muted" />
          </div>
          <div className="font-pixel text-2xl text-ink mb-1">
            {userStats.plans_completed}
          </div>
          <div className="font-pixel text-[0.625rem] text-ink-muted uppercase">
            COMPLETE
          </div>
        </div>
      </div>

      {/* Daily Verse - Blue accent */}
      <div className="blue-panel">
        <div className="blue-panel-header">
          <div className="flex items-center gap-2 font-pixel text-[0.75rem]">
            <Book className="w-5 h-5" />
            DAILY VERSE
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="font-pixel text-[0.75rem] text-ink leading-loose mb-4">
            {dailyVerse.text}
          </p>
          <p className="font-pixel text-[0.625rem] text-ink-muted">
            — {dailyVerse.reference}
          </p>
        </div>
      </div>

      {/* Today's Quests - Sage accent */}
      <div className="sage-panel">
        <div className="sage-panel-header">
          <div className="font-pixel text-[0.75rem]">
            TODAY'S QUESTS
          </div>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : activeCampaigns.length > 0 ? (
            <div className="space-y-4">
              {activeCampaigns.map((userPlan) => {
                const isCyclingPlan = userPlan.plan.daily_structure.type === 'cycling_lists'
                const isFreeReading = userPlan.plan.daily_structure.type === 'free_reading'
                const todaysReading = isCyclingPlan
                  ? getCurrentReadings(userPlan.plan, userPlan.list_positions || {})
                  : getTodaysReading(userPlan.plan, userPlan.current_day)
                const progress = calculatePlanProgress(userPlan, userPlan.plan)
                const totalLogged = userPlan.list_positions?.['free'] || 0

                return (
                  <div
                    key={userPlan.id}
                    className="p-5 bg-parchment-light border border-border-subtle"
                  >
                    {/* Quest Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="font-pixel text-[0.75rem] text-ink">
                        {userPlan.plan.name.toUpperCase()}
                      </h3>
                      {!isFreeReading && (
                        <span className="font-pixel text-[0.625rem] text-ink-muted">
                          DAY {userPlan.current_day}
                        </span>
                      )}
                    </div>

                    {/* Reading Checklist */}
                    {!isFreeReading && todaysReading.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {todaysReading.map((reading, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`w-5 h-5 border-2 flex-shrink-0 flex items-center justify-center ${
                              reading.isCompleted 
                                ? 'border-sage-dark bg-sage' 
                                : 'border-border-subtle bg-parchment-lightest'
                            }`}>
                              {reading.isCompleted && (
                                <span className="text-[0.625rem] text-white">✓</span>
                              )}
                            </div>
                            <span className={`font-pixel text-[0.625rem] ${
                              reading.isCompleted 
                                ? 'text-ink-muted line-through' 
                                : 'text-ink'
                            }`}>
                              {reading.passage || reading.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Free reading info */}
                    {isFreeReading && (
                      <p className="font-pixel text-[0.625rem] text-ink-muted mb-4">
                        {totalLogged} chapters logged
                      </p>
                    )}

                    {/* Progress Bar */}
                    {!isFreeReading && (
                      <div className="mb-4">
                        <ProgressBar value={progress} max={100} size="md" />
                      </div>
                    )}

                    {/* Continue Link */}
                    <Link
                      to={`/campaign/${userPlan.id}`}
                      className="inline-block font-pixel text-[0.625rem] text-sage hover:text-sage-dark hover:underline"
                    >
                      ▶ CONTINUE
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-pixel text-[0.625rem] text-ink-muted mb-4">
                No active quests
              </p>
              <Link to="/plans">
                <Button variant="secondary">
                  START A QUEST
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
