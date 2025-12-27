import { useReadingPlans, useUserPlans } from '../hooks/usePlans'
import { PlanCard, ArchivedPlanCard } from '../components/plans'
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
          <p className="font-pixel text-[0.625rem] text-danger">ERROR: Failed to load reading plans</p>
          <p className="font-pixel text-[0.5rem] text-ink-muted mt-2">{plansError.message}</p>
        </CardContent>
      </Card>
    )
  }

  // Active campaigns: not completed AND not archived
  const activeCampaigns = userPlans?.filter((up) => !up.is_completed && !up.is_archived) || []
  const activePlanIds = activeCampaigns.map((up) => up.plan_id)

  // Archived plans: all plans where is_archived = true
  const archivedPlans = userPlans?.filter((up) => up.is_archived) || []

  // Plans that user hasn't started or has completed/archived
  const availablePlans = plans?.filter((p) => !activePlanIds.includes(p.id)) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-pixel text-sm text-ink mb-2">START NEW QUEST</h1>
        <p className="font-pixel text-[0.5rem] text-ink-muted">
          Choose a reading plan to begin your journey through Scripture
        </p>
      </div>

      {/* Available Plans */}
      <section>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent -mx-4 px-4 py-3 mb-4 border-b border-border-subtle">
          <h2 className="font-pixel text-[0.625rem] text-ink">
            AVAILABLE QUESTS ({availablePlans.length})
          </h2>
        </div>
        {availablePlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="font-pixel text-[0.625rem] text-ink-muted">
                You're enrolled in all available quests!
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Archived Plans */}
      {archivedPlans.length > 0 && (
        <section>
          <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent -mx-4 px-4 py-3 mb-4 border-t border-b border-border-subtle">
            <h2 className="font-pixel text-[0.625rem] text-ink">
              ARCHIVED QUESTS ({archivedPlans.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedPlans.map((userPlan) => (
              <ArchivedPlanCard key={userPlan.id} userPlan={userPlan} />
            ))}
          </div>
        </section>
      )}

      {/* Plan Types Legend */}
      <section>
        <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent -mx-4 px-4 py-3 mb-4 border-t border-b border-border-subtle">
          <h3 className="font-pixel text-[0.5rem] text-ink-muted">QUEST TYPES</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-parchment-light border border-border-subtle">
            <span className="font-pixel text-[0.625rem] text-warning">CYCLING</span>
            <p className="font-pixel text-[0.5rem] text-ink-muted mt-2 leading-relaxed">
              Multiple independent reading lists that cycle at different rates (e.g., Horner's System)
            </p>
          </div>
          <div className="p-3 bg-parchment-light border border-border-subtle">
            <span className="font-pixel text-[0.625rem] text-sage">FREE</span>
            <p className="font-pixel text-[0.5rem] text-ink-muted mt-2 leading-relaxed">
              Log your own reading without a fixed schedule. Perfect for flexible study.
            </p>
          </div>
          <div className="p-3 bg-parchment-light border border-border-subtle">
            <span className="font-pixel text-[0.625rem] text-ink">SEQUENTIAL</span>
            <p className="font-pixel text-[0.5rem] text-ink-muted mt-2 leading-relaxed">
              Read through the Bible in order from Genesis to Revelation
            </p>
          </div>
          <div className="p-3 bg-parchment-light border border-border-subtle">
            <span className="font-pixel text-[0.625rem] text-blue">SECTIONAL</span>
            <p className="font-pixel text-[0.5rem] text-ink-muted mt-2 leading-relaxed">
              Daily readings from multiple sections (OT, NT, Psalms, Proverbs)
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
