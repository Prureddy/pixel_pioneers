import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  vital?: string;
  value?: number;
  recommendation?: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export function AlertPanel({ alerts, onAcknowledge, onDismiss }: AlertPanelProps) {
  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'info': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 fill-current" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const time = new Date(timestamp);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card className="p-6 bg-glass backdrop-blur-md border-glass-border shadow-glass">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Active Alerts</h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {alerts.filter(a => !a.acknowledged).length} Active
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-success mb-3" />
            <p className="text-muted-foreground">No active alerts</p>
            <p className="text-sm text-muted-foreground">All patients stable</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                alert.acknowledged 
                  ? 'opacity-60 bg-muted/30 border-border' 
                  : `${getSeverityColor(alert.type)} ${alert.type === 'critical' ? 'animate-pulse-glow' : ''}`
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.type)}
                  <div>
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground">{alert.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
                  {!alert.acknowledged && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-success/20"
                        onClick={() => onAcknowledge(alert.id)}
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                        onClick={() => onDismiss(alert.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm mb-2">{alert.description}</p>
              
              {alert.vital && alert.value && (
                <div className="text-xs text-muted-foreground mb-2">
                  <strong>{alert.vital}:</strong> {alert.value}
                </div>
              )}
              
              {alert.recommendation && (
                <div className="text-xs p-2 rounded bg-accent/30 border-l-2 border-primary">
                  <strong>Recommendation:</strong> {alert.recommendation}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}