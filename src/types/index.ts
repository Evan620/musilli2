// Core user types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string; // For Google profile pictures
}

export type UserRole = 'admin' | 'provider' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

// Provider-specific information
export interface Provider extends User {
  role: 'provider';
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  city: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  totalListings: number;
  totalViews: number;
  totalInquiries: number;
  approvedAt?: Date;
  approvedBy?: string;
}

export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise';

// Property types
export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  status: PropertyStatus;
  price: number;
  currency: string;
  location: Location;
  features: PropertyFeatures;
  images: PropertyImage[];
  providerId: string;
  provider?: Provider;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  views: number;
  inquiries: number;
  isFeatured: boolean;
}

export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'airbnb';
export type PropertyCategory = 'sale' | 'rent' | 'short-term-rental';
export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'sold' | 'rented';

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  areaUnit: 'sqft' | 'sqm' | 'acres' | 'hectares';
  parking?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  amenities: string[];
  utilities: string[];
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

// Inquiry system
export interface Inquiry {
  id: string;
  propertyId: string;
  property?: Property;
  inquirerName: string;
  inquirerEmail: string;
  inquirerPhone?: string;
  message: string;
  status: InquiryStatus;
  createdAt: Date;
  respondedAt?: Date;
  response?: string;
}

export type InquiryStatus = 'new' | 'responded' | 'closed';

// Admin dashboard data
export interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  pendingProviders: number;
  totalProperties: number;
  pendingProperties: number;
  totalInquiries: number;
  newInquiries: number;
  revenue: number;
  activeSubscriptions: number;
}

// Provider dashboard data
export interface ProviderStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  totalViews: number;
  totalInquiries: number;
  newInquiries: number;
  monthlyViews: number;
  conversionRate: number;
}

// Form types
export interface PropertyFormData {
  title: string;
  description: string;
  type: PropertyType;
  category: PropertyCategory;
  price: number;
  currency: string;
  location: Omit<Location, 'coordinates'>;
  features: Omit<PropertyFeatures, 'amenities' | 'utilities'> & {
    amenities: string;
    utilities: string;
  };
  images: File[];
}

export interface ProviderRegistrationData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  city: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Search and filter types
export interface PropertySearchFilters {
  query?: string;
  type?: PropertyType;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  amenities?: string[];
  sortBy?: 'price' | 'date' | 'views' | 'area';
  sortOrder?: 'asc' | 'desc';
}

// Context types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (googleUser: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface PropertyContextType {
  properties: Property[];
  addProperty: (property: PropertyFormData) => Promise<boolean>;
  updateProperty: (id: string, property: Partial<PropertyFormData>) => Promise<boolean>;
  deleteProperty: (id: string) => Promise<boolean>;
  getProperty: (id: string) => Property | undefined;
  searchProperties: (filters: PropertySearchFilters) => Property[];
  isLoading: boolean;
}
