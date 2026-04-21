import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getCorrelations, type HealthEntry } from '@/lib/store';
import { TrendingUp, TrendingDown, Minus, Info, X } from 'lucide-react';

interface CorrelationHeatmapProps {
  entries: HealthEntry[];
}

interface HeatmapCell {
  factorA: string;
  factorB: string;
  value: number;
  absValue: number;
  direction: 'positive' | 'negative';
}

export function CorrelationHeatmap({ entries }: CorrelationHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  
  // Sequential animation phases
  useEffect(() => {
    const timer = setTimeout(() => setAnimationPhase(1), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const heatmapData = useMemo(() => {
    const correlations = getCorrelations(entries);
    const factors = ['Sleep', 'Mood', 'Water Intake', 'Exercise'];
    
    // Create a matrix
    const matrix: HeatmapCell[][] = [];
    
    for (let i = 0; i < factors.length; i++) {
      const row: HeatmapCell[] = [];
      for (let j = 0; j < factors.length; j++) {
        if (i === j) {
          // Diagonal - perfect correlation
          row.push({
            factorA: factors[i],
            factorB: factors[j],
            value: 1,
            absValue: 1,
            direction: 'positive',
          });
        } else {
          // Find correlation
          const corr = correlations.find(
            c => 
              (c.factorA === factors[i] && c.factorB === factors[j]) ||
              (c.factorA === factors[j] && c.factorB === factors[i])
          );
          
          if (corr) {
            row.push({
              factorA: factors[i],
              factorB: factors[j],
              value: corr.strength * (corr.direction === 'positive' ? 1 : -1),
              absValue: corr.strength,
              direction: corr.direction,
            });
          } else {
            row.push({
              factorA: factors[i],
              factorB: factors[j],
              value: 0,
              absValue: 0,
              direction: 'positive',
            });
          }
        }
      }
      matrix.push(row);
    }
    
    return { matrix, factors };
  }, [entries]);

  const getCellColor = (value: number, absValue: number) => {
    if (absValue === 0) return 'from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900';
    if (absValue === 1) return 'from-emerald-400 to-emerald-600';
    
    if (value > 0) {
      // Positive correlations - Green gradient scale
      if (absValue > 0.6) return 'from-emerald-400 to-emerald-600';
      if (absValue > 0.4) return 'from-green-400 to-green-500';
      if (absValue > 0.2) return 'from-lime-300 to-lime-400';
      return 'from-yellow-200 to-yellow-300';
    } else {
      // Negative correlations - Red/Orange gradient scale
      if (absValue > 0.6) return 'from-rose-500 to-rose-700';
      if (absValue > 0.4) return 'from-red-400 to-red-500';
      if (absValue > 0.2) return 'from-orange-300 to-orange-400';
      return 'from-amber-200 to-amber-300';
    }
  };

  const getCellGlow = (absValue: number) => {
    if (absValue > 0.7) return 'shadow-lg shadow-emerald-500/50';
    if (absValue > 0.5) return 'shadow-md shadow-green-500/30';
    if (absValue > 0.3) return 'shadow-sm';
    return '';
  };

  const getStrengthLabel = (absValue: number) => {
    if (absValue === 0) return 'No correlation';
    if (absValue === 1) return 'Perfect';
    if (absValue > 0.7) return 'Very Strong';
    if (absValue > 0.6) return 'Strong';
    if (absValue > 0.4) return 'Moderate';
    if (absValue > 0.2) return 'Weak';
    return 'Very Weak';
  };

  const getCorrelationIcon = (value: number) => {
    if (value > 0.2) return <TrendingUp className="h-3 w-3" />;
    if (value < -0.2) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <Card className="shadow-card-interactive opacity-0 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse" />
          Interactive Correlation Heatmap
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Click any cell for detailed analysis • Hover to preview
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-grid gap-2" style={{ minWidth: 'fit-content' }}>
              {/* Header Row */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                <div /> {/* Empty corner */}
                {heatmapData.factors.map((factor, idx) => (
                  <div
                    key={`header-${idx}`}
                    className="text-xs font-semibold text-muted-foreground text-center py-2 px-3 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {factor}
                  </div>
                ))}
              </div>
              
              {/* Data Rows */}
              {heatmapData.matrix.map((row, rowIdx) => (
                <div key={`row-${rowIdx}`} className="grid grid-cols-5 gap-2">
                  {/* Row Header */}
                  <div
                    className="text-xs font-semibold text-muted-foreground py-3 px-3 flex items-center opacity-0 animate-fade-in"
                    style={{ animationDelay: `${rowIdx * 100}ms` }}
                  >
                    {heatmapData.factors[rowIdx]}
                  </div>
                  
                  {/* Cells */}
                  {row.map((cell, colIdx) => {
                    const isSelected = selectedCell?.factorA === cell.factorA && selectedCell?.factorB === cell.factorB;
                    const isHovered = hoveredCell?.factorA === cell.factorA && hoveredCell?.factorB === cell.factorB;
                    
                    return (
                      <div
                        key={`cell-${rowIdx}-${colIdx}`}
                        className={cn(
                          'relative rounded-xl transition-all duration-300 cursor-pointer',
                          'bg-gradient-to-br',
                          getCellColor(cell.value, cell.absValue),
                          getCellGlow(cell.absValue),
                          'opacity-0 animate-fade-in',
                          isSelected
                            ? 'scale-110 ring-4 ring-primary ring-offset-2 z-10'
                            : isHovered
                            ? 'scale-105 ring-2 ring-white/50 z-10'
                            : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
                        )}
                        style={{ 
                          animationDelay: `${(rowIdx * 4 + colIdx) * 60}ms`,
                          minHeight: '56px',
                          minWidth: '70px',
                        }}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => setSelectedCell(isSelected ? null : cell)}
                      >
                        {/* Animated background shimmer */}
                        {cell.absValue > 0.4 && (
                          <div className="absolute inset-0 rounded-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                          {/* Direction icon */}
                          <div className={cn(
                            'text-white/90',
                            cell.absValue <= 0.3 && 'text-foreground/70'
                          )}>
                            {getCorrelationIcon(cell.value)}
                          </div>
                          
                          {/* Correlation value */}
                          <span className={cn(
                            'text-sm font-bold',
                            cell.absValue > 0.5 ? 'text-white drop-shadow-md' : 'text-foreground'
                          )}>
                            {cell.value.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Animated pulse for very strong correlations */}
                        {cell.absValue > 0.7 && cell.absValue < 1 && (
                          <div className="absolute inset-0 rounded-xl">
                            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Color Scale
            </h4>
            <div className="space-y-3">
              {/* Gradient scale visualization */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Strong +</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-gradient-to-r from-yellow-200 to-lime-300" />
                  <div className="flex-1 bg-gradient-to-r from-lime-300 to-green-400" />
                  <div className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <div className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-600">1.0</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Strong -</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-gradient-to-r from-amber-200 to-orange-300" />
                  <div className="flex-1 bg-gradient-to-r from-orange-300 to-red-400" />
                  <div className="flex-1 bg-gradient-to-r from-red-400 to-rose-500" />
                  <div className="flex-1 bg-gradient-to-r from-rose-500 to-rose-700" />
                </div>
                <span className="text-xs font-semibold text-rose-600">-1.0</span>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                  <span className="text-xs text-muted-foreground">Negative</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-muted-foreground">None</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Selected/ Hover Details */}
          {(selectedCell || hoveredCell) && (
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-primary/30 shadow-lg opacity-0 animate-fade-in relative">
              {/* Close button for selected */}
              {selectedCell && (
                <button
                  onClick={() => setSelectedCell(null)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/50 transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    (selectedCell || hoveredCell)!.value > 0
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                      : (selectedCell || hoveredCell)!.value < 0
                      ? 'bg-gradient-to-br from-rose-500 to-rose-700'
                      : 'bg-gradient-to-br from-slate-300 to-slate-400'
                  )}>
                    {getCorrelationIcon((selectedCell || hoveredCell)!.value)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {(selectedCell || hoveredCell)!.factorA} ↔ {(selectedCell || hoveredCell)!.factorB}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Correlation Analysis
                    </p>
                  </div>
                </div>
                <div className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5',
                  (selectedCell || hoveredCell)!.direction === 'positive'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : (selectedCell || hoveredCell)!.direction === 'negative'
                    ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                )}>
                  {getCorrelationIcon((selectedCell || hoveredCell)!.value)}
                  {(selectedCell || hoveredCell)!.direction === 'positive' ? 'Positive' : 
                   (selectedCell || hoveredCell)!.direction === 'negative' ? 'Negative' : 'None'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-700/50">
                  <div className="text-xs text-muted-foreground mb-1">Correlation</div>
                  <div className="text-2xl font-bold text-foreground">
                    {(selectedCell || hoveredCell)!.value.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-700/50">
                  <div className="text-xs text-muted-foreground mb-1">Strength</div>
                  <div className="text-2xl font-bold text-primary">
                    {getStrengthLabel((selectedCell || hoveredCell)!.absValue)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/50 dark:bg-slate-700/50">
                  <div className="text-xs text-muted-foreground mb-1">Impact</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    (selectedCell || hoveredCell)!.absValue > 0.6 ? 'text-emerald-600' :
                    (selectedCell || hoveredCell)!.absValue > 0.4 ? 'text-amber-600' :
                    'text-slate-600'
                  )}>
                    {(selectedCell || hoveredCell)!.absValue > 0.6 ? 'High' :
                     (selectedCell || hoveredCell)!.absValue > 0.4 ? 'Medium' : 'Low'}
                  </div>
                </div>
              </div>
              
              {/* Interpretation */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground leading-relaxed">
                    {(selectedCell || hoveredCell)!.absValue > 0.6 ? (
                      <><strong>Strong relationship:</strong> Changes in {(selectedCell || hoveredCell)!.factorA.toLowerCase()} are closely associated with changes in {(selectedCell || hoveredCell)!.factorB.toLowerCase()}. This is a key pattern in your health data.</>
                    ) : (selectedCell || hoveredCell)!.absValue > 0.4 ? (
                      <><strong>Moderate relationship:</strong> There's a noticeable connection between {(selectedCell || hoveredCell)!.factorA.toLowerCase()} and {(selectedCell || hoveredCell)!.factorB.toLowerCase()}, though other factors also play a role.</>
                    ) : (
                      <><strong>Weak relationship:</strong> The connection between {(selectedCell || hoveredCell)!.factorA.toLowerCase()} and {(selectedCell || hoveredCell)!.factorB.toLowerCase()} is minimal. Focus on stronger correlations for insights.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Key Insights */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Top Correlations
              </h4>
            </div>
            {(() => {
              const strongCorrelations = heatmapData.matrix
                .flat()
                .filter(cell => cell.absValue > 0.4 && cell.absValue < 1)
                .sort((a, b) => b.absValue - a.absValue)
                .slice(0, 4);
              
              return strongCorrelations.map((cell, idx) => (
                <button
                  key={`insight-${idx}`}
                  onClick={() => setSelectedCell(cell)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 rounded-lg transition-all duration-200 text-left',
                    'hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5',
                    'opacity-0 animate-fade-in',
                    selectedCell?.factorA === cell.factorA && selectedCell?.factorB === cell.factorB
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 ring-2 ring-primary/30'
                      : 'bg-muted/30'
                  )}
                  style={{ animationDelay: `${(idx + 20) * 60}ms` }}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    cell.direction === 'positive'
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                      : 'bg-gradient-to-br from-rose-500 to-rose-700'
                  )}>
                    {getCorrelationIcon(cell.value)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground mb-1">
                      {cell.factorA} & {cell.factorB}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStrengthLabel(cell.absValue)} {cell.direction} correlation
                    </p>
                  </div>
                  <div className={cn(
                    'px-2 py-1 rounded-md text-xs font-bold',
                    cell.value > 0
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  )}>
                    {cell.value.toFixed(2)}
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
