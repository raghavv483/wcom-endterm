import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  PlayCircle, 
  Sparkles, 
  TrendingUp,
  Radio,
  Wifi,
  Satellite,
  CheckCircle2
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Radio,
      title: "Smart Video Aggregation",
      description: "Top YouTube tutorials ranked by AI-powered scoring algorithm",
    },
    {
      icon: Sparkles,
      title: "AI Learning Assistant",
      description: "Get instant explanations, summaries, and personalized study notes",
    },
    {
      icon: TrendingUp,
      title: "Personalized Paths",
      description: "Custom learning journeys based on your knowledge level",
    },
  ];

  const stats = [
    { label: "Video Tutorials", value: "1000+" },
    { label: "Topics Covered", value: "50+" },
    { label: "Learning Paths", value: "15+" },
    { label: "Active Learners", value: "5K+" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 wave-gradient opacity-10" />
        <div className="container mx-auto px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="wave-gradient text-white border-0 px-4 py-2 text-sm">
              🎓 The Future of Wireless Communication Learning
            </Badge>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Master Wireless Communication with{" "}
              <span className="wave-gradient-text">AI-Powered Learning</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access curated video tutorials, take smart notes, get AI tutoring, and follow 
              personalized learning paths—all in one beautiful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/videos">
                <Button size="lg" className="wave-gradient text-lg px-8 gap-2">
                  Explore Videos
                  <PlayCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/learning-paths">
                <Button size="lg" variant="outline" className="text-lg px-8 gap-2">
                  Start Learning Path
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold wave-gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to <span className="wave-gradient-text">Excel</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to accelerate your wireless communication journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="p-8 glass-card hover-lift group">
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg wave-gradient inline-block group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-4">Topics We Cover</h2>
            <p className="text-lg text-muted-foreground">
              From fundamentals to advanced concepts
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {["5G/6G", "LTE", "RF", "Antennas", "MIMO", "IoT", "Bluetooth", "Satellite", "Modulation", "Network Architecture", "Protocols", "Signal Processing"].map((topic) => (
              <Card key={topic} className="p-4 glass-card hover-lift text-center group cursor-pointer">
                <CheckCircle2 className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {topic}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <Card className="p-12 lg:p-16 glass-card text-center max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 wave-gradient opacity-5" />
            <div className="relative space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of learners mastering wireless communication technology
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/videos">
                  <Button size="lg" className="wave-gradient text-lg px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/ai-chat">
                  <Button size="lg" variant="outline" className="text-lg px-8 gap-2">
                    <Sparkles className="h-5 w-5" />
                    Try AI Tutor
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
