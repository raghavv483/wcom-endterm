import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Radio,
  Wifi,
  Satellite,
  Loader2,
  Sparkles
} from "lucide-react";

const learningPaths = [
  {
    id: 1,
    title: "Wireless Communication Fundamentals",
    description: "Start your journey from basics to advanced concepts",
    icon: Radio,
    progress: 0,
    totalVideos: 12,
    duration: "8 hours",
    difficulty: "Beginner",
    topics: ["RF Basics", "Modulation", "Antennas", "Propagation"],
    topicFilter: "RF",
    searchQuery: "wireless communication fundamentals tutorial",
  },
  {
    id: 2,
    title: "5G Technology Deep Dive",
    description: "Master next-generation wireless networks",
    icon: TrendingUp,
    progress: 0,
    totalVideos: 15,
    duration: "12 hours",
    difficulty: "Intermediate",
    topics: ["5G NR", "mmWave", "Network Slicing", "Edge Computing"],
    topicFilter: "5G",
    searchQuery: "5G technology tutorial",
  },
  {
    id: 3,
    title: "IoT & Connected Devices",
    description: "Learn about IoT protocols and applications",
    icon: Wifi,
    progress: 0,
    totalVideos: 10,
    duration: "6 hours",
    difficulty: "Beginner",
    topics: ["Bluetooth", "Zigbee", "LoRaWAN", "MQTT"],
    topicFilter: "IoT",
    searchQuery: "IoT protocols tutorial",
  },
  {
    id: 4,
    title: "Satellite Communication Systems",
    description: "Explore satellite technology and orbital mechanics",
    icon: Satellite,
    progress: 0,
    totalVideos: 8,
    duration: "5 hours",
    difficulty: "Advanced",
    topics: ["LEO/GEO", "Link Budget", "Modulation", "Ground Stations"],
    topicFilter: "Satellite",
    searchQuery: "satellite communication tutorial",
  },
];

