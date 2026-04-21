import { useEffect, useRef, useState, useMemo } from 'react';
import { Activity, Droplets, Moon, Heart, Info } from 'lucide-react';
import { calculateHealthScore, calculateStreak, getLast30DaysEntries, getWeekSummary } from '@/lib/store';

interface BodyMetrics {
  sleep: number;
  hydration: number;
  mood: number;
  energy: number;
}

export function Body3DPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  
  // Calculate real metrics from health data
  const entries = getLast30DaysEntries();
  const healthScore = calculateHealthScore(entries);
  const streak = calculateStreak(entries);
  const summary = getWeekSummary(entries);
  
  // Calculate individual metrics (0-100 scale)
  const metrics = useMemo(() => {
    const sleepScore = Math.min(100, (summary.avgSleep / 9) * 100);
    const hydrationScore = Math.min(100, (summary.avgWater / 8) * 100);
    const moodScore = (summary.avgMood / 5) * 100;
    const exerciseScore = Math.min(100, (summary.totalExercise / (entries.length * 30)) * 100);
    
    return {
      sleep: Math.round(sleepScore),
      hydration: Math.round(hydrationScore),
      mood: Math.round(moodScore),
      energy: Math.round(exerciseScore),
    };
  }, [entries, summary]);

  // Simulated 3D visualization using Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const drawBody = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.min(canvas.width, canvas.height) / 300;

      // Background glow based on overall health
      const overallHealth = (metrics.sleep + metrics.hydration + metrics.mood + metrics.energy) / 4;
      const glowIntensity = overallHealth / 100;
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200 * scale);
      gradient.addColorStop(0, `rgba(16, 185, 129, ${0.1 * glowIntensity})`);
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw head (Brain - Sleep indicator)
      const headY = centerY - 100 * scale;
      const brainGlow = metrics.sleep / 100;
      
      ctx.beginPath();
      ctx.arc(centerX, headY, 35 * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${0.3 + brainGlow * 0.4})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.6 + brainGlow * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Brain glow effect
      if (metrics.sleep > 70) {
        ctx.beginPath();
        ctx.arc(centerX, headY, (40 + Math.sin(time * 0.05) * 3) * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(time * 0.05) * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw body torso (Hydration indicator)
      const torsoY = centerY;
      const hydrationAlpha = metrics.hydration / 100;
      
      ctx.beginPath();
      ctx.ellipse(centerX, torsoY, 50 * scale, 70 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + hydrationAlpha * 0.3})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 + hydrationAlpha * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Water level indicator inside body
      ctx.beginPath();
      ctx.ellipse(centerX, torsoY + (1 - hydrationAlpha) * 30 * scale, 
        45 * scale * hydrationAlpha, 65 * scale * hydrationAlpha, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + hydrationAlpha * 0.2})`;
      ctx.fill();

      // Draw heart (Mood indicator)
      const heartX = centerX + 25 * scale;
      const heartY = centerY - 10 * scale;
      const heartPulse = 1 + Math.sin(time * 0.1) * 0.1;
      const moodColor = metrics.mood > 80 ? '#10B981' : metrics.mood > 60 ? '#F59E0B' : '#EF4444';
      
      ctx.save();
      ctx.translate(heartX, heartY);
      ctx.scale(heartPulse, heartPulse);
      
      ctx.beginPath();
      ctx.moveTo(0, 5 * scale);
      ctx.bezierCurveTo(-10 * scale, -10 * scale, -20 * scale, 0, 0, 20 * scale);
      ctx.bezierCurveTo(20 * scale, 0, 10 * scale, -10 * scale, 0, 5 * scale);
      ctx.fillStyle = moodColor;
      ctx.fill();
      
      ctx.restore();

      // Draw limbs
      // Arms
      ctx.beginPath();
      ctx.moveTo(centerX - 50 * scale, centerY - 30 * scale);
      ctx.lineTo(centerX - 90 * scale, centerY + 20 * scale);
      ctx.moveTo(centerX + 50 * scale, centerY - 30 * scale);
      ctx.lineTo(centerX + 90 * scale, centerY + 20 * scale);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 8 * scale;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(centerX - 20 * scale, centerY + 70 * scale);
      ctx.lineTo(centerX - 30 * scale, centerY + 160 * scale);
      ctx.moveTo(centerX + 20 * scale, centerY + 70 * scale);
      ctx.lineTo(centerX + 30 * scale, centerY + 160 * scale);
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      ctx.lineWidth = 10 * scale;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Labels
      ctx.font = `${12 * scale}px Inter, sans-serif`;
      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      
      ctx.fillText('Brain', centerX, headY + 55 * scale);
      ctx.fillText('Hydration', centerX, torsoY + 85 * scale);
      ctx.fillText('Heart', heartX, heartY + 30 * scale);

      time++;
      animationId = requestAnimationFrame(drawBody);
    };

    drawBody();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [metrics]);

  const bodyParts = [
    { id: 'brain', name: 'Brain', icon: Moon, metric: metrics.sleep, color: 'bg-purple-500', desc: 'Sleep quality affects cognitive function and recovery.' },
    { id: 'body', name: 'Hydration', icon: Droplets, metric: metrics.hydration, color: 'bg-blue-500', desc: 'Water intake is crucial for cellular function and energy.' },
    { id: 'heart', name: 'Mood', icon: Heart, metric: metrics.mood, color: 'bg-green-500', desc: 'Emotional wellbeing impacts overall health and immunity.' },
    { id: 'energy', name: 'Energy', icon: Activity, metric: metrics.energy, color: 'bg-amber-500', desc: 'Energy levels reflect your overall vitality and readiness.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">3D Body Visualization</h1>
        <p className="text-muted-foreground">Interactive view of your health metrics</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 3D Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Body Model
              </h3>
              <span className="text-xs text-muted-foreground">Click parts for details</span>
            </div>
            <div className="relative aspect-square max-h-[500px]">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full h-full cursor-pointer"
                onClick={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = (e.clientX - rect.left) * (600 / rect.width);
                    const y = (e.clientY - rect.top) * (600 / rect.height);
                    // Simple hit detection
                    if (y < 200) setSelectedPart('brain');
                    else if (y > 250 && y < 450) setSelectedPart('body');
                    else if (x > 350 && y > 200 && y < 350) setSelectedPart('heart');
                    else setSelectedPart('energy');
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="space-y-4">
          {bodyParts.map((part) => {
            const Icon = part.icon;
            const isSelected = selectedPart === part.id;
            
            return (
              <button
                key={part.id}
                onClick={() => setSelectedPart(isSelected ? null : part.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-white hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${part.color} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-white`} style={{ color: part.color.replace('bg-', '') }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{part.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${part.color} transition-all duration-500`}
                          style={{ width: `${part.metric}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{part.metric}%</span>
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="pt-3 border-t border-border animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {part.desc}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        part.metric >= 80 ? 'bg-green-100 text-green-700' :
                        part.metric >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {part.metric >= 80 ? 'Excellent' : part.metric >= 60 ? 'Good' : 'Needs Attention'}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}

          {/* Overall Health Score */}
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">Overall Health Score</h4>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">
                {healthScore}
              </div>
              <div className="flex-1">
                <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on 30-day average</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
