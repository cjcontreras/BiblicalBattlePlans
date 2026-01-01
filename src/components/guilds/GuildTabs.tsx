import { Users, Trophy, Activity } from 'lucide-react'

export type GuildTab = 'members' | 'leaderboard' | 'activity'

interface GuildTabsProps {
  activeTab: GuildTab
  onTabChange: (tab: GuildTab) => void
}

const tabs: { id: GuildTab; label: string; icon: typeof Users }[] = [
  { id: 'members', label: 'MEMBERS', icon: Users },
  { id: 'leaderboard', label: 'LEADERBOARD', icon: Trophy },
  { id: 'activity', label: 'ACTIVITY', icon: Activity },
]

export function GuildTabs({ activeTab, onTabChange }: GuildTabsProps) {
  return (
    <div className="flex border-b-2 border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-3
              font-pixel text-[0.5rem] transition-colors
              border-b-2 -mb-[2px]
              ${isActive
                ? 'border-sage text-sage bg-parchment-light'
                : 'border-transparent text-ink-muted hover:text-ink hover:bg-parchment-light/50'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
