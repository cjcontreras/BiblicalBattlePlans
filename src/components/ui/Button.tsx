import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { ButtonVariant, ButtonSize } from '../../types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-military-green hover:bg-military-green-dark
    text-terminal-gray-100
    border-2 border-terminal-green
    hover:shadow-[0_0_10px_var(--color-terminal-green)]
  `,
  secondary: `
    bg-terminal-darker hover:bg-terminal-gray-600
    text-terminal-gray-100
    border-2 border-terminal-gray-400
    hover:border-terminal-gray-300
  `,
  danger: `
    bg-alert-red-dim hover:bg-alert-red
    text-terminal-gray-100
    border-2 border-alert-red
    hover:shadow-[0_0_10px_var(--color-alert-red)]
  `,
  ghost: `
    bg-transparent hover:bg-terminal-gray-600
    text-terminal-gray-200
    border-2 border-transparent
    hover:border-terminal-gray-500
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-mono font-medium
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-terminal-green focus:ring-offset-2 focus:ring-offset-terminal-dark
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="animate-pulse">[ LOADING... ]</span>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
