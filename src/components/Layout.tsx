import { Outlet, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronDown, User, LogOut, Download } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { useIsPWA } from '../hooks/useIsPWA'
import { useSWUpdate } from '../hooks/useSWUpdate'
import { useCurrentAchievement, useDismissAchievement } from '../hooks/useAchievements'
import { Navigation, MobileNavigation } from './Navigation'
import { StreakBadge } from './ui'
import { InstallModal } from './InstallModal'
import { AchievementModal } from './AchievementModal'
import { MilestoneWatcher } from './MilestoneWatcher'
import { WelcomeModal } from './WelcomeModal'
import { UpdateBanner } from './UpdateBanner'
import { useIsOutage } from '../hooks/useSupabaseStatus'

const WELCOME_MODAL_KEY = 'hasSeenWelcomeModal'

export function Layout() {
  const { profile, signOut, user } = useAuth()
  const { data: stats } = useStats()
  const isPWA = useIsPWA()
  const { needRefresh, updateServiceWorker, close: dismissUpdate } = useSWUpdate()
  const isOutage = useIsOutage()
  const currentAchievement = useCurrentAchievement()
  const dismissAchievement = useDismissAchievement()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const currentStreak = stats?.current_streak || 0

  const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Soldier'

  // Check if user should see welcome modal
  useEffect(() => {
    // Only check when profile is loaded (user is authenticated)
    if (profile) {
      const hasSeenWelcome = localStorage.getItem(WELCOME_MODAL_KEY)
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true)
      }
    }
  }, [profile])

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false)
    localStorage.setItem(WELCOME_MODAL_KEY, 'true')
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-parchment-dark flex flex-col">
      {/* Update Banner */}
      {needRefresh && (
        <UpdateBanner
          onUpdate={updateServiceWorker}
          onDismiss={dismissUpdate}
        />
      )}

      {/* Header */}
      <header className={`sticky ${isOutage && needRefresh ? 'top-[104px]' : isOutage || needRefresh ? 'top-[52px]' : 'top-0'} z-40 bg-gradient-to-br from-parchment to-parchment-light border-b-2 border-border-subtle shadow-[0_4px_12px_var(--shadow-color)] transition-[top] duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              {/* Logo Placeholder - Replace with actual logo */}
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-13 h-13 flex items-center justify-center">
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
      <footer className="border-t border-border-subtle bg-parchment-light pb-32 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              Created and maintained by{' '}
              <Link
                to="/about"
                className="text-sage hover:text-sage-dark transition-colors"
              >
                ShirePath Solutions
              </Link>
            </p>
            <div className="flex items-center gap-4">
              {!isPWA && (
                <button
                  onClick={() => setShowInstallModal(true)}
                  className="flex items-center gap-1 font-pixel text-[0.625rem] text-sage hover:text-sage-dark transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Install App
                </button>
              )}
              <Link
                to="/acknowledgements"
                className="font-pixel text-[0.625rem] text-sage hover:text-sage-dark transition-colors"
              >
                Acknowledgements
              </Link>
              <span className="font-pixel text-[0.5rem] text-ink-muted/50">
                v{__APP_VERSION__}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeClose}
      />

      {/* Install Modal */}
      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Achievement Modal */}
      <AchievementModal
        achievement={currentAchievement}
        onDismiss={dismissAchievement}
      />

      {/* Milestone Watcher - detects streak/rank/chapter achievements */}
      <MilestoneWatcher />
    </div>
  )
}
