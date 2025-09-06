import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  Activity, 
  Shield, 
  Clock, 
  Users, 
  Stethoscope,
  User,
  ArrowRight,
  Zap,
  Brain,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
                <Heart className="w-6 h-6 text-background" />
              </div>
              <span className="text-xl font-semibold text-foreground">MedMonitor</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/doctor">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  For Doctors
                </Button>
              </Link>
              <Link to="/patient">
                <Button size="sm" className="btn-minimal">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-minimal"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            
            {/* Animated Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full glass border border-border/20 flex items-center justify-center hover-scale-subtle">
                  <Heart className="w-12 h-12 text-foreground" />
                </div>
                <div className="absolute inset-0 rounded-full border border-foreground/10 animate-ping"></div>
              </div>
            </div>

            {/* Headlines */}
            <div className="space-y-4">
              <h1 className="text-responsive-xl font-bold text-foreground leading-tight">
                Intelligent Patient Monitoring
                <br />
                <span className="text-muted-foreground">Made Simple</span>
              </h1>
              <p className="text-responsive text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Advanced healthcare monitoring with real-time vital signs tracking, 
                AI-powered insights, and seamless emergency response workflows.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/doctor">
                <Button size="lg" className="btn-minimal group">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Doctor Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/patient">
                <Button size="lg" className="btn-outline group">
                  <User className="w-5 h-5 mr-2" />
                  Patient View
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 mt-16 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Grade</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Real-time Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-responsive-lg font-bold text-foreground mb-4">
              Everything you need for comprehensive care
            </h2>
            <p className="text-responsive text-muted-foreground">
              Our platform combines cutting-edge AI with intuitive design to deliver 
              exceptional patient monitoring capabilities.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="card-minimal p-8 hover-lift-subtle group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                  <Activity className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Real-time Monitoring</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Continuous tracking of vital signs including heart rate, blood pressure, 
                temperature, and oxygen saturation with instant updates and alerts.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="card-minimal p-8 hover-lift-subtle group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                  <Brain className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">AI Anomaly Detection</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Machine learning algorithms continuously analyze patient data to detect 
                patterns and provide early warnings before critical situations develop.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="card-minimal p-8 hover-lift-subtle group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                  <Clock className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Emergency Response</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Automated escalation workflows and instant notifications ensure rapid 
                response to critical situations with seamless care coordination.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="card-minimal p-8 hover-lift-subtle group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                  <Users className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Multi-Patient Dashboard</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Centralized monitoring interface allowing healthcare providers to oversee 
                multiple patients with intelligent priority-based alert management.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="card-minimal p-8 hover-lift-subtle group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                  <Heart className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Patient Engagement</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Empower patients with access to their health data, trends, and personalized 
                insights through an intuitive, easy-to-understand interface.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="card-minimal p-8 hover-lift-subtle group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Clinical Decision Support</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered insights and evidence-based recommendations assist healthcare 
                professionals in making informed clinical decisions quickly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime Reliability</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">&lt;2s</div>
              <div className="text-muted-foreground">Alert Response Time</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-muted-foreground">Continuous Monitoring</div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-6">
            <h2 className="text-responsive-lg font-bold">
              Ready to transform patient care?
            </h2>
            <p className="text-responsive text-background/80 max-w-2xl mx-auto">
              Join healthcare providers who trust our platform to deliver 
              exceptional patient monitoring and emergency response capabilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/doctor">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 font-medium px-8 py-4">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  Try Doctor Dashboard
                </Button>
              </Link>
              <Link to="/patient">
                <Button size="lg" variant="outline" className="border-background/20 text-background hover:bg-background/10 font-medium px-8 py-4">
                  <User className="w-5 h-5 mr-2" />
                  View Patient Experience
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center">
                <Heart className="w-5 h-5 text-background" />
              </div>
              <span className="font-semibold text-foreground">MedMonitor</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 MedMonitor. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;