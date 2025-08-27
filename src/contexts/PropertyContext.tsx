import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, PropertyFormData, PropertySearchFilters, PropertyContextType } from '@/types';
import { propertyService } from '@/lib/supabase-properties';

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Properties will now be loaded from Supabase
// Mock data removed - using real database

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For now, just assume no user (public mode) - we'll fix this later
  const user = null;

  // Function to refresh properties data
  const refreshProperties = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let fetchedProperties: Property[] = [];

      if (user?.role === 'admin') {
        console.log('🔄 PropertyContext: Refreshing ALL properties for admin...');
        fetchedProperties = await propertyService.getAllProperties();
      } else {
        console.log('🔄 PropertyContext: Refreshing published properties...');
        fetchedProperties = await propertyService.getPublishedProperties();
      }

      setProperties(fetchedProperties);
    } catch (error) {
      console.error('❌ PropertyContext: Error refreshing properties:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    console.log('🚀 PropertyContext: Starting to load properties...');

    // Load properties from Supabase
    const loadProperties = async () => {
      setIsLoading(true);

      try {
        let fetchedProperties: Property[] = [];

        if (user?.role === 'admin') {
          console.log('🔄 PropertyContext: Loading ALL properties for admin...');
          // Admin sees all properties (pending, published, etc.)
          fetchedProperties = await propertyService.getAllProperties();
        } else {
          console.log('🔄 PropertyContext: Loading published properties for public...');
          // Public users see only published properties
          fetchedProperties = await propertyService.getPublishedProperties();
        }

        console.log('📊 PropertyContext: Loaded properties:', fetchedProperties.length);
        console.log('📋 Properties by status:', {
          pending: fetchedProperties.filter(p => p.status === 'pending').length,
          published: fetchedProperties.filter(p => p.status === 'published').length,
          draft: fetchedProperties.filter(p => p.status === 'draft').length,
        });
        console.log('📋 Properties by category:', {
          sale: fetchedProperties.filter(p => p.category === 'sale').length,
          rent: fetchedProperties.filter(p => p.category === 'rent').length,
          'short-term-rental': fetchedProperties.filter(p => p.category === 'short-term-rental').length,
        });
        console.log('📋 Properties by type:', {
          house: fetchedProperties.filter(p => p.type === 'house').length,
          apartment: fetchedProperties.filter(p => p.type === 'apartment').length,
          commercial: fetchedProperties.filter(p => p.type === 'commercial').length,
          land: fetchedProperties.filter(p => p.type === 'land').length,
        });

        setProperties(fetchedProperties);
      } catch (error) {
        console.error('❌ PropertyContext: Error loading properties:', error);
        setProperties([]);
      }

      setIsLoading(false);
    };

    loadProperties();
  }, []); // Load properties once on mount

  const addProperty = async (
    propertyData: PropertyFormData,
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    const result = await propertyService.createProperty(propertyData, onProgress);

    if (result.success) {
      // Refresh properties list
      const updatedProperties = await propertyService.getPublishedProperties();
      setProperties(updatedProperties);
      setIsLoading(false);
      return true;
    } else {
      console.error('Error creating property:', result.error);
      setIsLoading(false);
      return false;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<PropertyFormData>): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    const result = await propertyService.updateProperty(id, propertyData);

    if (result.success) {
      // Refresh properties list
      const updatedProperties = await propertyService.getPublishedProperties();
      setProperties(updatedProperties);
      setIsLoading(false);
      return true;
    } else {
      console.error('Error updating property:', result.error);
      setIsLoading(false);
      return false;
    }
  };

  const approveProperty = async (id: string): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;

    setIsLoading(true);

    const result = await propertyService.approveProperty(id);

    if (result.success) {
      // Refresh properties list
      const updatedProperties = await propertyService.getPublishedProperties();
      setProperties(updatedProperties);
      setIsLoading(false);
      return true;
    } else {
      console.error('Error approving property:', result.error);
      setIsLoading(false);
      return false;
    }
  };

  const rejectProperty = async (id: string): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false;

    setIsLoading(true);

    const result = await propertyService.rejectProperty(id);

    if (result.success) {
      // Refresh properties list
      const updatedProperties = await propertyService.getPublishedProperties();
      setProperties(updatedProperties);
      setIsLoading(false);
      return true;
    } else {
      console.error('Error rejecting property:', result.error);
      setIsLoading(false);
      return false;
    }
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    const result = await propertyService.deleteProperty(id);

    if (result.success) {
      // Remove property from local state
      setProperties(prev => prev.filter(p => p.id !== id));
      setIsLoading(false);
      return true;
    } else {
      console.error('Error deleting property:', result.error);
      setIsLoading(false);
      return false;
    }
  };

  const getProperty = (id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  };

  const searchProperties = (filters: PropertySearchFilters): Property[] => {
    // For now, return filtered properties from current state
    // In a full implementation, this could trigger a new API call
    return properties.filter(property => {
      // Only show published properties to non-admin users
      // If no user (public mode), only show published properties
      if (!user && property.status !== 'published') {
        return false;
      }

      // If user is not admin, only show published properties
      if (user && user.role !== 'admin' && property.status !== 'published') {
        return false;
      }

      // Provider filter (for filtering by specific provider)
      if (filters.providerId && property.providerId !== filters.providerId) return false;

      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery =
          property.title.toLowerCase().includes(query) ||
          property.description.toLowerCase().includes(query) ||
          property.location.city.toLowerCase().includes(query) ||
          property.location.address.toLowerCase().includes(query);

        if (!matchesQuery) return false;
      }

      // Type filter
      if (filters.type && property.type !== filters.type) return false;

      // Category filter
      if (filters.category && property.category !== filters.category) return false;

      // City filter
      if (filters.city && property.location.city !== filters.city) return false;

      // Price range
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;

      // Bedrooms
      if (filters.bedrooms && property.features.bedrooms !== filters.bedrooms) return false;

      // Bathrooms
      if (filters.bathrooms && property.features.bathrooms !== filters.bathrooms) return false;

      // Area range
      if (filters.minArea && property.features.area < filters.minArea) return false;
      if (filters.maxArea && property.features.area > filters.maxArea) return false;

      // Amenities
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          property.features.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!filters.sortBy) return 0;

      const order = filters.sortOrder === 'desc' ? -1 : 1;

      switch (filters.sortBy) {
        case 'price':
          return (a.price - b.price) * order;
        case 'date':
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        case 'views':
          return (a.views - b.views) * order;
        case 'area':
          return (a.features.area - b.features.area) * order;
        default:
          return 0;
      }
    });
  };

  const value: PropertyContextType = {
    properties,
    addProperty,
    updateProperty,
    approveProperty,
    rejectProperty,
    deleteProperty,
    getProperty,
    searchProperties,
    refreshProperties,
    isLoading,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
