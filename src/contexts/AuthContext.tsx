import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration - in a real app, this would come from an API
const mockUsers: (User & { password: string })[] = [
  {
    id: 'admin-1',
    email: 'admin@musillihomes.com',
    password: 'admin123',
    name: 'Admin User',
    phone: '+1234567890',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'provider-1',
    email: 'provider@example.com',
    password: 'provider123',
    name: 'John Provider',
    phone: '+1234567891',
    role: 'provider',
    status: 'approved',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user-1',
    email: 'user@example.com',
    password: 'user123',
    name: 'Jane User',
    phone: '+1234567892',
    role: 'user',
    status: 'approved',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on app load
    const storedUser = localStorage.getItem('musilli_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('musilli_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(u => u.email === email && u.password === password);

    if (foundUser && foundUser.status === 'approved') {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('musilli_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async (googleUser: any): Promise<boolean> => {
    setIsLoading(true);

    try {
      // In a real app, you would send the Google token to your backend
      // For now, we'll create a user from Google data
      const newUser: User = {
        id: `google-${googleUser.sub}`,
        email: googleUser.email,
        name: googleUser.name,
        phone: '', // Google doesn't always provide phone
        role: 'user' as UserRole,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        avatar: googleUser.picture,
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('musilli_user');
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithGoogle,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <>{fallback}</>;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    </div>;
  }

  return <>{children}</>;
};

// Hook to check if user has specific role
export const useRole = (role: UserRole): boolean => {
  const { user } = useAuth();
  return user?.role === role || user?.role === 'admin';
};

// Hook to check if user is admin
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'admin';
};

// Hook to check if user is provider
export const useIsProvider = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'provider';
};
