import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'pr'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-bg-elevated border border-border text-text-secondary',
  success: 'bg-success/10 border border-success/30 text-success',
  warning: 'bg-warning/10 border border-warning/30 text-warning',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400',
  accent: 'bg-accent-primary/10 border border-accent-primary/30 text-accent-primary',
  pr: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-body font-medium uppercase tracking-wider
        rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
