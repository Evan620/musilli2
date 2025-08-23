import { useState } from 'react';
import { simpleAuth } from '@/lib/simple-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const SimpleLogin = () => {
  const [email, setEmail] = useState('musilli.luxury@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('Attempting login...');

    try {
      const result = await simpleAuth.signIn(email, password);
      
      if (result.success) {
        setResult(`✅ Login successful! User: ${result.user?.email}`);
        // Try to get current user to verify session
        const currentUser = await simpleAuth.getCurrentUser();
        if (currentUser) {
          setResult(`✅ Login & session verified! User: ${currentUser.email} (${currentUser.role})`);
        }
      } else {
        setResult(`❌ Login failed: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    setResult('Checking current user...');
    const user = await simpleAuth.getCurrentUser();
    if (user) {
      setResult(`✅ Current user: ${user.email} (${user.role})`);
    } else {
      setResult('❌ No current user found');
    }
  };

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white border rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold mb-2">Simple Auth Test</h3>
        
        <form onSubmit={handleLogin} className="space-y-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-xs"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-xs"
          />
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading}
              size="sm"
              className="flex-1"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <Button 
              type="button"
              onClick={checkCurrentUser}
              size="sm"
              variant="outline"
            >
              Check User
            </Button>
          </div>
        </form>
        
        {result && (
          <div className="text-xs p-2 bg-gray-100 rounded mt-2">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};
