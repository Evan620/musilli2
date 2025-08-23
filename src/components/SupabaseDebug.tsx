import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';


export const SupabaseDebug = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkSupabaseConnectivity = async () => {
    setChecking(true);
    setResults([]);

    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    addResult(`Supabase URL: ${url ? '✅ Set' : '❌ Missing'}`);
    addResult(`Anon Key: ${key ? '✅ Set (length: ' + key.length + ')' : '❌ Missing'}`);
    
    if (!url || !key) {
      setChecking(false);
      return;
    }

    // Test 1: Basic fetch to Supabase REST API
    try {
      addResult('🔍 Testing basic REST API connectivity...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        addResult('✅ REST API: Connected successfully');
      } else {
        addResult(`❌ REST API: ${response.status} ${response.statusText}`);
        const text = await response.text();
        addResult(`Response: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      addResult(`❌ REST API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Auth endpoint
    try {
      addResult('🔍 Testing auth endpoint...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${url}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        addResult('✅ Auth endpoint: Accessible (401 expected without user token)');
      } else if (response.ok) {
        addResult('✅ Auth endpoint: Success');
      } else {
        addResult(`❌ Auth endpoint: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Auth endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Supabase client getSession
    try {
      addResult('🔍 Testing Supabase client getSession...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([
        sessionPromise,
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('getSession timeout')));
        })
      ]);

      clearTimeout(timeoutId);
      addResult('✅ Supabase getSession: Success');
    } catch (error) {
      addResult(`❌ Supabase getSession: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Simple database query
    try {
      addResult('🔍 Testing simple database query...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const queryPromise = supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const result = await Promise.race([
        queryPromise,
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('DB query timeout')));
        })
      ]);

      clearTimeout(timeoutId);
      addResult('✅ Database query: Success');
    } catch (error) {
      addResult(`❌ Database query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Network diagnostics
    try {
      addResult('🔍 Testing network connectivity to google.com...');
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      addResult('✅ Network: Internet connectivity OK');
    } catch (error) {
      addResult(`❌ Network: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 6: DNS resolution
    try {
      addResult('🔍 Testing DNS resolution for Supabase domain...');
      const response = await fetch(`https://pumxggiwvqvjjfjcwsrq.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: { 'apikey': key }
      });
      addResult('✅ DNS: Supabase domain resolves');
    } catch (error) {
      addResult(`❌ DNS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setChecking(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const forceSignOut = async () => {
    try {
      addResult('🔍 Clearing session and storage...');

      // Clear localStorage
      localStorage.clear();

      // Sign out from Supabase
      await supabase.auth.signOut();

      addResult('✅ Session cleared successfully');
      addResult('💡 Suggestion: Try logging in again or reload the page');

    } catch (error) {
      addResult(`❌ Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Supabase Debug</h3>
        <div className="space-y-2 mb-4">
          <Button 
            onClick={checkSupabaseConnectivity} 
            disabled={checking}
            size="sm"
            className="w-full"
          >
            {checking ? 'Running Tests...' : 'Run Connectivity Tests'}
          </Button>
          <Button 
            onClick={forceSignOut} 
            disabled={checking}
            size="sm"
            variant="outline"
            className="w-full"
          >
            Force Sign Out & Clear Storage
          </Button>
          <Button 
            onClick={reloadPage} 
            disabled={checking}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            Reload Page
          </Button>
          <Button 
            onClick={clearResults} 
            disabled={checking}
            size="sm"
            variant="ghost"
            className="w-full"
          >
            Clear Results
          </Button>
        </div>
        {results.length > 0 && (
          <div className="text-xs space-y-1 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded text-xs font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};