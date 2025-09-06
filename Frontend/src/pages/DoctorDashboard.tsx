import { useState } from 'react';
import { PatientCard } from '@/components/PatientCard';
import { VitalsDashboard } from '@/components/VitalsDashboard';
import { AlertPanel } from '@/components/AlertPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  Activity, 
  AlertTriangle,
  Clock,
  ArrowLeft
} from 'lucide-react';

// Mock data
const mockPatients = [
  {
    id: '001',
    name: 'Sarah Johnson',
    age: 45,
    gender: 'Female',
    room: '301A',
    condition: 'stable' as const,
    lastUpdate: '2 min ago',
    vitals: {
      heartRate: 72,
      bloodPressure: '120/80',
      temperature: 98.6,
      oxygenSat: 98
    }
  },
  {
    id: '002',
    name: 'Michael Chen',
    age: 62,
    gender: 'Male',
    room: '302B',
    condition: 'warning' as const,
    lastUpdate: '1 min ago',
    vitals: {
      heartRate: 105,
      bloodPressure: '145/95',
      temperature: 99.2,
      oxygenSat: 94
    }
  },
  {
    id: '003',
    name: 'Emily Rodriguez',
    age: 38,
    gender: 'Female',
    room: '303A',
    condition: 'critical' as const,
    lastUpdate: '30 sec ago',
    vitals: {
      heartRate: 125,
      bloodPressure: '160/110',
      temperature: 101.2,
      oxygenSat: 88
    }
  },
  {
    id: '004',
    name: 'Robert Wilson',
    age: 71,
    gender: 'Male',
    room: '304B',
    condition: 'stable' as const,
    lastUpdate: '5 min ago',
    vitals: {
      heartRate: 68,
      bloodPressure: '118/75',
      temperature: 98.4,
      oxygenSat: 97
    }
  }
];

const mockAlerts = [
  {
    id: 'alert-001',
    patientId: '003',
    patientName: 'Emily Rodriguez',
    type: 'critical' as const,
    title: 'Critical Heart Rate',
    description: 'Heart rate has exceeded 120 bpm for 10 minutes',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    acknowledged: false,
    vital: 'Heart Rate',
    value: 125,
    recommendation: 'Immediate medical attention required. Consider cardiac monitoring.'
  },
  {
    id: 'alert-002',
    patientId: '002',
    patientName: 'Michael Chen',
    type: 'warning' as const,
    title: 'Elevated Blood Pressure',
    description: 'Blood pressure readings consistently above normal range',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    acknowledged: false,
    vital: 'Blood Pressure',
    value: 145,
    recommendation: 'Monitor closely and consider medication adjustment.'
  },
  {
    id: 'alert-003',
    patientId: '003',
    patientName: 'Emily Rodriguez',
    type: 'warning' as const,
    title: 'Low Oxygen Saturation',
    description: 'SpO2 below 90% threshold',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    acknowledged: false,
    vital: 'Oxygen Saturation',
    value: 88,
    recommendation: 'Check airway, consider supplemental oxygen.'
  }
];

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState(mockAlerts);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.room?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getPatientById = (id: string) => {
    return mockPatients.find(p => p.id === id);
  };

  if (selectedPatient) {
    const patient = getPatientById(selectedPatient);
    if (!patient) return null;

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedPatient(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Patient Monitor</h1>
          </div>
          
          <VitalsDashboard 
            patientId={patient.id}
            patientName={patient.name}
            isRealTime={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-subtle text-white p-6 shadow-glass-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
              <p className="opacity-90">Patient Monitoring System</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Clock className="w-3 h-3 mr-1" />
                {new Date().toLocaleTimeString()}
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                Dr. Amanda Smith
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6" />
                <div>
                  <p className="text-2xl font-bold">{mockPatients.length}</p>
                  <p className="text-sm opacity-90">Total Patients</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6" />
                <div>
                  <p className="text-2xl font-bold">
                    {mockPatients.filter(p => p.condition === 'stable').length}
                  </p>
                  <p className="text-sm opacity-90">Stable</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <p className="text-2xl font-bold">
                    {mockPatients.filter(p => p.condition === 'warning').length}
                  </p>
                  <p className="text-sm opacity-90">Warning</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
                <div>
                  <p className="text-2xl font-bold">
                    {mockPatients.filter(p => p.condition === 'critical').length}
                  </p>
                  <p className="text-sm opacity-90">Critical</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patients Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-glass backdrop-blur-md border-glass-border"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Patient Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => setSelectedPatient(patient.id)}
                />
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-1">
            <AlertPanel
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onDismiss={handleDismissAlert}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
