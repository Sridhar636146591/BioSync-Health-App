import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface HealthTrendsChartProps {
  entries: HealthEntry[];
}

interface TrendData {
  date: string;
  sleep: number;
  mood: number;
  forecast?: boolean;
}

export function HealthTrendsChart({ entries }: HealthTrendsChartProps) {
  const data = useMemo(() => {
    if (entries.length < 7) return [];

    const last14Days = entries.slice(-14);
    
    // Calculate 3-day moving average for smoothing
    const smoothed: TrendData[] = last14Days.map((entry, index) => {
      const start = Math.max(0, index - 2);
      const slice = last14Days.slice(start, index + 1);
      
      const avgSleep = slice.reduce((sum, e) => sum + e.sleepHours, 0) / slice.length;
      const avgMood = slice.reduce((sum, e) => sum + e.mood, 0) / slice.length;
      
      return {
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sleep: Math.round(avgSleep * 10) / 10,
        mood: Math.round(avgMood * 10) / 10,
      };
    });

    // Simple linear regression for forecasting
    const forecastDays = 3;
    const n = smoothed.length;
    
    if (n > 0) {
      // Sleep forecast
      const sleepValues = smoothed.map(d => d.sleep);
      const sleepSlope = calculateSlope(sleepValues);
      const sleepIntercept = calculateIntercept(sleepValues, sleepSlope);
      
      // Mood forecast
      const moodValues = smoothed.map(d => d.mood);
      const moodSlope = calculateSlope(moodValues);
      const moodIntercept = calculateIntercept(moodValues, moodSlope);
      
      // Add forecast data
      for (let i = 1; i <= forecastDays; i++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + i);
        
        smoothed.push({
          date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sleep: Math.round((sleepSlope * (n + i) + sleepIntercept) * 10) / 10,
          mood: Math.round((moodSlope * (n + i) + moodIntercept) * 10) / 10,
          forecast: true,
        });
      }
    }

    return smoothed;
  }, [entries]);

  function calculateSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  function calculateIntercept(values: number[], slope: number): number {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    return (sumY - slope * sumX) / n;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>Need at least 7 days of data for trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            domain={[0, 10]}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Area
            type="monotone"
            dataKey="sleep"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#sleepGradient)"
            name="Sleep (hours)"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#moodGradient)"
            name="Mood (1-5)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
