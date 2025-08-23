import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '@/types';
import { authService } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Simple and robust user profile loading
  const loadUserProfile = async () => {
    try {
      console.log('🔄 AuthContext: Loading user profile...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('❌ AuthContext: No valid session');
        setUser(null);
        return;
      }

      const authUser = session.user;
      console.log('👤 AuthContext: Found auth user:', authUser.email);

      // Try to get profile from database (with fallback)
      let profile = null;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (!error && data) {
          profile = data;
          console.log('✅ AuthContext: Profile loaded from database');
        }
      } catch (dbError) {
        console.warn('⚠️ AuthContext: Database query failed, using fallback');
      }

      // Create user object (with database profile or fallback to auth metadata)
      const userObj: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        phone: profile?.phone || authUser.user_metadata?.phone || '',
        role: (profile?.role || authUser.user_metadata?.role || 'user') as UserRole,
        status: profile?.status || authUser.user_metadata?.status || 'approved',
        avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url || null,
        createdAt: new Date(profile?.created_at || authUser.created_at || Date.now()),
        updatedAt: new Date(profile?.updated_at || authUser.updated_at || Date.now())
      };

      console.log('✅ AuthContext: User profile loaded:', { email: userObj.email, role: userObj.role });
      setUser(userObj);
      
    } catch (error) {
      console.error('❌ AuthContext: Error loading user profile:', error);
      setUser(null);
    }
  };

  // Initialize authentication
  const initializeAuth = async () => {
    console.log('🚀 AuthContext: Initializing authentication...');
    setIsLoading(true);
    
    try {
      await loadUserProfile();
    } catch (error) {
      console.error('❌ AuthContext: Initialization failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log('🔗 AuthContext: Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthContext: Auth state changed:', event, !!session?.user);

      if (event === 'SIGNED_OUT') {
        console.log('🔐 AuthContext: User signed out');
        setUser(null);
        setSessionError(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          console.log('🔐 AuthContext: User signed in, loading profile...');
          await loadUserProfile();
        } else {
          setUser(null);
        }
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔐 AuthContext: Token refreshed');
        // Don't reload profile on token refresh to avoid loops
        setIsLoading(false);
      }
    });

    // Initialize auth on mount
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Attempting login...');
      setSessionError(null);
      
      const result = await authService.signIn(email, password);
      
      if (result.success) {
        console.log('✅ AuthContext: Login successful');
        // loadUserProfile will be called by the auth state change listener
        return { success: true };
      } else {
        console.error('❌ AuthContext: Login failed:', result.error);
        setSessionError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setSessionError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🔐 AuthContext: Logging out...');
      setIsLoggingOut(true);
      setUser(null); // Clear user immediately for better UX
      
      await authService.signOut();
      
      // Clear any stored data
      setSessionError(null);
      
      console.log('✅ AuthContext: Logout successful');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Session recovery function
  const recoverSession = async () => {
    console.log('🔄 AuthContext: Attempting session recovery...');
    setSessionError(null);
    setIsLoading(true);

    try {
      await loadUserProfile();
    } catch (error) {
      console.error('❌ AuthContext: Session recovery failed:', error);
      setSessionError('Session recovery failed. Please log in again.');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggingOut,
    sessionError,
    login,
    logout,
    recoverSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Safe auth hook for components that might not be wrapped in AuthProvider
export const useAuthSafe = () => {
  return useContext(AuthContext);
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback = <div>Access denied. Please log in.</div>
}) => {
  const { user, isLoading, isLoggingOut } = useAuth();
  const location = useLocation();

  if (isLoading || isLoggingOut) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Special case: If admin tries to access provider dashboard, redirect to admin dashboard
  if (requiredRole === 'provider' && user.role === 'admin') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  // Check role requirements (admin can access everything)
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
