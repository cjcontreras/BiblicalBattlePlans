import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Card, Badge, Button, LoadingSpinner } from '../ui'
import { useUserPlans, calculatePlanProgress } from '../../hooks/usePlans'

export function CampaignHistory() {
  const { data: userPlans, isLoading } = useUserPlans()

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  const activePlans = userPlans?.filter((up) => !up.is_completed && !up.is_archived) || []
  const completedPlans = userPlans?.filter((up) => up.is_completed) || []

  return (
    <div className="space-y-6">
      {/* Active Campaigns */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="font-pixel text-[0.625rem] text-ink">
            ACTIVE QUESTS
          </div>
          <Badge variant="success">{activePlans.length}</Badge>
        </div>
        <div className="p-4">
          {activePlans.length > 0 ? (
            <div className="space-y-3">
              {activePlans.map((userPlan) => {
                const progress = calculatePlanProgress(userPlan, userPlan.plan)
                return (
                  <Link
                    key={userPlan.id}
                    to={`/campaign/${userPlan.id}`}
                    className="block p-4 bg-parchment-light border border-border-subtle hover:border-gold transition-all shadow-[0_2px_4px_var(--shadow-color)]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-pixel text-[0.625rem] text-ink">
                          {userPlan.plan.name.toUpperCase()}
                        </div>
                        <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">
                          Day {userPlan.current_day} • Started{' '}
                          {new Date(userPlan.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-pixel text-[0.625rem] text-gold">{progress}%</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-pixel text-[0.625rem] text-ink-muted">No active quests</p>
              <Link to="/plans">
                <Button variant="secondary" className="mt-3">
                  START A QUEST
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Completed Campaigns */}
      <Card noPadding>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="font-pixel text-[0.625rem] text-ink">
            COMPLETED QUESTS
          </div>
          <Badge variant="gold">{completedPlans.length}</Badge>
        </div>
        <div className="p-4">
          {completedPlans.length > 0 ? (
            <div className="space-y-3">
              {completedPlans.map((userPlan) => (
                <div
                  key={userPlan.id}
                  className="p-4 bg-gold/10 border border-gold"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-pixel text-[0.625rem] text-gold">
                        {userPlan.plan.name.toUpperCase()}
                      </div>
                      <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">
                        Completed{' '}
                        {userPlan.completed_at
                          ? new Date(userPlan.completed_at).toLocaleDateString()
                          : 'Unknown'}
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-gold" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="font-pixel text-[0.625rem] text-ink-muted">No completed quests yet</p>
              <p className="font-pixel text-[0.5rem] text-ink-faint mt-1">Keep reading to complete your first!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
