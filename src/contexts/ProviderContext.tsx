import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Provider interface
export interface Provider {
  id: string;
  businessName: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  logo: string;
  website: string;
  description: string;
  totalListings: number;
  rating: number;
  reviews: number;
  yearsInBusiness: number;
  specialties: string[];
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  isVerified: boolean;
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  joinedDate: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

// Registration data interface
export interface ProviderRegistrationData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  city: string;
}

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

// Mock provider data
const mockProviders: Provider[] = [
  {
    id: 'provider-1',
    businessName: 'Sarabi Listings',
    name: 'John Sarabi',
    email: 'contact@sarabilistings.com',
    phone: '+254 700 123 456',
    city: 'Nairobi',
    state: 'Nairobi County',
    logo: '/api/placeholder/80/80',
    website: 'www.sarabilistings.com',
    description: 'Premier real estate agency specializing in luxury properties and commercial spaces in Nairobi.',
    totalListings: 1299,
    rating: 4.8,
    reviews: 245,
    yearsInBusiness: 8,
    specialties: ['Luxury Homes', 'Commercial', 'Investment Properties'],
    subscriptionPlan: 'premium',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2016-03-15',
    approvedAt: '2016-03-16',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-2',
    businessName: 'Pam Golding Properties',
    name: 'Sarah Pam',
    email: 'info@pamgolding.co.ke',
    phone: '+254 700 234 567',
    city: 'Mombasa',
    state: 'Mombasa County',
    logo: '/api/placeholder/80/80',
    website: 'www.pamgolding.co.ke',
    description: 'Leading property consultancy with expertise in coastal and urban real estate solutions.',
    totalListings: 892,
    rating: 4.6,
    reviews: 189,
    yearsInBusiness: 12,
    specialties: ['Coastal Properties', 'Residential', 'Holiday Homes'],
    subscriptionPlan: 'premium',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2012-08-20',
    approvedAt: '2012-08-21',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-3',
    businessName: 'Coral Property International Ltd',
    name: 'Michael Coral',
    email: 'contact@coralproperty.com',
    phone: '+254 700 345 678',
    city: 'Kisumu',
    state: 'Kisumu County',
    logo: '/api/placeholder/80/80',
    website: 'www.coralproperty.com',
    description: 'International property consultancy offering comprehensive real estate services across East Africa.',
    totalListings: 678,
    rating: 4.7,
    reviews: 156,
    yearsInBusiness: 6,
    specialties: ['International Sales', 'Property Management', 'Consultancy'],
    subscriptionPlan: 'enterprise',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2018-01-10',
    approvedAt: '2018-01-11',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-4',
    businessName: 'Ace Realtors Limited',
    name: 'David Ace',
    email: 'info@acerealtors.co.ke',
    phone: '+254 700 456 789',
    city: 'Nakuru',
    state: 'Nakuru County',
    logo: '/api/placeholder/80/80',
    website: 'www.acerealtors.co.ke',
    description: 'Trusted real estate partner for residential and commercial properties in the Rift Valley region.',
    totalListings: 532,
    rating: 4.5,
    reviews: 98,
    yearsInBusiness: 4,
    specialties: ['Residential', 'Land Sales', 'Property Valuation'],
    subscriptionPlan: 'basic',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2020-05-12',
    approvedAt: '2020-05-13',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-5',
    businessName: 'Prime Properties Kenya',
    name: 'Grace Prime',
    email: 'hello@primeproperties.ke',
    phone: '+254 700 567 890',
    city: 'Eldoret',
    state: 'Uasin Gishu County',
    logo: '/api/placeholder/80/80',
    website: 'www.primeproperties.ke',
    description: 'Innovative real estate solutions with a focus on affordable housing and modern developments.',
    totalListings: 423,
    rating: 4.4,
    reviews: 87,
    yearsInBusiness: 3,
    specialties: ['Affordable Housing', 'New Developments', 'First-time Buyers'],
    subscriptionPlan: 'basic',
    isVerified: false,
    isApproved: false,
    approvalStatus: 'pending',
    joinedDate: '2021-09-08'
  },
  {
    id: 'provider-6',
    businessName: 'New Applicant Agency',
    name: 'Jane Applicant',
    email: 'jane@newagency.com',
    phone: '+254 700 999 888',
    city: 'Nairobi',
    state: 'Nairobi County',
    logo: '/api/placeholder/80/80',
    website: 'www.newagency.com',
    description: 'New real estate agency looking to join the platform.',
    totalListings: 0,
    rating: 0,
    reviews: 0,
    yearsInBusiness: 1,
    specialties: ['Residential', 'First-time Buyers'],
    subscriptionPlan: 'basic',
    isVerified: false,
    isApproved: false,
    approvalStatus: 'pending',
    joinedDate: '2024-02-15'
  },
  // Partner Agent Providers
  {
    id: 'provider-ellington',
    businessName: 'ELLINGTON Properties',
    name: 'ELLINGTON Team',
    email: 'contact@ellington.ae',
    phone: '+971 4 123 4567',
    city: 'Dubai',
    state: 'Dubai',
    logo: '/api/placeholder/80/80',
    website: 'www.ellington.ae',
    description: 'Premium luxury property developer specializing in high-end residential developments in Dubai.',
    totalListings: 45,
    rating: 4.9,
    reviews: 89,
    yearsInBusiness: 15,
    specialties: ['Luxury Villas', 'Premium Developments', 'High-End Properties'],
    subscriptionPlan: 'enterprise',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2020-01-15',
    approvedAt: '2020-01-16',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-emaar',
    businessName: 'EMAAR & PALACE Properties',
    name: 'EMAAR Team',
    email: 'info@emaar.com',
    phone: '+971 4 234 5678',
    city: 'Dubai',
    state: 'Dubai',
    logo: '/api/placeholder/80/80',
    website: 'www.emaar.com',
    description: 'Leading real estate developer with iconic projects across Dubai and international markets.',
    totalListings: 120,
    rating: 4.8,
    reviews: 245,
    yearsInBusiness: 25,
    specialties: ['Downtown Properties', 'Iconic Developments', 'Mixed-Use Projects'],
    subscriptionPlan: 'enterprise',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2019-06-10',
    approvedAt: '2019-06-11',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-meraas',
    businessName: 'MERAAS Developments',
    name: 'MERAAS Team',
    email: 'contact@meraas.ae',
    phone: '+971 4 345 6789',
    city: 'Dubai',
    state: 'Dubai',
    logo: '/api/placeholder/80/80',
    website: 'www.meraas.ae',
    description: 'Innovative developer focused on sustainable and eco-friendly residential communities.',
    totalListings: 78,
    rating: 4.7,
    reviews: 156,
    yearsInBusiness: 12,
    specialties: ['Eco-Friendly Developments', 'Sustainable Living', 'Community Projects'],
    subscriptionPlan: 'premium',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2021-03-20',
    approvedAt: '2021-03-21',
    approvedBy: 'admin-1'
  },
  {
    id: 'provider-omniyat',
    businessName: 'OMNIYAT Properties',
    name: 'OMNIYAT Team',
    email: 'info@omniyat.com',
    phone: '+971 4 456 7890',
    city: 'Dubai',
    state: 'Dubai',
    logo: '/api/placeholder/80/80',
    website: 'www.omniyat.com',
    description: 'Luxury property developer creating exceptional residential and commercial spaces in prime locations.',
    totalListings: 65,
    rating: 4.8,
    reviews: 134,
    yearsInBusiness: 18,
    specialties: ['Luxury Penthouses', 'Marina Properties', 'Premium Locations'],
    subscriptionPlan: 'enterprise',
    isVerified: true,
    isApproved: true,
    approvalStatus: 'approved',
    joinedDate: '2020-09-05',
    approvedAt: '2020-09-06',
    approvedBy: 'admin-1'
  }
];

