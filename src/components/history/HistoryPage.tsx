import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Smile, Droplets, Dumbbell, Trash2, PenSquare, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAllEntries, deleteEntry, MOOD_LABELS, type HealthEntry } from '@/lib/store'

function EntryRow({ entry, onDelete, onEdit }: { entry: HealthEntry; onDelete: () => void; onEdit: () => void }) {
  const dateObj = new Date(entry.date)
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })

  return (
    <Card className="shadow-card-interactive overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Date column */}
          <div className="text-center min-w-[48px]">
            <div className="text-xs font-medium text-muted-foreground uppercase">{dayName}</div>
            <div className="text-lg font-bold text-foreground">{dateObj.getDate()}</div>
            <div className="text-[10px] text-muted-foreground">
              {dateObj.toLocaleDateString('en-US', { month: 'short' })}
            </div>
          </div>

          {/* Metrics */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">{entry.sleepHours}h</div>
                <div className="text-[10px] text-muted-foreground">sleep</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Smile className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">{entry.mood}/5</div>
                <div className="text-[10px] text-muted-foreground">{MOOD_LABELS[entry.mood]}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">{entry.waterGlasses}</div>
                <div className="text-[10px] text-muted-foreground">glasses</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">{entry.exerciseMinutes}m</div>
                <div className="text-[10px] text-muted-foreground">exercise</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <PenSquare className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Symptoms & notes */}
        {(entry.symptoms.length > 0 || entry.notes) && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            {entry.symptoms.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-light text-rose text-[10px] font-medium"
              >
                <AlertCircle className="h-2.5 w-2.5" />
                {s}
              </span>
            ))}
            {entry.notes && (
              <span className="text-xs text-muted-foreground italic">{entry.notes}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function HistoryPage() {
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)
  const entries = getAllEntries()

  // Ignore refreshKey lint warning - it's used to trigger re-renders
  void refreshKey

  function handleDelete(date: string) {
    deleteEntry(date)
    setRefreshKey(k => k + 1)
  }

  function handleEdit(date: string) {
    navigate(`/log?date=${date}`)
  }

  // Group entries by month
  const grouped: Record<string, HealthEntry[]> = {}
  entries.forEach(entry => {
    const monthKey = new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!grouped[monthKey]) grouped[monthKey] = []
    grouped[monthKey].push(entry)
  })

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} logged
          </p>
        </div>
        <Button variant="glow" onClick={() => navigate('/log')}>
          Log today
        </Button>
      </header>

      {entries.length === 0 ? (
        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-1">
          <CardContent className="p-8 text-center">
            <div className={cn('h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4')}>
              <Moon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No entries yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Start logging your daily habits to see your history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, monthEntries]) => (
          <section key={month} className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-background py-2 z-10">
              {month}
            </h2>
            <div className="space-y-2">
              {monthEntries.map(entry => (
                <EntryRow
                  key={entry.date}
                  entry={entry}
                  onDelete={() => handleDelete(entry.date)}
                  onEdit={() => handleEdit(entry.date)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
