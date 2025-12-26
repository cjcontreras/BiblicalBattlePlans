import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Infinity } from 'lucide-react'
import { useReadingPlan, useStartPlan, useUserPlans, getTodaysReading } from '../hooks/usePlans'
import { Card, CardHeader, CardContent, CardFooter, Button, Badge, LoadingSpinner, Input } from '../components/ui'
import type { CyclingListsStructure } from '../types'

export function PlanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: plan, isLoading, error } = useReadingPlan(id || '')
  const { data: userPlans } = useUserPlans()
  const startPlan = useStartPlan()

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])

  // Check if user already has this plan active
  const existingUserPlan = userPlans?.find(
    (up) => up.plan_id === id && !up.is_completed
  )

  const handleStartPlan = async () => {
    if (!id) return

    try {
      const newPlan = await startPlan.mutateAsync({ planId: id, startDate })
      navigate(`/campaign/${newPlan.id}`)
    } catch (error) {
      console.error('Failed to start plan:', error)
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
          <p className="text-alert-red">! ERROR: Failed to load plan details</p>
          <Button variant="secondary" onClick={() => navigate('/plans')} className="mt-4">
            Back to Plans
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
          variant: 'success' as const,
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
        onClick={() => navigate('/plans')}
        className="text-terminal-gray-400 hover:text-terminal-green transition-colors"
      >
        {'< Back to Plans'}
      </button>

      {/* Plan Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-pixel text-terminal-green">
                {plan.name}
              </h1>
              <p className="text-terminal-gray-400 mt-2">{plan.description}</p>
            </div>
            <Badge variant={typeInfo.variant}>{typeInfo.badge}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-terminal-dark border border-terminal-gray-600">
              <div className="text-2xl font-pixel text-terminal-green flex items-center justify-center">
                {plan.daily_structure.type === 'free_reading' ? (
                  <Infinity className="w-6 h-6" />
                ) : plan.duration_days > 0 ? (
                  plan.duration_days
                ) : (
                  <Infinity className="w-6 h-6" />
                )}
              </div>
              <div className="text-sm text-terminal-gray-400">
                {plan.daily_structure.type === 'free_reading' ? 'Self-Paced' :
                 plan.duration_days > 0 ? 'Days' : 'Ongoing'}
              </div>
            </div>
            <div className="p-4 bg-terminal-dark border border-terminal-gray-600">
              <div className="text-2xl font-pixel text-terminal-green">
                {plan.daily_structure.type === 'free_reading' ? '-' : sampleReading.length}
              </div>
              <div className="text-sm text-terminal-gray-400">
                {plan.daily_structure.type === 'free_reading' ? 'Your Choice' : 'Readings/Day'}
              </div>
            </div>
          </div>

          {/* Plan Type Description */}
          <div className="p-4 bg-terminal-dark border border-terminal-gray-600">
            <div className="text-sm text-terminal-gray-400 mb-1">Plan Type</div>
            <div className="text-terminal-gray-200">{typeInfo.description}</div>
          </div>

          {/* Sample Day Preview */}
          {plan.daily_structure.type !== 'free_reading' && (
            <div>
              <h3 className="text-sm font-pixel text-terminal-gray-400 mb-3">
                DAY 1 PREVIEW
              </h3>
              <div className="space-y-2">
                {sampleReading.map((section, index) => (
                  <div
                    key={section.id || index}
                    className="p-3 bg-terminal-dark border border-terminal-gray-600 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs text-terminal-gray-500">{section.label}</div>
                      <div className="text-terminal-gray-200">
                        {section.passage}
                      </div>
                    </div>
                    <div className="text-terminal-gray-500">[  ]</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {existingUserPlan ? (
            <div className="w-full space-y-3">
              <p className="text-terminal-gray-400 text-center text-sm">
                You already have this campaign active
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(`/campaign/${existingUserPlan.id}`)}
              >
                CONTINUE CAMPAIGN
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Button
                variant="primary"
                className="w-full"
                onClick={handleStartPlan}
                isLoading={startPlan.isPending}
              >
                BEGIN CAMPAIGN
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Additional Info for Cycling Plans */}
      {plan.daily_structure.type === 'cycling_lists' && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-pixel text-terminal-green">
              READING LISTS
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(plan.daily_structure as CyclingListsStructure).lists.map((list, index) => (
                <div
                  key={list.id}
                  className="p-3 bg-terminal-dark border border-terminal-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-terminal-green">
                        List {index + 1}: {list.label}
                      </div>
                      <div className="text-sm text-terminal-gray-400 mt-1">
                        {list.books.map((b) => b.book).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-terminal-gray-200">{list.total_chapters} chapters</div>
                      <div className="text-xs text-terminal-gray-500">
                        Cycles every {list.total_chapters} days
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
