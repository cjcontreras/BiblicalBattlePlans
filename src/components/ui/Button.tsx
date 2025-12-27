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
    bg-gradient-to-b from-sage to-sage-dark
    text-white
    border-2 border-sage-dark
    shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_var(--shadow-color)]
    hover:from-sage-light hover:to-sage
    hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_6px_var(--shadow-color)]
    active:from-sage active:to-sage-dark
    active:shadow-[inset_0_2px_4px_var(--shadow-color)]
  `,
  secondary: `
    bg-gradient-to-b from-parchment-light to-parchment
    text-ink
    border-2 border-border
    shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_var(--shadow-color)]
    hover:from-parchment-lightest hover:to-parchment-light
    hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_3px_6px_var(--shadow-color)]
    active:from-parchment active:to-parchment-dark
    active:shadow-[inset_0_2px_4px_var(--shadow-color)]
  `,
  danger: `
    bg-gradient-to-b from-danger to-danger-dark
    text-white
    border-2 border-danger-dark
    shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_var(--shadow-color)]
    hover:from-[#d85050] hover:to-danger
    hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_6px_var(--shadow-color)]
    active:from-danger active:to-danger-dark
    active:shadow-[inset_0_2px_4px_var(--shadow-color)]
  `,
  ghost: `
    bg-transparent
    text-ink
    border-2 border-transparent
    hover:bg-parchment-light
    hover:border-border-subtle
    active:bg-parchment
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[0.625rem]',
  md: 'px-4 py-2 text-[0.75rem]',
  lg: 'px-6 py-3 text-[0.875rem]',
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
          font-pixel
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 focus:ring-offset-parchment-dark
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="animate-pulse-subtle">LOADING...</span>
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
