import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Component to help maintain admin session and prevent unexpected logouts
 * This component runs in the background and helps keep the session alive
 */
export const AdminSessionKeeper = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }



    // Keep session alive by periodically checking it
    const sessionKeepAlive = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          return;
        }

        if (session?.user) {
          
          // Check if token is close to expiring (within 5 minutes)
          const expiresAt = session.expires_at;
          if (expiresAt) {
            const timeUntilExpiry = (expiresAt * 1000) - Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
              try {
                await supabase.auth.refreshSession();
              } catch (refreshError) {
                // Silent refresh failure
              }
            }
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }, 60000); // Check every minute

    // Cleanup interval on unmount
    return () => {
      clearInterval(sessionKeepAlive);
    };
  }, [isAuthenticated, user?.role]);

  // This component doesn't render anything
  return null;
};