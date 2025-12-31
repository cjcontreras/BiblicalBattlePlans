import { Modal } from './ui'
import { Button } from './ui/Button'
import { Sparkles, BookOpen, Trophy, FlaskConical } from 'lucide-react'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WELCOME WARRIOR!" size="lg">
      <div className="space-y-4">
        {/* Welcome Message */}
        <div className="flex items-start gap-3 p-3 bg-sage/10 border border-sage/30">
          <Sparkles className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-pixel text-sm text-sage mb-1">
              WELCOME TO BIBLICAL BATTLE PLANS
            </h3>
            <p className="font-pixel text-xs text-ink-muted leading-relaxed">
              Track your Bible reading with built-in
              plans, build consistency, and strengthen your faith one day at a time.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-3">
          <h3 className="font-pixel text-sm text-ink flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            HOW IT WORKS
          </h3>
          <div className="space-y-2 pl-6">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-white font-pixel text-xs">
                1
              </span>
              <p className="font-pixel text-xs text-ink-muted pt-0.5">
                Follow your Bible reading plan to maintain your streak
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-white font-pixel text-xs">
                2
              </span>
              <p className="font-pixel text-xs text-ink-muted pt-0.5">
                Earn achievements as you reach important milestones
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-white font-pixel text-xs">
                3
              </span>
              <p className="font-pixel text-xs text-ink-muted pt-0.5">
                Build a consistent Bible reading habit that transforms your spiritual life
              </p>
            </div>
          </div>
        </div>

        {/* Beta Notice */}
        <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30">
          <FlaskConical className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-pixel text-sm text-warning mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              BETA VERSION
            </h3>
            <p className="font-pixel text-xs text-ink-muted leading-relaxed">
              You&apos;re using an early version of Biblical Battle Plans. We&apos;re actively
              improving the app and would love your feedback! Use the Feedback tab to share
              any issues or suggestions to help us build the best Bible reading tool possible.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            GET STARTED
          </Button>
        </div>
      </div>
    </Modal>
  )
}
