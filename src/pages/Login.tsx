import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { GoogleSignIn, decodeGoogleJWT } from "@/components/ui/google-signin";
import { PageTransition, FadeTransition } from "@/components/ui/page-transition";

import { Eye, EyeOff, LogIn, Building2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitingForUser, setWaitingForUser] = useState(false);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pull redirect target and message from navigation state
  const from = (location.state as any)?.from || '/';
  const incomingMessage = (location.state as any)?.message as string | undefined;

  useEffect(() => {
    if (incomingMessage) {
      // Show a friendly notice when redirected from protected routes
      setError(incomingMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle redirect after successful login
  useEffect(() => {
    if (user && !isLoading) {
      // If we were redirected here from a protected page, go back there
      if ((location.state as any)?.from) {
        const target = (location.state as any).from as string;
        navigate(target, { replace: true });
      } else {
        // Check if user needs approval
        if (user.status !== 'approved') {
          navigate('/pending-approval', { replace: true });
        } else {
          // Redirect based on user role
          const redirectPath = user.role === 'admin' ? '/dashboard/admin' :
                             user.role === 'provider' ? '/dashboard/provider' : '/';
          navigate(redirectPath, { replace: true });
        }
      }
    }
  }, [user, isLoading, location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        // Show success feedback immediately
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });

        // Set flag to wait for user to be loaded by auth state listener
        setWaitingForUser(true);
      } else {
        setError(result.error || "Invalid email or password. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("Google sign-in is temporarily disabled. Please use email/password login.");
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed. Please try again.");
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
        <div className="w-full max-w-md">
          <FadeTransition show={true} className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Musilli homes</h1>
            </div>
            <p className="text-white/80">Sign in to your account</p>
          </FadeTransition>

          <Card className="backdrop-blur-sm bg-white/95 shadow-2xl transform transition-all duration-300 hover:shadow-3xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FadeTransition show={!!error}>
                {error && (
                  <Alert variant="destructive" className="transition-all duration-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </FadeTransition>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full transition-all duration-200"
                disabled={isSubmitting || waitingForUser}
              >
                {waitingForUser ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Redirecting...
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign-In */}
            <div className="mb-4">
              <GoogleSignIn
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text={isSubmitting ? "Signing in..." : "Continue with Google"}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
};

export default Login;
