import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export const DatabaseCheck = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const checkDatabase = async () => {
    setChecking(true);
    setResults(['Starting database check...']);

    const tables = ['profiles', 'properties', 'providers', 'admin_activity_logs'];
    const newResults: string[] = [];

    for (const table of tables) {
      try {
        newResults.push(`Checking table: ${table}...`);
        setResults([...newResults]);

        const { data, error, count } = await Promise.race([
          supabase.from(table).select('*', { count: 'exact', head: true }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]) as any;

        if (error) {
          newResults.push(`❌ ${table}: ${error.message}`);
        } else {
          newResults.push(`✅ ${table}: ${count || 0} rows`);
        }
      } catch (error) {
        newResults.push(`❌ ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setResults([...newResults]);
    }

    // Check if we can create a simple test record
    try {
      newResults.push('Testing write permissions...');
      setResults([...newResults]);

      // Try to insert a test record (this will fail if RLS is blocking)
      const { error } = await supabase
        .from('profiles')
        .insert({ 
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@test.com',
          name: 'Test User'
        });

      if (error) {
        if (error.code === '23505') {
          newResults.push('✅ Write test: Table exists (duplicate key expected)');
        } else {
          newResults.push(`⚠️ Write test: ${error.message}`);
        }
      } else {
        newResults.push('✅ Write test: Success');
        // Clean up test record
        await supabase.from('profiles').delete().eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      newResults.push(`❌ Write test: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setResults(newResults);
    setChecking(false);
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-32 right-4 z-50">
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-sm max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Database Check</h3>
        <Button 
          onClick={checkDatabase} 
          disabled={checking}
          size="sm"
          className="mb-2"
        >
          {checking ? 'Checking...' : 'Check Database'}
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
