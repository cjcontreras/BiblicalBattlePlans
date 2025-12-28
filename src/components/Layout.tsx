import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, User, LogOut } from 'lucide-react'
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
    <div className="min-h-screen bg-parchment-dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-br from-parchment to-parchment-light border-b-2 border-border-subtle shadow-[0_4px_12px_var(--shadow-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              {/* Logo Placeholder - Replace with actual logo */}
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/BiblicalBattlePlansLogo.png" alt="BBP" className="w-full h-full object-contain" />
                </div>
                <div className="hidden md:block">
                  <h1 className="font-pixel text-[0.625rem] text-ink leading-tight">
                    BIBLICAL BATTLE
                  </h1>
                  <p className="font-pixel text-[0.5rem] text-ink-muted leading-tight">
                    PLANS
                  </p>
                </div>
              </Link>
              
              <div className="hidden md:block ml-4">
                <Navigation />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Streak indicator */}
              <div className="hidden sm:block">
                <StreakBadge days={currentStreak} />
              </div>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-parchment-light border border-border-subtle hover:border-gold transition-colors"
                >
                  <span className="font-pixel text-[0.625rem] text-ink">
                    @{displayName.toUpperCase()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-ink-muted" />
                </button>

                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-parchment border-2 border-border-subtle shadow-[0_8px_24px_var(--shadow-color-strong)] z-20">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-border-subtle">
                          <p className="font-pixel text-[0.5rem] text-ink-muted">
                            SIGNED IN AS
                          </p>
                          <p className="font-pixel text-[0.625rem] text-ink truncate mt-1">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-3 font-pixel text-[0.625rem] text-ink hover:bg-parchment-light transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          PROFILE
                        </Link>

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-3 font-pixel text-[0.625rem] text-danger hover:bg-parchment-light transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          SIGN OUT
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-parchment-light pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              Created and maintained by ShirePath Solutions
            </p>
            <Link
              to="/acknowledgements"
              className="font-pixel text-[0.625rem] text-sage hover:text-sage-dark transition-colors"
            >
              Acknowledgements
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  )
}
