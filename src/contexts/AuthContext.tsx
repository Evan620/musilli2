import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Simple user creation from auth user - NO DATABASE QUERIES
  const createUserFromAuth = (authUser: any): User => {
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      phone: authUser.user_metadata?.phone || '',
      role: (authUser.user_metadata?.role as UserRole) || 'user',
      status: authUser.user_metadata?.status || 'approved',
      avatar: authUser.user_metadata?.avatar_url || null,
      createdAt: new Date(authUser.created_at || Date.now()),
      updatedAt: new Date(authUser.updated_at || Date.now())
    };
  };

  // Initialize auth on mount - OPTIMIZED FOR SEAMLESS REFRESH
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          setUser(createUserFromAuth(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
        setIsInitialized(true);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(createUserFromAuth(session.user));
        if (isInitialized) setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (isInitialized) setIsLoading(false);
      }
    });

    // The auth state listener will handle initialization
    // No need for separate initAuth function

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // User will be set by the auth state change listener
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // User will be cleared by the auth state change listener
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear user even if logout fails
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role requirements (admin can access everything)
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