interface ProviderProviderProps {
  children: ReactNode;
}

export const ProviderProvider: React.FC<ProviderProviderProps> = ({ children }) => {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [isLoading, setIsLoading] = useState(false);

  // Filter providers by status
  const approvedProviders = providers.filter(p => p.isApproved && p.approvalStatus === 'approved');
  const pendingProviders = providers.filter(p => p.approvalStatus === 'pending');
  const rejectedProviders = providers.filter(p => p.approvalStatus === 'rejected');

  const registerProvider = async (data: ProviderRegistrationData): Promise<{ success: boolean; providerId?: string; error?: string }> => {
    setIsLoading(true);

    try {
      // Check if email already exists
      const existingProvider = providers.find(p => p.email === data.email || p.businessEmail === data.businessEmail);
      if (existingProvider) {
        setIsLoading(false);
        return { success: false, error: 'A provider with this email already exists' };
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create new provider with pending status
      const newProvider: Provider = {
        id: `provider-${Date.now()}`,
        businessName: data.businessName,
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        state: `${data.city} County`, // Simple state mapping
        logo: '/api/placeholder/80/80',
        website: `www.${data.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
        description: `Professional real estate services in ${data.city}.`,
        totalListings: 0,
        rating: 0,
        reviews: 0,
        yearsInBusiness: 1,
        specialties: ['Residential', 'Property Sales'],
        subscriptionPlan: 'basic',
        isVerified: false,
        isApproved: false,
        approvalStatus: 'pending',
        joinedDate: new Date().toISOString().split('T')[0]
      };

      setProviders(prev => [...prev, newProvider]);
      setIsLoading(false);
      return { success: true, providerId: newProvider.id };
    } catch (error) {
      console.error('Error registering provider:', error);
      setIsLoading(false);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const approveProvider = async (providerId: string, adminId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? {
              ...provider,
              isApproved: true,
              approvalStatus: 'approved' as const,
              approvedAt: new Date().toISOString(),
              approvedBy: adminId
            }
          : provider
      ));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error approving provider:', error);
      setIsLoading(false);
      return false;
    }
  };

  const rejectProvider = async (providerId: string, adminId: string, reason?: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProviders(prev => prev.map(provider => 
        provider.id === providerId 
          ? {
              ...provider,
              isApproved: false,
              approvalStatus: 'rejected' as const,
              rejectedAt: new Date().toISOString(),
              rejectedBy: adminId,
              rejectionReason: reason
            }
          : provider
      ));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error rejecting provider:', error);
      setIsLoading(false);
      return false;
    }
  };

  const getProvider = (providerId: string): Provider | undefined => {
    return providers.find(p => p.id === providerId);
  };

  const value: ProviderContextType = {
    providers,
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
