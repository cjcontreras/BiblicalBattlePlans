import { ProgressBar } from '../ui'

interface PlanProgressProps {
  currentDay: number
  totalDays: number
  completedToday: number
  totalToday: number
  daysOnPlan?: number // Actual calendar days since start
  unit?: string // e.g., "chapters", "sections", "lists"
  className?: string
}

export function PlanProgress({
  currentDay,
  totalDays,
  completedToday,
  totalToday,
  daysOnPlan,
  unit = 'sections',
  className = '',
}: PlanProgressProps) {
  const overallProgress = totalDays > 0 ? Math.round(((currentDay - 1) / totalDays) * 100) : 0
  const todayProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0
  const readingsAhead = daysOnPlan !== undefined ? currentDay - daysOnPlan : 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Today's Progress */}
      <div>
        <div className="flex justify-between font-pixel text-[0.625rem] mb-2">
          <span className="text-ink-muted">Today's Progress</span>
          <span className="text-gold">
            {completedToday}/{totalToday} {unit}
          </span>
        </div>
        <ProgressBar
          value={todayProgress}
          max={100}
          variant="success"
        />
      </div>

      {/* Overall Progress */}
      {totalDays > 0 && (
        <div>
          <div className="flex justify-between font-pixel text-[0.625rem] mb-2">
            <span className="text-ink-muted">Quest Progress</span>
            <span className="text-ink flex items-center gap-2">
              <span>Reading {currentDay} of {totalDays}</span>
              {readingsAhead !== 0 && (
                <span className={`${readingsAhead > 0 ? 'text-warning' : 'text-danger'}`}>
                  ({readingsAhead > 0 ? `+${readingsAhead} ahead` : `${readingsAhead} behind`})
                </span>
              )}
            </span>
          </div>
          <ProgressBar
            value={overallProgress}
            max={100}
            variant="default"
          />
        </div>
      )}
    </div>
  )
}
