import { useReadingPlans, useUserPlans } from '../hooks/usePlans'
import { PlanCard } from '../components/plans'
import { LoadingSpinner, Card, CardContent } from '../components/ui'

export function Plans() {
  const { data: plans, isLoading: plansLoading, error: plansError } = useReadingPlans()
  const { data: userPlans, isLoading: userPlansLoading } = useUserPlans()

  const isLoading = plansLoading || userPlansLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (plansError) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-alert-red">! ERROR: Failed to load reading plans</p>
          <p className="text-terminal-gray-400 text-sm mt-2">{plansError.message}</p>
        </CardContent>
      </Card>
    )
  }

  // Separate active campaigns from available plans
  const activeCampaigns = userPlans?.filter((up) => !up.is_completed) || []
  const activePlanIds = activeCampaigns.map((up) => up.plan_id)

  // Plans that user hasn't started or has completed
  const availablePlans = plans?.filter((p) => !activePlanIds.includes(p.id)) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-pixel text-terminal-green">START NEW CAMPAIGN</h1>
        <p className="text-terminal-gray-400 mt-2">
          Choose a reading plan to begin your journey through Scripture
        </p>
      </div>

      {/* Available Plans */}
      <section>
        <h2 className="text-lg font-pixel text-terminal-green mb-4">
          AVAILABLE PLANS ({availablePlans.length})
        </h2>
        {availablePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-terminal-gray-400">
                You're enrolled in all available plans!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Plan Types Legend */}
      <section className="border-t border-terminal-gray-600 pt-6">
        <h3 className="text-sm font-pixel text-terminal-gray-400 mb-3">PLAN TYPES</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-achievement-gold">CYCLING</span>
            <p className="text-terminal-gray-400 mt-1">
              Multiple independent reading lists that cycle at different rates (e.g., Horner's System)
            </p>
          </div>
          <div>
            <span className="text-terminal-green">FREE</span>
            <p className="text-terminal-gray-400 mt-1">
              Log your own reading without a fixed schedule. Perfect for flexible study.
            </p>
          </div>
          <div>
            <span className="text-terminal-gray-200">SEQUENTIAL</span>
            <p className="text-terminal-gray-400 mt-1">
              Read through the Bible in order from Genesis to Revelation
            </p>
          </div>
          <div>
            <span className="text-terminal-green">SECTIONAL</span>
            <p className="text-terminal-gray-400 mt-1">
              Daily readings from multiple sections (OT, NT, Psalms, Proverbs)
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
