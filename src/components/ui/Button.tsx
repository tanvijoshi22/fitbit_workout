import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  icon?: ReactNode
}

const variantStyles = {
  primary:
    'bg-gradient-blue text-white btn-glow hover:brightness-110 disabled:opacity-40 disabled:shadow-none',
  secondary:
    'bg-bg-elevated border border-border text-text-primary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-glow',
  outline:
    'bg-transparent border border-accent-primary text-accent-primary hover:bg-accent-glow',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
  danger: 'bg-red-600/20 border border-red-600/40 text-red-400 hover:bg-red-600/30',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      onClick,
      type = 'button',
      className = '',
      icon,
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ duration: 0.15 }}
        className={`
          relative inline-flex items-center justify-center gap-2
          font-body font-semibold uppercase tracking-wider
          rounded-lg transition-all duration-200 cursor-pointer
          disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
