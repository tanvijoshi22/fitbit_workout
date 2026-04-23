import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0–100
  label?: string
  showPercent?: boolean
  color?: 'accent' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

const colorStyles = {
  accent: 'bg-gradient-cyan',
  success: 'bg-success',
  warning: 'bg-warning',
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  label,
  showPercent = false,
  color = 'accent',
  size = 'md',
  className = '',
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs uppercase tracking-widest text-text-secondary font-body">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-mono text-text-secondary">{Math.round(clamped)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-bg-elevated rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <motion.div
          className={`h-full rounded-full ${colorStyles[color]} ${clamped === 100 ? 'shadow-glow-sm' : ''}`}
          initial={animated ? { width: 0 } : { width: `${clamped}%` }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>
    </div>
  )
}
