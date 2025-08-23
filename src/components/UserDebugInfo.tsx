import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export const UserDebugInfo = () => {
  const { user, recoverSession } = useAuth();
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('Database profile:', profile);
        console.log('Database error:', error);
        setDbProfile(profile);
      }
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>User Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Current User Object (from AuthContext):</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button onClick={recoverSession}>Recover Session</Button>
          <Button onClick={checkDatabase} disabled={loading}>
            {loading ? 'Checking...' : 'Check Database'}
          </Button>
        </div>

        {dbProfile && (
          <div>
            <h3 className="font-semibold mb-2">Database Profile:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(dbProfile, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Access Check Results:</h3>
          <ul className="space-y-1 text-sm">
            <li>User exists: {user ? '✅' : '❌'}</li>
            <li>User role: {user?.role || 'undefined'}</li>
            <li>User status: {user?.status || 'undefined'}</li>
            <li>Is provider: {user?.role === 'provider' ? '✅' : '❌'}</li>
            <li>Is approved: {user?.status === 'approved' ? '✅' : '❌'}</li>
            <li>Should have access: {user?.role === 'provider' && user?.status === 'approved' ? '✅' : '❌'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
