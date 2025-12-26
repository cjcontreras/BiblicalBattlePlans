import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import { Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { Navigation, MobileNavigation } from './Navigation'
import { StreakBadge } from './ui'

export function Layout() {
  const { profile, signOut, user } = useAuth()
  const { data: stats } = useStats()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const currentStreak = stats?.current_streak || 0

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Soldier'

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-terminal-dark text-terminal-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-terminal-darker border-b border-terminal-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="font-pixel text-terminal-green text-sm sm:text-base">
                BBP
              </h1>
              <div className="hidden md:block">
                <Navigation />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Streak indicator */}
              <div className="hidden sm:block">
                <StreakBadge days={currentStreak} />
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-mono text-terminal-gray-200 hover:text-terminal-green transition-colors"
                >
                  <span className="hidden sm:inline">@{displayName}</span>
                  <Settings className="sm:hidden w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-terminal-darker border-2 border-terminal-gray-500 z-20">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-terminal-gray-400 border-b border-terminal-gray-500">
                          Signed in as
                          <div className="text-terminal-green truncate">
                            {user?.email}
                          </div>
                        </div>

                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-terminal-gray-200 hover:bg-terminal-gray-600 hover:text-terminal-green"
                          onClick={() => setShowUserMenu(false)}
                        >
                          {'> Profile'}
                        </Link>

                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-alert-red hover:bg-terminal-gray-600"
                        >
                          {'> Sign Out'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  )
}
