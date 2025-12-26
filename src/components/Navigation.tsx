import { NavLink } from 'react-router-dom'
import { Home, Swords, type LucideIcon } from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/profile', label: 'Profile', icon: Swords },
]

export function Navigation() {
  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 font-mono text-sm transition-all duration-150 flex items-center gap-2 ${
                isActive
                  ? 'text-terminal-green bg-terminal-gray-600 border-b-2 border-terminal-green'
                  : 'text-terminal-gray-300 hover:text-terminal-green hover:bg-terminal-gray-600'
              }`
            }
          >
            <Icon className="hidden sm:inline w-4 h-4" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-terminal-darker border-t border-terminal-gray-500 md:hidden z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-3 px-4 flex-1 transition-all duration-150 ${
                  isActive
                    ? 'text-terminal-green bg-terminal-gray-600'
                    : 'text-terminal-gray-400 hover:text-terminal-green'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
