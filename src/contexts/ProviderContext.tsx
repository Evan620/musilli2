import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { providerService, ProviderWithProfile, ProviderRegistrationData } from '@/lib/supabase-providers';

// Provider interface - now using the extended type from supabase service
export interface Provider extends ProviderWithProfile {
  // Keep existing interface for backward compatibility
  businessName: string;
  state: string;
  totalListings: number;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
}

// Export the registration interface from the service
export type { ProviderRegistrationData } from '@/lib/supabase-providers';

// Context type
interface ProviderContextType {
  providers: Provider[];
  approvedProviders: Provider[];
  pendingProviders: Provider[];
  rejectedProviders: Provider[];
  registerProvider: (data: ProviderRegistrationData) => Promise<{ success: boolean; providerId?: string; error?: string }>;
  approveProvider: (providerId: string, adminId: string) => Promise<boolean>;
  rejectProvider: (providerId: string, adminId: string, reason?: string) => Promise<boolean>;
  getProvider: (providerId: string) => Provider | undefined;
  isLoading: boolean;
}

// Create context
const ProviderContext = createContext<ProviderContextType | undefined>(undefined);




interface ProviderProviderProps {
  children: ReactNode;
}

export const ProviderProvider: React.FC<ProviderProviderProps> = ({ children }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transform providers to match existing interface and filter by status
  const transformedProviders = providers.map(p => ({
    ...p,
    businessName: p.business_name,
    state: `${p.city} County`,
    totalListings: p.total_listings,
    subscriptionPlan: (p.subscription_plan || 'basic') as 'basic' | 'premium' | 'enterprise'
  }));

  const approvedProviders = transformedProviders.filter(p => p.isApproved && p.approvalStatus === 'approved');
  const pendingProviders = transformedProviders.filter(p => p.approvalStatus === 'pending');
  const rejectedProviders = transformedProviders.filter(p => p.approvalStatus === 'rejected');

  // Load providers and set up real-time subscription
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadProviders = async () => {
      try {
        setIsLoading(true);
        const providersData = await providerService.getAllProviders();
        setProviders(providersData);
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadProviders();

    // Set up real-time subscription
    unsubscribe = providerService.subscribeToProviders((updatedProviders) => {
      setProviders(updatedProviders);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const registerProvider = async (data: ProviderRegistrationData): Promise<{ success: boolean; providerId?: string; error?: string }> => {
    setIsLoading(true);

    try {
      const result = await providerService.registerProvider(data);
      setIsLoading(false);
      return result;
    } catch (error) {
      console.error('Error registering provider:', error);
      setIsLoading(false);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const approveProvider = async (providerId: string, adminId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const success = await providerService.approveProvider(providerId, adminId);
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('Error approving provider:', error);
      setIsLoading(false);
      return false;
    }
  };

  const rejectProvider = async (providerId: string, adminId: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const success = await providerService.rejectProvider(providerId, adminId, reason);
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('Error rejecting provider:', error);
      setIsLoading(false);
      return false;
    }
  };

  const getProvider = (providerId: string): Provider | undefined => {
    return transformedProviders.find(p => p.id === providerId);
  };

  const value: ProviderContextType = {
    providers: transformedProviders,
    approvedProviders,
    pendingProviders,
    rejectedProviders,
    registerProvider,
    approveProvider,
    rejectProvider,
    getProvider,
    isLoading
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};



export const useProviders = (): ProviderContextType => {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProviders must be used within a ProviderProvider');
  }
  return context;
};
