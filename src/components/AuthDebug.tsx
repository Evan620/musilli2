import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export const AuthDebug = () => {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [debugVisible, setDebugVisible] = useState(false);

  useEffect(() => {
    const getSessionInfo = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({ session: session ? 'exists' : 'none', error: error?.message });
    };
    getSessionInfo();
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setDebugVisible(!debugVisible)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
      >
        Auth Debug
      </button>
      
      {debugVisible && (
        <div className="absolute bottom-8 right-0 bg-black text-white p-4 rounded text-xs max-w-sm">
          <div className="space-y-2">
            <div>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {user ? `${user.email} (${user.role})` : 'None'}
            </div>
            <div>
              <strong>Session:</strong> {sessionInfo?.session || 'Unknown'}
            </div>
            <div>
              <strong>URL:</strong> {window.location.pathname}
            </div>
            {sessionInfo?.error && (
              <div className="text-red-400">
                <strong>Error:</strong> {sessionInfo.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
