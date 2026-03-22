import { SignIn } from "@clerk/react";
import { Card } from "@/components/ui/card";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md p-8 glass-card">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-3xl font-bold wave-gradient-text">WaveLearn</h1>
        </div>
        <SignIn />
      </Card>
    </div>
  );
}
