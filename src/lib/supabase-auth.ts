import { supabase } from './supabase'
import { User, UserRole } from '@/types'

// Auth service functions
export const authService = {

  // Get current session
  async getSession() {
    return await supabase.auth.getSession();
  },

  // Get current user session
  async getCurrentUser(): Promise<User | null> {
    try {
      // Get user from auth state instead of session to avoid hanging
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('❌ getCurrentUser: User error:', userError)
        return null
      }

      if (!user) {
        console.warn('ℹ️ getCurrentUser: No active user found')
        return null
      }

      console.log('👤 getCurrentUser: Auth user found:', { id: user.id, email: user.email })

      // For admin users and to prevent logout issues, try to get profile but don't fail if it doesn't work
      // This prevents the constant logout issue in admin dashboard
      try {
        console.log('👤 getCurrentUser: Attempting to fetch profile...')
        
        const { data: profile, error: profileError } = await Promise.race([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          )
        ]) as any;

        if (profile && !profileError) {
          console.log('✅ getCurrentUser: Profile found:', { id: profile.id, email: profile.email, role: profile.role, status: profile.status })
          const userObj = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            phone: profile.phone,
            role: profile.role as UserRole,
            status: profile.status,
            avatar: profile.avatar_url,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at)
          };
          console.log('✅ getCurrentUser: Returning user object:', userObj);
          return userObj;
        } else {
          console.warn('⚠️ getCurrentUser: Profile fetch failed, using session data:', profileError)
        }
      } catch (profileError) {
        console.warn('⚠️ getCurrentUser: Profile fetch timed out or failed, using session data:', profileError)
      }

      // Fallback to basic user from session metadata
      // This prevents logout issues when database queries fail
      console.log('⚠️ getCurrentUser: Using fallback user from session metadata')
      console.log('⚠️ getCurrentUser: Session user metadata:', user.user_metadata)
      const fallbackUser = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        phone: user.user_metadata?.phone || '',
        role: (user.user_metadata?.role as UserRole) || 'user',
        status: (user.user_metadata?.status as any) || 'approved',
        avatar: user.user_metadata?.avatar_url || null,
        createdAt: new Date(user.created_at || Date.now()),
        updatedAt: new Date(user.updated_at || Date.now())
      };
      console.log('⚠️ getCurrentUser: Returning fallback user:', fallbackUser);
      return fallbackUser;
    } catch (error) {
      console.error('💥 getCurrentUser: Unexpected error:', error)
      return null
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔐 supabase-auth: Starting signInWithPassword...');
      console.log('🔐 supabase-auth: Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔐 supabase-auth: Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      // Create a Promise that resolves when auth state changes to SIGNED_IN
      const authPromise = new Promise<{ success: boolean; error?: string }>((resolve) => {
        let resolved = false;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('🔐 supabase-auth: Auth state change:', event, !!session);

          if (!resolved) {
            if (event === 'SIGNED_IN' && session) {
              resolved = true;
              subscription.unsubscribe();
              console.log('✅ supabase-auth: SignIn successful via auth state change');
              resolve({ success: true });
            } else if (event === 'SIGNED_OUT') {
              resolved = true;
              subscription.unsubscribe();
              console.log('❌ supabase-auth: Sign out detected during login attempt');
              resolve({ success: false, error: 'Login failed - signed out' });
            }
          }
        });

        // Set a timeout to clean up if nothing happens
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            subscription.unsubscribe();
            console.log('❌ supabase-auth: Auth state change timeout');
            resolve({ success: false, error: 'Login timeout - no auth state change detected' });
          }
        }, 10000);
      });

      console.log('🔐 supabase-auth: Making signInWithPassword request...');
      // Start the sign in process (don't await it, as it might hang)
      supabase.auth.signInWithPassword({
        email,
        password
      }).then(({ data, error }) => {
        console.log('🔐 supabase-auth: SignIn response:', { data, error });
        if (error) {
          console.log('❌ supabase-auth: SignIn error:', error.message);
        }
      }).catch((error) => {
        console.log('❌ supabase-auth: SignIn exception:', error);
      });

      // Wait for auth state change
      return await authPromise;
    } catch (error) {
      console.error('💥 supabase-auth: Exception during sign in:', error)
      
      // More specific error handling
      if (error instanceof Error) {
        if (/connection timeout|timeout/i.test(error.message)) {
          return { 
            success: false, 
            error: 'Connection timeout. This might be due to network issues or browser extensions blocking the request. Try disabling ad blockers or using incognito mode.' 
          }
        }
        if (/network|fetch/i.test(error.message)) {
          return { 
            success: false, 
            error: 'Network error. Please check your internet connection and try again.' 
          }
        }
        if (/cors|cross-origin/i.test(error.message)) {
          return { 
            success: false, 
            error: 'CORS error. This might be due to browser security settings or extensions.' 
          }
        }
      }
      
      return { success: false, error: 'An unexpected error occurred. Please try again or contact support.' }
    }
  },

  // Sign up with email and password
  async signUp(email: string, password: string, name: string, role: UserRole = 'user'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        return { success: true }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error) {
      console.error('Error signing up:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: 'Not authenticated' }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          phone: updates.phone,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}

// Provider-specific auth functions
export const providerAuthService = {
  // Register as provider
  async registerProvider(providerData: {
    name: string
    email: string
    password: string
    phone: string
    businessName: string
    businessEmail: string
    businessPhone: string
    city: string
  }): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> {
    try {
      // First create the auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: providerData.email,
        password: providerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: providerData.name,
            role: 'provider',
            phone: providerData.phone,
            businessName: providerData.businessName,
            businessEmail: providerData.businessEmail,
            businessPhone: providerData.businessPhone,
            city: providerData.city
          }
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (authData.user && !authData.user.email_confirmed_at) {
        // Email confirmation required
        return {
          success: true,
          needsEmailConfirmation: true,
          error: 'Please check your email and click the confirmation link to complete registration.'
        }
      }

      // If email is already confirmed (shouldn't happen in normal flow)
      if (authData.user && authData.user.email_confirmed_at) {
        // Create the provider record
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            user_id: authData.user.id,
            business_name: providerData.businessName,
            business_email: providerData.businessEmail,
            business_phone: providerData.businessPhone,
            city: providerData.city
          })

        if (providerError) {
          return { success: false, error: providerError.message }
        }
      }

      return { success: true, needsEmailConfirmation: true }
    } catch (error) {
      console.error('Error registering provider:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Get provider data for current user
  async getCurrentProvider() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !provider) return null

      return provider
    } catch (error) {
      console.error('Error getting current provider:', error)
      return null
    }
  }
}
