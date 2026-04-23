import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'accent-border' | 'glass' | 'gradient'
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles = {
  default: 'bg-bg-card border border-border shadow-card',
  elevated: 'bg-bg-elevated border border-border shadow-card',
  'accent-border': 'bg-bg-card border border-accent-primary shadow-glow-sm',
  glass: 'glass shadow-card',
  gradient: 'bg-gradient-card border border-border shadow-card',
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  hover = false,
  padding = 'md',
}: CardProps) {
  const isClickable = !!onClick || hover

  return (
    <motion.div
      onClick={onClick}
      whileHover={isClickable ? { scale: 1.01, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
