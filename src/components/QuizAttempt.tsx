import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import {
  getQuizWithQuestions,
  submitQuizAttempt,
  getUserAttemptForQuiz,
  type QuizWithQuestions,
} from '@/services/quizService';

export function QuizAttempt() {
  const { id: quizId } = useParams<{ id: string }>();
  const { userId } = useUserRole();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId || !userId) {
        console.log('⚠️ Missing quizId or userId:', { quizId, userId });
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Loading quiz:', quizId);

        // Check if already attempted
        console.log('🔍 Checking if quiz already attempted...');
        const attempt = await getUserAttemptForQuiz(quizId, userId);
        if (attempt) {
          console.log('✅ Quiz already attempted');
          toast.error('You have already attempted this quiz');
          navigate('/quizzes');
          return;
        }

        console.log('📥 Fetching quiz data...');
        const quizData = await getQuizWithQuestions(quizId);
        
        if (!quizData) {
          throw new Error('Quiz data is empty');
        }

        console.log('✅ Quiz loaded successfully:', { 
          title: quizData.title, 
          questionCount: quizData.questions?.length 
        });

        setQuiz(quizData);
        setAnswers(new Array((quizData.questions?.length || 0)).fill(-1));
      } catch (error) {
        console.error('❌ Error loading quiz:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Failed to load quiz: ${errorMessage}`);
        setTimeout(() => navigate('/quizzes'), 1500);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, userId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Quiz not found</p>
        <Button onClick={() => navigate('/quizzes')} className="mt-4">
          Back to Quizzes
        </Button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return;

    if (answers.some((a) => a === -1)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate score
      let correctCount = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correct_index) {
          correctCount++;
        }
      });

      // Submit attempt
      await submitQuizAttempt(quizId!, userId, correctCount, quiz.questions.length);

      setScore(correctCount);
      setShowResults(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const isPassed = percentage >= 70;

    return (
      <div className="space-y-6">
        <Button
          onClick={() => navigate('/quizzes')}
          variant="outline"
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Quizzes
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>Quiz Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
                  isPassed ? 'bg-green-100' : 'bg-orange-100'
                }`}
              >
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                    {percentage}%
                  </div>
                  <div className="text-sm font-medium">Score</div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold">
                  {isPassed ? 'Great Job! 🎉' : 'Good Effort'}
                </h3>
                <p className="text-muted-foreground mt-2">
                  You answered <span className="font-semibold">{score}</span> out of{' '}
                  <span className="font-semibold">{quiz.questions.length}</span> questions correctly
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Review Your Answers</h4>
              {quiz.questions.map((question, index) => {
                const isCorrect = answers[index] === question.correct_index;
                return (
                  <Card key={index} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{question.question}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Your answer:</span>{' '}
                              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {question.options[answers[index]]}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-sm">
                                <span className="text-muted-foreground">Correct answer:</span>{' '}
                                <span className="text-green-600">
                                  {question.options[question.correct_index]}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              onClick={() => navigate('/quizzes')}
              className="w-full"
            >
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={() => navigate('/quizzes')}
        variant="outline"
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Quizzes
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription className="mt-2">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </CardDescription>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="font-semibold text-primary">
                {currentQuestionIndex + 1}/{quiz.questions.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                    selectedAnswer === index
                      ? 'border-primary bg-primary/5'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary'
                          : 'border-input'
                      }`}
                    >
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || answers.some((a) => a === -1)}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === -1}
                className="flex-1"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Question indicator */}
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[index] === -1
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
