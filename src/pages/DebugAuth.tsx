import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DebugAuth: React.FC = () => {
  const { user, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleTestLogin = async () => {
    console.log('🔐 Testing admin login...');
    const result = await login('musilli.luxury@gmail.com', 'admin123');
    console.log('🔐 Login result:', result);
  };

  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    await logout();
  };

  const handleGoToAdmin = () => {
    navigate('/dashboard/admin');
  };

  const handleGoToProvider = () => {
    navigate('/dashboard/provider');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User State</h2>
          
          {isLoading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Status:</strong> {user.status}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>
          ) : (
            <p>No user logged in</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            {!user ? (
              <Button onClick={handleTestLogin} className="w-full">
                Test Admin Login
              </Button>
            ) : (
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Logout
              </Button>
            )}
            
            <Button onClick={handleGoToAdmin} className="w-full">
              Go to Admin Dashboard
            </Button>
            
            <Button onClick={handleGoToProvider} className="w-full">
              Go to Provider Dashboard
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Behavior</h2>
          <ul className="space-y-2 text-sm">
            <li>• Admin user should be redirected to <code>/dashboard/admin</code></li>
            <li>• Provider user should be redirected to <code>/dashboard/provider</code></li>
            <li>• Admin accessing provider dashboard should be redirected to admin dashboard</li>
            <li>• Provider accessing admin dashboard should be denied access</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
