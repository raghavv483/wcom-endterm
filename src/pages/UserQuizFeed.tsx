import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, BookOpen, Users } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import { getQuizzesForUser } from '@/services/quizService';
import { QuizCard } from '@/components/QuizCard';
import { getFollowedAdmins } from '@/services/followService';

export interface QuizWithInfo {
  id: string;
  admin_id: string;
  title: string;
  description?: string;
  created_at: string;
  attempted?: boolean;
  admin_name?: string;
  question_count?: number;
}

export function UserQuizFeed() {
  const navigate = useNavigate();
  const { userId } = useUserRole();
  const [quizzes, setQuizzes] = useState<QuizWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedAdminCount, setFollowedAdminCount] = useState(0);

  useEffect(() => {
    const loadQuizzes = async () => {
      if (!userId) {
        console.log('⏳ Waiting for userId from useUserRole...');
        return;
      }

      try {
        setLoading(true);
        console.log('📥 Loading quizzes for user:', userId);

        // Get followed admins count
        const followedAdmins = await getFollowedAdmins(userId);
        console.log('✅ Followed admins:', followedAdmins.length);
        setFollowedAdminCount(followedAdmins.length);

        // Get quizzes
        const quizzesData = await getQuizzesForUser(userId);
        console.log('✅ Quizzes loaded:', quizzesData.length);
        
        // Enhance quizzes with admin names
        const enhancedQuizzes = quizzesData.map((quiz: any) => ({
          ...quiz,
          admin_name: followedAdmins.find((a) => a.id === quiz.admin_id)?.username || 'Unknown',
        }));

        setQuizzes(enhancedQuizzes);
      } catch (error) {
        console.error('❌ Error loading quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Quiz Feed</h1>
        <p className="text-muted-foreground mt-2">
          Quizzes from admins you follow
        </p>
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available Quizzes</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-muted-foreground">Following</p>
                <p className="text-2xl font-bold">{followedAdminCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes */}
      {quizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Quizzes Yet</h3>
            <p className="text-muted-foreground mb-6">
              {followedAdminCount === 0
                ? 'Follow some admins to see their quizzes'
                : 'The admins you follow haven\'t created any quizzes yet'}
            </p>
            <Button onClick={() => navigate('/admins')}>
              <Users className="w-4 h-4 mr-2" />
              Discover Admins
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description}
              adminName={quiz.admin_name}
              attempted={quiz.attempted}
            />
          ))}
        </div>
      )}

      {followedAdminCount === 0 && quizzes.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Start by following some admins to see their quizzes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Visit the <strong>Discover Admins</strong> page to find and follow admins in your area of interest.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UserQuizFeed;
