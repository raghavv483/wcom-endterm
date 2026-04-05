import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface QuizCardProps {
  id: string;
  title: string;
  description?: string;
  adminName?: string;
  questionCount?: number;
  attempted?: boolean;
  score?: number;
  totalQuestions?: number;
  createdAt?: string;
}

export function QuizCard({
  id,
  title,
  description,
  adminName,
  questionCount = 0,
  attempted = false,
  score,
  totalQuestions,
  createdAt,
}: QuizCardProps) {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate(`/quiz/${id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{title}</CardTitle>
            {adminName && (
              <CardDescription className="mt-1">By {adminName}</CardDescription>
            )}
          </div>
          {attempted && (
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Attempted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{questionCount} questions</span>
          </div>

          {attempted && score !== undefined && totalQuestions && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {score}/{totalQuestions} correct
              </span>
            </div>
          )}
        </div>

        <Button
          onClick={handleStartQuiz}
          disabled={attempted}
          className="w-full"
          variant={attempted ? 'outline' : 'default'}
        >
          {attempted ? 'Attempted' : 'Start Quiz'}
        </Button>
      </CardContent>
    </Card>
  );
}
