// Core user types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'provider' | 'user';
export type UserStatus = 'email_unconfirmed' | 'pending' | 'approved' | 'rejected' | 'suspended';

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
  // Rejection fields
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial' | 'airbnb';
export type PropertyCategory = 'sale' | 'rent' | 'short-term-rental' | 'lease' | 'development_rights';
export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'sold' | 'rented';

// Land-specific types
export type LandZoning = 'residential' | 'commercial' | 'industrial' | 'agricultural' |
  'mixed_use' | 'recreational' | 'institutional' | 'conservation';

export type LandTopography = 'flat' | 'gently_sloping' | 'moderately_sloping' | 'steep' |
  'hilly' | 'mountainous' | 'valley' | 'plateau';

export type SoilType = 'clay' | 'sandy' | 'loamy' | 'rocky' | 'fertile' | 'poor' |
  'well_drained' | 'waterlogged' | 'mixed';

export type LandAccess = 'paved_road' | 'gravel_road' | 'dirt_road' | 'footpath' |
  'no_direct_access' | 'seasonal_access';

export type DevelopmentStatus = 'raw_land' | 'partially_developed' | 'ready_to_build' |
  'subdivided' | 'titled' | 'survey_done';

// Land-specific interfaces
export interface LandDetails {
  id: string;
  propertyId: string;
  // Zoning and Legal
  zoning?: LandZoning;
  titleDeedAvailable: boolean;
  surveyDone: boolean;
  landUsePermit: boolean;
  // Physical Characteristics
  topography?: LandTopography;
  soilType?: SoilType;
  elevationMeters?: number;
  waterSource?: string;
  // Access and Infrastructure
  roadAccess?: LandAccess;
  distanceToMainRoadKm?: number;
  electricityAvailable: boolean;
  waterConnectionAvailable: boolean;
  sewerConnectionAvailable: boolean;
  internetCoverage: boolean;
  // Development Potential
  developmentStatus?: DevelopmentStatus;
  buildingCoverageRatio?: number;
  floorAreaRatio?: number;
  maxBuildingHeightMeters?: number;
  subdivisionPotential: boolean;
  environmentalRestrictions?: string;
  // Agricultural
  agriculturalPotential: boolean;
  currentCrops?: string;
  irrigationAvailable: boolean;
  // Investment Information
  appreciationPotential?: 'high' | 'medium' | 'low';
  nearbyDevelopments?: string;
  futureInfrastructurePlans?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LandBoundary {
  id: string;
  propertyId: string;
  boundaryCoordinates?: any; // GeoJSON format
  surveyReference?: string;
  beaconNumbers: string[];
  neighboringProperties: string[];
  createdAt: Date;
}

export interface LandDocument {
  id: string;
  propertyId: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  documentSize: number;
  uploadedBy: string;
  verifiedBy?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface LandValuation {
  id: string;
  propertyId: string;
  valuationAmount: number;
  valuationCurrency: string;
  valuationDate: Date;
  valuerName: string;
  valuerLicense?: string;
  valuationMethod: 'comparative' | 'income' | 'cost' | 'residual';
  valuationReportUrl?: string;
  validUntil?: Date;
  createdAt: Date;
}

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
  password: string;
  confirmPassword: string;
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
  providerId?: string;
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export interface PropertyContextType {
  properties: Property[];
  addProperty: (
    property: PropertyFormData,
    onProgress?: (current: number, total: number, fileName: string) => void
  ) => Promise<boolean>;
  updateProperty: (id: string, property: Partial<PropertyFormData>) => Promise<boolean>;
  approveProperty: (id: string) => Promise<boolean>;
  rejectProperty: (id: string, rejectionReason?: string) => Promise<boolean>;
  deleteProperty: (id: string) => Promise<boolean>;
  getProperty: (id: string) => Property | undefined;
  getRejectedProperties: () => Promise<Property[]>;
  searchProperties: (filters: PropertySearchFilters) => Property[];
  refreshProperties: () => Promise<void>;
  isLoading: boolean;
}

// Commercial Property Types
export type CommercialPropertyType =
  | 'office_class_a' | 'office_class_b' | 'office_class_c'
  | 'coworking_space' | 'executive_suite'
  | 'shopping_center' | 'strip_mall' | 'standalone_retail'
  | 'restaurant' | 'popup_space'
  | 'warehouse' | 'manufacturing' | 'flex_space'
  | 'cold_storage' | 'logistics_center'
  | 'retail_office_mixed' | 'residential_commercial_mixed'
  | 'hotel_retail_mixed';

export type LeaseType = 'triple_net' | 'gross' | 'modified_gross' | 'percentage' | 'ground_lease';
export type BuildingClass = 'class_a' | 'class_b' | 'class_c';
export type CommercialZoning = 'commercial' | 'industrial' | 'mixed_use' | 'retail' | 'office' | 'warehouse' | 'manufacturing';

export interface CommercialPropertyDetails {
  id: string;
  propertyId: string;
  commercialType: CommercialPropertyType;
  buildingClass?: BuildingClass;
  zoningType: CommercialZoning;
  yearBuilt?: number;
  totalBuildingSize?: number;
  availableSpace?: number;
  ceilingHeight?: number;
  loadingDocks: number;
  parkingSpaces: number;
  parkingRatio?: number;
  leaseType?: LeaseType;
  leaseTermMin?: number;
  leaseTermMax?: number;
  rentPerSqft?: number;
  camCharges?: number;
  securityDepositMonths: number;
  annualEscalation?: number;
  currentOccupancyRate?: number;
  anchorTenants?: string[];
  tenantMix?: string[];
  occupancyCertificateValid: boolean;
  fireSafetyCompliant: boolean;
  adaCompliant: boolean;
  permittedUses?: string[];
  signageRights: boolean;
  driveThroughAvailable: boolean;
  restaurantApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommercialAmenity {
  id: string;
  propertyId: string;
  amenityType: string;
  amenityName: string;
  description?: string;
  isIncluded: boolean;
  additionalCost?: number;
  createdAt: Date;
}

export interface CommercialLeaseHistory {
  id: string;
  propertyId: string;
  tenantName: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  monthlyRent: number;
  securityDeposit?: number;
  leaseType: LeaseType;
  spaceSize?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommercialPropertyAnalytics {
  id: string;
  propertyId: string;
  averageLeaseDuration?: number;
  tenantTurnoverRate?: number;
  vacancyRate?: number;
  rentPerSqftMarket?: number;
  grossRentalIncome?: number;
  operatingExpenses?: number;
  netOperatingIncome?: number;
  capRate?: number;
  comparableProperties?: number;
  marketRentTrend?: number;
  absorptionRate?: number;
  analyticsDate: Date;
  createdAt: Date;
}

export interface CommercialSearchFilters {
  query?: string;
  commercialType?: CommercialPropertyType;
  buildingClass?: BuildingClass;
  zoning?: CommercialZoning;
  minSize?: number;
  maxSize?: number;
  minRent?: number;
  maxRent?: number;
  leaseType?: LeaseType;
  minParking?: number;
  requiredAmenities?: string[];
  sortBy?: 'date' | 'price' | 'size' | 'occupancy';
  sortOrder?: 'asc' | 'desc';
}

// Architectural Plans Types
export type PlanCategory = 'villa' | 'bungalow' | 'maisonette' | 'apartment' | 'cottage' | 'mansion' | 'townhouse' | 'duplex' | 'studio' | 'commercial';
export type PlanStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | 'archived';
export type PlanFileType = 'floor_plan' | '3d_render' | 'elevation' | 'section' | 'site_plan' | 'structural' | 'electrical' | 'plumbing' | 'landscape';

export interface ArchitecturalPlan {
  id: string;
  title: string;
  description: string;
  category: PlanCategory;
  status: PlanStatus;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: AreaUnit;
  floors: number;
  price: number;
  currency: string;
  discountPercentage?: number;
  features: string[];
  style?: string;
  isFeatured: boolean;
  tags: string[];
  views: number;
  downloads: number;
  purchases: number;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  files?: PlanFile[];
  reviews?: PlanReview[];
}

export interface PlanFile {
  id: string;
  planId: string;
  fileType: PlanFileType;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: Date;
}

export interface PlanPurchase {
  id: string;
  planId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  purchasePrice: number;
  currency: string;
  paymentMethod?: string;
  paymentReference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  downloadCount: number;
  firstDownloadedAt?: Date;
  lastDownloadedAt?: Date;
  downloadExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanReview {
  id: string;
  planId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  reviewText?: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
}

export interface PlanSearchFilters {
  category?: PlanCategory;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minArea?: number;
  maxArea?: number;
  style?: string;
  features?: string[];
  tags?: string[];
  sortBy?: 'date' | 'price' | 'popularity' | 'downloads';
  sortOrder?: 'asc' | 'desc';
}
