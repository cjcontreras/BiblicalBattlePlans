import { RefreshCw, X } from 'lucide-react'

interface UpdateBannerProps {
  onUpdate: () => void | Promise<void>
  onDismiss: () => void
}

/**
 * Banner shown when a new version of the app is available.
 * Prompts the user to refresh to get the latest updates.
 */
export function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-sage to-sage-dark text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-4 h-4" />
            <p className="font-pixel text-[0.625rem]">
              A NEW VERSION IS AVAILABLE!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUpdate}
              aria-label="Update and reload the application"
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/40 font-pixel text-[0.5rem] transition-colors"
            >
              UPDATE NOW
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 hover:bg-white/20 transition-colors"
              aria-label="Dismiss update notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
