import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Dumbbell, Clock, Flame, TrendingUp } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface ExerciseChartsProps {
  entries: HealthEntry[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ExerciseCharts({ entries }: ExerciseChartsProps) {
  const stats = useMemo(() => {
    const last7Days = entries.slice(-7);
    const last30Days = entries.slice(-30);
    
    // Weekly data
    const weeklyData = last7Days.map(entry => ({
      day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: entry.exerciseMinutes,
      date: entry.date,
    }));

    // Exercise distribution by intensity
    const intensityRanges = [
      { name: 'Light (0-15min)', range: [0, 15], count: 0, color: '#10b981' },
      { name: 'Moderate (16-30min)', range: [16, 30], count: 0, color: '#3b82f6' },
      { name: 'Active (31-60min)', range: [31, 60], count: 0, color: '#f59e0b' },
      { name: 'Intense (60+ min)', range: [61, 300], count: 0, color: '#ef4444' },
    ];

    entries.forEach(entry => {
      const range = intensityRanges.find(
        r => entry.exerciseMinutes >= r.range[0] && entry.exerciseMinutes <= r.range[1]
      );
      if (range) range.count++;
    });

    // Monthly trend
    const monthlyTrend = last30Days.reduce((acc, entry) => {
      const week = Math.floor((30 - last30Days.indexOf(entry) - 1) / 7);
      const weekLabel = `Week ${4 - week}`;
      const existing = acc.find(a => a.week === weekLabel);
      if (existing) {
        existing.minutes += entry.exerciseMinutes;
        existing.days += 1;
      } else {
        acc.push({ week: weekLabel, minutes: entry.exerciseMinutes, days: 1 });
      }
      return acc;
    }, [] as { week: string; minutes: number; days: number }[]);

    // Stats
    const totalMinutes = entries.reduce((sum, e) => sum + e.exerciseMinutes, 0);
    const avgMinutes = entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0;
    const activeDays = entries.filter(e => e.exerciseMinutes > 0).length;
    const streak = calculateStreak(entries);

    return {
      weeklyData,
      intensityDistribution: intensityRanges.filter(r => r.count > 0),
      monthlyTrend,
      totalMinutes,
      avgMinutes,
      activeDays,
      streak,
    };
  }, [entries]);

  function calculateStreak(entries: HealthEntry[]) {
    let streak = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].exerciseMinutes > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Avg/Day</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{stats.avgMinutes}m</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Active Days</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{stats.activeDays}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">{stats.streak} days</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Total</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">{stats.totalMinutes}m</p>
        </div>
      </div>

      {/* Weekly Exercise Chart */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-primary" />
          Last 7 Days Exercise
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${value} minutes`, 'Exercise']}
              />
              <Bar
                dataKey="minutes"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Minutes"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Intensity Distribution */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h4 className="font-semibold mb-4">Exercise Intensity</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.intensityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {stats.intensityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {stats.intensityDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h4 className="font-semibold mb-4">Monthly Trend</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value} min`, 'Total Exercise']}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Weekly Goal Progress
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">150 min/week goal</span>
              <span className="font-medium">{Math.min(100, Math.round((stats.weeklyData.reduce((a, b) => a + b.minutes, 0) / 150) * 100))}%</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                style={{ width: `${Math.min(100, (stats.weeklyData.reduce((a, b) => a + b.minutes, 0) / 150) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            You've completed {stats.weeklyData.reduce((a, b) => a + b.minutes, 0)} minutes this week. 
            {150 - stats.weeklyData.reduce((a, b) => a + b.minutes, 0) > 0 
              ? ` ${150 - stats.weeklyData.reduce((a, b) => a + b.minutes, 0)} more to reach your goal!` 
              : ' Goal achieved! 🎉'}
          </p>
        </div>
      </div>
    </div>
  );
}
