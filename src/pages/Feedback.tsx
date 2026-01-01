import { Link } from 'react-router-dom'
import {
  ChevronLeft,
  MessageSquarePlus,
  Bug,
  Lightbulb,
  ExternalLink,
  Sparkles,
  Users,
  Swords,
  Trophy,
  Wrench
} from 'lucide-react'
import { Card, CardContent } from '../components/ui'

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfVgGHqLyIPkaRaH7Oa5qL5S5iuR6VOPs_GS-aWG5YLcUrcNg/viewform?usp=header'

interface RoadmapPhase {
  title: string
  icon: React.ReactNode
  status: 'in-progress' | 'planned' | 'backlog'
  items: string[]
}

const roadmap: RoadmapPhase[] = [
  {
    title: 'POLISH & ENHANCEMENTS',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'in-progress',
    items: [
      'Notes & reflections on any reading plan',
      'View your notes history over time',
      'Search and filter your reading notes',
    ],
  },
  {
    title: 'BATTLE BUDDY',
    icon: <Swords className="w-5 h-5" />,
    status: 'planned',
    items: [
      'Invite a friend as your Battle Buddy',
      'See your buddy\'s streak and current plan',
      'Optional shared streak (both must read)',
    ],
  },
  {
    title: 'GROUPS',
    icon: <Users className="w-5 h-5" />,
    status: 'planned',
    items: [
      'Create or join reading groups',
      'Group leaderboards and activity feed',
      'Group challenges (read X chapters together)',
      'Recommend plans to your group',
    ],
  },
  {
    title: 'ENHANCED GAMIFICATION',
    icon: <Trophy className="w-5 h-5" />,
    status: 'planned',
    items: [
      'Achievement badges and unlockables',
      'Weekly challenges with rewards',
      'Rare collectibles and special items',
    ],
  },
  {
    title: 'TECHNICAL IMPROVEMENTS',
    icon: <Wrench className="w-5 h-5" />,
    status: 'in-progress',
    items: [
      'Better offline support',
      'Accessibility improvements',
      'Progressive web app enhancements',
    ],
  },
]

const statusLabels: Record<RoadmapPhase['status'], { label: string; className: string }> = {
  'in-progress': { label: 'IN PROGRESS', className: 'bg-gold/20 text-gold-dark border-gold' },
  'planned': { label: 'PLANNED', className: 'bg-sage/20 text-sage-dark border-sage' },
  'backlog': { label: 'BACKLOG', className: 'bg-ink-muted/20 text-ink-muted border-ink-muted' },
}

export function Feedback() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-sage transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO HOME
      </Link>

      {/* Header */}
      <Card variant="elevated">
        <CardContent>
          <h1 className="font-pixel text-sm text-ink mb-3">
            FEEDBACK & ROADMAP
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Biblical Battle Plans is a work in progress. Your feedback helps shape the future of this app!
          </p>
        </CardContent>
      </Card>

      {/* Feedback Types */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card noPadding>
          <div className="p-4 text-center">
            <Bug className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <h3 className="font-pixel text-[0.625rem] text-ink mb-1">BUGS</h3>
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              Something broken or not working right?
            </p>
          </div>
        </Card>
        <Card noPadding>
          <div className="p-4 text-center">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-gold" />
            <h3 className="font-pixel text-[0.625rem] text-ink mb-1">IDEAS</h3>
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              Feature requests or suggestions?
            </p>
          </div>
        </Card>
        <Card noPadding>
          <div className="p-4 text-center">
            <MessageSquarePlus className="w-6 h-6 mx-auto mb-2 text-sage" />
            <h3 className="font-pixel text-[0.625rem] text-ink mb-1">GENERAL</h3>
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              Any other thoughts or comments?
            </p>
          </div>
        </Card>
      </div>

      {/* Form Link */}
      <Card noPadding>
        <div className="p-6 text-center">
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-4">
            Click below to open the feedback form. It only takes a minute!
          </p>
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-sage to-sage-dark border-2 border-sage-dark text-white font-pixel text-[0.625rem] hover:from-sage-dark hover:to-sage-dark transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            OPEN FEEDBACK FORM
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>

      {/* Roadmap Section */}
      <Card variant="elevated">
        <CardContent>
          <h2 className="font-pixel text-[0.75rem] text-ink mb-2">
            ROADMAP
          </h2>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Here's what's coming to Biblical Battle Plans. Priorities may shift based on your feedback!
          </p>
        </CardContent>
      </Card>

      {/* Roadmap Items */}
      <div className="space-y-4">
        {roadmap.map((phase, index) => {
          const status = statusLabels[phase.status]
          return (
            <Card key={index} noPadding>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 text-ink">
                    {phase.icon}
                    <h3 className="font-pixel text-[0.625rem]">
                      {phase.title}
                    </h3>
                  </div>
                  <span className={`font-pixel text-[0.625rem] px-2 py-1 border ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed flex items-start gap-2"
                    >
                      <span className="text-sage mt-0.5">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Note */}
      <Card>
        <CardContent className="text-center">
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Thank you for helping improve Biblical Battle Plans. Every piece of feedback is read and appreciated!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
