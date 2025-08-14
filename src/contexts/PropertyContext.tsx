import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, PropertyFormData, PropertySearchFilters, PropertyContextType, PropertyType, PropertyCategory } from '@/types';
import { useAuth } from './AuthContext';

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Mock properties data
const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'Modern Luxury Villa',
    description: 'Beautiful 4-bedroom villa with ocean view, perfect for families or vacation rental.',
    type: 'house',
    category: 'sale',
    status: 'published',
    price: 85000000,
    currency: 'KSH',
    location: {
      address: '123 Ocean Drive',
      city: 'Mombasa',
      state: 'Mombasa County',
      country: 'Kenya',
      zipCode: '80100',
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      area: 3500,
      areaUnit: 'sqft',
      parking: 2,
      furnished: true,
      petFriendly: true,
      amenities: ['Private Pool', 'Garden', 'Security', 'Generator', 'Water Views'],
      utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
    },
    images: [
      {
        id: 'img-1',
        url: '/placeholder.svg',
        alt: 'Villa exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-16'),
    views: 245,
    inquiries: 12,
    isFeatured: true,
  },
  {
    id: 'prop-2',
    title: 'Downtown Apartment',
    description: 'Modern 2-bedroom apartment in the heart of the city, perfect for professionals.',
    type: 'apartment',
    category: 'rent',
    status: 'published',
    price: 120000,
    currency: 'KSH',
    location: {
      address: '456 City Center',
      city: 'Kisumu',
      state: 'Kisumu County',
      country: 'Kenya',
      zipCode: '40100',
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      areaUnit: 'sqft',
      parking: 1,
      furnished: true,
      petFriendly: false,
      amenities: ['Gym', 'Elevator', 'Security', 'Furnished'],
      utilities: ['Electricity', 'Water', 'Internet'],
    },
    images: [
      {
        id: 'img-2',
        url: '/placeholder.svg',
        alt: 'Apartment living room',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    publishedAt: new Date('2024-02-02'),
    views: 156,
    inquiries: 8,
    isFeatured: false,
  },
  {
    id: 'prop-3',
    title: 'Prime Commercial Land',
    description: '5-acre commercial land in developing area, perfect for shopping center or office complex.',
    type: 'land',
    category: 'sale',
    status: 'published',
    price: 50000000,
    currency: 'KSH',
    location: {
      address: 'Industrial Area',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      zipCode: '00100',
    },
    features: {
      area: 5,
      areaUnit: 'acres',
      amenities: ['Road Access', 'Electricity Connection', 'Title Deed Ready'],
      utilities: ['Electricity', 'Water'],
    },
    images: [
      {
        id: 'img-3',
        url: '/placeholder.svg',
        alt: 'Commercial land',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-1',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    publishedAt: new Date('2024-02-11'),
    views: 89,
    inquiries: 5,
    isFeatured: false,
  },
  {
    id: 'prop-land-2',
    title: 'Residential Plot in Gated Community',
    description: '1-acre residential plot in exclusive gated community with all amenities and security.',
    type: 'land',
    category: 'sale',
    status: 'published',
    price: 15000000,
    currency: 'KSH',
    location: {
      address: 'Runda Estate',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      zipCode: '00100',
    },
    features: {
      area: 1,
      areaUnit: 'acres',
      amenities: ['Road Access', 'Electricity Connection', 'Water Access', 'Title Deed Ready', 'Close to Park'],
      utilities: ['Electricity', 'Water', 'Sewer'],
    },
    images: [
      {
        id: 'img-land-2',
        url: '/placeholder.svg',
        alt: 'Residential plot',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    publishedAt: new Date('2024-01-10'),
    views: 156,
    inquiries: 23,
    isFeatured: true,
  },
  {
    id: 'prop-land-3',
    title: 'Agricultural Land - Prime Farming',
    description: '50-acre agricultural land with fertile soil, perfect for farming and livestock.',
    type: 'land',
    category: 'sale',
    status: 'published',
    price: 75000000,
    currency: 'KSH',
    location: {
      address: 'Nakuru County',
      city: 'Nakuru',
      state: 'Nakuru County',
      country: 'Kenya',
      zipCode: '20100',
    },
    features: {
      area: 50,
      areaUnit: 'acres',
      amenities: ['Water Access', 'Road Access', 'Title Deed Ready'],
      utilities: ['Water'],
    },
    images: [
      {
        id: 'img-land-3',
        url: '/placeholder.svg',
        alt: 'Agricultural land',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    publishedAt: new Date('2024-01-05'),
    views: 234,
    inquiries: 18,
    isFeatured: false,
  },
  {
    id: 'prop-4',
    title: 'Brand New Luxury Penthouse',
    description: 'Brand new 3-bedroom penthouse with private pool and upgraded finishes.',
    type: 'apartment',
    category: 'sale',
    status: 'published',
    price: 120000000,
    currency: 'KSH',
    location: {
      address: '789 Westlands Avenue',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      zipCode: '00100',
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2500,
      areaUnit: 'sqft',
      parking: 2,
      furnished: false,
      petFriendly: true,
      amenities: ['Private Pool', 'Brand New', 'Upgraded', 'Security', 'Elevator'],
      utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
    },
    images: [
      {
        id: 'img-4',
        url: '/placeholder.svg',
        alt: 'Penthouse exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-1',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    publishedAt: new Date('2024-03-02'),
    views: 320,
    inquiries: 18,
    isFeatured: true,
  },
  {
    id: 'prop-5',
    title: 'Furnished Family Home Near Park',
    description: 'Spacious 5-bedroom family home, fully furnished and close to recreational park.',
    type: 'house',
    category: 'rent',
    status: 'published',
    price: 250000,
    currency: 'KSH',
    location: {
      address: '321 Karen Road',
      city: 'Nairobi',
      state: 'Nairobi County',
      country: 'Kenya',
      zipCode: '00100',
    },
    features: {
      bedrooms: 5,
      bathrooms: 4,
      area: 4000,
      areaUnit: 'sqft',
      parking: 3,
      furnished: true,
      petFriendly: true,
      amenities: ['Furnished', 'Close to Park', 'Large Plot', 'Garden', 'Security'],
      utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
    },
    images: [
      {
        id: 'img-5',
        url: '/placeholder.svg',
        alt: 'Family home exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-1',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    publishedAt: new Date('2024-03-11'),
    views: 180,
    inquiries: 14,
    isFeatured: false,
  },
  // Partner Agent Properties
  {
    id: 'partner-prop-1',
    title: 'Palace Villas Ceara',
    description: 'Luxury villa development in The One with premium finishes and world-class amenities.',
    type: 'house',
    category: 'sale',
    status: 'published',
    price: 151550000,
    currency: 'KSH',
    location: {
      address: 'The One Development',
      city: 'Kiambu',
      state: 'Kiambu County',
      country: 'Kenya',
      zipCode: '00900',
    },
    features: {
      bedrooms: 4,
      bathrooms: 5,
      area: 4500,
      areaUnit: 'sqft',
      parking: 2,
      furnished: false,
      petFriendly: true,
      amenities: ['Private Pool', 'Garden', 'Security', 'Luxury Finishes', 'Premium Location'],
      utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
    },
    images: [
      {
        id: 'partner-img-1',
        url: '/api/placeholder/300/200',
        alt: 'Palace Villas Ceara exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-ellington',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: new Date('2024-01-01'),
    views: 450,
    inquiries: 25,
    isFeatured: true,
  },
  {
    id: 'partner-prop-2',
    title: 'Address Grand Downtown',
    description: 'Modern apartment in the heart of downtown with stunning city views and premium amenities.',
    type: 'apartment',
    category: 'sale',
    status: 'published',
    price: 19800000,
    currency: 'KSH',
    location: {
      address: 'Downtown District',
      city: 'Eldoret',
      state: 'Uasin Gishu County',
      country: 'Kenya',
      zipCode: '30100',
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      area: 1800,
      areaUnit: 'sqft',
      parking: 1,
      furnished: false,
      petFriendly: false,
      amenities: ['City Views', 'Gym', 'Security', 'Elevator', 'Modern Design'],
      utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
    },
    images: [
      {
        id: 'partner-img-2',
        url: '/api/placeholder/300/200',
        alt: 'Address Grand Downtown exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-emaar',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    publishedAt: new Date('2024-01-02'),
    views: 320,
    inquiries: 18,
    isFeatured: true,
  },
  {
    id: 'partner-prop-3',
    title: 'The Acres',
    description: 'Eco-friendly development in Thika offering sustainable living with modern amenities.',
    type: 'house',
    category: 'sale',
    status: 'published',
    price: 35000000,
    currency: 'KSH',
    location: {
      address: 'Thika Community',
      city: 'Thika',
      state: 'Kiambu County',
      country: 'Kenya',
      zipCode: '01000',
    },
    features: {
      bedrooms: 3,
      bathrooms: 3,
      area: 2800,
      areaUnit: 'sqft',
      parking: 2,
      furnished: false,
      petFriendly: true,
      amenities: ['Eco-Friendly', 'Garden', 'Security', 'Community Pool', 'Sustainable Design'],
      utilities: ['Electricity', 'Water', 'Internet', 'Solar Power'],
    },
    images: [
      {
        id: 'partner-img-3',
        url: '/api/placeholder/300/200',
        alt: 'The Acres exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-meraas',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    publishedAt: new Date('2024-01-03'),
    views: 280,
    inquiries: 15,
    isFeatured: true,
  },
  {
    id: 'partner-prop-4',
    title: 'Tales by Beyond',
    description: 'Luxury penthouse development in Machakos with premium finishes and scenic views.',
    type: 'apartment',
    category: 'sale',
    status: 'published',
    price: 25000000,
    currency: 'KSH',
    location: {
      address: 'Marina District',
      city: 'Machakos',
      state: 'Machakos County',
      country: 'Kenya',
      zipCode: '90100',
    },
    features: {
      bedrooms: 2,
      bathrooms: 3,
      area: 2200,
      areaUnit: 'sqft',
      parking: 1,
      furnished: false,
      petFriendly: false,
      amenities: ['Marina Views', 'Luxury Finishes', 'Security', 'Elevator', 'Premium Location'],
      utilities: ['Electricity', 'Water', 'Internet', 'Gas'],
    },
    images: [
      {
        id: 'partner-img-4',
        url: '/api/placeholder/300/200',
        alt: 'Tales by Beyond exterior',
        isPrimary: true,
        order: 1,
      },
    ],
    providerId: 'provider-omniyat',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    publishedAt: new Date('2024-01-04'),
    views: 380,
    inquiries: 22,
    isFeatured: true,
  },
];

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load properties from localStorage or use mock data
    // Clear old cached data and use updated mock data with KSH currency
    const storedProperties = localStorage.getItem('musilli_properties');
    const dataVersion = localStorage.getItem('musilli_properties_version');
    const currentVersion = '2.0'; // Updated version with KSH currency

    if (storedProperties && dataVersion === currentVersion) {
      try {
        const parsedProperties = JSON.parse(storedProperties);
        // Double-check that all properties have KSH currency
        const hasOldCurrency = parsedProperties.some((p: Property) => p.currency !== 'KSH');
        if (hasOldCurrency) {
          console.log('Found old currency data, refreshing with KSH...');
          setProperties(mockProperties);
          localStorage.setItem('musilli_properties_version', currentVersion);
        } else {
          setProperties(parsedProperties);
        }
      } catch (error) {
        console.error('Error parsing stored properties:', error);
        setProperties(mockProperties);
        localStorage.setItem('musilli_properties_version', currentVersion);
      }
    } else {
      // Use fresh mock data with KSH currency
      console.log('Loading fresh property data with KSH currency...');
      setProperties(mockProperties);
      localStorage.setItem('musilli_properties_version', currentVersion);
    }
    setIsLoading(false);
  }, []);

  // Save properties to localStorage whenever properties change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('musilli_properties', JSON.stringify(properties));
    }
  }, [properties, isLoading]);

  const addProperty = async (propertyData: PropertyFormData): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title: propertyData.title,
      description: propertyData.description,
      type: propertyData.type,
      category: propertyData.category,
      status: user.role === 'admin' ? 'published' : 'pending',
      price: propertyData.price,
      currency: propertyData.currency,
      location: propertyData.location,
      features: {
        ...propertyData.features,
        amenities: propertyData.features.amenities.split(',').map(a => a.trim()).filter(Boolean),
        utilities: propertyData.features.utilities.split(',').map(u => u.trim()).filter(Boolean),
      },
      images: propertyData.images.map((file, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: URL.createObjectURL(file), // In real app, upload to server
        alt: `${propertyData.title} image ${index + 1}`,
        isPrimary: index === 0,
        order: index + 1,
      })),
      providerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: user.role === 'admin' ? new Date() : undefined,
      views: 0,
      inquiries: 0,
      isFeatured: false,
    };

    setProperties(prev => [...prev, newProperty]);
    setIsLoading(false);
    return true;
  };

  const updateProperty = async (id: string, propertyData: Partial<PropertyFormData>): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setProperties(prev => prev.map(property => {
      if (property.id === id && (user.role === 'admin' || property.providerId === user.id)) {
        return {
          ...property,
          ...propertyData,
          updatedAt: new Date(),
        };
      }
      return property;
    }));

    setIsLoading(false);
    return true;
  };

  const deleteProperty = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setProperties(prev => prev.filter(property => 
      property.id !== id || (user.role !== 'admin' && property.providerId !== user.id)
    ));

    setIsLoading(false);
    return true;
  };

  const getProperty = (id: string): Property | undefined => {
    return properties.find(property => property.id === id);
  };

  const searchProperties = (filters: PropertySearchFilters): Property[] => {
    return properties.filter(property => {
      // Only show published properties to non-admin users
      if (user?.role !== 'admin' && property.status !== 'published') {
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
    deleteProperty,
    getProperty,
    searchProperties,
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
