import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: ReactNode
  accent?: boolean
  className?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  accent = false,
  className = '',
  onClick,
}: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-red-400' : 'text-text-muted'

  return (
    <Card
      variant={accent ? 'accent-border' : 'default'}
      className={`flex flex-col gap-3 relative overflow-hidden ${className}`}
      onClick={onClick}
      hover={!!onClick}
    >
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${accent ? 'bg-gradient-cyan' : 'bg-accent-primary/20'}`} />

      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-widest text-text-muted font-body font-medium">
          {label}
        </span>
        {icon && (
          <span className="p-1.5 rounded-lg bg-accent-primary/10 text-accent-primary">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="font-mono text-3xl font-bold text-text-primary leading-none">{value}</span>
        {unit && <span className="text-text-secondary text-sm font-body mb-0.5">{unit}</span>}
      </div>

      {(trend || trendValue) && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          {trend && <TrendIcon size={12} />}
          {trendValue && <span className="font-body">{trendValue}</span>}
        </div>
      )}
    </Card>
  )
}
