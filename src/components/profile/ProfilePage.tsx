import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Calendar, Trophy, Flame, Target, 
  Edit3, Camera, Palette, Save, LogOut, ChevronRight,
  Award, Star, Zap, Heart, Moon, Droplets, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HealthScoreCard } from '@/components/healthscore/HealthScoreCard';
import { calculateHealthScore, calculateStreak, getLast30DaysEntries, getWeekSummary } from '@/lib/store';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  level: 'Rookie' | 'Warrior' | 'Legend' | 'Master';
  xp: number;
  streak: number;
  totalLogs: number;
}

const avatarStyles = [
  { id: 'avataaars', name: 'Cartoon', icon: '👤' },
  { id: 'bottts', name: 'Robot', icon: '🤖' },
  { id: 'fun-emoji', name: 'Emoji', icon: '😊' },
  { id: 'lorelei', name: 'Artistic', icon: '🎨' },
  { id: 'notionists', name: 'Minimal', icon: '✏️' },
  { id: 'open-peeps', name: 'Sketch', icon: '✍️' },
];

const avatarColors = [
  { id: 'b6e3f4', name: 'Sky', bg: 'bg-sky-200' },
  { id: 'c0aede', name: 'Lavender', bg: 'bg-purple-200' },
  { id: 'd1d4f9', name: 'Periwinkle', bg: 'bg-indigo-200' },
  { id: 'ffd5dc', name: 'Rose', bg: 'bg-pink-200' },
  { id: 'ffdfbf', name: 'Peach', bg: 'bg-orange-200' },
  { id: 'c7f9cc', name: 'Mint', bg: 'bg-green-200' },
];

