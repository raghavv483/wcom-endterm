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
  tags: string[];
}

export function QuizBuilder() {
  const navigate = useNavigate();
  const { userId } = useUserRole();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [instructions, setInstructions] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: QuestionInput = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      tags: [],
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

  const addTag = (questionId: string, tag: string) => {
    const trimmedTag = tag.trim();
    console.log(`🏷️ Adding tag to question ${questionId}:`, trimmedTag);
    
    if (!trimmedTag) {
      console.warn('⚠️ Tag is empty');
      return;
    }
    
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && !q.tags.includes(trimmedTag)) {
          console.log(`✅ Tag added! Question now has tags:`, [...q.tags, trimmedTag]);
          return { ...q, tags: [...q.tags, trimmedTag] };
        }
        return q;
      })
    );
  };

  const removeTag = (questionId: string, tagToRemove: string) => {
    console.log(`❌ Removing tag from question ${questionId}:`, tagToRemove);
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, tags: q.tags.filter((t) => t !== tagToRemove) }
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
      // Log questions before submission
      console.log('📝 Questions to submit:', questions);
      questions.forEach((q, idx) => {
        console.log(`  Q${idx + 1} - "${q.question.substring(0, 30)}..." - Tags: ${JSON.stringify(q.tags)}`);
      });

      // Create quiz with pass criteria
      const quiz = await createQuiz(userId, title, description || null, passingPercentage, instructions || null);

      // Add all questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        console.log(`✏️ Submitting Q${i + 1} with tags:`, q.tags);
        await addQuizQuestion(
          quiz.id,
          q.question,
          q.options,
          q.correctIndex,
          i,
          q.tags
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passing">Passing Percentage (%)</Label>
              <Input
                id="passing"
                type="number"
                min="0"
                max="100"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                placeholder="70"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Students need {passingPercentage}% to pass</p>
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Instructions for Students</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Additional instructions or guidelines for taking this quiz..."
              className="mt-1 min-h-20"
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

                    <div className="space-y-2 border-t pt-4">
                      <Label htmlFor={`tags-${question.id}`}>Topic Tags</Label>
                      <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-2">
                        Current tags: <strong>{question.tags.length > 0 ? question.tags.join(', ') : 'None'}</strong>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id={`tags-${question.id}`}
                          placeholder="Type tag and press Enter (e.g., a, b, Python)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = (e.target as HTMLInputElement).value;
                              console.log('🏷️ ENTER pressed - Tag value:', value);
                              addTag(question.id, value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            const input = document.getElementById(`tags-${question.id}`) as HTMLInputElement;
                            console.log('🔘 BUTTON clicked - Input value:', input?.value);
                            if (input && input.value) {
                              addTag(question.id, input.value);
                              input.value = '';
                            } else {
                              console.warn('⚠️ No input value!');
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {question.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => removeTag(question.id, tag)}
                            >
                              {tag} ✕
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Press Enter or click + to add tags. Click tags to remove them.
                      </p>
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
