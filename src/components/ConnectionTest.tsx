import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setTesting(true);
    setResult('Testing connection...');

    try {
      // Test 1: Basic Supabase client health
      setResult('Step 1: Testing Supabase client...');
      const client = supabase;
      if (!client) {
        throw new Error('Supabase client not initialized');
      }

      // Test 2: Check environment variables
      setResult('Step 2: Checking environment...');
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
      }

      // Test 3: Simple auth check (no database query)
      setResult('Step 3: Testing auth service...');
      const { data: session, error: sessionError } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        )
      ]) as any;

      if (sessionError) {
        setResult(`❌ Auth error: ${sessionError.message}`);
        return;
      }

      // Test 4: Simple database query with timeout
      setResult('Step 4: Testing database query...');
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('id').limit(1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any;

      if (error) {
        setResult(`❌ Database error: ${error.message}\nCode: ${error.code}\nDetails: ${error.details}`);
      } else {
        setResult(`✅ Connection successful!\nSession: ${session?.user ? 'Active' : 'None'}\nQuery: ${data ? 'Success' : 'No data'}`);
      }
    } catch (error) {
      setResult(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold mb-2">Connection Test</h3>
        <Button 
          onClick={testConnection} 
          disabled={testing}
          size="sm"
          className="mb-2"
        >
          {testing ? 'Testing...' : 'Test DB Connection'}
        </Button>
        {result && (
          <div className="text-xs p-2 bg-gray-100 rounded">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};
