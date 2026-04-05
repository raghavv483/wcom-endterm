import { useEffect, useState } from 'react';
import { useUser } from '@clerk/react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'user';

export interface UseUserRoleResult {
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  userId: string | null; // Add userId
}

export function useUserRole(): UseUserRoleResult {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [role, setRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchUserRole = async () => {
    if (!clerkLoaded) {
      console.log('⏳ Clerk not loaded yet');
      return;
    }

    if (!clerkUser?.id) {
      console.log('❌ No Clerk user ID');
      setRole(null);
      setUserId(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
      const userName = clerkUser.username || userEmail?.split('@')[0];

      console.log('🔍 useUserRole - Processing user:', { userEmail, userName });

      if (!userEmail) {
        console.error('❌ No email found in Clerk user');
        setError('No email found');
        setRole('user');
        setUserId(null);
        setLoading(false);
        return;
      }

      // Try to fetch from users table first (original table) using REST API with service role
      console.log('📝 Attempting to fetch user from users table via REST API...');
      
      const fetchResponse = await fetch(
        `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(userEmail)}&select=id,email,role`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!fetchResponse.ok) {
        console.error('❌ Fetch response error:', fetchResponse.status);
        throw new Error(`Fetch error: ${fetchResponse.status}`);
      }

      const usersData = await fetchResponse.json();
      console.log('📋 Fetch response - users:', usersData);
      
      const existingUser = usersData?.[0] || null;

      if (existingUser) {
        // User exists
        console.log('✅ User found:', existingUser);
        console.log('🎯 FINAL ROLE FROM DB:', existingUser.role);
        setUserId(existingUser.id);
        setRole((existingUser.role as UserRole) || 'user');
      } else {
        // User doesn't exist, check if we should create or wait
        console.log('👤 User not found, checking if we should create...');
        
        // First check if maybe the user exists but email is different
        // (shouldn't happen but let's be safe)
        console.log('⚠️ No user found with email:', userEmail);
        console.log('📝 Creating new user...');
        
        try {
          const response = await fetch(
            `https://vhtlioeeqkkcsycgadcj.supabase.co/rest/v1/users`,
            {
              method: 'POST',
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodGxpb2VlcWtrY3N5Y2dhZGNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ4NzYyNywiZXhwIjoyMDg5MDYzNjI3fQ.k3qtd376PvGJRlrELuGxaxNaLxg62hzYvEgwIE4oTlw`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
              },
              body: JSON.stringify({
                email: userEmail,
                username: userName,
                password_hash: `clerk_${clerkUser.id}`,
                role: 'user',
              }),
            }
          );

          if (response.ok) {
            const newUser = await response.json();
            console.log('✅ User created successfully:', newUser[0]);
            console.log('🎯 FINAL ROLE (new user):', 'user');
            setUserId(newUser[0]?.id || null);
            setRole('user');
          } else {
            const errorData = await response.json();
            console.error('❌ API Error creating user:', errorData);
            
            // If conflict (409), user already exists - fetch again
            if (response.status === 409) {
              console.log('⚠️ User already exists (409), attempting to refetch...');
              
              // Try multiple times to get the user
              let retryCount = 0;
              let foundUser = null;
              
              while (retryCount < 3 && !foundUser) {
                await new Promise(r => setTimeout(r, 500)); // Wait 500ms before retry
                
                const { data: refetchedUser, error: refetchError } = await supabase
                  .from('users')
                  .select('id, email, role')
                  .eq('email', userEmail)
                  .maybeSingle();
                
                console.log(`🔄 Refetch attempt ${retryCount + 1} - user: ${refetchedUser ? 'found' : 'null'}, error:`, refetchError);
                
                if (refetchedUser) {
                  foundUser = refetchedUser;
                }
                retryCount++;
              }
              
              if (foundUser) {
                console.log('✅ User found after conflict:', foundUser);
                console.log('🎯 FINAL ROLE (refetched):', foundUser.role);
                setUserId(foundUser.id);
                setRole((foundUser.role as UserRole) || 'user');
              } else {
                console.error('❌ User not found even after retries, using default role');
                // Even if we can't fetch the user, they exist (409 means conflict)
                // Set a temporary userId and role='user' as default
                setRole('user');
                setUserId(null);
              }
            } else {
              setRole('user');
              setUserId(null);
            }
          }
        } catch (err) {
          console.error('❌ Direct POST error:', err);
          setRole('user');
          setUserId(null);
        }
      }
    } catch (err) {
      console.error('❌ Error in user role hook:', err);
      setRole('user');
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    
    // Only refetch on manual trigger (removed auto-polling to prevent infinite loops)
    // Auto-polling every 5 seconds was causing excessive state updates
    // Users can refresh manually (F5) to check for role changes
    
    return () => {
      // cleanup
    };
  }, [clerkUser?.id, clerkLoaded, refetchTrigger]);

  return {
    role,
    isAdmin: role === 'admin',
    userId,
    loading,
    error,
    refetch: () => setRefetchTrigger(prev => prev + 1),
  };
}
