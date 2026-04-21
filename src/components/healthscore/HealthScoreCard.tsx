import { useState, useEffect } from 'react';
import { Trophy, Flame, Target, Star, Zap, Award, TrendingUp, UtensilsCrossed } from 'lucide-react';

interface HealthScoreData {
  overall: number;
  sleep: number;
  water: number;
  mood: number;
  exercise?: number;
  diet?: number;
  consistency: number;
  streak: number;
  level: 'Rookie' | 'Warrior' | 'Legend' | 'Master';
  xp: number;
  xpToNext: number;
  badges: string[];
}

interface HealthScoreCardProps {
  data?: HealthScoreData;
}

const defaultData: HealthScoreData = {
  overall: 78,
  sleep: 82,
  water: 75,
  mood: 88,
  consistency: 70,
  streak: 12,
  level: 'Warrior',
  xp: 2450,
  xpToNext: 3000,
  badges: ['Early Bird', 'Hydration Hero', 'Mood Master'],
};

const levelConfig = {
  Rookie: { color: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
  Warrior: { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  Legend: { color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  Master: { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
};

const scoreColors = {
  excellent: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
  good: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  average: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' },
  poor: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' },
};

function getScoreCategory(score: number) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

export function HealthScoreCard({ data = defaultData }: HealthScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const levelStyle = levelConfig[data.level];
  const overallCategory = getScoreCategory(data.overall);
  const overallColors = scoreColors[overallCategory];

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = data.overall / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= data.overall) {
        setAnimatedScore(data.overall);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [data.overall]);

  const metrics = [
    { name: 'Sleep', score: data.sleep, weight: 20, icon: Target },
    { name: 'Diet', score: data.diet || 0, weight: 20, icon: UtensilsCrossed },
    { name: 'Water', score: data.water, weight: 15, icon: Zap },
    { name: 'Mood', score: data.mood, weight: 15, icon: Star },
    { name: 'Exercise', score: data.exercise || 0, weight: 15, icon: Flame },
    { name: 'Consistency', score: data.consistency, weight: 15, icon: TrendingUp },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
      {/* Header */}
      <div className={`p-5 ${levelStyle.bg} border-b ${levelStyle.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${levelStyle.color} flex items-center justify-center text-white`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Health Score</h3>
              <span className={`text-sm font-medium ${levelStyle.text}`}>{data.level}</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${overallColors.text}`}>{animatedScore}</div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Main Score Circle */}
        <div className="flex justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(animatedScore / 100) * 283} 283`}
                className={`${overallColors.text} transition-all duration-1000`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${overallColors.text}`}>{animatedScore}</span>
              <span className="text-xs text-muted-foreground capitalize">{overallCategory}</span>
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-center gap-2 py-3 bg-orange-50 rounded-xl border border-orange-100">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-orange-700">{data.streak} Day Streak!</span>
          <span className="text-sm text-orange-600">Keep it up!</span>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Score Breakdown</h4>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const category = getScoreCategory(metric.score);
            const colors = scoreColors[category];
            
            return (
              <div key={metric.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${colors.light} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-muted-foreground">{metric.weight}% weight</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
                <span className="font-semibold w-8 text-right">{metric.score}</span>
              </div>
            );
          })}
        </div>

        {/* XP Progress */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium flex items-center gap-1">
              <Award className="w-4 h-4 text-primary" />
              XP Progress
            </span>
            <span className="text-muted-foreground">{data.xp} / {data.xpToNext}</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              style={{ width: `${(data.xp / data.xpToNext) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.xpToNext - data.xp} XP to reach {data.level === 'Rookie' ? 'Warrior' : data.level === 'Warrior' ? 'Legend' : 'Master'}
          </p>
        </div>

        {/* Badges */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-semibold text-sm mb-3">Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {data.badges.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                {badge}
              </span>
            ))}
            <span className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm">
              +5 more
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HealthScoreMini({ score = 78, streak = 12 }: { score?: number; streak?: number }) {
  const category = getScoreCategory(score);
  const colors = scoreColors[category];

  return (
    <div className="bg-white rounded-xl shadow-card border border-border p-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
              className={colors.text}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">Health Score</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{streak} day streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
