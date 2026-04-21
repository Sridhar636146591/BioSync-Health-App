import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    healthGoals: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const healthGoalOptions = [
    'Improve Sleep',
    'Drink More Water',
    'Better Mood',
    'Lose Weight',
    'Build Consistency',
    'Reduce Stress',
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('biosync_users') || '[]');
    const existingUser = users.find((u: any) => u.email === formData.email);
    
    if (existingUser) {
      setErrors({ email: 'An account with this email already exists' });
      setIsLoading(false);
      return;
    }
    
    // Create new user
    const newUser = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.email,
      goals: formData.healthGoals,
      joinedAt: new Date().toISOString(),
    };
    
    // Save to users list
    users.push(newUser);
    localStorage.setItem('biosync_users', JSON.stringify(users));
    
    // Store auth state
    localStorage.setItem('biosync_auth', JSON.stringify({
      isAuthenticated: true,
      user: {
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        goals: newUser.goals,
        joinedAt: newUser.joinedAt,
      }
    }));
    
    setIsLoading(false);
    navigate('/');
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter(g => g !== goal)
        : [...prev.healthGoals, goal]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sage/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-glow">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-primary">Join BioSync</h1>
          <p className="text-muted-foreground mt-2">Start your health journey today</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              1
            </div>
            <span className="text-sm font-medium hidden sm:inline">Account</span>
          </div>
          <div className="w-12 h-0.5 bg-muted">
            <div className={`h-full bg-primary transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:inline">Goals</span>
          </div>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-card border border-border p-8">
          {step === 1 ? (
            <form className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="text-sm text-red-500">{errors.acceptTerms}</p>}

              {/* Next Button */}
              <Button
                type="button"
                variant="glow"
                className="w-full py-3"
                onClick={handleNext}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">What are your health goals?</h2>
                <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
              </div>

              {/* Health Goals */}
              <div className="grid grid-cols-2 gap-3">
                {healthGoalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.healthGoals.includes(goal)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {formData.healthGoals.includes(goal) && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      {goal}
                    </div>
                  </button>
                ))}
              </div>

              {/* Avatar Preview */}
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-3">Your Avatar</p>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email || 'default'}`}
                  alt="Avatar preview"
                  className="w-20 h-20 mx-auto rounded-full bg-white shadow-md"
                />
                <p className="text-xs text-muted-foreground mt-2">Customize after signup</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="glow"
                  className="flex-1 py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
