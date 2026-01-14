import { useState } from 'react'
import { Modal } from './ui'
import { usePlatform } from '../hooks/usePlatform'
import { useIsNative } from '../hooks/useIsNative'
import { Smartphone, Monitor } from 'lucide-react'

interface InstallModalProps {
  isOpen: boolean
  onClose: () => void
}

// Placeholder paths - replace with actual video paths when available
const VIDEO_PATHS = {
  ios: '/videos/install-ios.mp4',
  android: '/videos/install-android.mp4',
}

const INSTRUCTIONS = {
  ios: [
    'Tap the Share button (box with arrow) at the bottom of Safari',
    'Scroll down and tap "Add to Home Screen"',
    'Tap "Add" in the top right corner',
    'The app icon will appear on your home screen!',
  ],
  android: [
    'Tap the menu button (three dots) in Chrome',
    'Tap "Add to Home screen" or "Install app"',
    'Tap "Add" or "Install" to confirm',
    'The app icon will appear on your home screen!',
  ],
}

export function InstallModal({ isOpen, onClose }: InstallModalProps) {
  const isNative = useIsNative()
  const detectedPlatform = usePlatform()
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>(
    detectedPlatform === 'ios' ? 'ios' : 'android'
  )

  // Never show install modal on native apps - they're already installed
  if (isNative) {
    return null
  }

  const instructions = INSTRUCTIONS[selectedPlatform]
  const videoPath = VIDEO_PATHS[selectedPlatform]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="INSTALL APP" size="lg">
      <div className="space-y-4">
        {/* Platform selector tabs */}
        <div className="flex border-2 border-border">
          <button
            onClick={() => setSelectedPlatform('ios')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2
              font-pixel text-[0.625rem] transition-colors
              ${selectedPlatform === 'ios'
                ? 'bg-sage text-parchment-lightest'
                : 'bg-parchment-light text-ink-muted hover:bg-parchment'
              }
            `}
          >
            <Smartphone className="w-4 h-4" />
            iPHONE / iPAD
          </button>
          <button
            onClick={() => setSelectedPlatform('android')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2
              font-pixel text-[0.625rem] transition-colors border-l-2 border-border
              ${selectedPlatform === 'android'
                ? 'bg-sage text-parchment-lightest'
                : 'bg-parchment-light text-ink-muted hover:bg-parchment'
              }
            `}
          >
            <Smartphone className="w-4 h-4" />
            ANDROID
          </button>
        </div>

        {/* Desktop message */}
        {detectedPlatform === 'desktop' && (
          <div className="flex items-center gap-2 p-3 bg-blue/10 border border-blue/30">
            <Monitor className="w-4 h-4 text-blue flex-shrink-0" />
            <p className="font-pixel text-[0.625rem] text-ink-muted">
              You&apos;re on a desktop. View this page on your phone to install, or share the link!
            </p>
          </div>
        )}

        {/* Video section */}
        <div className="border-2 border-border bg-parchment-dark/30">
          <video
            key={selectedPlatform}
            className="w-full aspect-video bg-ink/10"
            controls
            playsInline
            preload="metadata"
          >
            <source src={videoPath} type="video/mp4" />
            <p className="p-4 font-pixel text-[0.625rem] text-ink-muted text-center">
              Your browser does not support video playback.
            </p>
          </video>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-2">
          <h3 className="font-pixel text-[0.625rem] text-ink">
            STEP-BY-STEP INSTRUCTIONS
          </h3>
          <ol className="space-y-2">
            {instructions.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-sage text-parchment-lightest font-pixel text-[0.5rem]">
                  {index + 1}
                </span>
                <span className="font-pixel text-[0.625rem] text-ink-muted pt-0.5">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Browser note */}
        <p className="font-pixel text-[0.625rem] text-ink-muted/70 text-center pt-2 border-t border-border-subtle">
          {selectedPlatform === 'ios'
            ? 'Note: Installation only works in Safari on iOS devices.'
            : 'Note: Installation works best in Chrome or Samsung Internet.'}
        </p>
      </div>
    </Modal>
  )
}
