import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface HealthRadarChartProps {
  entries: HealthEntry[];
}

export function HealthRadarChart({ entries }: HealthRadarChartProps) {
  const data = useMemo(() => {
    if (entries.length === 0) return [];

    const avgSleep = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const avgWater = entries.reduce((sum, e) => sum + e.waterGlasses, 0) / entries.length;
    const avgExercise = entries.reduce((sum, e) => sum + e.exerciseMinutes, 0) / entries.length;
    const avgSteps = entries.reduce((sum, e) => sum + (e.steps || 0), 0) / entries.length;

    // Normalize to 0-100 scale
    return [
      { metric: 'Sleep', value: Math.min(100, (avgSleep / 9) * 100), fullMark: 100 },
      { metric: 'Mood', value: (avgMood / 5) * 100, fullMark: 100 },
      { metric: 'Hydration', value: Math.min(100, (avgWater / 8) * 100), fullMark: 100 },
      { metric: 'Exercise', value: Math.min(100, (avgExercise / 60) * 100), fullMark: 100 },
      { metric: 'Steps', value: Math.min(100, (avgSteps / 10000) * 100), fullMark: 100 },
    ];
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          />
          <Radar
            name="Health Metrics"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => `${value.toFixed(0)}%`}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
