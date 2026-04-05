import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Users, TrendingUp, Award } from 'lucide-react';
import { getQuizWithQuestions, getAttemptsByQuiz, type Quiz } from '@/services/quizService';

interface AttemptStats {
  user_id: string;
  score: number;
  total_questions: number;
  attempted_at: string;
}

export default function QuizStats() {
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<AttemptStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        console.log('📊 Loading quiz stats for:', quizId);

        // Fetch quiz details
        const quizData = await getQuizWithQuestions(quizId);
        setQuiz(quizData as Quiz);

        // Fetch attempts
        const attemptsData = await getAttemptsByQuiz(quizId);
        console.log('✅ Attempts loaded:', attemptsData.length);
        setAttempts(attemptsData as AttemptStats[]);
      } catch (error) {
        console.error('❌ Error loading stats:', error);
        toast.error('Failed to load quiz stats');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz stats...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Quiz not found</p>
        <Button onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const averageScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length)
    : 0;

  const passRate = attempts.length > 0
    ? Math.round((attempts.filter(a => (a.score || 0) >= (a.total_questions || 1) * 0.7).length / attempts.length) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-muted-foreground mt-2">{quiz.description}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{attempts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{passRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{quiz.questions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attempts Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">User Attempts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed breakdown of each user's quiz attempt
          </p>
        </div>

        {attempts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No attempts yet. Share this quiz with users!</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">User ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Score</th>
                      <th className="text-left py-3 px-4 font-semibold">Percentage</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Attempted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt, index) => {
                      const percentage = Math.round(
                        (attempt.score / attempt.total_questions) * 100
                      );
                      const passed = percentage >= 70;

                      return (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-xs truncate">
                            {attempt.user_id}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">
                              {attempt.score}/{attempt.total_questions}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{percentage}%</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={passed ? 'default' : 'outline'}
                              className={
                                passed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {passed ? 'Pass' : 'Fail'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(attempt.attempted_at).toLocaleDateString()} at{' '}
                            {new Date(attempt.attempted_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
