import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Custom storage adapter with better error handling
const customStorage = {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('Storage removeItem error:', error);
    }
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable URL session detection for proper auth flow
    flowType: 'pkce', // Use PKCE flow for better security and reliability
    storage: customStorage,
    storageKey: 'sb-auth-token', // Use standard storage key
    debug: false // Disable debug logs for cleaner console
  },
  global: {
    headers: {
      'x-client-info': 'musilli-homes@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  return {
    success: false,
    error: error.message || 'An unexpected error occurred'
  }
}

// Helper function for successful responses
export const handleSupabaseSuccess = <T>(data: T) => {
  return {
    success: true,
    data
  }
}
