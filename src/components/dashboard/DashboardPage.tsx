import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Smile, Droplets, Dumbbell, TrendingUp, Plus, Brain, Users, Box, Zap, Footprints, Target, Activity, Calendar, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from './StatCard'
import { WeeklyChart } from './WeeklyChart'
import { MoodTimeline } from './MoodTimeline'
import { HealthScoreMini, HealthScoreCard } from '@/components/healthscore/HealthScoreCard'
import { StepsChart } from './StepsChart'
import { WaterTargetChart } from './WaterTargetChart'
import { HealthRadarChart } from './HealthRadarChart'
import { WeeklyComparisonChart } from './WeeklyComparisonChart'
import { HydrationTimeline } from './HydrationTimeline'
import { getLast7DaysEntries, getLast30DaysEntries, getWeekSummary, getEntryByDate, getToday, generateInsights, calculateHealthScore, calculateStreak, calculateDetailedHealthScore, ensureDemoDataForCurrentUser } from '@/lib/store'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const [range, setRange] = useState<'today' | '7d' | '30d'>('7d')
  const navigate = useNavigate()
  
  // Ensure demo data exists when dashboard loads
  useEffect(() => {
    console.log('Dashboard - Checking for demo data...')
    const seeded = ensureDemoDataForCurrentUser()
    if (seeded) {
      console.log('Dashboard - Demo data was seeded, reloading...')
      // Force re-render by changing range briefly
      setRange('30d')
    }
  }, [])
  
  const entries = range === 'today' 
    ? (getEntryByDate(getToday()) ? [getEntryByDate(getToday())!] : []) 
    : range === '7d' 
      ? getLast7DaysEntries() 
      : getLast30DaysEntries()
  const allEntries = getLast30DaysEntries() // Always use 30 days for health score
  const summary = getWeekSummary(entries)
  const todayEntry = getEntryByDate(getToday())
  const insights = generateInsights(entries)
  const topInsight = insights[0]
  const detailedScore = calculateDetailedHealthScore(allEntries)

  // Debug logging
  console.log('Dashboard loaded, entries count:', entries.length)
  console.log('All entries (30d):', allEntries.length)
  console.log('Summary:', summary)
  console.log('Today entry:', todayEntry)

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header className="relative rounded-2xl overflow-hidden opacity-0 animate-fade-in">
        <div className="relative gradient-hero p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-lg">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                {todayEntry ? 'Welcome back to BioSync' : 'Start your health journey'}
              </h1>
              <p className="mt-2 text-sm lg:text-base text-muted-foreground">
                {todayEntry
                  ? `Your AI health assistant has ${3} new insights for you. Your squad is waiting!`
                  : 'Track your habits, get AI predictions, and compete with your squad.'
                }
              </p>
              <div className="flex gap-2 mt-4">
                {!todayEntry && (
                  <Button
                    variant="glow"
                    onClick={() => navigate('/log')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Today
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/predictions')}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  View AI Insights
                </Button>
              </div>
            </div>
            <div className="lg:w-72">
              <HealthScoreMini score={detailedScore.overall} streak={detailedScore.streak} />
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/predictions')}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 text-left hover:shadow-md transition-all group"
        >
          <Brain className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-semibold text-purple-800">AI Predictions</div>
          <div className="text-xs text-purple-600">5 new insights</div>
        </button>
        <button
          onClick={() => navigate('/body')}
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 text-left hover:shadow-md transition-all group"
        >
          <Box className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-semibold text-blue-800">3D Body</div>
          <div className="text-xs text-blue-600">Visualize health</div>
        </button>
        <button
          onClick={() => navigate('/squad')}
          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 text-left hover:shadow-md transition-all group"
        >
          <Users className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-semibold text-orange-800">Squad</div>
          <div className="text-xs text-orange-600">#42 rank</div>
        </button>
        <button
          onClick={() => navigate('/log')}
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 text-left hover:shadow-md transition-all group"
        >
          <Zap className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-semibold text-green-800">Quick Log</div>
          <div className="text-xs text-green-600">2 min entry</div>
        </button>
      </div>

      {/* Time range toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRange('today')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            range === 'today' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Today
        </button>
        <button
          onClick={() => setRange('7d')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            range === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Last 7 days
        </button>
        <button
          onClick={() => setRange('30d')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            range === '30d' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          Last 30 days
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <StatCard
          title="Sleep"
          value={summary.entries > 0 ? `${summary.avgSleep.toFixed(1)}h` : '--'}
          subtitle="daily average"
          icon={Moon}
          gradient="gradient-card-teal"
          delay={50}
        />
        <StatCard
          title="Calories"
          value={summary.avgCalories ? `${Math.round(summary.avgCalories)}` : '--'}
          subtitle="kcal/day"
          icon={UtensilsCrossed}
          gradient="gradient-card-amber"
          delay={100}
        />
        <StatCard
          title="Mood"
          value={summary.entries > 0 ? `${summary.avgMood.toFixed(1)}` : '--'}
          subtitle="out of 5"
          icon={Smile}
          gradient="gradient-card-sage"
          delay={150}
        />
        <StatCard
          title="Water"
          value={summary.entries > 0 ? `${summary.avgWater.toFixed(0)}` : '--'}
          subtitle="glasses/day"
          icon={Droplets}
          gradient="gradient-card-lavender"
          delay={200}
        />
        <StatCard
          title="Exercise"
          value={summary.entries > 0 ? `${Math.round(summary.totalExercise / Math.max(summary.entries, 1))}` : '--'}
          subtitle="min/day"
          icon={Dumbbell}
          gradient="gradient-card-teal"
          delay={250}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              Sleep Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length > 0 ? (
              <WeeklyChart
                entries={entries}
                dataKey="sleepHours"
                color="hsl(168, 50%, 38%)"
                label="Sleep"
                unit="h"
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Log at least 2 days to see trends
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Smile className="w-4 h-4 text-primary" />
              Mood This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodTimeline entries={entries} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 - Steps & Water */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Footprints className="w-4 h-4 text-primary" />
              Daily Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StepsChart entries={entries} />
          </CardContent>
        </Card>

        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Water Target Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WaterTargetChart entries={entries} />
          </CardContent>
        </Card>
      </div>

      {/* Health Score Full Card */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-2">
        <CardContent className="p-0">
          <HealthScoreCard data={detailedScore} />
        </CardContent>
      </Card>

      {/* Health Radar Chart */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-7">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Health Metrics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HealthRadarChart entries={entries} />
        </CardContent>
      </Card>

      {/* Weekly Comparison & Hydration Timeline */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-card-interactive opacity-0 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Week over Week Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyComparisonChart entries={entries} />
          </CardContent>
        </Card>

        <Card className="shadow-card-interactive opacity-0 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Droplets className="w-4 h-4 text-primary" />
              Hydration Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HydrationTimeline entries={entries} />
          </CardContent>
        </Card>
      </div>

      {/* Insight highlight */}
      {topInsight && (
        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-7 overflow-hidden">
          <div className="flex items-stretch">
            <div className={cn(
              'w-1.5 flex-shrink-0',
              topInsight.type === 'positive' ? 'bg-sage' : topInsight.type === 'warning' ? 'bg-amber' : 'bg-muted-foreground'
            )} />
            <div className="p-5 flex items-center gap-4">
              <div className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
                topInsight.type === 'positive' ? 'gradient-card-sage' : topInsight.type === 'warning' ? 'gradient-card-amber' : 'bg-muted'
              )}>
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{topInsight.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{topInsight.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto flex-shrink-0"
                onClick={() => navigate('/insights')}
              >
                View all
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
