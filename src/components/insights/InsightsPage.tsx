import { TrendingUp, AlertTriangle, Info, ArrowRight, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { SymptomFrequencyChart } from './SymptomFrequencyChart'
import { MoodCorrelationChart } from './MoodCorrelationChart'
import { HealthTrendsChart } from './HealthTrendsChart'
import { CorrelationHeatmap } from './CorrelationHeatmap'
import {
  getLast30DaysEntries,
  generateInsights,
  getCorrelations,
  type Insight,
  type Correlation,
} from '@/lib/store'

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const iconMap = {
    positive: TrendingUp,
    warning: AlertTriangle,
    neutral: Info,
  }
  const colorMap = {
    positive: { bg: 'gradient-card-sage', accent: 'bg-sage', text: 'text-sage-dark' },
    warning: { bg: 'gradient-card-amber', accent: 'bg-amber', text: 'text-amber' },
    neutral: { bg: 'bg-muted', accent: 'bg-muted-foreground', text: 'text-muted-foreground' },
  }
  const Icon = iconMap[insight.type]
  const colors = colorMap[insight.type]

  return (
    <Card
      className={cn(
        'shadow-card-interactive overflow-hidden opacity-0 animate-fade-in',
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex">
        <div className={cn('w-1 flex-shrink-0', colors.accent)} />
        <div className="flex-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', colors.bg)}>
                  <Icon className={cn('h-4 w-4', colors.text)} />
                </div>
                <CardTitle className="text-sm font-semibold">{insight.title}</CardTitle>
              </div>
              {insight.metric && (
                <span className={cn('text-xs font-bold px-2 py-1 rounded-md', colors.bg, colors.text)}>
                  {insight.metric}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

function CorrelationCard({ correlation, index }: { correlation: Correlation; index: number }) {
  const strength = correlation.strength
  const strengthLabel = strength > 0.6 ? 'Strong' : strength > 0.4 ? 'Moderate' : 'Weak'
  const strengthColor = strength > 0.6
    ? 'bg-primary text-primary-foreground'
    : strength > 0.4
      ? 'bg-sage-light text-sage-dark'
      : 'bg-muted text-muted-foreground'

  return (
    <Card
      className="shadow-card-interactive opacity-0 animate-fade-in"
      style={{ animationDelay: `${(index + 3) * 60}ms` }}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="px-2 py-1 rounded-md bg-muted text-xs">{correlation.factorA}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="px-2 py-1 rounded-md bg-muted text-xs">{correlation.factorB}</span>
          </div>
          <span className={cn('ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full', strengthColor)}>
            {strengthLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{correlation.description}</p>
        {/* Strength bar */}
        <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700',
              correlation.direction === 'positive' ? 'gradient-primary' : 'bg-amber'
            )}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export function InsightsPage() {
  const entries = getLast30DaysEntries()
  const insights = generateInsights(entries)
  const correlations = getCorrelations(entries)

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-8">
      <header className="opacity-0 animate-fade-in">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Patterns and actionable observations from your last 30 days of data.
        </p>
      </header>

      {entries.length < 3 ? (
        <Card className="shadow-card-interactive">
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Not enough data yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Log at least 3 days of habits to start seeing insights and correlations. The more data you provide, the better the analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Insights section */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Key Observations
            </h2>
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notable patterns detected yet.</p>
            )}
          </section>

          {/* Correlations section with Heatmap */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Correlations
              </h2>
            </div>
            
            {/* Animated Heatmap */}
            {correlations.length > 0 && <CorrelationHeatmap entries={entries} />}
            
            {/* Traditional Correlation Cards */}
            {correlations.length > 0 ? (
              <div className="space-y-3">
                {correlations.map((corr, i) => (
                  <CorrelationCard key={`${corr.factorA}-${corr.factorB}`} correlation={corr} index={i} />
                ))}
              </div>
            ) : (
              <Card className="shadow-card-interactive">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No significant correlations found yet. Keep logging daily to uncover hidden patterns.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Advanced Analytics Section */}
          <section className="space-y-6 mt-8">
            <h2 className="text-lg font-bold text-foreground">Advanced Analytics</h2>
            
            {/* Health Trends */}
            <Card className="shadow-card-interactive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Health Trends & Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HealthTrendsChart entries={entries} />
              </CardContent>
            </Card>

            {/* Mood Correlation */}
            <Card className="shadow-card-interactive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Mood vs Sleep Correlation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodCorrelationChart entries={entries} />
              </CardContent>
            </Card>

            {/* Symptom Frequency */}
            <Card className="shadow-card-interactive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Symptom Frequency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SymptomFrequencyChart entries={entries} />
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
