import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { useUserRole } from '@/hooks/use-user-role';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isAdmin, loading: roleLoading, role } = useUserRole();

  const loading = !clerkLoaded || roleLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.warn('❌ No user logged in');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.warn('❌ User is not admin (role=' + role + '), redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('✅ Admin access granted! (role=' + role + ')');
  return <>{children}</>;
}
