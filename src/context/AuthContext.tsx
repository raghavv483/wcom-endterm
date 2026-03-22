import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_login: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (for testing - replace with real API calls)
const mockUsers: Record<string, { password: string; user: User }> = {};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      if (token && userData) {
        // For mock auth, just restore from localStorage
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Try real API first
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { user: userData, token } = await response.json();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        return;
      }
    } catch (err) {
      console.log('Real API not available, using mock auth');
    }

    // Fall back to mock auth
    const userRecord = mockUsers[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }

    const token = `mock_token_${Date.now()}`;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userRecord.user));
    setUser(userRecord.user);
  };

  const signup = async (email: string, username: string, password: string) => {
    // Validate inputs
    if (!email || !username || !password) {
      throw new Error('All fields are required');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    // Try real API first
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      if (response.ok) {
        const { user: userData, token } = await response.json();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
        return;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
    } catch (err) {
      if (err instanceof Error && err.message !== 'Signup failed') {
        console.log('Real API not available, using mock auth');
      } else {
        throw err;
      }
    }

    // Fall back to mock auth
    if (mockUsers[email]) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      username,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    const token = `mock_token_${Date.now()}`;
    mockUsers[email] = { password, user: newUser };
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token && token.startsWith('mock_')) {
        // Mock logout
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
        return;
      }

      // Try real API
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
    }
  };

  const updateProfile = async (username: string) => {
    if (!user) throw new Error('Not authenticated');

    // Update local user
    const updatedUser = { ...user, username };

    // Try real API first
    try {
      const token = localStorage.getItem('auth_token');
      if (!token?.startsWith('mock_')) {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ username })
        });

        if (response.ok) {
          const responseUser = await response.json();
          localStorage.setItem('user_data', JSON.stringify(responseUser));
          setUser(responseUser);
          return;
        }
      }
    } catch (err) {
      console.log('Real API update failed, using mock');
    }

    // Fall back to mock update
    if (mockUsers[user.email]) {
      mockUsers[user.email].user = updatedUser;
    }
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
