import { useState } from 'react';
import { Brain, AlertTriangle, Lightbulb, TrendingUp, Clock, Moon, Droplets, Activity, ChevronRight, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, Cell } from 'recharts';

interface Prediction {
  id: string;
  type: 'warning' | 'suggestion' | 'insight';
  title: string;
  description: string;
  confidence: number;
  timeFrame: string;
  action: string;
  icon: typeof Moon;
}

const mockPredictions: Prediction[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Poor Sleep Risk',
    description: '78% chance of poor sleep tonight based on your late caffeine intake and screen time.',
    confidence: 78,
    timeFrame: 'Tonight',
    action: 'Try chamomile tea and avoid screens 1 hour before bed',
    icon: Moon,
  },
  {
    id: '2',
    type: 'suggestion',
    title: 'Energy Crash Expected',
    description: 'Your pattern shows energy crashes around 3 PM on days with low water intake.',
    confidence: 85,
    timeFrame: 'Today at 3 PM',
    action: 'Plan a 10-minute walk at 2:45 PM and drink 500ml water',
    icon: Activity,
  },
  {
    id: '3',
    type: 'insight',
    title: 'Hydration Goal',
    description: "You'll need 3.2L water today based on your workout schedule and weather.",
    confidence: 92,
    timeFrame: 'Today',
    action: 'Set reminders every 2 hours to stay on track',
    icon: Droplets,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Weekend Water Drop',
    description: 'Your water intake drops 40% on weekends compared to weekdays.',
    confidence: 88,
    timeFrame: 'This Weekend',
    action: 'Set a weekend reminder? Click to enable',
    icon: Droplets,
  },
  {
    id: '5',
    type: 'suggestion',
    title: 'Sleep Improvement',
    description: '4-7-8 breathing technique could improve your sleep quality by 23%.',
    confidence: 76,
    timeFrame: 'Tonight',
    action: 'Try 4-7-8 breathing: Inhale 4s, hold 7s, exhale 8s',
    icon: Moon,
  },
];

const typeConfig = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Warning',
  },
  suggestion: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Suggestion',
  },
  insight: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
    label: 'Insight',
  },
};

// Mock data for visualizations
const consistencyData = [
  { day: 'Mon', score: 75, sleep: 7, water: 6, mood: 4 },
  { day: 'Tue', score: 82, sleep: 8, water: 7, mood: 4 },
  { day: 'Wed', score: 78, sleep: 7.5, water: 5, mood: 3 },
  { day: 'Thu', score: 85, sleep: 8, water: 8, mood: 5 },
  { day: 'Fri', score: 80, sleep: 7, water: 7, mood: 4 },
  { day: 'Sat', score: 72, sleep: 6.5, water: 4, mood: 3 },
  { day: 'Sun', score: 88, sleep: 9, water: 8, mood: 5 },
];

const healthDistribution = [
  { range: 'Poor', count: 2, color: '#ef4444' },
  { range: 'Fair', count: 5, color: '#f59e0b' },
  { range: 'Good', count: 12, color: '#3b82f6' },
  { range: 'Great', count: 8, color: '#10b981' },
  { range: 'Excellent', count: 3, color: '#8b5cf6' },
];

const predictionAccuracy = [
  { month: 'Jan', predicted: 82, actual: 85 },
  { month: 'Feb', predicted: 78, actual: 80 },
  { month: 'Mar', predicted: 85, actual: 83 },
  { month: 'Apr', predicted: 88, actual: 88 },
];

