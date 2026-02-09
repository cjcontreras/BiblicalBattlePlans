import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Keyboard } from '@capacitor/keyboard'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Dismiss keyboard when tapping outside of input fields
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    // If tapping on non-input area, blur active element to dismiss keyboard
    if (!isInput && Capacitor.isNativePlatform()) {
      const activeElement = document.activeElement as HTMLElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        activeElement.blur()
        // Also explicitly hide keyboard on iOS
        Keyboard.hide().catch(() => {
          // Keyboard hide can fail if no keyboard is shown, ignore
        })
      }
    }
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  // Hide keyboard when modal closes
  useEffect(() => {
    if (!isOpen && Capacitor.isNativePlatform()) {
      Keyboard.hide().catch(() => {
        // Ignore errors
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full ${sizeStyles[size]}
          bg-parchment
          border-4 border-border
          shadow-[0_8px_32px_var(--shadow-color)]
          animate-in fade-in zoom-in-95 duration-200
          max-h-[90vh] overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-parchment-dark/30 sticky top-0 z-10">
          <h2 id="modal-title" className="font-pixel text-[0.75rem] text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-parchment-light transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        </div>

        {/* Content - tap to dismiss keyboard */}
        <div
          ref={contentRef}
          className="p-4"
          onClick={handleContentClick}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
