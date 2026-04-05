import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Search, UserCheck, UserPlus, ExternalLink } from 'lucide-react';
import { useUserRole } from '@/hooks/use-user-role';
import {
  getAllAdmins,
  followAdmin,
  unfollowAdmin,
  type AdminWithFollowStatus,
} from '@/services/followService';

export function AdminList() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { userId } = useUserRole(); // Get database user ID
  const [admins, setAdmins] = useState<AdminWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadAdmins = async () => {
      if (!userId) {
        console.log('❌ No database user ID available yet, waiting...');
        return;
      }

      try {
        setLoading(true);
        console.log('📝 Fetching admins for database user:', userId);
        const adminsData = await getAllAdmins(userId);
        console.log('✅ Admins loaded:', adminsData);
        setAdmins(adminsData);

        // Track following state
        const followingMap: Record<string, boolean> = {};
        adminsData.forEach((admin) => {
          followingMap[admin.id] = admin.isFollowing || false;
        });
        setFollowingStates(followingMap);
      } catch (error) {
        console.error('❌ Error loading admins:', error);
        toast.error(`Failed to load admins: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, [userId]);

  const handleFollowToggle = async (adminId: string) => {
    if (!userId) {
      toast.error('Please log in first');
      return;
    }

    try {
      const isCurrentlyFollowing = followingStates[adminId];

      if (isCurrentlyFollowing) {
        await unfollowAdmin(userId, adminId);
        setFollowingStates((prev) => ({ ...prev, [adminId]: false }));
        toast.success('Unfollowed admin');
      } else {
        await followAdmin(userId, adminId);
        setFollowingStates((prev) => ({ ...prev, [adminId]: true }));
        toast.success('Following admin');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Admins</h1>
        <p className="text-muted-foreground mt-2">
          Follow admins to see their quizzes in your feed
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search admins by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredAdmins.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {admins.length === 0 ? 'No admins found' : 'No admins match your search'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAdmins.map((admin) => (
            <Card
              key={admin.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{admin.username}</CardTitle>
                    <CardDescription className="text-xs truncate mt-1">
                      {admin.email}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Admin
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Member since</span>
                    <p className="font-semibold">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/${admin.id}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    onClick={() => handleFollowToggle(admin.id)}
                    variant={followingStates[admin.id] ? 'outline' : 'default'}
                    className="flex-1"
                  >
                    {followingStates[admin.id] ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