const badges = [
  { id: 'early-bird', name: 'Early Bird', icon: Moon, color: 'bg-amber-100 text-amber-700', desc: 'Logged 7 days before 8am' },
  { id: 'hydration-hero', name: 'Hydration Hero', icon: Droplets, color: 'bg-blue-100 text-blue-700', desc: 'Drank 3L water for 7 days' },
  { id: 'mood-master', name: 'Mood Master', icon: Heart, color: 'bg-rose-100 text-rose-700', desc: 'Positive mood for 10 days' },
  { id: 'streak-star', name: 'Streak Star', icon: Flame, color: 'bg-orange-100 text-orange-700', desc: '30-day logging streak' },
  { id: 'sleep-guru', name: 'Sleep Guru', icon: Moon, color: 'bg-indigo-100 text-indigo-700', desc: '8+ hours sleep for 14 days' },
  { id: 'consistent', name: 'Consistent', icon: Target, color: 'bg-green-100 text-green-700', desc: 'Logged all metrics for 30 days' },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'avatar' | 'badges' | 'settings'>('overview');
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Demo User',
    email: 'demo@biosync.health',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo&backgroundColor=b6e3f4',
    bio: 'Health enthusiast on a journey to better wellbeing! 🌱',
    joinedAt: '2026-01-15',
    level: 'Warrior',
    xp: 2450,
    streak: 12,
    totalLogs: 156,
  });

  const [avatarConfig, setAvatarConfig] = useState({
    style: 'avataaars',
    backgroundColor: 'b6e3f4',
    seed: 'demo',
  });

  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    // Load auth data
    const auth = localStorage.getItem('biosync_auth');
    if (auth) {
      const { user } = JSON.parse(auth);
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }));
      setEditForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }));
    }
  }, []);

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
    // Update localStorage
    const auth = JSON.parse(localStorage.getItem('biosync_auth') || '{}');
    auth.user = { ...auth.user, name: editForm.name, bio: editForm.bio };
    localStorage.setItem('biosync_auth', JSON.stringify(auth));
  };

  const handleLogout = () => {
    localStorage.removeItem('biosync_auth');
    navigate('/login');
  };

  const updateAvatar = () => {
    const newAvatar = `https://api.dicebear.com/7.x/${avatarConfig.style}/svg?seed=${avatarConfig.seed}&backgroundColor=${avatarConfig.backgroundColor}`;
    setAvatarConfig(prev => ({ ...prev, seed: Math.random().toString(36).substring(7) }));
    setProfile(prev => ({ ...prev, avatar: newAvatar }));
    setEditForm(prev => ({ ...prev, avatar: newAvatar }));
  };

  // Calculate real health metrics from data
  const entries = getLast30DaysEntries();
  const healthScore = calculateHealthScore(entries);
  const streak = calculateStreak(entries);
  const summary = getWeekSummary(entries);

  // Calculate individual metric scores
  const sleepScore = summary.avgSleep >= 7 && summary.avgSleep <= 9 
    ? 82 
    : Math.round((summary.avgSleep / 9) * 100);
  const waterScore = summary.avgWater >= 8 
    ? 75 
    : Math.round((summary.avgWater / 8) * 100);
  const moodScore = Math.round((summary.avgMood / 5) * 100);
  const consistencyScore = Math.round((entries.length / 30) * 100);

  const healthScoreData = {
    overall: healthScore,
    sleep: sleepScore,
    water: waterScore,
    mood: moodScore,
    consistency: consistencyScore,
    streak: streak,
    level: profile.level,
    xp: profile.xp,
    xpToNext: 3000,
    badges: ['Early Bird', 'Hydration Hero', 'Mood Master'],
  };

  const stats = [
    { label: 'Total Logs', value: profile.totalLogs, icon: Activity, color: 'bg-blue-500' },
    { label: 'Current Streak', value: `${streak} days`, icon: Flame, color: 'bg-orange-500' },
    { label: 'Level', value: profile.level, icon: Trophy, color: 'bg-purple-500' },
    { label: 'XP Points', value: profile.xp, icon: Star, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and customize your experience</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-sage" />
        
        {/* Avatar & Info */}
        <div className="px-6 pb-6">
          <div className="relative flex flex-col md:flex-row md:items-end -mt-12 mb-4 gap-4">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-2xl bg-white shadow-lg border-4 border-white"
              />
              <button
                onClick={() => setActiveTab('avatar')}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-lg shadow-md flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <div className="flex gap-2 self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border mb-6">
            {(['overview', 'avatar', 'badges', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full mt-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button onClick={handleSave} variant="glow">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground">{profile.bio}</p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className="p-4 bg-muted/50 rounded-xl text-center">
                          <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'avatar' && (
            <div className="space-y-6">
              {/* Current Avatar */}
              <div className="text-center">
                <img
                  src={`https://api.dicebear.com/7.x/${avatarConfig.style}/svg?seed=${avatarConfig.seed}&backgroundColor=${avatarConfig.backgroundColor}`}
                  alt="Avatar preview"
                  className="w-32 h-32 mx-auto rounded-2xl bg-white shadow-lg"
                />
                <p className="text-sm text-muted-foreground mt-3">Preview</p>
              </div>

              {/* Style Selection */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4" />
                  Avatar Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {avatarStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setAvatarConfig(prev => ({ ...prev, style: style.id }))}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        avatarConfig.style === style.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <p className="text-xs mt-1">{style.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">Background Color</label>
                <div className="flex flex-wrap gap-3">
                  {avatarColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setAvatarConfig(prev => ({ ...prev, backgroundColor: color.id }))}
                      className={`w-12 h-12 rounded-xl ${color.bg} border-2 transition-all ${
                        avatarConfig.backgroundColor === color.id
                          ? 'border-primary scale-110'
                          : 'border-transparent'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Randomize */}
              <Button onClick={updateAvatar} variant="outline" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Randomize Avatar
              </Button>

              <Button 
                onClick={() => {
                  const newAvatar = `https://api.dicebear.com/7.x/${avatarConfig.style}/svg?seed=${avatarConfig.seed}&backgroundColor=${avatarConfig.backgroundColor}`;
                  setProfile(prev => ({ ...prev, avatar: newAvatar }));
                  setActiveTab('overview');
                }} 
                variant="glow" 
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Avatar
              </Button>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Achievements</h3>
                <span className="text-sm text-muted-foreground">6 of 12 unlocked</span>
              </div>
              <div className="grid gap-3">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  const isUnlocked = ['early-bird', 'hydration-hero', 'mood-master'].includes(badge.id);
                  
                  return (
                    <div
                      key={badge.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        isUnlocked
                          ? 'bg-white border-border'
                          : 'bg-muted/30 border-border/50 opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${isUnlocked ? badge.color : 'bg-gray-200 text-gray-400'} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{badge.name}</h4>
                          {isUnlocked && <Award className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{badge.desc}</p>
                      </div>
                      {isUnlocked ? (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Account Settings</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span>Change Email</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <span>Health Goals</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span>Notifications</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health Score */}
      <HealthScoreCard data={healthScoreData} />
    </div>
  );
}