interface AssessmentQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function LearningPaths() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [recommendedPath, setRecommendedPath] = useState<typeof learningPaths[0] | null>(null);
  const [pathProgress, setPathProgress] = useState<{[key: number]: number}>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const progress: {[key: number]: number} = {};
    learningPaths.forEach(path => {
      const completed = localStorage.getItem(`wavelearn-path-${path.id}-completed`) || '0';
      const total = path.totalVideos;
      progress[path.id] = Math.round((parseInt(completed) / total) * 100);
    });
    setPathProgress(progress);
  };

  const generateAssessment = async () => {
    setLoadingAssessment(true);
    setShowAssessment(true);
    
    try {
      const GROQ_URL = import.meta.env.VITE_GROQ_API_URL;
      const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

      if (!GROQ_URL || !GROQ_KEY) {
        throw new Error('GROQ API configuration missing');
      }

      const prompt = `Generate 5 multiple-choice questions to assess someone's knowledge level in wireless communication technology. 
      
Questions should cover:
1. Basic RF concepts
2. Wireless protocols
3. Network architecture
4. Signal processing
5. Modern wireless technologies

Format your response as valid JSON only:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

The correctAnswer should be the index (0-3) of the correct option.`;

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in wireless communication technology. Generate clear, accurate assessment questions. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`GROQ API error: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      
      // Clean and parse JSON
      const cleanJson = content.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setAssessmentQuestions(parsed.questions || []);
      setCurrentQuestion(0);
      setSelectedAnswers([]);
      
    } catch (error) {
      console.error('Error generating assessment:', error);
      toast({
        title: 'Assessment generation failed',
        description: 'Using default questions',
        variant: 'default',
      });
      
      // Fallback questions
      setAssessmentQuestions([
        {
          question: "What does RF stand for in wireless communication?",
          options: ["Radio Frequency", "Random Function", "Rate Factor", "Real Fiber"],
          correctAnswer: 0
        },
        {
          question: "Which frequency range is commonly used for WiFi?",
          options: ["100-200 MHz", "2.4 GHz and 5 GHz", "10-20 GHz", "50-60 GHz"],
          correctAnswer: 1
        },
        {
          question: "What is the primary advantage of 5G over 4G?",
          options: ["Lower cost", "Higher speed and lower latency", "Longer range", "Simpler technology"],
          correctAnswer: 1
        },
        {
          question: "What does IoT stand for?",
          options: ["Internet of Things", "Internal Operating Tool", "Integrated Optical Transmission", "International Orbit Technology"],
          correctAnswer: 0
        },
        {
          question: "Which modulation technique is commonly used in modern wireless systems?",
          options: ["AM only", "FM only", "OFDM", "None of the above"],
          correctAnswer: 2
        }
      ]);
    } finally {
      setLoadingAssessment(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = async () => {
    // Calculate score
    const correctAnswers = selectedAnswers.filter((answer, idx) => 
      answer === assessmentQuestions[idx]?.correctAnswer
    ).length;
    const score = (correctAnswers / assessmentQuestions.length) * 100;

    // Recommend path based on score
    let recommended;
    if (score < 40) {
      recommended = learningPaths[0]; // Fundamentals
    } else if (score < 70) {
      recommended = learningPaths[2]; // IoT (Beginner-Intermediate)
    } else if (score < 85) {
      recommended = learningPaths[1]; // 5G (Intermediate)
    } else {
      recommended = learningPaths[3]; // Satellite (Advanced)
    }

    setRecommendedPath(recommended);
    setAssessmentComplete(true);

    toast({
      title: 'Assessment Complete!',
      description: `You scored ${score.toFixed(0)}%. We recommend: ${recommended.title}`,
    });
  };

  const startPath = (path: typeof learningPaths[0]) => {
    // Mark path as started
    localStorage.setItem(`wavelearn-path-${path.id}-started`, 'true');
    // Navigate to videos page with topic filter for this path
    navigate(`/videos?topic=${encodeURIComponent(path.topicFilter)}`);
  };

  const closeAssessment = () => {
    setShowAssessment(false);
    setAssessmentComplete(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setRecommendedPath(null);
  };
  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold wave-gradient-text">Learning Paths</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Structured learning journeys to take you from beginner to expert in wireless communication
          </p>
        </div>

        {/* Personalized Recommendation */}
        <Card className="p-6 glass-card border-primary/50">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg wave-gradient">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Get Your Personalized Path</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Answer 5 quick questions to get a customized learning path based on your knowledge level
              </p>
              <Button className="wave-gradient" onClick={generateAssessment}>
                Start Assessment
              </Button>
            </div>
          </div>
        </Card>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => {
            const PathIcon = path.icon;
            const progress = pathProgress[path.id] || 0;
            return (
              <Card key={path.id} className="p-6 glass-card hover-lift group">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg wave-gradient group-hover:scale-110 transition-transform">
                      <PathIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {path.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <PlayCircle className="h-3 w-3" />
                      {path.totalVideos} videos
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {path.duration}
                    </Badge>
                    <Badge variant="outline">
                      {path.difficulty}
                    </Badge>
                  </div>

                  {/* Topics */}
                  <div>
                    <p className="text-sm font-medium mb-2">What you'll learn:</p>
                    <div className="flex flex-wrap gap-2">
                      {path.topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <Button 
                    className="w-full wave-gradient"
                    onClick={() => startPath(path)}
                  >
                    {progress > 0 ? "Continue Learning" : "Start Path"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <Card className="p-6 glass-card">
          <h3 className="text-lg font-bold mb-4">Your Learning Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Paths Started</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Videos Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary mb-1">0h</div>
              <div className="text-sm text-muted-foreground">Learning Time</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary mb-1">0</div>
              <div className="text-sm text-muted-foreground">Certificates Earned</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Assessment Dialog */}
      <Dialog open={showAssessment} onOpenChange={closeAssessment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {assessmentComplete ? 'Assessment Complete!' : 'Knowledge Assessment'}
            </DialogTitle>
            <DialogDescription>
              {assessmentComplete 
                ? 'Here\'s your personalized learning path recommendation'
                : `Question ${currentQuestion + 1} of ${assessmentQuestions.length}`
              }
            </DialogDescription>
          </DialogHeader>

          {loadingAssessment ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating assessment questions...</p>
            </div>
          ) : assessmentComplete && recommendedPath ? (
            <div className="space-y-6 py-4">
              <Card className="p-6 glass-card border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg wave-gradient">
                    {(() => {
                      const PathIcon = recommendedPath.icon;
                      return <PathIcon className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{recommendedPath.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendedPath.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{recommendedPath.difficulty}</Badge>
                      <Badge variant="outline">{recommendedPath.totalVideos} videos</Badge>
                      <Badge variant="outline">{recommendedPath.duration}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="wave-gradient"
                        onClick={() => {
                          startPath(recommendedPath);
                          closeAssessment();
                        }}
                      >
                        Start This Path
                      </Button>
                      <Button variant="outline" onClick={closeAssessment}>
                        Browse All Paths
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  You can also explore other learning paths below
                </p>
              </div>
            </div>
          ) : assessmentQuestions.length > 0 ? (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {assessmentQuestions[currentQuestion]?.question}
                </h3>
                <RadioGroup
                  value={selectedAnswers[currentQuestion]?.toString()}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                >
                  <div className="space-y-3">
                    {assessmentQuestions[currentQuestion]?.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label 
                          htmlFor={`option-${idx}`}
                          className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  Progress: {currentQuestion + 1} / {assessmentQuestions.length}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  className="wave-gradient"
                >
                  {currentQuestion < assessmentQuestions.length - 1 ? 'Next Question' : 'Complete Assessment'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
