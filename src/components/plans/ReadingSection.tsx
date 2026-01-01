import { Check, ChevronRight } from 'lucide-react'

interface ReadingSectionProps {
  id: string
  label: string
  passage: string
  isCompleted: boolean
  onToggle: () => void
  onContinue?: () => void
  disabled?: boolean
  showContinue?: boolean
  continueLabel?: string
}

export function ReadingSection({
  label,
  passage,
  isCompleted,
  onToggle,
  onContinue,
  disabled = false,
  showContinue = false,
  continueLabel = "Continue to next chapter",
}: ReadingSectionProps) {
  return (
    <div
      className={`
        border transition-all duration-150
        ${
          isCompleted
            ? 'border-sage bg-sage/10'
            : 'border-border-subtle bg-parchment-light'
        }
      `}
    >
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          w-full text-left p-3
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-parchment-dark/10'}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div
            className={`
              w-5 h-5 border-2 flex items-center justify-center flex-shrink-0
              ${isCompleted ? 'border-sage-dark bg-sage' : 'border-border bg-parchment-lightest'}
            `}
          >
            {isCompleted && (
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="font-pixel text-[0.625rem] text-ink-muted mb-0.5">{label}</div>
            <div
              className={`font-pixel text-[0.625rem] ${
                isCompleted ? 'text-ink-muted line-through' : 'text-ink'
              }`}
            >
              {passage}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <span className="font-pixel text-[0.625rem] text-sage">DONE</span>
            ) : (
              <span className="font-pixel text-[0.625rem] text-ink-faint">○</span>
            )}
          </div>
        </div>
      </button>

      {/* Continue button - shown when completed and showContinue is true */}
      {isCompleted && showContinue && onContinue && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onContinue()
          }}
          disabled={disabled}
          className={`
            w-full text-left px-3 py-2 border-t border-sage/30
            flex items-center justify-between
            font-pixel text-[0.625rem] text-sage hover:bg-sage/20 transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span>{continueLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
