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
            className="block mb-1.5 text-sm font-medium text-terminal-gray-200"
          >
            {`> ${label}`}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-gray-400">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full
              bg-terminal-dark
              border-2 ${error ? 'border-alert-red' : 'border-terminal-gray-500'}
              text-terminal-gray-100
              placeholder:text-terminal-gray-400
              font-mono
              px-3 py-2
              ${leftElement ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              focus:outline-none focus:border-terminal-green
              focus:shadow-[0_0_5px_var(--color-terminal-green)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-150
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-gray-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-alert-red">
            {`! ${error}`}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-terminal-gray-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
