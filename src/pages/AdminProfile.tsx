import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { getQuizzesByAdmin } from '@/services/quizService';
import { getAdminProfile, followAdmin, unfollowAdmin, isFollowing } from '@/services/followService';
import { useUserRole } from '@/hooks/use-user-role';

interface AdminProfileData {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

interface Quiz {
  id: string;
  admin_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProfile() {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const { userId } = useUserRole();

  const [admin, setAdmin] = useState<AdminProfileData | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowingAdmin, setIsFollowingAdmin] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [adminId]);

  const fetchAdminData = async () => {
    if (!adminId) return;

    try {
      setLoading(true);
      
      // Fetch admin profile (we'll need to update this to use REST API)
      try {
        const adminData = await getAdminProfile(adminId);
        setAdmin(adminData as AdminProfileData);
      } catch (error) {
        console.log('Using REST API for admin profile');
        // Fallback: fetch directly via REST API
        const response = await fetch(
          `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users?id=eq.${adminId}&role=eq.admin`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            },
          }
        );
        const data = await response.json();
        setAdmin(data[0]);
      }

      // Fetch quizzes created by admin
      const adminQuizzes = await getQuizzesByAdmin(adminId);
      setQuizzes(adminQuizzes);

      // Check if current user is following this admin
      if (userId) {
        const following = await isFollowing(userId, adminId);
        setIsFollowingAdmin(following);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!userId || !adminId) return;

    try {
      setFollowLoading(true);
      if (isFollowingAdmin) {
        await unfollowAdmin(userId, adminId);
        setIsFollowingAdmin(false);
        toast.success('Unfollowed admin');
      } else {
        await followAdmin(userId, adminId);
        setIsFollowingAdmin(true);
        toast.success('Following admin');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-muted-foreground">Admin not found</p>
        <Button onClick={() => navigate('/admins')}>Back to Admins</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admins')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admins
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{admin.username || admin.email}</h1>
            <p className="text-muted-foreground">{admin.email}</p>
            <Badge className="mt-2">Admin</Badge>
          </div>
        </div>
        <Button
          onClick={handleFollowToggle}
          disabled={followLoading}
          variant={isFollowingAdmin ? 'outline' : 'default'}
        >
          {followLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : isFollowingAdmin ? (
            'Following'
          ) : (
            'Follow'
          )}
        </Button>
      </div>

      {/* Quizzes Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Quizzes Created</h2>
          <p className="text-sm text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created by this admin
          </p>
        </div>

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                This admin hasn't created any quizzes yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleQuizClick(quiz.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      {quiz.description && (
                        <CardDescription className="mt-1">
                          {quiz.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuizClick(quiz.id);
                      }}
                    >
                      Take Quiz
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(quiz.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
