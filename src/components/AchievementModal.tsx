import { useEffect, useState } from 'react'
import { Trophy, Flame, BookOpen, Shield, Swords } from 'lucide-react'

export type AchievementType =
  | 'quest_complete'
  | 'streak_milestone'
  | 'rank_promotion'
  | 'chapter_milestone'
  | 'shield_used'

export interface Achievement {
  id: string
  type: AchievementType
  title: string
  description: string
  subtitle?: string
}

interface AchievementModalProps {
  achievement: Achievement | null
  onDismiss: () => void
}

const ACHIEVEMENT_CONFIG: Record<AchievementType, {
  icon: typeof Trophy
  headerText: string
  accentColor: string
  bgGradient: string
}> = {
  quest_complete: {
    icon: Trophy,
    headerText: 'QUEST COMPLETE',
    accentColor: 'text-gold',
    bgGradient: 'from-gold/20 to-gold/5',
  },
  streak_milestone: {
    icon: Flame,
    headerText: 'STREAK MILESTONE',
    accentColor: 'text-warning',
    bgGradient: 'from-warning/20 to-warning/5',
  },
  rank_promotion: {
    icon: Shield,
    headerText: 'RANK UP',
    accentColor: 'text-sage',
    bgGradient: 'from-sage/20 to-sage/5',
  },
  chapter_milestone: {
    icon: BookOpen,
    headerText: 'MILESTONE REACHED',
    accentColor: 'text-blue',
    bgGradient: 'from-blue/20 to-blue/5',
  },
  shield_used: {
    icon: Shield,
    headerText: 'STREAK PROTECTED',
    accentColor: 'text-sage',
    bgGradient: 'from-sage/20 to-sage/5',
  },
}

export function AchievementModal({ achievement, onDismiss }: AchievementModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (achievement) {
      // Small delay for animation
      const showTimer = setTimeout(() => setIsVisible(true), 50)

      // Auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => {
        handleDismiss()
      }, 5000)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(dismissTimer)
      }
    } else {
      setIsVisible(false)
    }
  }, [achievement])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsLeaving(false)
      setIsVisible(false)
      onDismiss()
    }, 300)
  }

  if (!achievement) return null

  const config = ACHIEVEMENT_CONFIG[achievement.type]
  const Icon = config.icon

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleDismiss}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-ink/40 backdrop-blur-sm
          transition-opacity duration-300
          ${isVisible && !isLeaving ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Achievement Card */}
      <div
        className={`
          relative w-full max-w-sm
          bg-parchment border-4 border-gold
          shadow-[0_0_40px_rgba(212,175,55,0.3),0_8px_32px_var(--shadow-color)]
          transition-all duration-300 ease-out
          ${isVisible && !isLeaving
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        {/* Decorative corners */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-gold" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-gold" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-gold" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-gold" />

        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-3 border-b-2 border-gold/30`}>
          <div className="flex items-center justify-center gap-2">
            <Swords className={`w-4 h-4 ${config.accentColor}`} />
            <span className={`font-pixel text-[0.625rem] ${config.accentColor} tracking-wider`}>
              {config.headerText}
            </span>
            <Swords className={`w-4 h-4 ${config.accentColor} scale-x-[-1]`} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {/* Icon with glow effect */}
          <div className="relative inline-block mb-4">
            <div className={`absolute inset-0 blur-xl ${config.accentColor} opacity-30`}>
              <Icon className="w-16 h-16" />
            </div>
            <Icon className={`relative w-16 h-16 ${config.accentColor}`} />
          </div>

          {/* Achievement Title */}
          <h2 className="font-pixel text-[0.875rem] text-ink mb-2">
            {achievement.title}
          </h2>

          {/* Subtitle (optional) */}
          {achievement.subtitle && (
            <p className={`font-pixel text-[0.75rem] ${config.accentColor} mb-3`}>
              {achievement.subtitle}
            </p>
          )}

          {/* Description */}
          <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
            {achievement.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-parchment-dark/20">
          <p className="font-pixel text-[0.5rem] text-ink-muted text-center">
            TAP ANYWHERE TO CONTINUE
          </p>
        </div>
      </div>
    </div>
  )
}
