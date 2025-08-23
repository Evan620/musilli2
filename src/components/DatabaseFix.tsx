import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export const DatabaseFix = () => {
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const fixDatabase = async () => {
    setFixing(true);
    const newResults: string[] = [];

    try {
      // Test 1: Try to call a simple function
      newResults.push('Testing basic function call...');
      setResults([...newResults]);

      const { data, error } = await supabase.rpc('test_connection');
      
      if (error) {
        newResults.push(`❌ Function call failed: ${error.message}`);
      } else {
        newResults.push(`✅ Function call success: ${data}`);
      }
      setResults([...newResults]);

      // Test 2: Try to create a simple profile entry
      newResults.push('Testing profile creation...');
      setResults([...newResults]);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          email: 'musilli.luxury@gmail.com',
          name: 'Admin User',
          role: 'admin',
          status: 'approved'
        })
        .select()
        .single();

      if (profileError) {
        newResults.push(`❌ Profile creation failed: ${profileError.message}`);
        
        // If it's an RLS error, suggest the fix
        if (profileError.message.includes('RLS') || profileError.message.includes('policy')) {
          newResults.push('🔧 RLS policies need to be set up. Please run the SQL script in Supabase dashboard.');
        }
      } else {
        newResults.push(`✅ Profile created/updated: ${profileData.email}`);
      }
      setResults([...newResults]);

      // Test 3: Try to read profiles
      newResults.push('Testing profile read...');
      setResults([...newResults]);

      const { data: profiles, error: readError } = await supabase
        .from('profiles')
        .select('email, role, status')
        .limit(5);

      if (readError) {
        newResults.push(`❌ Profile read failed: ${readError.message}`);
      } else {
        newResults.push(`✅ Profile read success: ${profiles?.length || 0} profiles found`);
        if (profiles && profiles.length > 0) {
          profiles.forEach(p => {
            newResults.push(`  - ${p.email} (${p.role}, ${p.status})`);
          });
        }
      }
      setResults([...newResults]);

    } catch (error) {
      newResults.push(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResults([...newResults]);
    }

    setFixing(false);
  };

  const showSQLInstructions = () => {
    const instructions = [
      '📋 Manual Fix Instructions:',
      '',
      '1. Go to your Supabase Dashboard',
      '2. Navigate to SQL Editor',
      '3. Run this SQL:',
      '',
      'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE properties DISABLE ROW LEVEL SECURITY;',
      'ALTER TABLE providers DISABLE ROW LEVEL SECURITY;',
      '',
      'INSERT INTO profiles (email, name, role, status)',
      'VALUES (\'musilli.luxury@gmail.com\', \'Admin\', \'admin\', \'approved\')',
      'ON CONFLICT (email) DO UPDATE SET role = \'admin\', status = \'approved\';',
      '',
      '4. Then test the connection again'
    ];
    
    setResults(instructions);
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-md max-h-96 overflow-y-auto">
        <h3 className="font-semibold mb-2">Database Fix</h3>
        
        <div className="flex gap-2 mb-2">
          <Button 
            onClick={fixDatabase} 
            disabled={fixing}
            size="sm"
          >
            {fixing ? 'Testing...' : 'Test Fix'}
          </Button>
          <Button 
            onClick={showSQLInstructions}
            size="sm"
            variant="outline"
          >
            Show SQL
          </Button>
        </div>
        
        {results.length > 0 && (
          <div className="text-xs space-y-1">
            {results.map((result, index) => (
              <div key={index} className="p-1 bg-gray-100 rounded whitespace-pre-wrap">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
