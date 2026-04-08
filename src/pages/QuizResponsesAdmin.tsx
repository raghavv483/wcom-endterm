import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Users, HelpCircle } from 'lucide-react';
import { getQuizResponses, getQuestionResponses, getUserNames } from '@/services/quizService';

export default function QuizResponsesAdmin() {
  const { id: quizId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [questionStats, setQuestionStats] = useState<any>(null);

  useEffect(() => {
    const loadResponses = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        console.log('📊 Loading quiz responses:', quizId);

        const results = await getQuizResponses(quizId);
        setData(results);

        // Fetch user names
        const userIds = Object.keys(results.responsesByUser || {});
        if (userIds.length > 0) {
          const names = await getUserNames(userIds);
          setUserNames(names);
        }

        // Load first question stats
        if (results.quiz?.questions?.length > 0) {
          const firstQuestionId = results.quiz.questions[0].id;
          setSelectedQuestion(firstQuestionId);
          const stats = await getQuestionResponses(firstQuestionId);
          setQuestionStats(stats);
        }
      } catch (error) {
        console.error('❌ Error loading responses:', error);
        toast.error('Failed to load response data');
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, [quizId]);

  const handleQuestionSelect = async (questionId: string) => {
    setSelectedQuestion(questionId);
    try {
      const stats = await getQuestionResponses(questionId);
      setQuestionStats(stats);
    } catch (error) {
      console.error('Error loading question stats:', error);
      toast.error('Failed to load question stats');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading response data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Quiz not found</p>
        <Button onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const { quiz, responses, responsesByUser, responsesByQuestion, totalResponses } = data;
  const uniqueUsers = Object.keys(responsesByUser).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/quiz/${quizId}/stats`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stats
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{quiz.title} - User Responses</h1>
          <p className="text-muted-foreground mt-2">Review detailed responses from all users</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Unique Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Total Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalResponses}</div>
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

      {/* Response Analysis Tabs */}
      <Tabs defaultValue="by-question" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-question">By Question</TabsTrigger>
          <TabsTrigger value="by-user">By User</TabsTrigger>
        </TabsList>

        {/* By Question View */}
        <TabsContent value="by-question" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Question List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quiz.questions.map((question: any, index: number) => (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionSelect(question.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      selectedQuestion === question.id
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <p className="text-sm font-medium">Q{index + 1}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {question.question}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Question Stats */}
            <div className="md:col-span-2 space-y-4">
              {questionStats && (
                <>
                  {/* Stats Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Response Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Responses</p>
                          <p className="text-2xl font-bold">{questionStats.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Correct</p>
                          <p className="text-2xl font-bold text-green-600">
                            {questionStats.correct}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Accuracy</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {questionStats.accuracy}%
                          </p>
                        </div>
                      </div>

                      {/* Answer Distribution */}
                      {Object.keys(questionStats.answerDistribution).length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                          <p className="font-semibold text-sm">Answer Distribution</p>
                          {selectedQuestion && 
                            quiz.questions
                              .find((q: any) => q.id === selectedQuestion)
                              ?.options.map((option: string, index: number) => {
                                const count = questionStats.answerDistribution[index] || 0;
                                const isCorrect = index === quiz.questions.find((q: any) => q.id === selectedQuestion)?.correct_index;
                                const percentage =
                                  questionStats.total > 0
                                    ? ((count / questionStats.total) * 100).toFixed(0)
                                    : 0;

                                return (
                                  <div key={index} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="flex items-center gap-2">
                                        <span className="font-semibold">
                                          {String.fromCharCode(65 + index)}.
                                        </span>
                                        {isCorrect && (
                                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        )}
                                        <span className="line-clamp-1">{option}</span>
                                      </span>
                                      <span className="font-semibold">{count}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          isCorrect ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Individual Responses */}
                  {questionStats.responses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">User Responses</CardTitle>
                        <CardDescription>
                          Individual responses from all users
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {questionStats.responses.map((response: any, idx: number) => {
                            const selectedQuestion_ = quiz.questions.find(
                              (q: any) => q.id === response.question_id
                            );
                            const selectedOption =
                              response.selected_index >= 0
                                ? selectedQuestion_?.options[response.selected_index]
                                : 'No answer';

                            return (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg border ${
                                  response.is_correct
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-red-200 bg-red-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {response.is_correct ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    )}
                                  <span className="text-xs font-mono text-muted-foreground truncate">
                                      {userNames[response.user_id] || response.user_id}
                                    </span>
                                    <span className="text-sm truncate">{selectedOption}</span>
                                  </div>
                                  <Badge
                                    className={`ml-2 flex-shrink-0 ${
                                      response.is_correct
                                        ? 'bg-green-200 text-green-900'
                                        : 'bg-red-200 text-red-900'
                                    }`}
                                  >
                                    {response.is_correct ? 'Correct' : 'Wrong'}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* By User View */}
        <TabsContent value="by-user" space-y-4>
          <Card>
            <CardHeader>
              <CardTitle>User Responses</CardTitle>
              <CardDescription>
                Responses grouped by user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(responsesByUser).map(([userId, userResponses]: [string, any]) => {
                  const correct = userResponses.filter((r: any) => r.is_correct).length;
                  const total = userResponses.length;
                  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                  return (
                    <Card key={userId} className="border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">{userNames[userId] || userId}</p>
                            <p className="text-xs text-muted-foreground font-mono">{userId}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Accuracy</p>
                              <p className="text-lg font-bold">{accuracy}%</p>
                            </div>
                            <Badge
                              className={accuracy >= 70 ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}
                            >
                              {correct}/{total}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {userResponses.map((response: any, idx: number) => {
                            const question = quiz.questions.find(
                              (q: any) => q.id === response.question_id
                            );
                            return (
                              <div
                                key={idx}
                                className={`p-2 rounded border-l-4 ${
                                  response.is_correct
                                    ? 'border-l-green-500 bg-green-50'
                                    : 'border-l-red-500 bg-red-50'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {response.is_correct ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">
                                      Q{quiz.questions.findIndex((q: any) => q.id === response.question_id) + 1}
                                    </p>
                                    {response.selected_index >= 0 && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {question?.options[response.selected_index]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {Object.keys(responsesByUser).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No responses yet. Individual response tracking will appear after users complete the migration.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="flex gap-2">
        <Button onClick={() => navigate(`/quiz/${quizId}/stats`)} className="flex-1">
          Back to Stats
        </Button>
      </div>
    </div>
  );
}
