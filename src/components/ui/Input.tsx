import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftElement,
      rightElement,
      className = '',
      id,
      enterKeyHint = 'done',
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1.5 text-[0.625rem] font-pixel text-ink-muted uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            enterKeyHint={enterKeyHint}
            className={`
              w-full
              bg-parchment-light
              border-2 ${error ? 'border-danger' : 'border-border-subtle'}
              text-ink
              placeholder:text-ink-faint
              font-pixel
              text-[0.75rem]
              px-3 py-2.5
              ${leftElement ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              focus:outline-none focus:border-sage
              focus:shadow-[0_0_0_3px_rgba(93,138,102,0.2)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[0.625rem] text-danger font-pixel">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-[0.625rem] text-ink-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
