import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from '../ui'
import type { ReadingPlan, UserPlan } from '../../types'
import { calculatePlanProgress } from '../../hooks/usePlans'

interface PlanCardProps {
  plan: ReadingPlan
  userPlan?: UserPlan
  showStartButton?: boolean
}

function getPlanTypeBadge(type: string) {
  switch (type) {
    case 'cycling_lists':
      return { label: 'CYCLING', variant: 'warning' as const }
    case 'free_reading':
      return { label: 'FREE', variant: 'success' as const }
    case 'sequential':
      return { label: 'SEQUENTIAL', variant: 'default' as const }
    case 'weekly_sectional':
      return { label: 'SEQUENTIAL', variant: 'default' as const }
    case 'sectional':
      return { label: 'SECTIONAL', variant: 'success' as const }
    default:
      return { label: 'STANDARD', variant: 'default' as const }
  }
}

export function PlanCard({ plan, userPlan, showStartButton = true }: PlanCardProps) {
  const typeBadge = getPlanTypeBadge(plan.daily_structure.type)
  const progress = userPlan ? calculatePlanProgress(userPlan, plan) : 0
  const isActive = userPlan && !userPlan.is_completed

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-pixel text-terminal-green leading-tight">
            {plan.name}
          </h3>
          <Badge variant={typeBadge.variant} size="sm">
            {typeBadge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-terminal-gray-300 text-sm mb-4 line-clamp-3">
          {plan.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-terminal-gray-400">
            <span>Duration:</span>
            <span className="text-terminal-gray-200">
              {plan.duration_days > 0 ? `${plan.duration_days} days` : 'Ongoing'}
            </span>
          </div>

          {isActive && (
            <>
              {plan.daily_structure.type === 'free_reading' ? (
                <div className="flex justify-between text-terminal-gray-400">
                  <span>Total Logged:</span>
                  <span className="text-terminal-green">
                    {userPlan.list_positions?.['free'] || 0} chapters
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-terminal-gray-400">
                    <span>Current Day:</span>
                    <span className="text-terminal-green">{userPlan.current_day}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-terminal-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-terminal-gray-600 overflow-hidden">
                      <div
                        className="h-full bg-terminal-green transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {isActive ? (
          <Link to={`/campaign/${userPlan.id}`} className="w-full">
            <Button variant="primary" className="w-full">
              CONTINUE CAMPAIGN
            </Button>
          </Link>
        ) : showStartButton ? (
          <Link to={`/plans/${plan.id}`} className="w-full">
            <Button variant="secondary" className="w-full">
              VIEW DETAILS
            </Button>
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  )
}
