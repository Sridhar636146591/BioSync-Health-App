import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface WeeklyComparisonChartProps {
  entries: HealthEntry[];
}

export function WeeklyComparisonChart({ entries }: WeeklyComparisonChartProps) {
  const data = useMemo(() => {
    if (entries.length < 2) return [];

    // Always show 7 days for proper week comparison
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Get the most recent 14 days for comparison
    const last14Days = entries.slice(-14);
    
    // This week = most recent 7 days
    const thisWeekEntries = last14Days.slice(-7);
    
    // Last week = 7 days before this week
    const lastWeekEntries = last14Days.slice(0, last14Days.length - 7);
    
    // Pad with empty entries if we don't have enough data
    const paddedThisWeek = [...thisWeekEntries];
    while (paddedThisWeek.length < 7) {
      paddedThisWeek.push({} as HealthEntry);
    }
    
    const paddedLastWeek = [...lastWeekEntries];
    while (paddedLastWeek.length < 7) {
      paddedLastWeek.push({} as HealthEntry);
    }

    return days.map((day, index) => {
      const thisWeekEntry = paddedThisWeek[index];
      const lastWeekEntry = paddedLastWeek[index];

      return {
        day,
        thisWeekSleep: thisWeekEntry?.sleepHours || 0,
        lastWeekSleep: lastWeekEntry?.sleepHours || 0,
        thisWeekMood: (thisWeekEntry?.mood || 0) * 2, // Scale mood to hours (0-10)
        lastWeekMood: (lastWeekEntry?.mood || 0) * 2,
        thisWeekExercise: thisWeekEntry?.exerciseMinutes || 0,
        lastWeekExercise: lastWeekEntry?.exerciseMinutes || 0,
      };
    });
  }, [entries]);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (data.length === 0) return null;
    
    const thisWeekAvg = data.reduce((sum, d) => sum + d.thisWeekSleep, 0) / data.filter(d => d.thisWeekSleep > 0).length || 0;
    const lastWeekAvg = data.reduce((sum, d) => sum + d.lastWeekSleep, 0) / data.filter(d => d.lastWeekSleep > 0).length || 0;
    const difference = thisWeekAvg - lastWeekAvg;
    
    return {
      thisWeekAvg: thisWeekAvg.toFixed(1),
      lastWeekAvg: lastWeekAvg.toFixed(1),
      difference: difference.toFixed(1),
      improved: difference > 0,
    };
  }, [data]);

  if (data.length === 0 || entries.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>Log at least 2 days to see week comparison</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Stats */}
      {summary && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-medium">This Week:</span>
              <span className="text-green-800 font-bold text-lg">{summary.thisWeekAvg}h</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Last Week:</span>
              <span className="text-gray-700 font-bold text-lg">{summary.lastWeekAvg}h</span>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
              summary.improved 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {summary.improved ? '↑' : '↓'} {Math.abs(Number(summary.difference))}h
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 11 }}
              label={{ value: 'Sleep (hours)', angle: -90, position: 'insideLeft', fill: '#374151', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '10px'
              }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
              formatter={(value: number, name: string) => {
                if (name.includes('Sleep')) return [`${value}h`, name];
                return [value, name];
              }}
            />
            <Legend 
              formatter={(value: string) => {
                if (value === 'This Week') return '🟢 This Week';
                if (value === 'Last Week') return '⚪ Last Week';
                return value;
              }}
            />
            <Bar 
              dataKey="thisWeekSleep" 
              name="This Week" 
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            />
            <Bar 
              dataKey="lastWeekSleep" 
              name="Last Week" 
              fill="#94a3b8"
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
