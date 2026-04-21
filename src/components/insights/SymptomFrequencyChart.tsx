import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle } from 'lucide-react';
import type { HealthEntry } from '@/lib/store';

interface SymptomFrequencyChartProps {
  entries: HealthEntry[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function SymptomFrequencyChart({ entries }: SymptomFrequencyChartProps) {
  const data = useMemo(() => {
    const symptomCount: Record<string, number> = {};
    
    entries.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 symptoms
  }, [entries]);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p>No symptoms logged yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => [`${value} occurrences`, 'Frequency']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
