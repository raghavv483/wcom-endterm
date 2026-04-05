import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { createQuiz, addQuizQuestion } from '@/services/quizService';
import { useUserRole } from '@/hooks/use-user-role';

interface QuestionInput {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export function QuizBuilder() {
  const navigate = useNavigate();
  const { userId } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: QuestionInput = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof QuestionInput, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? { ...q, [field]: value }
          : q
      )
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((o, i) => (i === optionIndex ? value : o)) as [string, string, string, string] }
          : q
      )
    );
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Quiz title is required');
      return false;
    }

    if (questions.length === 0) {
      toast.error('Add at least one question');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1}: Question text is required`);
        return false;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error(`Question ${i + 1}: All options are required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !userId) return;

    setLoading(true);
    try {
      // Create quiz
      const quiz = await createQuiz(userId, title, description || null);

      // Add all questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await addQuizQuestion(
          quiz.id,
          q.question,
          q.options,
          q.correctIndex,
          i
        );
      }

      toast.success('Quiz created successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
        <p className="text-muted-foreground mt-2">Add quiz details and questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Basic information about your quiz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Quiz Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Advanced Signal Processing"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this quiz is about..."
              className="mt-1 min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Questions</h2>
          <Button onClick={addQuestion} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No questions added yet</p>
              <Button onClick={addQuestion} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card key={question.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === question.id ? null : question.id
                    )
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Q{index + 1}</Badge>
                      <span className="font-medium truncate">
                        {question.question || 'Click to edit...'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQuestion(question.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {expandedQuestion === question.id && (
                  <CardContent className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor={`q-${question.id}`}>Question Text *</Label>
                      <Textarea
                        id={`q-${question.id}`}
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(question.id, 'question', e.target.value)
                        }
                        placeholder="Enter the question..."
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options *</Label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctIndex === optionIndex}
                            onChange={() =>
                              updateQuestion(
                                question.id,
                                'correctIndex',
                                optionIndex
                              )
                            }
                            className="w-4 h-4"
                          />
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(question.id, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted p-3 rounded text-sm text-muted-foreground">
                      Select the radio button next to the correct answer
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={loading || questions.length === 0 || !title.trim()}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Quiz...
            </>
          ) : (
            'Create Quiz'
          )}
        </Button>
        <Button
          onClick={() => navigate('/admin/dashboard')}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
