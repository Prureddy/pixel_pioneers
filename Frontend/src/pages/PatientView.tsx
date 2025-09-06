import { useState, useEffect } from "react";
import { VitalsDashboard } from "@/components/VitalsDashboard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Clock, 
  Heart, 
  Thermometer, 
  Activity, 
  Droplets,
  Phone,
  MessageCircle
} from "lucide-react";

// Mock patient data
const mockPatient = {
  id: "P001",
  name: "John Anderson",
  age: 58,
  gender: "Male",
  dateOfBirth: "1965-03-15",
  bloodType: "A+",
  allergies: ["Penicillin", "Shellfish"],
  emergencyContact: {
    name: "Mary Anderson",
    relationship: "Spouse",
    phone: "(555) 123-4567",
  },
  doctor: {
    name: "Dr. Amanda Smith",
    department: "Cardiology",
    phone: "(555) 987-6543",
  },
  conditions: ["Hypertension", "Type 2 Diabetes"],
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
    { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily" },
  ],
};

const healthInsights = [
  {
    type: "positive",
    title: "Heart Rate Stable",
    description: "Your heart rate has been consistently within the normal range over the past 24 hours.",
    icon: Heart,
    color: "text-green-500",
  },
  {
    type: "neutral",
    title: "Blood Pressure Monitoring",
    description: "Your blood pressure shows slight elevation. Continue taking medication as prescribed.",
    icon: Activity,
    color: "text-yellow-500",
  },
  {
    type: "positive",
    title: "Temperature Normal",
    description: "Body temperature remains stable and within healthy range.",
    icon: Thermometer,
    color: "text-green-500",
  },
];

export default function PatientView() {
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "health-info">("overview");

  // Chatbase embed script
  useEffect(() => {
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        if (!window.chatbase.q) window.chatbase.q = [];
        window.chatbase.q.push(args);
      };
      window.chatbase = new Proxy(window.chatbase, {
        get(target, prop) {
          if (prop === "q") return target.q;
          return (...args) => target(prop, ...args);
        },
      });
    }
    const onLoad = () => {
      const script = document.createElement("script");
      script.src = "https://www.chatbase.co/embed.min.js";
      script.id = "6qJi4KpsuUDkXM45FHh4u";
      // @ts-ignore
      script.domain = "www.chatbase.co";
      document.body.appendChild(script);
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="bg-black text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{mockPatient.name}</h1>
                <p className="opacity-90">Patient ID: {mockPatient.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <Clock className="w-3 h-3 mr-1" />
                Live Monitoring
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                Last Update: {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-lg font-bold text-white">72</p>
                  <p className="text-xs text-gray-200">Heart Rate</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-lg font-bold text-white">120/80</p>
                  <p className="text-xs text-gray-200">Blood Pressure</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-white">98.6°F</p>
                  <p className="text-xs text-gray-200">Temperature</p>
                </div>
              </div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-lg font-bold text-white">98%</p>
                  <p className="text-xs text-gray-200">Oxygen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "vitals", label: "Vital Signs", icon: Heart },
            { id: "health-info", label: "Health Information", icon: User },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as "overview" | "vitals" | "health-info")}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Health Insights</h2>
              {healthInsights.map((insight, index) => (
                <Card
                  key={index}
                  className="p-4 bg-white/50 backdrop-blur-md border border-white/20 shadow-md animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    <insight.icon className={`w-6 h-6 mt-1 ${insight.color}`} />
                    <div>
                      <h3 className="font-semibold text-foreground">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Emergency & Doctor */}
            <div className="space-y-6">
              <Card className="p-4 bg-white/50 backdrop-blur-md border border-white/20 shadow-md">
                <h3 className="font-semibold text-foreground mb-3">Emergency Contact</h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{mockPatient.emergencyContact.name}</p>
                  <p className="text-xs text-muted-foreground">{mockPatient.emergencyContact.relationship}</p>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    <Phone className="w-3 h-3 mr-2" />
                    {mockPatient.emergencyContact.phone}
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-white/50 backdrop-blur-md border border-white/20 shadow-md">
                <h3 className="font-semibold text-foreground mb-3">Your Doctor</h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{mockPatient.doctor.name}</p>
                  <p className="text-xs text-muted-foreground">{mockPatient.doctor.department}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "vitals" && (
          <VitalsDashboard patientId={mockPatient.id} patientName={mockPatient.name} isRealTime={true} />
        )}

        {activeTab === "health-info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="p-6 bg-white/50 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-medium">{mockPatient.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gender:</span>
                  <span className="font-medium">{mockPatient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium">{new Date(mockPatient.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blood Type:</span>
                  <span className="font-medium">{mockPatient.bloodType}</span>
                </div>
              </div>
            </Card>

            {/* Medical Conditions */}
            <Card className="p-6 bg-white/50 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Medical Conditions</h3>
              <div className="space-y-2">
                {mockPatient.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {condition}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Allergies */}
            <Card className="p-6 bg-white/50 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Allergies</h3>
              <div className="space-y-2">
                {mockPatient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="mr-2 mb-2">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Medications */}
            <Card className="p-6 bg-white/50 backdrop-blur-md border border-white/20 shadow-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">Current Medications</h3>
              <div className="space-y-3">
                {mockPatient.medications.map((medication, index) => (
                  <div key={index} className="p-3 rounded-lg bg-accent/30">
                    <p className="font-medium text-sm">{medication.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Floating Chatbox */}
    </div>
  );
}
