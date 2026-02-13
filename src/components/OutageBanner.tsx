import { useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import { useSupabaseStatus, useIsOutage } from '../hooks/useSupabaseStatus'

export function OutageBanner() {
  const isOutage = useIsOutage()
  const { checkHealth, isChecking, startRecoveryPolling } = useSupabaseStatus()

  // Start recovery polling while outage is active
  useEffect(() => {
    if (!isOutage) return
    return startRecoveryPolling()
  }, [isOutage, startRecoveryPolling])

  if (!isOutage) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[51] bg-gradient-to-r from-danger to-red-700 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <WifiOff className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-pixel text-[0.625rem]">
                SERVER UNREACHABLE
              </p>
              <p className="font-pixel text-[0.5rem] text-white/80">
                Our servers are experiencing issues. Your data is safe — we'll reconnect automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => checkHealth()}
            disabled={isChecking}
            aria-label="Retry connection to server"
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 border border-white/40 font-pixel text-[0.5rem] transition-colors disabled:opacity-50 shrink-0"
          >
            {isChecking ? 'CHECKING...' : 'RETRY'}
          </button>
        </div>
      </div>
    </div>
  )
}
