import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useUserPlans, getCurrentReadings, getTodaysReading, calculatePlanProgress } from '../hooks/usePlans'
import { useStats } from '../hooks/useStats'
import { supabase } from '../lib/supabase'
import { Card, CardHeader, CardContent, Button, StreakBadge, LoadingSpinner, ProgressBar } from '../components/ui'
import type { ReadingPlan, DailyProgress } from '../types'

function calculatePlanChapters(
  userPlanId: string,
  plan: ReadingPlan,
  allProgress: DailyProgress[]
): number {
  const planProgress = allProgress.filter(p => p.user_plan_id === userPlanId)
  const structure = plan.daily_structure

  return planProgress.reduce((total, day) => {
    const sectionsCount = day.completed_sections?.length || 0

    if (structure.type === 'sequential') {
      const seqStructure = structure as any
      return total + (sectionsCount * (seqStructure.chapters_per_day || 3))
    }

    // For cycling, sectional, and free_reading: each section = 1 chapter
    return total + sectionsCount
  }, 0)
}

export function Dashboard() {
  const { profile, user } = useAuth()
  const { data: userPlans, isLoading: plansLoading } = useUserPlans()
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: allProgress } = useQuery({
    queryKey: ['allProgress', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
      return data as DailyProgress[]
    },
    enabled: !!user
  })

  const isLoading = plansLoading || statsLoading
  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Soldier'

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
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-pixel text-terminal-green">
            WELCOME BACK, {displayName.toUpperCase()}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-terminal-gray-400">Current Streak:</span>
            <StreakBadge days={userStats.current_streak} />
          </div>
        </div>
        <Link to="/plans">
          <Button variant="primary">
            + NEW CAMPAIGN
          </Button>
        </Link>
      </div>

      {/* Today's Missions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-pixel text-terminal-green">
            {"TODAY'S MISSIONS"}
          </h2>
        </CardHeader>
        <CardContent>
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
                const chaptersRead = calculatePlanChapters(userPlan.id, userPlan.plan, allProgress || [])
                const totalLogged = userPlan.list_positions?.['free'] || 0

                return (
                  <Link
                    key={userPlan.id}
                    to={`/campaign/${userPlan.id}`}
                    className="block p-4 border-2 border-terminal-gray-500 hover:border-terminal-green transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-terminal-green font-medium">
                          {userPlan.plan.name}
                        </h3>
                        <p className="text-terminal-gray-400 text-sm mt-1">
                          {isFreeReading
                            ? `${totalLogged} chapters logged`
                            : isCyclingPlan
                            ? `${todaysReading.length} lists to read • ${chaptersRead} chapters read`
                            : `Day ${userPlan.current_day} • ${todaysReading.length} readings • ${chaptersRead} chapters read`
                          }
                        </p>
                      </div>
                      {!isFreeReading && (
                        <div className="text-right">
                          <div className="text-terminal-gray-200 text-sm">
                            {progress}% complete
                          </div>
                        </div>
                      )}
                    </div>
                    {!isFreeReading && (
                      <div className="mt-3">
                        <ProgressBar value={progress} max={100} size="sm" showBlocks={false} />
                      </div>
                    )}
                    <div className="mt-3 text-sm text-terminal-gray-400">
                      {'> Click to continue reading'}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-terminal-gray-400">
              <p className="mb-4">No active campaigns</p>
              <Link to="/plans">
                <Button variant="secondary">
                  Browse Reading Plans
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-pixel text-terminal-green mb-2">
              {userStats.total_chapters_read}
            </div>
            <div className="text-terminal-gray-400 text-sm">CHAPTERS READ</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-pixel text-terminal-green mb-2">
              {userStats.plans_active}
            </div>
            <div className="text-terminal-gray-400 text-sm">ACTIVE CAMPAIGNS</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-3xl font-pixel text-terminal-green mb-2">
              {userStats.plans_completed}
            </div>
            <div className="text-terminal-gray-400 text-sm">CAMPAIGNS COMPLETE</div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
