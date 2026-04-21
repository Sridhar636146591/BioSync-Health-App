import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Smile } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface MoodCorrelationChartProps {
  entries: HealthEntry[];
}

export function MoodCorrelationChart({ entries }: MoodCorrelationChartProps) {
  const data = useMemo(() => {
    return entries.map(entry => ({
      sleep: entry.sleepHours,
      exercise: entry.exerciseMinutes,
      water: entry.waterGlasses,
      mood: entry.mood,
      date: entry.date,
    }));
  }, [entries]);

  if (entries.length < 3) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Smile className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>Need more data to show correlations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            dataKey="sleep" 
            name="Sleep"
            unit="h"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            label={{ value: 'Sleep (hours)', position: 'bottom', fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="mood" 
            name="Mood"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            label={{ value: 'Mood (1-5)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12 }}
            domain={[0, 6]}
          />
          <ZAxis 
            type="number" 
            dataKey="exercise" 
            name="Exercise"
            unit="min"
            range={[50, 200]}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                sleep: 'Sleep',
                mood: 'Mood',
                exercise: 'Exercise',
                water: 'Water',
              };
              return [`${value}${name === 'sleep' ? 'h' : name === 'exercise' ? 'min' : ''}`, labels[name] || name];
            }}
          />
          <Scatter 
            name="Mood vs Sleep" 
            data={data} 
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
