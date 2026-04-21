import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  gradient: string
  trend?: { direction: 'up' | 'down' | 'flat'; label: string }
  delay?: number
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, delay = 0 }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 shadow-card-interactive opacity-0 animate-fade-in',
        gradient
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-background/80 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn(
            'text-xs font-medium',
            trend.direction === 'up' ? 'text-sage-dark' : trend.direction === 'down' ? 'text-rose' : 'text-muted-foreground'
          )}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
            {trend.label}
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  )
}