export function PredictionsPage() {
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [enabledReminders, setEnabledReminders] = useState<string[]>([]);
  const [activeChart, setActiveChart] = useState<'consistency' | 'distribution' | 'accuracy'>('consistency');

  const toggleReminder = (id: string) => {
    setEnabledReminders(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">Predictive AI Insights</h1>
        <p className="text-muted-foreground">AI-powered predictions to help you stay ahead of health issues</p>
      </div>

      {/* AI Status Card */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI Health Assistant</h3>
            <p className="text-sm text-muted-foreground">Analyzing your patterns to predict and prevent health issues</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{mockPredictions.length}</div>
            <div className="text-xs text-muted-foreground">Active insights</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-card border border-border text-center">
          <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{mockPredictions.filter(p => p.type === 'warning').length}</div>
          <div className="text-xs text-muted-foreground">Warnings</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-card border border-border text-center">
          <Lightbulb className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{mockPredictions.filter(p => p.type === 'suggestion').length}</div>
          <div className="text-xs text-muted-foreground">Suggestions</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-card border border-border text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{mockPredictions.filter(p => p.type === 'insight').length}</div>
          <div className="text-xs text-muted-foreground">Insights</div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Today's Predictions</h3>
        
        {mockPredictions.map((prediction) => {
          const config = typeConfig[prediction.type];
          const Icon = prediction.icon;
          const isExpanded = selectedPrediction === prediction.id;
          const isReminderEnabled = enabledReminders.includes(prediction.id);

          return (
            <div
              key={prediction.id}
              className={`rounded-xl border transition-all duration-300 ${config.bg} ${config.border} ${
                isExpanded ? 'shadow-lg' : 'shadow-card'
              }`}
            >
              <button
                onClick={() => setSelectedPrediction(isExpanded ? null : prediction.id)}
                className="w-full p-5 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center ${config.icon}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {prediction.timeFrame}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg">{prediction.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{prediction.description}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">AI Confidence:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-white/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${prediction.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{prediction.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2">
                  <div className="pt-4 border-t border-border/50">
                    <div className="bg-white/80 rounded-lg p-4">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        Recommended Action
                      </h5>
                      <p className="text-sm text-muted-foreground mb-4">{prediction.action}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReminder(prediction.id);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isReminderEnabled
                              ? 'bg-primary text-white'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {isReminderEnabled ? 'Reminder Set ✓' : 'Set Reminder'}
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-white/50 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Data Visualization Section */}
      <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Health Data Analysis
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Visual insights from your health patterns</p>
        </div>

        {/* Chart Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'consistency', label: 'Consistency Trend', icon: LineChartIcon },
            { id: 'distribution', label: 'Health Distribution', icon: BarChart3 },
            { id: 'accuracy', label: 'Prediction Accuracy', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id as typeof activeChart)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeChart === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chart Content */}
        <div className="p-5">
          {activeChart === 'consistency' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Weekly Consistency Score</h4>
                <span className="text-sm text-muted-foreground">Last 7 days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consistencyData}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorScore)"
                      name="Health Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">7.5h</div>
                  <div className="text-xs text-blue-600">Avg Sleep</div>
                </div>
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <div className="text-lg font-bold text-cyan-600">6.4</div>
                  <div className="text-xs text-cyan-600">Avg Water</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">4.0</div>
                  <div className="text-xs text-purple-600">Avg Mood</div>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'distribution' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Health Score Distribution</h4>
                <span className="text-sm text-muted-foreground">30 days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" name="Days" radius={[8, 8, 0, 0]}>
                      {healthDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Most of your days are in the "Good" range. Keep pushing for "Great"!
              </p>
            </div>
          )}

          {activeChart === 'accuracy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">AI Prediction vs Actual</h4>
                <span className="text-sm text-muted-foreground">Accuracy: 94%</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[70, 95]} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted"
                      dot={{ fill: '#8b5cf6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Actual"
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-muted-foreground">Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Actual</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/50 rounded-xl p-5 border border-border">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          How BioSync AI Works
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-primary">1. Data Collection</div>
            <p className="text-muted-foreground">Your daily logs build a comprehensive health profile</p>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">2. Pattern Analysis</div>
            <p className="text-muted-foreground">AI identifies trends and correlations in your habits</p>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-primary">3. Predictions</div>
            <p className="text-muted-foreground">Get early warnings and personalized recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
