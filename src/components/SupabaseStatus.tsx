import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const SupabaseStatus = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const checkSupabaseStatus = async () => {
    setChecking(true);
    const newResults: string[] = [];

    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    newResults.push(`Supabase URL: ${url ? '✅ Set' : '❌ Missing'}`);
    newResults.push(`Anon Key: ${key ? '✅ Set' : '❌ Missing'}`);
    
    if (url) {
      newResults.push(`URL: ${url}`);
    }
    
    setResults([...newResults]);

    if (!url || !key) {
      setChecking(false);
      return;
    }

    // Test direct HTTP request to Supabase REST API
    try {
      newResults.push('Testing direct HTTP request...');
      setResults([...newResults]);

      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        newResults.push('✅ Direct HTTP: Success');
      } else {
        newResults.push(`❌ Direct HTTP: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      newResults.push(`❌ Direct HTTP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setResults([...newResults]);

    // Test auth endpoint
    try {
      newResults.push('Testing auth endpoint...');
      setResults([...newResults]);

      const response = await fetch(`${url}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });

      if (response.status === 401) {
        newResults.push('✅ Auth endpoint: Accessible (401 expected)');
      } else if (response.ok) {
        newResults.push('✅ Auth endpoint: Success');
      } else {
        newResults.push(`❌ Auth endpoint: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      newResults.push(`❌ Auth endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setResults([...newResults]);
    setChecking(false);
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-sm max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Supabase Status</h3>
        <Button 
          onClick={checkSupabaseStatus} 
          disabled={checking}
          size="sm"
          className="mb-2"
        >
          {checking ? 'Checking...' : 'Check Status'}
        </Button>
        {results.length > 0 && (
          <div className="text-xs space-y-1">
            {results.map((result, index) => (
              <div key={index} className="p-1 bg-gray-100 rounded">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
