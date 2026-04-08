import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import { getUserAttemptResults } from '@/services/quizService';

interface DetailedResult {
  questionId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  userSelectedIndex: number;
  isCorrect: boolean;
  tags: string[];
}

interface AttemptData {
  attempt: any;
  quiz: any;
  detailedResults: DetailedResult[];
}

export default function QuizAttemptReview() {
  const { id: quizId } = useParams<{ id: string }>();
  const { userId } = useUserRole();
  const navigate = useNavigate();

  const [data, setData] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!quizId || !userId) return;

      try {
        setLoading(true);
        console.log('📊 Loading attempt review:', { quizId, userId });

        const results = await getUserAttemptResults(quizId, userId);
        if (!results) {
          toast.error('Attempt not found');
          navigate('/quizzes');
          return;
        }

        setData(results);
      } catch (error) {
        console.error('❌ Error loading results:', error);
        toast.error('Failed to load attempt details');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [quizId, userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading attempt review...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Attempt not found</p>
        <Button onClick={() => navigate('/quizzes')}>Back to Quizzes</Button>
      </div>
    );
  }

  const { attempt, quiz, detailedResults } = data;
  const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
  const correctCount = detailedResults.filter((r) => r.isCorrect).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/quizzes')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground mt-2">Your Detailed Results</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className={`border-2 ${percentage >= 70 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className={percentage >= 70 ? 'text-green-900' : 'text-red-900'}>
            {percentage >= 70 ? '✓ Quiz Passed!' : '✗ Quiz Not Passed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-3xl font-bold">{percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
              <p className="text-3xl font-bold">{correctCount}/{attempt.total_questions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attempted At</p>
              <p className="text-sm font-semibold">
                {new Date(attempt.attempted_at).toLocaleDateString()} at{' '}
                {new Date(attempt.attempted_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Review */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Question Breakdown</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review your answers for each question
          </p>
        </div>

        <div className="space-y-4">
          {detailedResults.map((result, index) => {
            const isCorrect = result.isCorrect;
            const selectedOption = result.userSelectedIndex >= 0 ? result.options[result.userSelectedIndex] : 'No answer selected';
            const correctOption = result.options[result.correctIndex];

            return (
              <Card key={result.questionId} className={`border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">Q{index + 1}</Badge>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <CardTitle className="text-lg">{result.questionText}</CardTitle>
                      {result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge className={isCorrect ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}>
                      {isCorrect ? 'Correct' : 'Wrong'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Your Answer */}
                  <div>
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Your Answer (Correct)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          Your Answer (Incorrect)
                        </>
                      )}
                    </p>
                    <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                      {selectedOption}
                    </div>
                  </div>

                  {/* Correct Answer (if wrong) */}
                  {!isCorrect && (
                    <div>
                      <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Correct Answer
                      </p>
                      <div className="p-3 rounded-lg bg-green-100 text-green-900">
                        {correctOption}
                      </div>
                    </div>
                  )}

                  {/* All Options Reference */}
                  <div>
                    <p className="font-semibold text-sm mb-2 text-muted-foreground">All Options</p>
                    <div className="space-y-2">
                      {result.options.map((option, optionIndex) => {
                        const isSelected = optionIndex === result.userSelectedIndex;
                        const isCorrectOption = optionIndex === result.correctIndex;

                        return (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded-lg border-2 transition-colors ${
                              isCorrectOption
                                ? 'border-green-400 bg-green-50'
                                : isSelected
                                  ? 'border-red-400 bg-red-50'
                                  : 'border-muted bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-semibold text-sm">
                                {String.fromCharCode(65 + optionIndex)}.
                              </span>
                              <div className="flex-1">
                                <p className="text-sm">{option}</p>
                                <div className="flex gap-2 mt-1">
                                  {isCorrectOption && (
                                    <Badge className="text-xs bg-green-200 text-green-900">
                                      Correct Answer
                                    </Badge>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <Badge className="text-xs bg-red-200 text-red-900">
                                      Your Choice
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => navigate('/quizzes')} className="flex-1">
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
}
