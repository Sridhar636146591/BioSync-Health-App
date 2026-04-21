import { useState, useEffect } from 'react';
import { 
  Scale, Target, TrendingUp, 
  ChevronRight, Check, Activity, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  getUserProfile, 
  saveUserProfile, 
  calculateBMI, 
  getBMICategory,
  calculateCalorieNeeds,
  calculateMacroSplit,
  getLast30DaysEntries,
  UserProfile
} from '@/lib/store';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];

export function DietPage() {
  const profile = getUserProfile();
  const [showForm, setShowForm] = useState(!profile?.height || !profile?.weight);
  const [formData, setFormData] = useState({
    height: profile?.height || '',
    weight: profile?.weight || '',
    age: profile?.age || '',
    gender: profile?.gender || 'male' as 'male' | 'female' | 'other',
    activityLevel: profile?.activityLevel || 'moderate' as const,
    dietGoal: profile?.dietGoal || 'maintain' as 'lose' | 'maintain' | 'gain',
  });

  const [calculatedData, setCalculatedData] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const entries = getLast30DaysEntries();
  const calorieHistory = entries
    .filter(e => e.calories)
    .slice(-7)
    .map(e => ({
      day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'short' }),
      calories: e.calories || 0,
      protein: e.protein || 0,
      carbs: e.carbs || 0,
      fat: e.fat || 0,
    }));

  useEffect(() => {
    if (profile?.height && profile?.weight && profile?.age) {
      const bmi = calculateBMI(profile.weight, profile.height);
      const calories = calculateCalorieNeeds(profile);
      const macros = calculateMacroSplit(calories, profile.dietGoal || 'maintain');
      
      setCalculatedData({
        bmi: bmi.toFixed(1),
        bmiCategory: getBMICategory(bmi),
        calories,
        macros,
      });
    }
  }, [profile]);

  const handleFollowPlan = (planIndex: number) => {
    setSelectedPlan(planIndex);
    setShowPlanDetails(true);
    
    // Save selected plan to localStorage
    const plan = dietPlans[planIndex];
    localStorage.setItem('biosync-selected-diet-plan', JSON.stringify({
      name: plan.name,
      calories: plan.calories,
      protein: plan.protein,
      carbs: plan.carbs,
      fat: plan.fat,
      selectedAt: new Date().toISOString(),
    }));
  };

  const handleSaveProfile = () => {
    const heightNum = Number(formData.height);
    const weightNum = Number(formData.weight);
    const ageNum = Number(formData.age);

    if (!heightNum || !weightNum || !ageNum) {
      alert('Please fill in all fields');
      return;
    }

    saveUserProfile({
      height: heightNum,
      weight: weightNum,
      age: ageNum,
      gender: formData.gender,
      activityLevel: formData.activityLevel,
      dietGoal: formData.dietGoal,
    });

    setShowForm(false);
    
    const bmi = calculateBMI(weightNum, heightNum);
    const calories = calculateCalorieNeeds({
      ...formData,
      height: heightNum,
      weight: weightNum,
      age: ageNum,
    } as UserProfile);
    const macros = calculateMacroSplit(calories, formData.dietGoal);

    setCalculatedData({
      bmi: bmi.toFixed(1),
      bmiCategory: getBMICategory(bmi),
      calories,
      macros,
    });
  };

  const dietPlans = [
    {
      name: 'Balanced Diet',
      description: 'Well-rounded nutrition for overall health',
      calories: calculatedData?.calories || 2000,
      protein: calculatedData?.macros.protein || 150,
      carbs: calculatedData?.macros.carbs || 225,
      fat: calculatedData?.macros.fat || 56,
      emoji: '⚖️',
      meals: [
        'Oatmeal with fruits & nuts',
        'Grilled chicken salad',
        'Salmon with quinoa & veggies',
        'Greek yogurt with honey',
      ],
    },
    {
      name: 'High Protein',
      description: 'Muscle building and recovery',
      calories: (calculatedData?.calories || 2000) + 200,
      protein: Math.round((calculatedData?.macros.protein || 150) * 1.3),
      carbs: Math.round((calculatedData?.macros.carbs || 225) * 0.8),
      fat: calculatedData?.macros.fat || 56,
      emoji: '💪',
      meals: [
        'Egg white omelet with spinach',
        'Chicken breast with rice',
        'Protein shake with banana',
        'Lean beef with sweet potato',
      ],
    },
    {
      name: 'Low Carb',
      description: 'Fat burning and weight loss',
      calories: (calculatedData?.calories || 2000) - 300,
      protein: calculatedData?.macros.protein || 150,
      carbs: Math.round((calculatedData?.macros.carbs || 225) * 0.5),
      fat: Math.round((calculatedData?.macros.fat || 56) * 1.3),
      emoji: '🔥',
      meals: [
        'Avocado & eggs',
        'Grilled fish with salad',
        'Nuts & cheese snack',
        'Steak with roasted vegetables',
      ],
    },
  ];

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gradient-primary">Your Body Profile</h1>
          <p className="text-muted-foreground">Tell us about yourself for personalized diet plans</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Body Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="25"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['male', 'female', 'other'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`py-2 px-4 rounded-lg border capitalize ${
                      formData.gender === g
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (hard exercise daily)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'lose', label: 'Lose Weight', icon: '🔥' },
                  { value: 'maintain', label: 'Maintain', icon: '⚖️' },
                  { value: 'gain', label: 'Gain Muscle', icon: '💪' },
                ]).map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => setFormData({ ...formData, dietGoal: goal.value as 'lose' | 'maintain' | 'gain' })}
                    className={`py-3 px-4 rounded-lg border ${
                      formData.dietGoal === goal.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border'
                    }`}
                  >
                    <div className="text-2xl mb-1">{goal.icon}</div>
                    <div className="text-sm font-medium">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button variant="glow" className="w-full" onClick={handleSaveProfile}>
              <Check className="w-4 h-4 mr-2" />
              Calculate My Diet Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Diet & Nutrition</h1>
          <p className="text-muted-foreground">Personalized plans based on your body</p>
        </div>
        <Button variant="outline" onClick={() => setShowForm(true)}>
          Update Profile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 opacity-0 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary animate-pulse">{calculatedData?.bmi}</div>
              <div className="text-sm text-muted-foreground mt-1">BMI</div>
              <div className={`text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block ${
                calculatedData?.bmiCategory === 'Normal' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {calculatedData?.bmiCategory}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 animate-pulse">{calculatedData?.calories}</div>
              <div className="text-sm text-muted-foreground mt-1">Calories/day</div>
              <div className="text-xs text-muted-foreground mt-2">Target intake</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 animate-pulse">{calculatedData?.macros?.protein}g</div>
              <div className="text-sm text-muted-foreground mt-1">Protein</div>
              <div className="text-xs text-muted-foreground mt-2">Daily target</div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 animate-pulse">{profile?.weight}kg</div>
              <div className="text-sm text-muted-foreground mt-1">Weight</div>
              <div className="text-xs text-muted-foreground mt-2">Current</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              7-Day Calorie Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calorieHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={calorieHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, stroke: '#f97316', strokeWidth: 2, fill: '#fff' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data yet. Start logging your meals!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Macro Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Protein', value: calculatedData?.macros?.protein * 4 || 600 },
                    { name: 'Carbs', value: calculatedData?.macros?.carbs * 4 || 900 },
                    { name: 'Fat', value: calculatedData?.macros?.fat * 9 || 450 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                  animationBegin={200}
                >
                  {COLORS.map((color, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={color}
                      style={{
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e: any) => {
                        e.target.style.filter = 'brightness(1.2)';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e: any) => {
                        e.target.style.filter = 'brightness(1)';
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string) => {
                    const grams = Math.round(value / (name === 'Protein' || name === 'Carbs' ? 4 : 9));
                    return [`${grams}g (${((value / (calculatedData?.calories || 2000)) * 100).toFixed(1)}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Macro Trends */}
        <Card className="hover:shadow-lg transition-shadow opacity-0 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Weekly Macro Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calorieHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={calorieHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorProtein" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCarbs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="protein" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="url(#colorProtein)"
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="carbs" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="url(#colorCarbs)"
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="fat" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="url(#colorFat)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No macro data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calorie Goal Progress */}
        <Card className="hover:shadow-lg transition-shadow opacity-0 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Calorie vs Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calorieHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={calorieHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCalorieBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="calories" 
                    name="Actual Calories"
                    fill="url(#colorCalorieBar)"
                    radius={[8, 8, 0, 0]}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={() => calculatedData?.calories || 2000} 
                    name="Goal"
                    stroke="#ef4444" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No data to compare
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Nutrition Score Radar */}
      <Card className="hover:shadow-lg transition-shadow opacity-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Nutrition Balance Score
          </CardTitle>
          <p className="text-sm text-muted-foreground">How well balanced is your diet</p>
        </CardHeader>
        <CardContent>
          {calculatedData && calorieHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                {
                  metric: 'Protein',
                  score: Math.min(100, ((calculatedData.macros.protein || 150) / 180) * 100),
                  fullMark: 100,
                },
                {
                  metric: 'Carbs',
                  score: Math.min(100, ((calculatedData.macros.carbs || 225) / 300) * 100),
                  fullMark: 100,
                },
                {
                  metric: 'Fat',
                  score: Math.min(100, ((calculatedData.macros.fat || 56) / 80) * 100),
                  fullMark: 100,
                },
                {
                  metric: 'Fiber',
                  score: Math.min(100, (30 / 35) * 100),
                  fullMark: 100,
                },
                {
                  metric: 'Calories',
                  score: Math.min(100, (calculatedData.calories / 2500) * 100),
                  fullMark: 100,
                },
                {
                  metric: 'Consistency',
                  score: Math.min(100, (calorieHistory.length / 7) * 100),
                  fullMark: 100,
                },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Radar
                  name="Your Diet"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="#10b981"
                  fillOpacity={0.3}
                  animationDuration={1500}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Complete your profile to see nutrition score
            </div>
          )}
        </CardContent>
      </Card>

      {/* Macro Bar Chart */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" />
            Daily Macro Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Protein', grams: calculatedData?.macros?.protein || 150, calories: (calculatedData?.macros?.protein || 150) * 4 },
                { name: 'Carbs', grams: calculatedData?.macros?.carbs || 225, calories: (calculatedData?.macros?.carbs || 225) * 4 },
                { name: 'Fat', grams: calculatedData?.macros?.fat || 56, calories: (calculatedData?.macros?.fat || 56) * 9 },
              ]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="gradientProtein" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradientCarbs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="gradientFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 'bold' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                label={{ value: 'Grams', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'grams') {
                    return [`${value}g`, 'Amount'];
                  }
                  return [`${value} kcal`, 'Calories'];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar 
                dataKey="grams" 
                name="Grams"
                animationDuration={1500}
                animationBegin={0}
                radius={[10, 10, 0, 0]}
              >
                <Cell 
                  key="protein" 
                  fill="url(#gradientProtein)"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <Cell 
                  key="carbs" 
                  fill="url(#gradientCarbs)"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <Cell 
                  key="fat" 
                  fill="url(#gradientFat)"
                  style={{ transition: 'all 0.3s ease' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Diet Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Recommended Diet Plans
        </h2>
        <div className="space-y-4">
          {dietPlans.map((plan, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-3xl group-hover:animate-bounce">{plan.emoji}</span>
                      <span className="group-hover:text-primary transition-colors">{plan.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  <Button 
                    variant="glow" 
                    size="sm"
                    className="group-hover:scale-110 transition-transform"
                    onClick={() => handleFollowPlan(index)}
                  >
                    Follow Plan
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      Daily Targets
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                        <span className="text-sm font-medium">Calories</span>
                        <span className="font-bold text-orange-700">{plan.calories} kcal</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                        <span className="text-sm font-medium">Protein</span>
                        <span className="font-bold text-red-700">{plan.protein}g</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                        <span className="text-sm font-medium">Carbs</span>
                        <span className="font-bold text-amber-700">{plan.carbs}g</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                        <span className="text-sm font-medium">Fat</span>
                        <span className="font-bold text-blue-700">{plan.fat}g</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Sample Meals
                    </h4>
                    <div className="space-y-2">
                      {plan.meals.map((meal, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-green-50 transition-colors group/item"
                        >
                          <Check className="w-4 h-4 text-green-600 group-hover/item:scale-125 transition-transform" />
                          <span className="group-hover/item:text-green-700 transition-colors">{meal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan !== null && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPlanDetails(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{dietPlans[selectedPlan].emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gradient-primary">
                      {dietPlans[selectedPlan].name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dietPlans[selectedPlan].description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlanDetails(false)}
                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Plan Activated!</h3>
                  <p className="text-sm text-green-700">
                    Your daily targets have been updated based on this plan.
                  </p>
                </div>
              </div>

              {/* Daily Targets */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Your Daily Targets
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <div className="text-sm text-orange-700 mb-1">Calories</div>
                    <div className="text-2xl font-bold text-orange-800">
                      {dietPlans[selectedPlan].calories}
                    </div>
                    <div className="text-xs text-orange-600">kcal/day</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                    <div className="text-sm text-red-700 mb-1">Protein</div>
                    <div className="text-2xl font-bold text-red-800">
                      {dietPlans[selectedPlan].protein}g
                    </div>
                    <div className="text-xs text-red-600">daily target</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                    <div className="text-sm text-amber-700 mb-1">Carbs</div>
                    <div className="text-2xl font-bold text-amber-800">
                      {dietPlans[selectedPlan].carbs}g
                    </div>
                    <div className="text-xs text-amber-600">daily target</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="text-sm text-blue-700 mb-1">Fat</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {dietPlans[selectedPlan].fat}g
                    </div>
                    <div className="text-xs text-blue-600">daily target</div>
                  </div>
                </div>
              </div>

              {/* Meal Plan */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  Suggested Meal Plan
                </h3>
                <div className="space-y-3">
                  {dietPlans[selectedPlan].meals.map((meal, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <span className="font-medium">{meal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Tips for Success</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Track your meals daily to stay on target</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Drink plenty of water throughout the day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Adjust portions based on your hunger levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Review your progress weekly and adjust as needed</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPlanDetails(false)}
              >
                Close
              </Button>
              <Button
                variant="glow"
                className="flex-1"
                onClick={() => {
                  setShowPlanDetails(false);
                  // Could navigate to log page or show confirmation
                  alert('Plan saved! Start logging your meals to track progress.');
                }}
              >
                Start Logging Meals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
