import { supabase } from './supabase';

// Simple auth service that doesn't rely on database queries
export const simpleAuth = {
  async signIn(email: string, password: string) {
    try {
      console.log('🔐 SimpleAuth: Starting sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ SimpleAuth: Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ SimpleAuth: Sign in successful');
        return { 
          success: true, 
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            role: data.user.user_metadata?.role || 'user'
          }
        };
      }

      return { success: false, error: 'No user returned' };
    } catch (error) {
      console.error('💥 SimpleAuth: Exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async getCurrentUser() {
    try {
      console.log('👤 SimpleAuth: Getting current user...');
      
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ SimpleAuth: Get user error:', error);
        return null;
      }

      if (user) {
        console.log('✅ SimpleAuth: User found');
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: user.user_metadata?.role || 'user'
        };
      }

      console.log('ℹ️ SimpleAuth: No user found');
      return null;
    } catch (error) {
      console.error('💥 SimpleAuth: Exception:', error);
      return null;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
};
