import { supabase } from '@/lib/supabase';

/**
 * Utility functions for managing authentication sessions
 */

export const sessionUtils = {
  /**
   * Clear all session data and force logout
   */
  async clearSession(): Promise<void> {
    console.log('🧹 SessionUtils: Clearing all session data...');
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all possible storage keys
      const keysToRemove = [
        'sb-auth-token',
        'sb-musilli-auth',
        'supabase.auth.token',
        'sb-pumxggiwvqvjjfjcwsrq-auth-token'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`Could not remove ${key}:`, e);
        }
      });
      
      // Clear any cookies that might be set
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().includes('sb-') || name.trim().includes('supabase')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      console.log('✅ SessionUtils: Session cleared successfully');
    } catch (error) {
      console.error('❌ SessionUtils: Error clearing session:', error);
      throw error;
    }
  },

  /**
   * Check if there's a valid session
   */
  async hasValidSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session?.user;
    } catch (error) {
      console.error('SessionUtils: Error checking session:', error);
      return false;
    }
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<boolean> {
    try {
      console.log('🔄 SessionUtils: Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        console.error('❌ SessionUtils: Session refresh failed:', error);
        return false;
      }
      
      console.log('✅ SessionUtils: Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ SessionUtils: Error refreshing session:', error);
      return false;
    }
  },

  /**
   * Force reload the page to clear any cached state
   */
  forceReload(): void {
    console.log('🔄 SessionUtils: Force reloading page...');
    window.location.reload();
  },

  /**
   * Navigate to login with session cleared
   */
  async redirectToLogin(message?: string): Promise<void> {
    await this.clearSession();
    const url = new URL('/login', window.location.origin);
    if (message) {
      url.searchParams.set('message', message);
    }
    window.location.href = url.toString();
  }
};

/**
 * Hook for session management in React components
 */
export const useSessionUtils = () => {
  return sessionUtils;
};
