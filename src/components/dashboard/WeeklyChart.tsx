import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthEntry } from '@/lib/store'

interface WeeklyChartProps {
  entries: HealthEntry[]
  dataKey: keyof Pick<HealthEntry, 'sleepHours' | 'mood' | 'waterGlasses' | 'exerciseMinutes'>
  color: string
  label: string
  unit?: string
}

export function WeeklyChart({ entries, dataKey, color, label, unit = '' }: WeeklyChartProps) {
  const data = entries.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
    [dataKey]: e[dataKey],
  }))

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: 'var(--shadow-card)',
            }}
            formatter={(value: number) => [`${value}${unit}`, label]}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: 'hsl(var(--card))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
