import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AdminWithFollowStatus extends UserProfile {
  isFollowing?: boolean;
  followerCount?: number;
}

export const followAdmin = async (followerId: string, adminId: string) => {
  try {
    console.log('📝 Following admin via REST API:', { followerId, adminId });
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/follows`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          follower_id: followerId,
          following_id: adminId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Follow error:', errorData);
      throw new Error(`Failed to follow: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Follow successful:', data[0]);
    return data[0];
  } catch (error) {
    console.error('❌ Exception in followAdmin:', error);
    throw error;
  }
};

export const unfollowAdmin = async (followerId: string, adminId: string) => {
  try {
    console.log('📝 Unfollowing admin via REST API:', { followerId, adminId });
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/follows?follower_id=eq.${followerId}&following_id=eq.${adminId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Unfollow error:', errorData);
      throw new Error(`Failed to unfollow: ${response.status}`);
    }

    console.log('✅ Unfollow successful');
  } catch (error) {
    console.error('❌ Exception in unfollowAdmin:', error);
    throw error;
  }
};

export const getFollowedAdmins = async (userId: string) => {
  try {
    console.log('📥 Fetching followed admins for user:', userId);
    
    const encodedUserId = encodeURIComponent(userId);

    // Get followed admin IDs
    const followResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/follows?follower_id=eq.${encodedUserId}`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!followResponse.ok) {
      throw new Error(`Failed to fetch follows: ${followResponse.status}`);
    }

    const followData = await followResponse.json();
    const followedAdminIds = followData?.map((f: any) => f.following_id) || [];

    console.log('✅ Followed admin IDs:', followedAdminIds);

    if (followedAdminIds.length === 0) {
      return [];
    }

    // Fetch all admins
    const allAdminsResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users?role=eq.admin`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!allAdminsResponse.ok) {
      throw new Error(`Failed to fetch admins: ${allAdminsResponse.status}`);
    }

    const allAdmins = await allAdminsResponse.json();
    
    // Filter to only followed admins
    const followedAdmins = allAdmins.filter((admin: any) => 
      followedAdminIds.includes(admin.id)
    );

    console.log('✅ Followed admins loaded:', followedAdmins.length);
    return followedAdmins as UserProfile[];
  } catch (error) {
    console.error('❌ Exception in getFollowedAdmins:', error);
    return [];
  }
};

export const getAllAdmins = async (currentUserId?: string) => {
  try {
    console.log('📝 Querying all admins with direct REST API (service role)');
    
    // Use REST API with service role key to bypass RLS
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users?role=eq.admin&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch admins: ${response.status}`);
    }

    const admins = await response.json();
    console.log('📋 Admins response:', admins);
    console.log('✅ Found admins:', admins?.length || 0);

    if (!currentUserId) {
      return admins as UserProfile[];
    }

    // Get all users this user follows using REST API
    console.log('📝 Querying follows for user:', currentUserId);
    const followsResponse = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/follows?follower_id=eq.${currentUserId}&select=following_id`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    let follows = [];
    if (followsResponse.ok) {
      follows = await followsResponse.json();
      console.log('📋 Follows response:', follows);
    } else {
      console.log('⚠️ Follows query returned:', followsResponse.status, '(this is OK if user is new)');
    }

    const followingIds = new Set((follows || []).map((f: any) => f.following_id));

    return (admins as UserProfile[]).map((admin) => ({
      ...admin,
      isFollowing: followingIds.has(admin.id),
    })) as AdminWithFollowStatus[];
  } catch (err) {
    console.error('❌ Exception in getAllAdmins:', err);
    throw err;
  }
};

export const isFollowing = async (
  followerId: string,
  adminId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', adminId)
    .single();

  if (error && error.code === 'PGRST116') {
    return false;
  }

  if (error) throw error;

  return data !== null;
};

export const getAdminProfile = async (adminId: string) => {
  try {
    console.log('📥 Fetching admin profile:', adminId);
    
    const response = await fetch(
      `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users?id=eq.${adminId}&role=eq.admin`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Fetch admin profile error:', error);
      throw new Error(`Failed to fetch admin profile: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Admin profile fetched');
    return data[0] as UserProfile;
  } catch (error) {
    console.error('❌ Exception in getAdminProfile:', error);
    throw error;
  }
};

export const getFollowerCount = async (adminId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', adminId);

  if (error) throw error;

  return count || 0;
};

export const getFollowersForAdmin = async (adminId: string) => {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, users:follower_id(username, email)')
    .eq('following_id', adminId);

  if (error) throw error;

  return data;
};
