import { assignments } from "@/data/assignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { Card } from "@/components/ui/card";
import { Lightbulb, Code2, Zap, Rocket } from "lucide-react";

export default function Assignments() {
  const learningObjectives = [
    {
      icon: Lightbulb,
      title: "Theoretical Understanding",
      description: "Master fundamental concepts in wireless communications and signal processing"
    },
    {
      icon: Code2,
      title: "Practical Implementation",
      description: "Apply theory through MATLAB programming and hands-on simulations"
    },
    {
      icon: Zap,
      title: "Interactive Learning",
      description: "Explore concepts with real-time visualizations and parameter manipulation"
    },
    {
      icon: Rocket,
      title: "Real-world Applications",
      description: "Connect lab exercises to industry standards and modern communication systems"
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">WCOM Lab Assignments</h1>
        <p className="text-lg text-muted-foreground">Comprehensive wireless communication laboratory exercises</p>
      </div>

      {/* Course Overview */}
      <div className="space-y-3 text-muted-foreground">
        <p>
          This comprehensive assignment series guides you through the fundamental concepts and advanced techniques in wireless communications. From probability distributions and propagation models to MIMO systems and space-time coding, each assignment builds upon previous knowledge to develop both theoretical understanding and practical implementation skills.
        </p>
        <p>
          Each assignment combines theoretical concepts with MATLAB-based practical implementations, interactive simulations, and real-world applications in modern communication systems.
        </p>
      </div>

      {/* Assignments Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Lab Assignments</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </div>

      {/* Learning Objectives */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Learning Objectives</h2>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {learningObjectives.map((objective) => {
            const Icon = objective.icon;
            return (
              <Card key={objective.title} className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{objective.title}</h3>
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
