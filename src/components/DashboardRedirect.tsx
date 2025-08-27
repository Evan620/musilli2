import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/utils/userRoles';

/**
 * Component that automatically redirects users to their appropriate dashboard
 * Used for generic /dashboard route
 */
export const DashboardRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      const dashboardRoute = getDashboardRoute(user);
      navigate(dashboardRoute, { replace: true });
    } else if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading state while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Redirecting...</p>
      </div>
    </div>
  );
};
