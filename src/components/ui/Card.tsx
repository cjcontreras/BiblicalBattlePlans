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
    bg-terminal-darker
    border-2 border-terminal-gray-500
  `,
  elevated: `
    bg-terminal-darker
    border-2 border-terminal-green
    shadow-[0_0_10px_rgba(51,255,51,0.2)]
  `,
  outlined: `
    bg-transparent
    border-2 border-terminal-gray-400
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
        border-b border-terminal-gray-500
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
        border-t border-terminal-gray-500
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
