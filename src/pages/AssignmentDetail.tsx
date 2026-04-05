import { useParams, Link } from "react-router-dom";
import { assignments } from "@/data/assignments";
import { Card } from "@/components/ui/card";
import { TagBadge } from "@/components/TagBadge";
import { Download, Zap, BookOpen, CheckCircle2 } from "lucide-react";
import { GaussianSimulation } from "@/components/simulations/GaussianSimulation";
import { PathLossSimulation } from "@/components/simulations/PathLossSimulation";
import { HataOkumuraSimulation } from "@/components/simulations/HataOkumuraSimulation";
import { MIMOCapacitySimulation } from "@/components/simulations/MIMOCapacitySimulation";
import { RicianFadingSimulation } from "@/components/simulations/RicianFadingSimulation";
import { WaterFillingSimulation } from "@/components/simulations/WaterFillingSimulation";
import { ModulationSimulation } from "@/components/simulations/ModulationSimulation";
import { DiversityCombiningSimulation } from "@/components/simulations/DiversityCombiningSimulation";
import { AlamoutiSimulation } from "@/components/simulations/AlamoutiSimulation";

export default function AssignmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const assignment = assignments.find((a) => a.slug === slug);

  if (!assignment) {
    return (
      <div className="space-y-6 py-12">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold text-destructive">Assignment not found</h2>
          <p className="text-sm text-muted-foreground mt-2">The assignment you're looking for doesn't exist.</p>
          <Link
            to="/assignments"
            className="inline-flex mt-4 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button */}
      <Link
        to="/assignments"
        className="inline-flex text-sm font-medium text-primary hover:underline transition-colors"
      >
        ← Back to Assignments
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl font-bold text-primary">
            {String(assignment.id).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{assignment.title}</h1>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {assignment.tags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* Objective */}
      <Card className="p-6 border-primary/20 bg-primary/5">
        <div className="flex gap-3">
          <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Objective</h2>
            <p className="text-muted-foreground">{assignment.objective}</p>
          </div>
        </div>
      </Card>

      {/* Theory */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Theoretical Foundation</h2>
        <div className="rounded-lg border border-border p-6 bg-card text-muted-foreground space-y-2">
          <p>{assignment.theory}</p>
        </div>
      </div>

      {/* Implementation Steps */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Implementation Steps</h2>
        <ol className="space-y-3">
          {assignment.implementation.map((step, index) => (
            <li key={index} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <span className="text-muted-foreground pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Expected Results */}
      <Card className="p-6 border-amber-200/30 bg-amber-50/30 dark:bg-amber-900/10">
        <h3 className="font-semibold text-foreground mb-2">Expected Results</h3>
        <p className="text-sm text-muted-foreground">
          Run the MATLAB code to see plots and statistical outputs. The implementation should demonstrate the concepts described in the theoretical foundation and validate the theory through empirical results.
        </p>
      </Card>

      {/* Interactive Simulation */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Interactive Simulation</h2>
        <Card className="p-6">
          {assignment.id === 1 && <GaussianSimulation />}
          {assignment.id === 2 && <PathLossSimulation />}
          {assignment.id === 3 && <HataOkumuraSimulation />}
          {assignment.id === 4 && <RicianFadingSimulation />}
          {assignment.id === 6 && <WaterFillingSimulation />}
          {assignment.id === 7 && <MIMOCapacitySimulation />}
          {assignment.id === 8 && <DiversityCombiningSimulation />}
          {assignment.id === 9 && <ModulationSimulation />}
          {assignment.id === 10 && <AlamoutiSimulation />}
          {![1, 2, 3, 4, 6, 7, 8, 9, 10].includes(assignment.id) && (
            <div className="flex gap-4">
              <Zap className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Download the MATLAB file below to run the simulation locally and explore different parameter values in real-time.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Learning Outcomes */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Learning Outcomes</h2>
        <ul className="space-y-2">
          {assignment.learningOutcomes.map((outcome, index) => (
            <li key={index} className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{outcome}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Assignment Files */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Assignment Files</h2>
        <div className="grid gap-3">
          {assignment.files.map((file) => (
            <Card
              key={file.filename}
              className="p-4 hover:bg-accent transition-colors cursor-pointer border border-border hover:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{file.label}</p>
                    <p className="text-xs text-muted-foreground">{file.filename}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                  {file.type}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
