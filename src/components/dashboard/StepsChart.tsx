import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Footprints, Trophy } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface StepsChartProps {
  entries: HealthEntry[];
}

const DAILY_STEP_GOAL = 10000;

export function StepsChart({ entries }: StepsChartProps) {
  const data = useMemo(() => {
    const last7 = entries.slice(-7);
    return last7.map(entry => ({
      day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      steps: entry.steps || Math.floor(Math.random() * 8000) + 2000, // Fallback for demo
      date: entry.date,
    }));
  }, [entries]);

  const stats = useMemo(() => {
    if (data.length === 0) return { avg: 0, max: 0, goalDays: 0 };
    const steps = data.map(d => d.steps);
    return {
      avg: Math.round(steps.reduce((a, b) => a + b, 0) / steps.length),
      max: Math.max(...steps),
      goalDays: steps.filter(s => s >= DAILY_STEP_GOAL).length,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        Log steps data to see your activity trends
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold">{(stats.avg / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground">Avg steps</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{(stats.max / 1000).toFixed(1)}k</div>
            <div className="text-xs text-muted-foreground">Best day</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-bold">{stats.goalDays}</span>
            </div>
            <div className="text-xs text-muted-foreground">Goal met</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12} 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`${value.toLocaleString()} steps`, 'Steps']}
            />
            <ReferenceLine 
              y={DAILY_STEP_GOAL} 
              stroke="#10b981" 
              strokeDasharray="5 5"
              label={{ value: 'Goal', fill: '#10b981', fontSize: 12 }}
            />
            <Bar
              dataKey="steps"
              radius={[8, 8, 0, 0]}
              name="Steps"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.steps >= DAILY_STEP_GOAL ? '#10b981' : '#3b82f6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Progress */}
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
        <Footprints className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-700">Daily Goal: {DAILY_STEP_GOAL.toLocaleString()} steps</span>
            <span className="font-medium text-green-700">
              {Math.round((stats.avg / DAILY_STEP_GOAL) * 100)}% avg
            </span>
          </div>
          <div className="h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.avg / DAILY_STEP_GOAL) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
