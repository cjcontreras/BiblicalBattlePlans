import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Infinity, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useReadingPlan, useStartPlan, useUserPlans, getTodaysReading, getLocalDate } from '../hooks/usePlans'
import { captureError } from '../lib/errorLogger'
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, LoadingSpinner, Input } from '../components/ui'
import type { CyclingListsStructure } from '../types'

export function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: plan, isLoading, error } = useReadingPlan(id || '')
  const { data: userPlans } = useUserPlans()
  const startPlan = useStartPlan()

  const [startDate, setStartDate] = useState(getLocalDate())
  const [previewDay, setPreviewDay] = useState(1)
  const [showSchedule, setShowSchedule] = useState(false)

  // Check if user already has this plan active
  const existingUserPlan = userPlans?.find(
    (up) => up.plan_id === id && !up.is_completed
  )

  const handleStartPlan = async () => {
    if (!id) return

    try {
      const newPlan = await startPlan.mutateAsync({ planId: id, startDate })
      toast.success('Quest started! Your journey begins.')
      navigate(`/campaign/${newPlan.id}`)
    } catch (error) {
      captureError(error, { component: 'PlanDetail', action: 'startPlan', planId: id })
      toast.error('Failed to start quest. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !plan) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="font-pixel text-[0.625rem] text-danger">ERROR: Failed to load quest details</p>
          <Button variant="secondary" onClick={() => navigate('/plans')} className="mt-4">
            Back to Quests
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Get sample reading for day 1
  const sampleReading = getTodaysReading(plan, 1)

  const getPlanTypeInfo = () => {
    switch (plan.daily_structure.type) {
      case 'cycling_lists':
        const cyclingStructure = plan.daily_structure as CyclingListsStructure
        return {
          badge: 'CYCLING',
          variant: 'warning' as const,
          description: `${cyclingStructure.lists.length} independent reading lists that cycle at different rates`,
        }
      case 'free_reading':
        return {
          badge: 'FREE',
          variant: 'success' as const,
          description: 'Log your own reading - no fixed schedule required',
        }
      case 'sequential':
        return {
          badge: 'SEQUENTIAL',
          variant: 'default' as const,
          description: 'Read through Scripture in canonical order',
        }
      case 'sectional':
        return {
          badge: 'SECTIONAL',
          variant: 'gold' as const,
          description: 'Daily readings from multiple sections of Scripture',
        }
      case 'weekly_sectional':
        return {
          badge: 'SECTIONAL',
          variant: 'gold' as const,
          description: 'Daily readings from multiple sections of Scripture',
        }
      default:
        return {
          badge: 'STANDARD',
          variant: 'default' as const,
          description: '',
        }
    }
  }

  const typeInfo = getPlanTypeInfo()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-gold transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK
      </button>

      {/* Plan Header */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-pixel text-sm text-ink">
                {plan.name.toUpperCase()}
              </h1>
              <p className="font-pixel text-[0.625rem] text-ink-muted mt-2 leading-relaxed">{plan.description}</p>
            </div>
            <Badge variant={typeInfo.variant}>{typeInfo.badge}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-parchment-light border border-border-subtle text-center">
              <div className="font-pixel text-xl text-ink flex items-center justify-center">
                {plan.daily_structure.type === 'free_reading' ? (
                  <Infinity className="w-6 h-6" />
                ) : plan.duration_days > 0 ? (
                  plan.duration_days
                ) : (
                  <Infinity className="w-6 h-6" />
                )}
              </div>
              <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">
                {plan.daily_structure.type === 'free_reading' ? 'Self-Paced' :
                 plan.duration_days > 0 ? 'Days' : 'Ongoing'}
              </div>
            </div>
            <div className="p-4 bg-parchment-light border border-border-subtle text-center">
              <div className="font-pixel text-xl text-ink">
                {plan.daily_structure.type === 'free_reading' ? '-' : sampleReading.length}
              </div>
              <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">
                {plan.daily_structure.type === 'free_reading' ? 'Your Choice' : 'Readings/Day'}
              </div>
            </div>
          </div>

          {/* Plan Type Description */}
          <div className="p-4 bg-parchment-light border border-border-subtle">
            <div className="font-pixel text-[0.625rem] text-ink-muted mb-1">Quest Type</div>
            <div className="font-pixel text-[0.625rem] text-ink">{typeInfo.description}</div>
          </div>

          {/* Reading Schedule Preview */}
          {plan.daily_structure.type !== 'free_reading' && plan.daily_structure.type !== 'cycling_lists' && (
            <div>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full flex items-center justify-between p-3 bg-parchment-light border border-border-subtle hover:border-sage transition-colors"
              >
                <span className="font-pixel text-[0.625rem] text-ink">
                  READING SCHEDULE
                </span>
                {showSchedule ? (
                  <ChevronUp className="w-4 h-4 text-ink-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-muted" />
                )}
              </button>
              
              {showSchedule && (
                <div className="border border-t-0 border-border-subtle p-4 space-y-4">
                  {/* Day Navigator */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPreviewDay(Math.max(1, previewDay - 1))}
                      disabled={previewDay <= 1}
                      className="p-2 border border-border-subtle hover:border-sage disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 text-ink" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-pixel text-[0.625rem] text-ink">DAY</span>
                      <input
                        type="number"
                        min={1}
                        max={plan.duration_days || 365}
                        value={previewDay}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          const max = plan.duration_days || 365
                          setPreviewDay(Math.min(Math.max(1, val), max))
                        }}
                        className="w-16 px-2 py-1 text-center font-pixel text-[0.625rem] text-ink bg-parchment-light border border-border-subtle focus:border-sage focus:outline-none"
                      />
                      <span className="font-pixel text-[0.625rem] text-ink-muted">
                        of {plan.duration_days || '∞'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => setPreviewDay(Math.min(plan.duration_days || 365, previewDay + 1))}
                      disabled={plan.duration_days > 0 && previewDay >= plan.duration_days}
                      className="p-2 border border-border-subtle hover:border-sage disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-ink" />
                    </button>
                  </div>
                  
                  {/* Day's Readings */}
                  <div className="space-y-2">
                    {getTodaysReading(plan, previewDay).map((section, index) => (
                      <div
                        key={section.id || index}
                        className="p-3 bg-parchment-light border border-border-subtle flex justify-between items-center"
                      >
                        <div>
                          <div className="font-pixel text-[0.625rem] text-ink-muted">{section.label}</div>
                          <div className="font-pixel text-[0.625rem] text-ink">
                            {section.passage}
                          </div>
                        </div>
                        <div className="font-pixel text-[0.625rem] text-ink-faint">○</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Day 1 Preview for cycling plans (they don't have day-based schedules) */}
          {plan.daily_structure.type === 'cycling_lists' && (
            <div>
              <h3 className="font-pixel text-[0.625rem] text-ink-muted mb-3">
                STARTING CHAPTERS
              </h3>
              <div className="space-y-2">
                {sampleReading.map((section, index) => (
                  <div
                    key={section.id || index}
                    className="p-3 bg-parchment-light border border-border-subtle flex justify-between items-center"
                  >
                    <div>
                      <div className="font-pixel text-[0.625rem] text-ink-muted">{section.label}</div>
                      <div className="font-pixel text-[0.625rem] text-ink">
                        {section.passage}
                      </div>
                    </div>
                    <div className="font-pixel text-[0.625rem] text-ink-faint">○</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {existingUserPlan ? (
            <div className="w-full space-y-3">
              <p className="font-pixel text-[0.625rem] text-ink-muted text-center">
                You already have this quest active
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/campaign/${existingUserPlan.id}`)}
              >
                CONTINUE QUEST
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="max-w-xs">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleStartPlan}
                isLoading={startPlan.isPending}
              >
                BEGIN QUEST
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Additional Info for Cycling Plans */}
      {plan.daily_structure.type === 'cycling_lists' && (
        <Card noPadding>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              READING LISTS
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {(plan.daily_structure as CyclingListsStructure).lists.map((list, index) => (
              <div
                key={list.id}
                className="p-3 bg-parchment-light border border-border-subtle"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-pixel text-[0.625rem] text-gold">
                      List {index + 1}: {list.label}
                    </div>
                    <div className="font-pixel text-[0.625rem] text-ink-muted mt-1">
                      {list.books.map((b) => b.book).join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-pixel text-[0.625rem] text-ink">{list.total_chapters} chapters</div>
                    <div className="font-pixel text-[0.625rem] text-ink-muted">
                      Cycles every {list.total_chapters} days
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
