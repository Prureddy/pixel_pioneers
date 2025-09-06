import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, AlertTriangle, Activity, Thermometer } from 'lucide-react';

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    room?: string;
    condition: 'stable' | 'warning' | 'critical';
    lastUpdate: string;
    vitals: {
      heartRate: number;
      bloodPressure: string;
      temperature: number;
      oxygenSat: number;
    };
  };
  onClick: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'stable': return 'text-success bg-success/10 border-success/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20 animate-pulse-glow';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'stable': return <Activity className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <Heart className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Card 
      className="p-4 bg-glass backdrop-blur-md border-glass-border shadow-glass hover:shadow-glow transition-all duration-300 cursor-pointer group animate-fade-in"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={`/api/placeholder/48/48?text=${patient.name.split(' ').map(n => n[0]).join('')}`} />
            <AvatarFallback className="bg-gradient-warm text-white">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {patient.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {patient.age}y • {patient.gender} {patient.room && `• Room ${patient.room}`}
            </p>
          </div>
        </div>
        <Badge className={`${getConditionColor(patient.condition)} border`}>
          {getConditionIcon(patient.condition)}
          <span className="ml-1 capitalize">{patient.condition}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30">
          <Heart className="w-4 h-4 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Heart Rate</p>
            <p className="text-sm font-semibold">{patient.vitals.heartRate} bpm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/30">
          <Thermometer className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Temperature</p>
            <p className="text-sm font-semibold">{patient.vitals.temperature}°F</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>BP: {patient.vitals.bloodPressure}</span>
        <span>SpO2: {patient.vitals.oxygenSat}%</span>
        <span>Updated: {patient.lastUpdate}</span>
      </div>
    </Card>
  );
}