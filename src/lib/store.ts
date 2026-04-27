export interface Meal {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time?: string;
}

export interface HealthEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  mood: 1 | 2 | 3 | 4 | 5;
  waterGlasses: number;
  exerciseMinutes: number;
  steps?: number;
  symptoms: string[];
  notes: string;
  // Diet tracking
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  meals?: Meal[];
  dietType?: string; // 'Balanced', 'Keto', 'Vegan', 'Vegetarian', 'Paleo', etc.
}

export interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
  goals?: string[];
  joinedAt?: string;
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietGoal?: 'lose' | 'maintain' | 'gain';
}

export interface FriendRequest {
  from: string; // email
  to: string; // email
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Friend {
  email: string;
  name: string;
  avatar?: string;
  addedAt: string;
  healthScore?: number;
  streak?: number;
  level?: string;
}

const PROFILE_KEY = 'biosync-profile';

export function getUserProfile(): UserProfile | null {
  try {
    const auth = localStorage.getItem('biosync_auth');
    if (!auth) return null;
    const { user } = JSON.parse(auth);
    
    const profile = localStorage.getItem(PROFILE_KEY);
    if (profile) {
      return { ...user, ...JSON.parse(profile) };
    }
    return user;
  } catch {
    return null;
  }
}

export function saveUserProfile(updates: Partial<UserProfile>): void {
  const current = getUserProfile();
  const profile = { ...current, ...updates };
  
  const toSave = {
    height: profile.height,
    weight: profile.weight,
    age: profile.age,
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    dietGoal: profile.dietGoal,
  };
  
  localStorage.setItem(PROFILE_KEY, JSON.stringify(toSave));
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateCalorieNeeds(profile: UserProfile): number {
  if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
    return 2000;
  }
  
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }
  
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const tdee = bmr * (activityMultipliers[profile.activityLevel || 'moderate']);
  
  if (profile.dietGoal === 'lose') {
    return Math.round(tdee - 500);
  } else if (profile.dietGoal === 'gain') {
    return Math.round(tdee + 500);
  }
  
  return Math.round(tdee);
}

export function calculateMacroSplit(calories: number, goal: string): { protein: number; carbs: number; fat: number } {
  let proteinRatio: number, carbsRatio: number, fatRatio: number;
  
  if (goal === 'lose') {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatRatio = 0.30;
  } else if (goal === 'gain') {
    proteinRatio = 0.30;
    carbsRatio = 0.50;
    fatRatio = 0.20;
  } else {
    proteinRatio = 0.30;
    carbsRatio = 0.45;
    fatRatio = 0.25;
  }
  
  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbsRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  };
}

export interface WeekSummary {
  avgSleep: number;
  avgMood: number;
  avgWater: number;
  totalExercise: number;
  mostCommonSymptom: string | null;
  entries: number;
  avgCalories?: number;
  avgProtein?: number;
  avgCarbs?: number;
  avgFat?: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  metric?: string;
}

export interface Correlation {
  factorA: string;
  factorB: string;
  direction: 'positive' | 'negative';
  strength: number; // 0-1
  description: string;
}

const STORAGE_KEY = 'vitalis-health-data';

// Get user-specific storage key
function getUserStorageKey(): string {
  const auth = localStorage.getItem('biosync_auth');
  if (!auth) return STORAGE_KEY;
  const { user } = JSON.parse(auth);
  return `${STORAGE_KEY}-${user.email}`;
}

