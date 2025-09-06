import { useState, useEffect } from 'react';
import { VitalChart } from './VitalChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Thermometer, Activity, Droplets, Clock, Calendar } from 'lucide-react';

interface VitalsDashboardProps {
  patientId: string;
  patientName: string;
  isRealTime?: boolean;
}

export function VitalsDashboard({ patientId, patientName, isRealTime = true }: VitalsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [vitalsData, setVitalsData] = useState<any>({});

  // Mock data generator
  const generateMockData = (hours: number) => {
    const now = new Date();
    const data = [];
    
    for (let i = hours * 12; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60000); // 5-minute intervals
      data.push({
        time: time.toISOString(),
        heartRate: Math.floor(Math.random() * 30) + 70 + (Math.sin(i / 10) * 10),
        bloodPressureSystolic: Math.floor(Math.random() * 20) + 110 + (Math.sin(i / 8) * 5),
        bloodPressureDiastolic: Math.floor(Math.random() * 15) + 70 + (Math.sin(i / 8) * 3),
        temperature: 98.6 + (Math.random() - 0.5) * 2 + (Math.sin(i / 15) * 0.5),
        oxygenSaturation: Math.floor(Math.random() * 5) + 95 + (Math.sin(i / 12) * 2),
        respirationRate: Math.floor(Math.random() * 8) + 16 + (Math.sin(i / 7) * 2),
      });
    }
    return data;
  };

  useEffect(() => {
    const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '24h' ? 24 : 168;
    const data = generateMockData(hours);
    
    setVitalsData({
      heartRate: data.map(d => ({ time: d.time, value: d.heartRate })),
      bloodPressureSystolic: data.map(d => ({ time: d.time, value: d.bloodPressureSystolic })),
      bloodPressureDiastolic: data.map(d => ({ time: d.time, value: d.bloodPressureDiastolic })),
      temperature: data.map(d => ({ time: d.time, value: d.temperature })),
      oxygenSaturation: data.map(d => ({ time: d.time, value: d.oxygenSaturation })),
      respirationRate: data.map(d => ({ time: d.time, value: d.respirationRate })),
    });
  }, [timeRange]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setVitalsData((prev: any) => {
        const now = new Date().toISOString();
        const newPoint = {
          time: now,
          heartRate: Math.floor(Math.random() * 30) + 70,
          bloodPressureSystolic: Math.floor(Math.random() * 20) + 110,
          bloodPressureDiastolic: Math.floor(Math.random() * 15) + 70,
          temperature: 98.6 + (Math.random() - 0.5) * 2,
          oxygenSaturation: Math.floor(Math.random() * 5) + 95,
          respirationRate: Math.floor(Math.random() * 8) + 16,
        };

        return {
          heartRate: [...prev.heartRate.slice(-50), { time: now, value: newPoint.heartRate }],
          bloodPressureSystolic: [...prev.bloodPressureSystolic.slice(-50), { time: now, value: newPoint.bloodPressureSystolic }],
          bloodPressureDiastolic: [...prev.bloodPressureDiastolic.slice(-50), { time: now, value: newPoint.bloodPressureDiastolic }],
          temperature: [...prev.temperature.slice(-50), { time: now, value: newPoint.temperature }],
          oxygenSaturation: [...prev.oxygenSaturation.slice(-50), { time: now, value: newPoint.oxygenSaturation }],
          respirationRate: [...prev.respirationRate.slice(-50), { time: now, value: newPoint.respirationRate }],
        };
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isRealTime]);

  const timeRangeOptions = [
    { value: '1h', label: '1H', icon: Clock },
    { value: '6h', label: '6H', icon: Clock },
    { value: '24h', label: '24H', icon: Clock },
    { value: '7d', label: '7D', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-warm text-white shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{patientName}</h2>
            <p className="opacity-90">Patient ID: {patientId}</p>
          </div>
          <div className="flex items-center gap-2">
            {isRealTime && (
              <Badge className="bg-white/20 text-white border-white/30 animate-pulse-glow">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                Live
              </Badge>
            )}
            <Badge className="bg-white/20 text-white border-white/30">
              Last Update: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Time Range:</span>
        {timeRangeOptions.map((option) => (
          <Button
            key={option.value}
            variant={timeRange === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(option.value as any)}
            className="h-8"
          >
            <option.icon className="w-3 h-3 mr-1" />
            {option.label}
          </Button>
        ))}
      </div>

      {/* Vital Signs Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cardiac">Cardiac</TabsTrigger>
          <TabsTrigger value="respiratory">Respiratory</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VitalChart
              data={vitalsData.heartRate || []}
              title="Heart Rate"
              unit="bpm"
              color="hsl(var(--destructive))"
              normalRange={{ min: 60, max: 100 }}
            />
            <VitalChart
              data={vitalsData.bloodPressureSystolic || []}
              title="Blood Pressure (Systolic)"
              unit="mmHg"
              color="hsl(var(--primary))"
              normalRange={{ min: 90, max: 140 }}
            />
            <VitalChart
              data={vitalsData.temperature || []}
              title="Temperature"
              unit="°F"
              color="hsl(var(--warning))"
              normalRange={{ min: 97, max: 99 }}
            />
            <VitalChart
              data={vitalsData.oxygenSaturation || []}
              title="Oxygen Saturation"
              unit="%"
              color="hsl(var(--success))"
              normalRange={{ min: 95, max: 100 }}
            />
            <VitalChart
              data={vitalsData.respirationRate || []}
              title="Respiration Rate"
              unit="breaths/min"
              color="hsl(var(--accent-foreground))"
              normalRange={{ min: 12, max: 20 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="cardiac" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VitalChart
              data={vitalsData.heartRate || []}
              title="Heart Rate"
              unit="bpm"
              color="hsl(var(--destructive))"
              normalRange={{ min: 60, max: 100 }}
            />
            <Card className="p-6 bg-glass backdrop-blur-md border-glass-border shadow-glass">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-destructive" />
                <h3 className="text-lg font-semibold">Cardiac Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-sm font-medium">Heart Rhythm</p>
                  <p className="text-xs text-muted-foreground">Regular sinus rhythm detected</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-sm font-medium">Variability</p>
                  <p className="text-xs text-muted-foreground">Normal heart rate variability</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="respiratory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VitalChart
              data={vitalsData.respirationRate || []}
              title="Respiration Rate"
              unit="breaths/min"
              color="hsl(var(--accent-foreground))"
              normalRange={{ min: 12, max: 20 }}
            />
            <VitalChart
              data={vitalsData.oxygenSaturation || []}
              title="Oxygen Saturation"
              unit="%"
              color="hsl(var(--success))"
              normalRange={{ min: 95, max: 100 }}
            />
          </div>
        </TabsContent>

        <TabsContent value="temperature" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VitalChart
              data={vitalsData.temperature || []}
              title="Body Temperature"
              unit="°F"
              color="hsl(var(--warning))"
              normalRange={{ min: 97, max: 99 }}
            />
            <Card className="p-6 bg-glass backdrop-blur-md border-glass-border shadow-glass">
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="w-6 h-6 text-warning" />
                <h3 className="text-lg font-semibold">Temperature Analysis</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-sm font-medium">Trend</p>
                  <p className="text-xs text-muted-foreground">Stable within normal range</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/30">
                  <p className="text-sm font-medium">Pattern</p>
                  <p className="text-xs text-muted-foreground">Normal circadian variation</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blood-pressure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VitalChart
              data={vitalsData.bloodPressureSystolic || []}
              title="Systolic Pressure"
              unit="mmHg"
              color="hsl(var(--primary))"
              normalRange={{ min: 90, max: 140 }}
            />
            <VitalChart
              data={vitalsData.bloodPressureDiastolic || []}
              title="Diastolic Pressure"
              unit="mmHg"
              color="hsl(var(--primary-glow))"
              normalRange={{ min: 60, max: 90 }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}