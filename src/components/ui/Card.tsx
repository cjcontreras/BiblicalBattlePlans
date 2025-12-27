import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  noPadding?: boolean
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

const variantStyles = {
  default: `
    bg-gradient-to-br from-parchment to-parchment-light
    border-2 border-border-subtle
    shadow-[0_4px_12px_var(--shadow-color),0_2px_4px_var(--shadow-color)]
  `,
  elevated: `
    bg-gradient-to-br from-parchment to-parchment-light
    border-2 border-border
    shadow-[0_8px_24px_var(--shadow-color-strong),0_4px_8px_var(--shadow-color)]
  `,
  outlined: `
    bg-transparent
    border-2 border-border-subtle
  `,
}

export function Card({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        ${variantStyles[variant]}
        ${noPadding ? '' : 'p-4'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`
        pb-3 mb-3
        bg-gradient-to-r from-parchment-dark/30 to-transparent
        -mx-4 -mt-4 px-4 pt-3
        border-b border-border-subtle
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div
      className={`
        pt-3 mt-3
        border-t border-border-subtle
      `}
      {...props}
    >
      {children}
    </div>
  )
}