function loadEntries(): HealthEntry[] {
  try {
    const key = getUserStorageKey();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: HealthEntry[]): void {
  const key = getUserStorageKey();
  localStorage.setItem(key, JSON.stringify(entries));
}

export function getAllEntries(): HealthEntry[] {
  return loadEntries().sort((a, b) => b.date.localeCompare(a.date));
}

export function getEntryByDate(date: string): HealthEntry | undefined {
  return loadEntries().find(e => e.date === date);
}

export function saveEntry(entry: HealthEntry): void {
  const entries = loadEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  saveEntries(entries);
}

export function deleteEntry(date: string): void {
  const entries = loadEntries().filter(e => e.date !== date);
  saveEntries(entries);
}

export function getEntriesForRange(startDate: string, endDate: string): HealthEntry[] {
  return loadEntries()
    .filter(e => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getLast7DaysEntries(): HealthEntry[] {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);
  return getEntriesForRange(formatDate(weekAgo), formatDate(today));
}

export function getLast30DaysEntries(): HealthEntry[] {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 29);
  return getEntriesForRange(formatDate(monthAgo), formatDate(today));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekSummary(entries: HealthEntry[]): WeekSummary {
  if (entries.length === 0) {
    return { avgSleep: 0, avgMood: 0, avgWater: 0, totalExercise: 0, mostCommonSymptom: null, entries: 0 };
  }
  const avgSleep = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;
  const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
  const avgWater = entries.reduce((sum, e) => sum + e.waterGlasses, 0) / entries.length;
  const totalExercise = entries.reduce((sum, e) => sum + e.exerciseMinutes, 0);

  const symptomCount: Record<string, number> = {};
  entries.forEach(e => e.symptoms.forEach(s => {
    symptomCount[s] = (symptomCount[s] || 0) + 1;
  }));
  const mostCommonSymptom = Object.entries(symptomCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Calculate diet averages
  const entriesWithDiet = entries.filter(e => e.calories);
  const avgCalories = entriesWithDiet.length > 0 ? entriesWithDiet.reduce((sum, e) => sum + (e.calories || 0), 0) / entriesWithDiet.length : undefined;
  const avgProtein = entriesWithDiet.length > 0 ? entriesWithDiet.reduce((sum, e) => sum + (e.protein || 0), 0) / entriesWithDiet.length : undefined;
  const avgCarbs = entriesWithDiet.length > 0 ? entriesWithDiet.reduce((sum, e) => sum + (e.carbs || 0), 0) / entriesWithDiet.length : undefined;
  const avgFat = entriesWithDiet.length > 0 ? entriesWithDiet.reduce((sum, e) => sum + (e.fat || 0), 0) / entriesWithDiet.length : undefined;

  return { 
    avgSleep, 
    avgMood, 
    avgWater, 
    totalExercise, 
    mostCommonSymptom, 
    entries: entries.length,
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFat,
  };
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

export function getCorrelations(entries: HealthEntry[]): Correlation[] {
  if (entries.length < 3) return [];
  const correlations: Correlation[] = [];
  const sleep = entries.map(e => e.sleepHours);
  const mood = entries.map(e => e.mood);
  const water = entries.map(e => e.waterGlasses);
  const exercise = entries.map(e => e.exerciseMinutes);

  const pairs: [string, string, number[], number[]][] = [
    ['Sleep', 'Mood', sleep, mood],
    ['Water Intake', 'Mood', water, mood],
    ['Exercise', 'Mood', exercise, mood],
    ['Sleep', 'Exercise', sleep, exercise],
    ['Water Intake', 'Sleep', water, sleep],
    ['Exercise', 'Sleep', exercise, sleep],
  ];

  for (const [a, b, xArr, yArr] of pairs) {
    const r = pearsonCorrelation(xArr, yArr);
    if (Math.abs(r) > 0.2) {
      const direction = r > 0 ? 'positive' as const : 'negative' as const;
      const strength = Math.abs(r);
      let description: string;
      if (strength > 0.6) {
        description = `Strong ${direction} relationship: when your ${a.toLowerCase()} is higher, your ${b.toLowerCase()} tends to be ${direction === 'positive' ? 'higher' : 'lower'} too.`;
      } else if (strength > 0.4) {
        description = `Moderate link between ${a.toLowerCase()} and ${b.toLowerCase()}. They tend to move ${direction === 'positive' ? 'together' : 'in opposite directions'}.`;
      } else {
        description = `Slight connection between ${a.toLowerCase()} and ${b.toLowerCase()} observed in your data.`;
      }
      correlations.push({ factorA: a, factorB: b, direction, strength, description });
    }
  }
  return correlations.sort((a, b) => b.strength - a.strength);
}

export function generateInsights(entries: HealthEntry[]): Insight[] {
  const insights: Insight[] = [];
  if (entries.length === 0) return insights;

  const summary = getWeekSummary(entries);

  // Sleep insights
  if (summary.avgSleep >= 7 && summary.avgSleep <= 9) {
    insights.push({ id: 'sleep-good', type: 'positive', title: 'Great Sleep Pattern', description: `You're averaging ${summary.avgSleep.toFixed(1)} hours of sleep. That's within the recommended 7-9 hours.`, metric: `${summary.avgSleep.toFixed(1)}h avg` });
  } else if (summary.avgSleep < 7) {
    insights.push({ id: 'sleep-low', type: 'warning', title: 'Sleep Could Improve', description: `Your average of ${summary.avgSleep.toFixed(1)} hours is below the recommended 7 hours. Try a consistent bedtime.`, metric: `${summary.avgSleep.toFixed(1)}h avg` });
  }

  // Mood insights
  if (summary.avgMood >= 4) {
    insights.push({ id: 'mood-good', type: 'positive', title: 'Positive Mood Trend', description: `Your mood has been consistently positive with an average of ${summary.avgMood.toFixed(1)} out of 5.`, metric: `${summary.avgMood.toFixed(1)}/5` });
  } else if (summary.avgMood < 3) {
    insights.push({ id: 'mood-low', type: 'warning', title: 'Mood Needs Attention', description: `Your mood average is ${summary.avgMood.toFixed(1)}. Consider which activities make you feel better.`, metric: `${summary.avgMood.toFixed(1)}/5` });
  }

  // Water insights
  if (summary.avgWater >= 8) {
    insights.push({ id: 'water-good', type: 'positive', title: 'Well Hydrated', description: `Averaging ${summary.avgWater.toFixed(1)} glasses per day. Keep up the great hydration!`, metric: `${summary.avgWater.toFixed(0)} glasses` });
  } else if (summary.avgWater < 6) {
    insights.push({ id: 'water-low', type: 'warning', title: 'Drink More Water', description: `At ${summary.avgWater.toFixed(1)} glasses per day, consider increasing your water intake to at least 8 glasses.`, metric: `${summary.avgWater.toFixed(0)} glasses` });
  }

  // Exercise insights
  const avgExercise = summary.totalExercise / entries.length;
  if (avgExercise >= 30) {
    insights.push({ id: 'exercise-good', type: 'positive', title: 'Active Lifestyle', description: `Averaging ${avgExercise.toFixed(0)} minutes of exercise per day. You're meeting daily activity goals!`, metric: `${avgExercise.toFixed(0)} min/day` });
  } else if (avgExercise < 15) {
    insights.push({ id: 'exercise-low', type: 'warning', title: 'Move More', description: `Only ${avgExercise.toFixed(0)} minutes of exercise per day. Try adding a short walk or stretching routine.`, metric: `${avgExercise.toFixed(0)} min/day` });
  }

  // Symptom pattern
  if (summary.mostCommonSymptom) {
    insights.push({ id: 'symptom-pattern', type: 'neutral', title: 'Recurring Symptom', description: `"${summary.mostCommonSymptom}" appears most frequently in your logs. Track what triggers it.`, metric: summary.mostCommonSymptom });
  }

  // Correlations as insights
  const correlations = getCorrelations(entries);
  if (correlations.length > 0) {
    const top = correlations[0];
    insights.push({
      id: 'correlation-top',
      type: top.direction === 'positive' ? 'positive' : 'neutral',
      title: `${top.factorA} & ${top.factorB} Link`,
      description: top.description,
      metric: `r=${top.strength.toFixed(2)}`
    });
  }

  return insights;
}

export function seedDemoData(): void {
  const existing = loadEntries();
  console.log('seedDemoData - Existing entries:', existing.length);
  if (existing.length > 0) {
    console.log('seedDemoData - Data already exists, skipping');
    return;
  }
  
  console.log('seedDemoData - Starting to seed 30 days of demo data...');

  const symptoms = ['Headache', 'Fatigue', 'Back pain', 'Anxiety', 'Bloating'];
  const entries: HealthEntry[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const baseSleep = isWeekend ? 8.5 : 7;
    const sleepHours = Math.round((baseSleep + (Math.random() * 2 - 1)) * 2) / 2;
    const exerciseMinutes = isWeekend ? Math.round(40 + Math.random() * 30) : Math.round(15 + Math.random() * 25);
    const waterGlasses = Math.round(5 + Math.random() * 5);
    const moodBase = sleepHours >= 7 ? 4 : 3;
    const mood = Math.min(5, Math.max(1, Math.round(moodBase + (Math.random() - 0.4)))) as 1|2|3|4|5;

    const daySymptoms: string[] = [];
    if (sleepHours < 6.5) daySymptoms.push('Fatigue');
    if (waterGlasses < 5) daySymptoms.push('Headache');
    if (Math.random() < 0.15) daySymptoms.push(symptoms[Math.floor(Math.random() * symptoms.length)]);

    // Generate diet data
    const calories = Math.round(1800 + Math.random() * 700);
    const protein = Math.round(80 + Math.random() * 60);
    const carbs = Math.round(200 + Math.random() * 100);
    const fat = Math.round(50 + Math.random() * 40);
    const fiber = Math.round(20 + Math.random() * 20);

    const meals: Meal[] = [
      {
        type: 'Breakfast',
        name: ['Oatmeal with fruits', 'Eggs & toast', 'Smoothie bowl', 'Yogurt parfait'][Math.floor(Math.random() * 4)],
        calories: Math.round(300 + Math.random() * 200),
        protein: Math.round(15 + Math.random() * 15),
        carbs: Math.round(40 + Math.random() * 30),
        fat: Math.round(10 + Math.random() * 15),
        time: '08:00',
      },
      {
        type: 'Lunch',
        name: ['Grilled chicken salad', 'Rice & vegetables', 'Sandwich & soup', 'Pasta'][Math.floor(Math.random() * 4)],
        calories: Math.round(400 + Math.random() * 300),
        protein: Math.round(25 + Math.random() * 20),
        carbs: Math.round(50 + Math.random() * 40),
        fat: Math.round(15 + Math.random() * 20),
        time: '13:00',
      },
      {
        type: 'Dinner',
        name: ['Salmon with veggies', 'Stir-fry tofu', 'Lean steak & potato', 'Curry'][Math.floor(Math.random() * 4)],
        calories: Math.round(450 + Math.random() * 300),
        protein: Math.round(30 + Math.random() * 25),
        carbs: Math.round(45 + Math.random() * 35),
        fat: Math.round(18 + Math.random() * 22),
        time: '19:00',
      },
    ];

    entries.push({
      id: `demo-${formatDate(date)}`,
      date: formatDate(date),
      sleepHours: Math.max(4, Math.min(12, sleepHours)),
      mood,
      waterGlasses: Math.max(0, Math.min(15, waterGlasses)),
      exerciseMinutes: Math.max(0, exerciseMinutes),
      symptoms: [...new Set(daySymptoms)],
      notes: '',
      calories,
      protein,
      carbs,
      fat,
      fiber,
      meals,
      dietType: 'Balanced',
    });
  }
  saveEntries(entries);
  console.log('seedDemoData - Successfully saved', entries.length, 'entries');
  console.log('seedDemoData - Storage key:', getUserStorageKey());
}

export const MOOD_LABELS: Record<number, string> = {
  1: 'Very Low',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export const MOOD_COLORS: Record<number, string> = {
  1: 'hsl(var(--rose))',
  2: 'hsl(var(--amber))',
  3: 'hsl(var(--muted-foreground))',
  4: 'hsl(var(--sage))',
  5: 'hsl(var(--teal))',
};

export const COMMON_SYMPTOMS = [
  'Headache', 'Fatigue', 'Back pain', 'Anxiety',
  'Bloating', 'Insomnia', 'Nausea', 'Joint pain',
  'Brain fog', 'Allergies', 'Cramps', 'Dizziness',
];

export function calculateHealthScore(entries: HealthEntry[]): number {
  if (entries.length === 0) return 0;
  
  const detailed = calculateDetailedHealthScore(entries);
  return detailed.overall;
}

export interface DetailedHealthScore {
  overall: number;
  sleep: number;
  water: number;
  mood: number;
  exercise: number;
  diet: number;
  consistency: number;
  streak: number;
  level: 'Rookie' | 'Warrior' | 'Legend' | 'Master';
  xp: number;
  xpToNext: number;
  badges: string[];
}

export function calculateDetailedHealthScore(entries: HealthEntry[]): DetailedHealthScore {
  if (entries.length === 0) {
    return {
      overall: 0,
      sleep: 0,
      water: 0,
      mood: 0,
      exercise: 0,
      diet: 0,
      consistency: 0,
      streak: 0,
      level: 'Rookie',
      xp: 0,
      xpToNext: 1000,
      badges: [],
    };
  }
  
  const summary = getWeekSummary(entries);
  const streak = calculateStreak(entries);
  
  // Sleep score (0-100) - optimal 7-9 hours
  let sleepScore: number;
  if (summary.avgSleep >= 7 && summary.avgSleep <= 9) {
    sleepScore = 100;
  } else if (summary.avgSleep >= 6 && summary.avgSleep < 7) {
    sleepScore = 70 + (summary.avgSleep - 6) * 30;
  } else if (summary.avgSleep > 9 && summary.avgSleep <= 10) {
    sleepScore = 70 - (summary.avgSleep - 9) * 30;
  } else if (summary.avgSleep < 6) {
    sleepScore = Math.max(0, (summary.avgSleep / 6) * 70);
  } else {
    sleepScore = Math.max(0, 100 - (summary.avgSleep - 10) * 20);
  }
  
  // Mood score (0-100)
  const moodScore = (summary.avgMood / 5) * 100;
  
  // Hydration score (0-100) - optimal 8 glasses
  let waterScore: number;
  if (summary.avgWater >= 8) {
    waterScore = 100;
  } else {
    waterScore = (summary.avgWater / 8) * 100;
  }
  
  // Exercise score (0-100) - optimal 30 min/day
  const avgExercise = summary.totalExercise / Math.max(entries.length, 1);
  let exerciseScore: number;
  if (avgExercise >= 30) {
    exerciseScore = 100;
  } else {
    exerciseScore = (avgExercise / 30) * 100;
  }
  
  // Diet score (0-100) - based on calorie target and macro balance
  let dietScore = 50; // Default if no data
  if (summary.avgCalories) {
    const calorieTarget = 2000;
    const calorieDiff = Math.abs(summary.avgCalories - calorieTarget);
    const calorieScore = Math.max(0, 100 - (calorieDiff / 20));
    
    // Macro balance score
    let macroScore = 50;
    if (summary.avgProtein && summary.avgCarbs && summary.avgFat) {
      const proteinRatio = (summary.avgProtein * 4) / summary.avgCalories;
      const carbRatio = (summary.avgCarbs * 4) / summary.avgCalories;
      const fatRatio = (summary.avgFat * 9) / summary.avgCalories;
      
      // Ideal ratios: Protein 25-35%, Carbs 45-55%, Fat 20-30%
      const proteinScore = proteinRatio >= 0.25 && proteinRatio <= 0.35 ? 100 : Math.max(0, 100 - Math.abs(proteinRatio - 0.30) * 200);
      const carbScore = carbRatio >= 0.45 && carbRatio <= 0.55 ? 100 : Math.max(0, 100 - Math.abs(carbRatio - 0.50) * 200);
      const fatScore = fatRatio >= 0.20 && fatRatio <= 0.30 ? 100 : Math.max(0, 100 - Math.abs(fatRatio - 0.25) * 200);
      
      macroScore = (proteinScore + carbScore + fatScore) / 3;
    }
    
    dietScore = (calorieScore * 0.4 + macroScore * 0.6);
  }
  
  // Consistency score (0-100) - based on logging frequency
  const consistencyScore = Math.min(100, (entries.length / 30) * 100);
  
  // Overall score (weighted average)
  const overall = Math.round(
    sleepScore * 0.20 +
    moodScore * 0.15 +
    waterScore * 0.15 +
    exerciseScore * 0.15 +
    dietScore * 0.20 +
    consistencyScore * 0.15
  );
  
  // Determine level
  let level: 'Rookie' | 'Warrior' | 'Legend' | 'Master';
  let xp: number;
  let xpToNext: number;
  
  if (overall >= 90) {
    level = 'Master';
    xp = 3000 + (overall - 90) * 50;
    xpToNext = 5000;
  } else if (overall >= 75) {
    level = 'Legend';
    xp = 2000 + (overall - 75) * 67;
    xpToNext = 3000;
  } else if (overall >= 60) {
    level = 'Warrior';
    xp = 1000 + (overall - 60) * 67;
    xpToNext = 2000;
  } else {
    level = 'Rookie';
    xp = overall * 17;
    xpToNext = 1000;
  }
  
  // Generate badges based on achievements
  const badges: string[] = [];
  
  if (sleepScore >= 90) badges.push('Sleep Master');
  if (waterScore >= 100) badges.push('Hydration Hero');
  if (moodScore >= 90) badges.push('Mood Master');
  if (exerciseScore >= 100) badges.push('Fitness Pro');
  if (streak >= 7) badges.push('Week Warrior');
  if (streak >= 30) badges.push('Monthly Master');
  if (consistencyScore >= 80) badges.push('Consistency King');
  if (summary.avgSleep >= 7 && summary.avgSleep <= 9 && summary.avgMood >= 4) {
    badges.push('Wellness Star');
  }
  if (badges.length === 0) badges.push('Getting Started');
  
  return {
    overall: Math.min(100, Math.max(0, overall)),
    sleep: Math.round(Math.min(100, Math.max(0, sleepScore))),
    water: Math.round(Math.min(100, Math.max(0, waterScore))),
    mood: Math.round(Math.min(100, Math.max(0, moodScore))),
    exercise: Math.round(Math.min(100, Math.max(0, exerciseScore))),
    diet: Math.round(Math.min(100, Math.max(0, dietScore))),
    consistency: Math.round(Math.min(100, Math.max(0, consistencyScore))),
    streak,
    level,
    xp,
    xpToNext,
    badges,
  };
}

export function calculateStreak(entries: HealthEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = getToday();
  
  for (let i = 0; i < sorted.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedStr = formatDate(expectedDate);
    
    if (sorted[i].date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

// ============ Friend System ============

const FRIENDS_KEY = 'biosync-friends';
const FRIEND_REQUESTS_KEY = 'biosync-friend-requests';

// Get all registered users (from biosync_users)
export function getAllRegisteredUsers(): UserProfile[] {
  try {
    const users = localStorage.getItem('biosync_users');
    if (!users) return [];
    return JSON.parse(users);
  } catch {
    return [];
  }
}

// Get current user's email
function getCurrentUserEmail(): string | null {
  const auth = localStorage.getItem('biosync_auth');
  if (!auth) return null;
  const { user } = JSON.parse(auth);
  return user.email;
}

// Get user's friends
export function getFriends(): Friend[] {
  const email = getCurrentUserEmail();
  if (!email) return [];
  
  try {
    const allFriends = localStorage.getItem(FRIENDS_KEY);
    if (!allFriends) return [];
    const friendsMap = JSON.parse(allFriends);
    return friendsMap[email] || [];
  } catch {
    return [];
  }
}

// Add friend
export function addFriend(friendEmail: string): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  
  const allFriends = localStorage.getItem(FRIENDS_KEY);
  const friendsMap = allFriends ? JSON.parse(allFriends) : {};
  
  if (!friendsMap[email]) {
    friendsMap[email] = [];
  }
  
  // Check if already friends
  const alreadyFriends = friendsMap[email].some((f: Friend) => f.email === friendEmail);
  if (alreadyFriends) return;
  
  // Get friend's info
  const users = getAllRegisteredUsers();
  const friendUser = users.find(u => u.email === friendEmail);
  if (!friendUser) return;
  
  // Get friend's health data
  const healthKey = `vitalis-health-data-${friendEmail}`;
  const healthData = localStorage.getItem(healthKey);
  const entries: HealthEntry[] = healthData ? JSON.parse(healthData) : [];
  const healthScore = entries.length > 0 ? calculateHealthScore(entries) : 0;
  const streak = calculateStreak(entries);
  const detailedScore = entries.length > 0 ? calculateDetailedHealthScore(entries) : null;
  
  friendsMap[email].push({
    email: friendUser.email,
    name: friendUser.name,
    avatar: friendUser.avatar,
    addedAt: new Date().toISOString(),
    healthScore,
    streak,
    level: detailedScore?.level || 'Rookie',
  });
  
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friendsMap));
}

// Remove friend
export function removeFriend(friendEmail: string): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  
  const allFriends = localStorage.getItem(FRIENDS_KEY);
  if (!allFriends) return;
  const friendsMap = JSON.parse(allFriends);
  
  if (friendsMap[email]) {
    friendsMap[email] = friendsMap[email].filter((f: Friend) => f.email !== friendEmail);
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friendsMap));
  }
}

// Get pending friend requests (received)
export function getPendingFriendRequests(): FriendRequest[] {
  const email = getCurrentUserEmail();
  if (!email) return [];
  
  try {
    const requests = localStorage.getItem(FRIEND_REQUESTS_KEY);
    if (!requests) return [];
    const allRequests: FriendRequest[] = JSON.parse(requests);
    return allRequests.filter(r => r.to === email && r.status === 'pending');
  } catch {
    return [];
  }
}

// Send friend request
export function sendFriendRequest(toEmail: string): boolean {
  const email = getCurrentUserEmail();
  if (!email || email === toEmail) return false;
  
  const requests = localStorage.getItem(FRIEND_REQUESTS_KEY);
  const allRequests: FriendRequest[] = requests ? JSON.parse(requests) : [];
  
  // Check if request already exists
  const exists = allRequests.some(
    r => (r.from === email && r.to === toEmail) || (r.from === toEmail && r.to === email)
  );
  
  if (exists) return false;
  
  allRequests.push({
    from: email,
    to: toEmail,
    timestamp: new Date().toISOString(),
    status: 'pending',
  });
  
  localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(allRequests));
  return true;
}

// Accept friend request
export function acceptFriendRequest(fromEmail: string): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  
  // Update request status
  const requests = localStorage.getItem(FRIEND_REQUESTS_KEY);
  if (requests) {
    const allRequests: FriendRequest[] = JSON.parse(requests);
    const request = allRequests.find(r => r.from === fromEmail && r.to === email);
    if (request) {
      request.status = 'accepted';
      localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(allRequests));
    }
  }
  
  // Add as friend (bidirectional)
  addFriend(fromEmail);
  
  // Also add current user to the other person's friends
  const allFriends = localStorage.getItem(FRIENDS_KEY);
  const friendsMap = allFriends ? JSON.parse(allFriends) : {};
  
  if (!friendsMap[fromEmail]) {
    friendsMap[fromEmail] = [];
  }
  
  const currentUser = getAllRegisteredUsers().find(u => u.email === email);
  if (currentUser) {
    const currentHealthKey = `vitalis-health-data-${email}`;
    const currentHealthData = localStorage.getItem(currentHealthKey);
    const currentEntries: HealthEntry[] = currentHealthData ? JSON.parse(currentHealthData) : [];
    const currentHealthScore = currentEntries.length > 0 ? calculateHealthScore(currentEntries) : 0;
    const currentStreak = calculateStreak(currentEntries);
    const currentDetailedScore = currentEntries.length > 0 ? calculateDetailedHealthScore(currentEntries) : null;
    
    friendsMap[fromEmail].push({
      email: currentUser.email,
      name: currentUser.name,
      avatar: currentUser.avatar,
      addedAt: new Date().toISOString(),
      healthScore: currentHealthScore,
      streak: currentStreak,
      level: currentDetailedScore?.level || 'Rookie',
    });
    
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friendsMap));
  }
}

