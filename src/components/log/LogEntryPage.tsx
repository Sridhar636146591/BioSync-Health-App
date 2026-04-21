import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Smile, Droplets, Dumbbell, Plus, Check, ChevronLeft, ChevronRight, X, Footprints, BarChart3, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExerciseCharts } from './ExerciseCharts'
import {
  type HealthEntry,
  getEntryByDate,
  saveEntry,
  getToday,
  formatDate,
  MOOD_LABELS,
  COMMON_SYMPTOMS,
  getLast30DaysEntries,
} from '@/lib/store'

export function LogEntryPage() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [sleepHours, setSleepHours] = useState(7)
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [waterGlasses, setWaterGlasses] = useState(6)
  const [exerciseMinutes, setExerciseMinutes] = useState(20)
  const [steps, setSteps] = useState(5000)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  // Diet state
  const [calories, setCalories] = useState(2000)
  const [protein, setProtein] = useState(100)
  const [carbs, setCarbs] = useState(250)
  const [fat, setFat] = useState(65)
  const [fiber, setFiber] = useState(30)

  useEffect(() => {
    const existing = getEntryByDate(selectedDate)
    if (existing) {
      setSleepHours(existing.sleepHours)
      setMood(existing.mood)
      setWaterGlasses(existing.waterGlasses)
      setExerciseMinutes(existing.exerciseMinutes)
      setSteps(existing.steps || 5000)
      setSymptoms(existing.symptoms)
      setNotes(existing.notes)
      setCalories(existing.calories || 2000)
      setProtein(existing.protein || 100)
      setCarbs(existing.carbs || 250)
      setFat(existing.fat || 65)
      setFiber(existing.fiber || 30)
    } else {
      setSleepHours(7)
      setMood(3)
      setWaterGlasses(6)
      setExerciseMinutes(20)
      setSteps(5000)
      setSymptoms([])
      setNotes('')
      setCalories(2000)
      setProtein(100)
      setCarbs(250)
      setFat(65)
      setFiber(30)
    }
    setSaved(false)
  }, [selectedDate])

  function handleSave() {
    const entry: HealthEntry = {
      id: `entry-${selectedDate}`,
      date: selectedDate,
      sleepHours,
      mood,
      waterGlasses,
      exerciseMinutes,
      steps,
      symptoms,
      notes,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    }
    saveEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const recentEntries = getLast30DaysEntries()

  function toggleSymptom(symptom: string) {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    if (d <= new Date()) {
      setSelectedDate(formatDate(d))
    }
  }

  const isToday = selectedDate === getToday()
  const dateDisplay = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      {/* Date selector */}
      <div className="flex items-center justify-between opacity-0 animate-fade-in">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Daily Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isToday ? 'Today' : dateDisplay}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[80px] text-center">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shiftDate(1)}
            disabled={isToday}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sleep */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Moon className="h-4 w-4 text-primary" />
            Sleep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="flex-1 accent-[hsl(var(--teal))]"
            />
            <span className="text-lg font-bold text-foreground min-w-[60px] text-right">{sleepHours}h</span>
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
          </div>
        </CardContent>
      </Card>

      {/* Mood */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Smile className="h-4 w-4 text-primary" />
            Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map(level => (
              <button
                key={level}
                onClick={() => setMood(level)}
                className={cn(
                  'flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 border',
                  mood === level
                    ? 'bg-primary text-primary-foreground border-primary shadow-elegant'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                )}
              >
                <div className="text-lg mb-0.5">
                  {level === 1 ? '😞' : level === 2 ? '😐' : level === 3 ? '🙂' : level === 4 ? '😊' : '😄'}
                </div>
                <div className="text-[10px]">{MOOD_LABELS[level]}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Water, Steps & Exercise */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                -
              </button>
              <span className="text-xl font-bold text-foreground min-w-[32px] text-center">
                {waterGlasses}
              </span>
              <button
                onClick={() => setWaterGlasses(Math.min(20, waterGlasses + 1))}
                className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-1">glasses</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Footprints className="h-4 w-4 text-primary" />
              Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setSteps(Math.max(0, steps - 500))}
                className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                -
              </button>
              <span className="text-lg font-bold text-foreground min-w-[50px] text-center">
                {(steps / 1000).toFixed(1)}k
              </span>
              <button
                onClick={() => setSteps(Math.min(50000, steps + 500))}
                className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-1">steps</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              Exercise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setExerciseMinutes(Math.max(0, exerciseMinutes - 5))}
                className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                -
              </button>
              <span className="text-xl font-bold text-foreground min-w-[40px] text-center">
                {exerciseMinutes}
              </span>
              <button
                onClick={() => setExerciseMinutes(Math.min(300, exerciseMinutes + 5))}
                className="h-7 w-7 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-1">minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Analytics Toggle */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Exercise Analytics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCharts(!showCharts)}
            >
              {showCharts ? 'Hide' : 'Show'} Charts
            </Button>
          </div>
        </CardHeader>
        {showCharts && (
          <CardContent>
            <ExerciseCharts entries={recentEntries} />
          </CardContent>
        )}
      </Card>

      {/* Diet Tracking */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            Daily Nutrition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-foreground">Calories</span>
              <span className="text-muted-foreground">{calories} / 2000 kcal</span>
            </div>
            <input
              type="range"
              min={500}
              max={4000}
              step={50}
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full accent-[hsl(var(--teal))]"
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Protein */}
            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">P</div>
                <span className="text-sm font-medium text-red-800">Protein</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setProtein(Math.max(0, protein - 5))} className="w-6 h-6 rounded bg-red-200 hover:bg-red-300 flex items-center justify-center text-red-700">-</button>
                <span className="flex-1 text-center font-bold text-red-900">{protein}g</span>
                <button onClick={() => setProtein(protein + 5)} className="w-6 h-6 rounded bg-red-200 hover:bg-red-300 flex items-center justify-center text-red-700">+</button>
              </div>
              <p className="text-xs text-red-600 mt-1">Target: 100-150g</p>
            </div>

            {/* Carbs */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">C</div>
                <span className="text-sm font-medium text-amber-800">Carbs</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCarbs(Math.max(0, carbs - 5))} className="w-6 h-6 rounded bg-amber-200 hover:bg-amber-300 flex items-center justify-center text-amber-700">-</button>
                <span className="flex-1 text-center font-bold text-amber-900">{carbs}g</span>
                <button onClick={() => setCarbs(carbs + 5)} className="w-6 h-6 rounded bg-amber-200 hover:bg-amber-300 flex items-center justify-center text-amber-700">+</button>
              </div>
              <p className="text-xs text-amber-600 mt-1">Target: 200-300g</p>
            </div>

            {/* Fat */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">F</div>
                <span className="text-sm font-medium text-blue-800">Fat</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFat(Math.max(0, fat - 5))} className="w-6 h-6 rounded bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-700">-</button>
                <span className="flex-1 text-center font-bold text-blue-900">{fat}g</span>
                <button onClick={() => setFat(fat + 5)} className="w-6 h-6 rounded bg-blue-200 hover:bg-blue-300 flex items-center justify-center text-blue-700">+</button>
              </div>
              <p className="text-xs text-blue-600 mt-1">Target: 50-80g</p>
            </div>

            {/* Fiber */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">Fi</div>
                <span className="text-sm font-medium text-green-800">Fiber</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFiber(Math.max(0, fiber - 5))} className="w-6 h-6 rounded bg-green-200 hover:bg-green-300 flex items-center justify-center text-green-700">-</button>
                <span className="flex-1 text-center font-bold text-green-900">{fiber}g</span>
                <button onClick={() => setFiber(fiber + 5)} className="w-6 h-6 rounded bg-green-200 hover:bg-green-300 flex items-center justify-center text-green-700">+</button>
              </div>
              <p className="text-xs text-green-600 mt-1">Target: 25-35g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(symptom => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
                  symptoms.includes(symptom)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/40'
                )}
              >
                {symptoms.includes(symptom) && <X className="h-3 w-3 inline mr-1" />}
                {symptom}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-card-interactive opacity-0 animate-fade-in stagger-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? Any observations..."
            className="w-full h-24 px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        variant="glow"
        className="w-full h-12 text-base font-semibold"
        onClick={handleSave}
      >
        {saved ? (
          <>
            <Check className="h-5 w-5 mr-2" />
            Saved
          </>
        ) : (
          'Save Entry'
        )}
      </Button>

      {/* Quick nav hint */}
      {saved && (
        <div className="text-center opacity-0 animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-primary hover:underline"
          >
            View your dashboard
          </button>
        </div>
      )}
    </div>
  )
}
