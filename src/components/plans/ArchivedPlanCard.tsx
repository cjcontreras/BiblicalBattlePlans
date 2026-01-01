import { toast } from 'sonner'
import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from '../ui'
import { useUnarchivePlan, calculatePlanProgress } from '../../hooks/usePlans'
import type { UserPlan, ReadingPlan } from '../../types'

interface ArchivedPlanCardProps {
  userPlan: UserPlan & { plan: ReadingPlan }
}

export function ArchivedPlanCard({ userPlan }: ArchivedPlanCardProps) {
  const unarchivePlan = useUnarchivePlan()
  const { plan } = userPlan
  const progress = calculatePlanProgress(userPlan, plan)

  const handleUnarchive = async () => {
    try {
      await unarchivePlan.mutateAsync(userPlan.id)
      toast.success('Quest restored! It will appear in Today\'s Quests.')
    } catch (error) {
      toast.error('Failed to restore quest. Please try again.')
    }
  }

  return (
    <Card className="h-full flex flex-col opacity-70 hover:opacity-100 transition-opacity">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-pixel text-[0.625rem] text-ink-muted leading-tight">
            {plan.name.toUpperCase()}
          </h3>
          <Badge variant="default" size="sm">ARCHIVED</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex justify-between font-pixel text-[0.625rem]">
            <span className="text-ink-muted">Status:</span>
            <span className="text-ink-faint">{userPlan.is_completed ? 'Completed' : 'In Progress'}</span>
          </div>
          <div className="flex justify-between font-pixel text-[0.625rem]">
            <span className="text-ink-muted">Progress:</span>
            <span className="text-ink-faint">{progress}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleUnarchive}
          isLoading={unarchivePlan.isPending}
        >
          RESTORE QUEST
        </Button>
      </CardFooter>
    </Card>
  )
}
