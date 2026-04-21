import type { HealthEntry } from '@/lib/store'
import { MOOD_LABELS } from '@/lib/store'
import { cn } from '@/lib/utils'

interface MoodTimelineProps {
  entries: HealthEntry[]
}

const moodEmojis: Record<number, string> = {
  1: '😞',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '😄',
}

const moodColors: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
  5: 'bg-emerald-500',
}

const moodGradients: Record<number, string> = {
  1: 'gradient-card-rose',
  2: 'gradient-card-amber',
  3: 'bg-muted',
  4: 'gradient-card-sage',
  5: 'gradient-card-teal',
}

const moodBgColors: Record<number, string> = {
  1: 'bg-red-50',
  2: 'bg-orange-50',
  3: 'bg-yellow-50',
  4: 'bg-green-50',
  5: 'bg-emerald-50',
}

export function MoodTimeline({ entries }: MoodTimelineProps) {
  const last7 = entries.slice(-7)

  return (
    <div className="space-y-4">
      {/* Emoji Mood Display */}
      <div className="flex items-center justify-between">
        {last7.map(entry => (
          <div
            key={entry.date}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
              moodBgColors[entry.mood]
            )}
          >
            <span className="text-2xl">{moodEmojis[entry.mood]}</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        ))}
        {last7.length === 0 && (
          <div className="flex-1 text-center text-sm text-muted-foreground py-4">
            No mood data yet
          </div>
        )}
      </div>

      {/* Mood Bar Chart */}
      <div className="flex items-end gap-2 h-32">
        {last7.map(entry => {
          const height = (entry.mood / 5) * 100
          return (
            <div
              key={`bar-${entry.date}`}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <span className="text-lg">{moodEmojis[entry.mood]}</span>
              <div
                className={cn(
                  'w-full rounded-t-lg transition-all duration-500 relative group',
                  moodGradients[entry.mood]
                )}
                style={{ height: `${height}%`, minHeight: '20%' }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {MOOD_LABELS[entry.mood]}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          )
        })}
        {last7.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Log entries to see your mood timeline
          </div>
        )}
      </div>

      {/* Mood Summary */}
      {last7.length > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-sm">
            <span className="text-muted-foreground">Average Mood: </span>
            <span className="font-semibold">
              {moodEmojis[Math.round(last7.reduce((acc, e) => acc + e.mood, 0) / last7.length)]}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(mood => {
              const count = last7.filter(e => e.mood === mood).length
              if (count === 0) return null
              return (
                <div
                  key={mood}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs text-white',
                    moodColors[mood]
                  )}
                  title={`${count} days`}
                >
                  {count}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
