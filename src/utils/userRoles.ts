import { User } from '@/types';

/**
 * Utility functions for user role management and differentiation
 */

// Musilli admin email (site owner)
export const MUSILLI_ADMIN_EMAIL = 'musilli.luxury@gmail.com';
export const MUSILLI_BUSINESS_NAME = 'Musilli Homes';

/**
 * Check if user is the site admin (Musilli)
 */
export const isMusilliAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin' && user.email === MUSILLI_ADMIN_EMAIL;
};

/**
 * Check if user is any admin (including Musilli)
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin';
};

/**
 * Check if user is a regular provider (not Musilli admin)
 */
export const isRegularProvider = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'provider' && user.email !== MUSILLI_ADMIN_EMAIL;
};

/**
 * Check if provider is Musilli Homes (main company)
 */
export const isMusilliProvider = (provider: any): boolean => {
  if (!provider) return false;
  return provider.business_name === MUSILLI_BUSINESS_NAME || 
         provider.businessName === MUSILLI_BUSINESS_NAME;
};

/**
 * Get user role display name
 */
export const getUserRoleDisplay = (user: User | null): string => {
  if (!user) return 'Guest';
  
  if (isMusilliAdmin(user)) return 'Site Admin (Musilli)';
  if (user.role === 'admin') return 'Admin';
  if (user.role === 'provider') return 'Provider';
  return 'User';
};

/**
 * Get provider type display name
 */
export const getProviderTypeDisplay = (provider: any): string => {
  if (!provider) return 'Unknown';
  
  if (isMusilliProvider(provider)) return 'Musilli Homes (Main Company)';
  return 'Partner Agent';
};

/**
 * Check if user can manage providers (admin only)
 */
export const canManageProviders = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Check if user can manage all properties (admin only)
 */
export const canManageAllProperties = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Check if user can access admin dashboard
 */
export const canAccessAdminDashboard = (user: User | null): boolean => {
  return isAdmin(user);
};

/**
 * Check if user can access provider dashboard
 */
export const canAccessProviderDashboard = (user: User | null): boolean => {
  return user?.role === 'provider' || isAdmin(user);
};

/**
 * Get appropriate dashboard route for user
 */
export const getDashboardRoute = (user: User | null): string => {
  if (!user) return '/login';

  if (isAdmin(user)) return '/dashboard/admin';
  if (user.role === 'provider') return '/dashboard/provider';
  return '/';
};

/**
 * Filter properties by ownership type
 */
export const filterPropertiesByOwnership = (
  properties: any[], 
  type: 'musilli' | 'partners' | 'all' = 'all'
) => {
  if (type === 'all') return properties;
  
  return properties.filter(property => {
    const isMusilliProperty = property.provider?.business_name === MUSILLI_BUSINESS_NAME ||
                             property.provider?.businessName === MUSILLI_BUSINESS_NAME;
    
    return type === 'musilli' ? isMusilliProperty : !isMusilliProperty;
  });
};
