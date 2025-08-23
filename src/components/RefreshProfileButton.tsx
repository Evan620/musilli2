import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RefreshProfileButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const RefreshProfileButton: React.FC<RefreshProfileButtonProps> = ({
  className,
  variant = 'outline',
  size = 'default'
}) => {
  const { recoverSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!recoverSession) return;

    setIsRefreshing(true);
    try {
      await recoverSession();
      toast({
        title: "Session Recovered",
        description: "Your session has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Recovery Failed",
        description: "Failed to recover session. Please try logging in again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={className}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Recovering...' : 'Recover Session'}
    </Button>
  );
};
