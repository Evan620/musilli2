import React from 'react';
import { useAuthSafe } from '@/contexts/AuthContext';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export const SessionErrorBanner: React.FC = () => {
  const authContext = useAuthSafe();
  
  if (!authContext?.sessionError) {
    return null;
  }

  const { sessionError, recoverSession } = authContext;

  const handleRecover = async () => {
    if (recoverSession) {
      await recoverSession();
    }
  };

  const handleDismiss = () => {
    // Clear the error by setting it to null
    // This would need to be implemented in AuthContext
    window.location.reload();
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Session Error
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {sessionError}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRecover}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>
          <button
            onClick={handleDismiss}
            className="inline-flex items-center p-1 border border-transparent rounded-md text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
