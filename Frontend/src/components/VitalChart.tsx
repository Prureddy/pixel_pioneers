import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { Card } from '@/components/ui/card';

interface VitalData {
  time: string;
  value: number;
  normal?: boolean;
}

interface VitalChartProps {
  data: VitalData[];
  title: string;
  unit: string;
  color: string;
  normalRange?: { min: number; max: number };
}

export function VitalChart({ data, title, unit, color, normalRange }: VitalChartProps) {
  const formatTime = (timeStr: string) => {
    const time = new Date(timeStr);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isAbnormal = (value: number) => {
    if (!normalRange) return false;
    return value < normalRange.min || value > normalRange.max;
  };

  const latestValue = data[data.length - 1]?.value;
  const isCurrentAbnormal = latestValue && normalRange ? isAbnormal(latestValue) : false;

  return (
    <Card className="p-6 bg-glass backdrop-blur-md border-glass-border shadow-glass hover:shadow-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-bold ${isCurrentAbnormal ? 'text-destructive animate-pulse-glow' : 'text-primary'}`}>
              {latestValue || '--'}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
            {normalRange && (
              <span className="text-xs text-muted-foreground ml-2">
                Normal: {normalRange.min}-{normalRange.max}
              </span>
            )}
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${isCurrentAbnormal ? 'bg-destructive animate-pulse-glow' : 'bg-success'}`} />
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              tickFormatter={formatTime}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} ${unit}`, title]}
              labelFormatter={(time) => formatTime(time as string)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              dot={{ fill: color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: color, strokeWidth: 2 }}
            />
            {normalRange && (
              <>
                <Line 
                  type="monotone" 
                  dataKey={() => normalRange.min} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="2 2" 
                  strokeWidth={1}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey={() => normalRange.max} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="2 2" 
                  strokeWidth={1}
                  dot={false}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}