import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, BarChart3, Trash2 } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import { getQuizzesByAdmin, deleteQuiz, getQuizStats, type Quiz } from '@/services/quizService';
import { QuizCard } from '@/components/QuizCard';

interface QuizWithStats extends Quiz {
  questionCount?: number;
  attempts?: number;
  averageScore?: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userId } = useUserRole();
  const [quizzes, setQuizzes] = useState<QuizWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      if (!userId) {
        console.log('⏳ Waiting for userId from useUserRole...');
        return;
      }

      try {
        setLoading(true);
        console.log('📥 Loading quizzes for admin:', userId);
        const quizzesData = await getQuizzesByAdmin(userId);
        console.log('✅ Quizzes loaded:', quizzesData.length);

        // Load stats for each quiz
        const quizzesWithStats = await Promise.all(
          quizzesData.map(async (quiz) => {
            try {
              console.log('📊 Loading stats for quiz:', quiz.id);
              
              // Get stats
              const stats = await getQuizStats(quiz.id);

              return {
                ...quiz,
                questionCount: 0, // We'll calculate this differently
                attempts: stats.totalAttempts,
                averageScore: stats.averageScore,
              };
            } catch (error) {
              console.error('Error loading quiz stats:', error);
              return quiz;
            }
          })
        );

        setQuizzes(quizzesWithStats);
      } catch (error) {
        console.error('❌ Error loading quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [userId]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    setDeleting(quizId);
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      toast.success('Quiz deleted successfully');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your quizzes</p>
        </div>
        <Button onClick={() => navigate('/admin/quiz/create')} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {quizzes.reduce((sum, q) => sum + (q.attempts || 0), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {quizzes.length > 0
                ? Math.round(
                    quizzes.reduce((sum, q) => sum + (q.averageScore || 0), 0) /
                      quizzes.length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Quizzes</h2>

        {quizzes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No quizzes created yet</p>
              <Button onClick={() => navigate('/admin/quiz/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="line-clamp-2">
                      {quiz.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="font-semibold">{quiz.attempts || 0}</span>
                    </div>
                    {(quiz.attempts || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg. Score:</span>
                        <span className="font-semibold">{quiz.averageScore || 0}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-semibold">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => navigate(`/quiz/${quiz.id}/stats`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Stats
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      disabled={deleting === quiz.id}
                      variant="destructive"
                      size="sm"
                    >
                      {deleting === quiz.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
