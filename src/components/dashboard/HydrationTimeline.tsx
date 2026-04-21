import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Droplets } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface HydrationTimelineProps {
  entries: HealthEntry[];
}

export function HydrationTimeline({ entries }: HydrationTimelineProps) {
  const data = useMemo(() => {
    return entries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      water: entry.waterGlasses,
      dateFull: entry.date,
    }));
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Droplets className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>No hydration data logged yet</p>
        </div>
      </div>
    );
  }

  const avgWater = entries.reduce((sum, e) => sum + e.waterGlasses, 0) / entries.length;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`${value} glasses`, 'Water Intake']}
          />
          <ReferenceLine 
            y={8} 
            stroke="#10b981" 
            strokeDasharray="3 3"
            label={{ value: 'Goal: 8', position: 'right', fill: '#10b981', fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="water"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#waterGradient)"
            name="Water Intake"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-2 text-center text-xs text-muted-foreground">
        Average: {avgWater.toFixed(1)} glasses/day | Goal: 8 glasses/day
      </div>
    </div>
  );
}
