import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { providerAuthService } from '@/lib/supabase-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the tokens from URL
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'signup' && access_token && refresh_token) {
          // Set the session
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) {
            setStatus('error');
            setMessage('Failed to confirm email. Please try again.');
            return;
          }

          if (data.user) {
            // Check if this is a provider registration
            const userMetadata = data.user.user_metadata;
            
            if (userMetadata.role === 'provider') {
              // Create the provider record now that email is confirmed
              const { error: providerError } = await supabase
                .from('providers')
                .insert({
                  user_id: data.user.id,
                  business_name: userMetadata.businessName,
                  business_email: userMetadata.businessEmail,
                  business_phone: userMetadata.businessPhone,
                  city: userMetadata.city
                });

              if (providerError) {
                console.error('Error creating provider record:', providerError);
              }

              // Update profile status to pending (waiting for admin approval)
              await supabase
                .from('profiles')
                .update({ status: 'pending' })
                .eq('id', data.user.id);

              setStatus('success');
              setMessage('Email confirmed! Your provider account is now pending admin approval. You will be notified once approved.');
            } else {
              // Regular user confirmation
              setStatus('success');
              setMessage('Email confirmed! You can now log in to your account.');
            }
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try registering again.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred during email confirmation. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Email Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {status === 'loading' && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-gray-600">Confirming your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-green-800">
                    Email Confirmed!
                  </h3>
                  <p className="text-gray-600">{message}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <XCircle className="h-12 w-12 text-red-600" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-800">
                    Confirmation Failed
                  </h3>
                  <p className="text-gray-600">{message}</p>
                </div>
              </div>
            )}
          </div>

          {status !== 'loading' && (
            <Button 
              onClick={handleContinue}
              className="w-full"
              variant={status === 'success' ? 'default' : 'outline'}
            >
              {status === 'success' ? 'Continue to Login' : 'Try Again'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
