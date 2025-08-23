import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NetworkTest = () => {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runNetworkTests = async () => {
    setTesting(true);
    setResults([]);

    // Test 1: Basic internet connectivity
    try {
      addResult('🔍 Testing basic internet connectivity...');
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        addResult('✅ Internet: Connected');
      } else {
        addResult(`❌ Internet: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Internet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: DNS resolution for Supabase
    try {
      addResult('🔍 Testing DNS resolution for Supabase...');
      const response = await fetch('https://pumxggiwvqvjjfjcwsrq.supabase.co', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      addResult('✅ DNS: Supabase domain resolves');
    } catch (error) {
      addResult(`❌ DNS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: CORS preflight
    try {
      addResult('🔍 Testing CORS preflight...');
      const response = await fetch('https://pumxggiwvqvjjfjcwsrq.supabase.co/rest/v1/', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'apikey,authorization'
        }
      });
      addResult('✅ CORS: Preflight successful');
    } catch (error) {
      addResult(`❌ CORS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Direct Supabase REST API
    try {
      addResult('🔍 Testing direct Supabase REST API...');
      const response = await fetch('https://pumxggiwvqvjjfjcwsrq.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      if (response.ok) {
        addResult('✅ Supabase REST: Connected');
      } else {
        addResult(`❌ Supabase REST: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Supabase REST: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Supabase Auth endpoint
    try {
      addResult('🔍 Testing Supabase Auth endpoint...');
      const response = await fetch('https://pumxggiwvqvjjfjcwsrq.supabase.co/auth/v1/settings', {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      });
      if (response.ok) {
        addResult('✅ Supabase Auth: Connected');
      } else {
        addResult(`❌ Supabase Auth: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addResult(`❌ Supabase Auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Network Connectivity Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runNetworkTests} 
                disabled={testing}
                className="w-full"
              >
                {testing ? 'Running Tests...' : 'Run Network Tests'}
              </Button>
              
              {results.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold">Test Results:</h3>
                  {results.map((result, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Environment Info:</h3>
                <div className="text-sm space-y-1">
                  <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</div>
                  <div>Has Anon Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</div>
                  <div>User Agent: {navigator.userAgent}</div>
                  <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkTest;