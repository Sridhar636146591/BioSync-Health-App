import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Droplets, Target, CheckCircle2, XCircle } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface WaterTargetChartProps {
  entries: HealthEntry[];
}

const DAILY_WATER_GOAL = 8; // glasses

export function WaterTargetChart({ entries }: WaterTargetChartProps) {
  const data = useMemo(() => {
    const last7 = entries.slice(-7);
    return last7.map(entry => ({
      day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      glasses: entry.waterGlasses,
      target: DAILY_WATER_GOAL,
      percentage: Math.min(100, Math.round((entry.waterGlasses / DAILY_WATER_GOAL) * 100)),
      met: entry.waterGlasses >= DAILY_WATER_GOAL,
    }));
  }, [entries]);

  const stats = useMemo(() => {
    if (data.length === 0) return { met: 0, missed: 0, avg: 0, streak: 0 };
    
    const met = data.filter(d => d.met).length;
    const missed = data.length - met;
    const avg = Math.round(data.reduce((a, b) => a + b.glasses, 0) / data.length);
    
    // Calculate current streak
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].met) streak++;
      else break;
    }
    
    return { met, missed, avg, streak };
  }, [data]);

  const pieData = [
    { name: 'Goal Met', value: stats.met, color: '#10b981' },
    { name: 'Goal Missed', value: stats.missed, color: '#ef4444' },
  ];

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        Log water intake to see your hydration progress
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{stats.avg}</div>
          <div className="text-[10px] text-blue-600">Avg/day</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">{stats.met}</div>
          <div className="text-[10px] text-green-600">Met</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-600">{stats.missed}</div>
          <div className="text-[10px] text-red-600">Missed</div>
        </div>
        <div className="text-center p-2 bg-amber-50 rounded-lg">
          <div className="text-lg font-bold text-amber-600">{stats.streak}</div>
          <div className="text-[10px] text-amber-600">Streak</div>
        </div>
      </div>

      {/* Chart & Daily Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Met</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Missed</span>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-1">
          {data.map((day) => (
            <div key={day.day} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-xs text-muted-foreground">{day.day}</span>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    day.met ? 'bg-green-500' : 'bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(100, day.percentage)}%` }}
                />
              </div>
              <span className="text-xs w-8 text-right">{day.glasses}</span>
              {day.met ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Target Info */}
      <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
        <Target className="w-5 h-5 text-cyan-600" />
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-cyan-700">Daily Target: {DAILY_WATER_GOAL} glasses</span>
            <span className="font-medium text-cyan-700">
              {Math.round((stats.avg / DAILY_WATER_GOAL) * 100)}% avg
            </span>
          </div>
          <div className="h-2 bg-cyan-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.avg / DAILY_WATER_GOAL) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips */}
      {stats.streak >= 3 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm">
          <Droplets className="w-4 h-4 text-green-600" />
          <span className="text-green-700">
            Amazing! You've met your goal for {stats.streak} days in a row! 🎉
          </span>
        </div>
      )}
    </div>
  );
}