// Reject friend request
export function rejectFriendRequest(fromEmail: string): void {
  const email = getCurrentUserEmail();
  if (!email) return;
  
  const requests = localStorage.getItem(FRIEND_REQUESTS_KEY);
  if (requests) {
    const allRequests: FriendRequest[] = JSON.parse(requests);
    const request = allRequests.find(r => r.from === fromEmail && r.to === email);
    if (request) {
      request.status = 'rejected';
      localStorage.setItem(FRIEND_REQUESTS_KEY, JSON.stringify(allRequests));
    }
  }
}

// Check if user is already a friend
export function isFriend(email: string): boolean {
  const friends = getFriends();
  return friends.some(f => f.email === email);
}

// Check if friend request is pending
export function hasPendingRequestWith(email: string): boolean {
  const currentUser = getCurrentUserEmail();
  if (!currentUser) return false;
  
  const requests = localStorage.getItem(FRIEND_REQUESTS_KEY);
  if (!requests) return false;
  const allRequests: FriendRequest[] = JSON.parse(requests);
  
  return allRequests.some(
    r => r.status === 'pending' && (
      (r.from === currentUser && r.to === email) ||
      (r.from === email && r.to === currentUser)
    )
  );
}

// Get available users to discover (not already friends)
export function getDiscoverableUsers(): UserProfile[] {
  const currentUser = getCurrentUserEmail();
  if (!currentUser) return [];
  
  const allUsers = getAllRegisteredUsers();
  const friends = getFriends();
  const friendEmails = new Set(friends.map(f => f.email));
  
  // Filter out current user and existing friends
  return allUsers.filter(u => u.email !== currentUser && !friendEmails.has(u.email));
}
