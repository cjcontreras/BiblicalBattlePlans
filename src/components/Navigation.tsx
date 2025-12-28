import { NavLink } from 'react-router-dom'
import { Home, Shield, MessageSquarePlus, type LucideIcon } from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

// Removed QUESTS from nav - users access it via "NEW QUEST" button
const navItems: NavItem[] = [
  { path: '/dashboard', label: 'HOME', icon: Home },
  { path: '/profile', label: 'HERO', icon: Shield },
  { path: '/feedback', label: 'FEEDBACK', icon: MessageSquarePlus },
]

export function Navigation() {
  return (
    <nav className="flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 font-pixel text-[0.625rem] transition-all duration-150 flex items-center gap-2 border-2 ${
                isActive
                  ? 'bg-gradient-to-b from-gold to-gold-dark border-gold-dark text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                  : 'bg-gradient-to-b from-parchment-light to-parchment border-border-subtle text-ink hover:border-gold hover:from-parchment-lightest hover:to-parchment-light'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-parchment to-parchment-light border-t-2 border-border-subtle md:hidden z-50 shadow-[0_-4px_12px_var(--shadow-color)] pb-safe">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-4 px-6 flex-1 transition-all duration-150 ${
                  isActive
                    ? 'text-gold bg-parchment-dark/20'
                    : 'text-ink-muted hover:text-gold'
                }`
              }
            >
              <Icon className="w-7 h-7 mb-1.5" />
              <span className="font-pixel text-[0.625rem]">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
