import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/contexts/PropertyContext";
import { useProviders } from "@/contexts/ProviderContext";
import { PropertySearchFilters } from "@/types";

import { Search, MapPin, Eye, MessageSquare, Bed, Bath, Car, Home, Building2, ArrowLeft } from "lucide-react";

const Rentals = () => {
  const { searchProperties, properties } = useProperties();
  const { getProvider } = useProviders();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if we should show all properties (from "View All Properties" button)
  const showAllProperties = searchParams.get('showAll') === 'true';

  // Check if we're filtering by a specific provider
  const providerId = searchParams.get('provider');
  const selectedProvider = providerId ? getProvider(providerId) : null;

  // Debug logging
  useEffect(() => {
    if (providerId) {
      console.log('Filtering by provider ID:', providerId);
      console.log('Selected provider:', selectedProvider);
      console.log('Properties with this provider ID:', properties.filter(p => p.providerId === providerId));
    }
  }, [providerId, selectedProvider, properties]);

  const [filters, setFilters] = useState<PropertySearchFilters>({
    query: "",
    category: showAllProperties ? "sale" : "rent",  // When showing all properties, default to sale
    providerId: providerId || undefined,  // Filter by provider if specified
    sortBy: "date",
    sortOrder: "desc",
  });

  // State for search properties by feature
  const [searchType, setSearchType] = useState<'sale' | 'rent'>(showAllProperties ? 'sale' : 'rent');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const features = [
    'Private Pool',
    'Upgraded',
    'Large Plot',
    'Close to Park',
    'Brand New',
    'Furnished',
    'Vacant on Transfer',
    'Water Views',
    'Road Access',
    'Title Deed Ready',
    'Electricity Connection',
    'Water Access'
  ];

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const getFeatureCount = (feature: string) => {
    return properties.filter(p => {
      // When showing all properties, count features across all categories
      // When in rental mode, only count rental properties
      const categoryMatch = showAllProperties ? true : p.category === searchType;

      // When filtering by provider, only count properties from that provider
      const providerMatch = providerId ? p.providerId === providerId : true;

      return categoryMatch &&
        providerMatch &&
        p.status === 'published' &&
        (p.features.amenities || []).some(amenity =>
          amenity.toLowerCase().includes(feature.toLowerCase()) ||
          feature.toLowerCase().includes(amenity.toLowerCase())
        );
    }).length;
  };

  // Filter properties based on selected features and search type
  const getFilteredProperties = () => {
    if (selectedFeatures.length === 0) return [];

    return properties.filter(property => {
      // Filter by status first
      if (property.status !== 'published') return false;

      // Filter by provider if specified
      if (providerId && property.providerId !== providerId) return false;

      // Filter by category (sale/rent) - when showing all properties, include both
      if (!showAllProperties && property.category !== searchType) return false;
      if (showAllProperties && property.category !== searchType) return false;

      // Check if property has any of the selected features
      const propertyFeatures = property.features.amenities || [];
      return selectedFeatures.some(feature =>
        propertyFeatures.some(amenity =>
          amenity.toLowerCase().includes(feature.toLowerCase()) ||
          feature.toLowerCase().includes(amenity.toLowerCase())
        )
      );
    });
  };

  const filteredProperties = getFilteredProperties();

  // Update search type when showAllProperties changes
  useEffect(() => {
    if (showAllProperties && searchType === 'rent') {
      setSearchType('sale'); // Default to 'sale' when showing all properties
    }
  }, [showAllProperties, searchType]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters: PropertySearchFilters = {
      query: searchParams.get('query') || "",
      category: (searchParams.get('category') as any) || (showAllProperties ? undefined : "rent"),
      type: (searchParams.get('type') as any) || undefined,
      city: searchParams.get('city') || undefined,
      providerId: searchParams.get('provider') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || "date",
      sortOrder: (searchParams.get('sortOrder') as any) || "desc",
    };
    setFilters(urlFilters);
  }, [searchParams, showAllProperties]);

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL parameters
    const newSearchParams = new URLSearchParams();

    // Preserve showAll parameter if it exists
    if (showAllProperties) {
      newSearchParams.set('showAll', 'true');
    }

    // Preserve provider parameter if it exists
    if (providerId) {
      newSearchParams.set('provider', providerId);
    }

    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "" && v !== "all") {
        newSearchParams.set(k, v.toString());
      }
    });
    setSearchParams(newSearchParams);
  };

  const results = useMemo(() => {
    const searchResults = searchProperties(filters);
    console.log('Search filters:', filters);
    console.log('Search results:', searchResults);
    console.log('Total properties:', properties.length);
    return searchResults;
  }, [filters, searchProperties, properties]);

  // Get unique cities for filter dropdown
  const cities = useMemo(() => {
    const allProperties = searchProperties({ category: showAllProperties ? undefined : "rent" });
    const uniqueCities = Array.from(new Set(allProperties.map(p => p.location.city)));
    return uniqueCities.sort();
  }, [searchProperties, showAllProperties]);

  // Apply feature filtering if features are selected
  const baseProperties = showAllProperties
    ? results  // When showing all properties, the filters.category already handles the FOR SALE/FOR RENT selection
    : results.filter(p => p.category === 'rent' || p.category === 'short-term-rental');

  const rentalProperties = selectedFeatures.length > 0
    ? filteredProperties
    : baseProperties;

  return (
    <main className="container mx-auto mobile-padding py-6 sm:py-10 mobile-container">
      <header className="mb-6 sm:mb-8">
        {/* Back to Partners button when filtering by provider */}
        {selectedProvider && (
          <div className="mb-4">
            <Link
              to="/partners"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Partners
            </Link>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-semibold text-gradient mb-2">
          {selectedProvider
            ? `Properties by ${selectedProvider.businessName}`
            : showAllProperties
              ? 'All Properties'
              : 'Rental Properties'
          }
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {selectedProvider
            ? `Browse all properties listed by ${selectedProvider.businessName} in ${selectedProvider.city}.`
            : showAllProperties
              ? 'Discover amazing properties for sale and rent from verified providers.'
              : 'Discover amazing rental properties and short-term stays from verified providers.'
          }
        </p>
      </header>

      {/* Search and Filters - Mobile Optimized */}
      <section className="brutal-card mobile-card p-4 sm:p-6 mb-6 sm:mb-8 animate-fade-in">
        <div className="space-y-4">
          {/* Search Bar - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search properties..."
              value={filters.query || ""}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10 h-12 text-base mobile-button"
            />
          </div>

          {/* Filter Dropdowns - Stack on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {showAllProperties && (
              <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange('category', value === "all" ? undefined : value)}>
                <SelectTrigger className="h-12 text-base mobile-button">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={filters.city || "all"} onValueChange={(value) => handleFilterChange('city', value === "all" ? undefined : value)}>
              <SelectTrigger className="h-12 text-base mobile-button">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.sortBy || "date"} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="h-12 text-base mobile-button">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ category: "rent", sortBy: "date", sortOrder: "desc" })}
              className="h-12 text-base mobile-button"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t gap-3 sm:gap-0">
          <p className="text-sm text-muted-foreground">
            {rentalProperties.length} properties found
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer text-xs sm:text-sm touch-target">
              Long-term Rentals
            </Badge>
            <Badge variant="outline" className="cursor-pointer text-xs sm:text-sm touch-target">
              Short-term Stays
            </Badge>
          </div>
        </div>
      </section>

      {/* Search Properties by Feature Section - Mobile Optimized */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto mobile-padding">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight" style={{color: 'hsl(158, 64%, 20%)'}}>
              Search properties by feature
            </h2>
            <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden w-full sm:w-auto">
              <button
                onClick={() => {
                  setSearchType('sale');
                  setFilters(prev => ({ ...prev, category: 'sale' }));
                }}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-colors touch-target ${
                  searchType === 'sale'
                    ? 'text-white border-b-2'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={searchType === 'sale' ? {
                  backgroundColor: 'hsl(174, 100%, 29%)',
                  borderBottomColor: 'hsl(174, 100%, 29%)'
                } : {}}
              >
                FOR SALE
              </button>
              <button
                onClick={() => {
                  setSearchType('rent');
                  setFilters(prev => ({ ...prev, category: 'rent' }));
                }}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-colors touch-target ${
                  searchType === 'rent'
                    ? 'text-white border-b-2'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={searchType === 'rent' ? {
                  backgroundColor: 'hsl(174, 100%, 29%)',
                  borderBottomColor: 'hsl(174, 100%, 29%)'
                } : {}}
              >
                FOR RENT
              </button>
              {showAllProperties && (
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: undefined }));
                  }}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm font-medium transition-colors touch-target ${
                    filters.category === undefined
                      ? 'text-white border-b-2'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={filters.category === undefined ? {
                    backgroundColor: 'hsl(174, 100%, 29%)',
                    borderBottomColor: 'hsl(174, 100%, 29%)'
                  } : {}}
                >
                  ALL
                </button>
              )}
            </div>
          </div>

          {/* Feature Buttons - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6 sm:mb-8">
            {features.map((feature) => {
              const count = getFeatureCount(feature);

              const getFeatureIcon = (feature: string) => {
                switch (feature) {
                  case 'Private Pool': return '🏊';
                  case 'Upgraded': return '⬆️';
                  case 'Large Plot': return '📐';
                  case 'Close to Park': return '🌳';
                  case 'Brand New': return '✨';
                  case 'Furnished': return '🛋️';
                  case 'Vacant on Transfer': return '🔄';
                  case 'Water Views': return '🌊';
                  case 'Road Access': return '🛣️';
                  case 'Title Deed Ready': return '📋';
                  case 'Electricity Connection': return '⚡';
                  case 'Water Access': return '💧';
                  default: return '';
                }
              };

              return (
                <button
                  key={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 border touch-target ${
                    selectedFeatures.includes(feature)
                      ? 'text-white shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  style={selectedFeatures.includes(feature) ? {
                    backgroundColor: 'hsl(174, 100%, 29%)',
                    borderColor: 'hsl(174, 100%, 29%)'
                  } : {}}
                  title={`${count} properties available`}
                >
                  <span className="text-lg sm:text-xl">{getFeatureIcon(feature)}</span>
                  <span className="text-center leading-tight">{feature}</span>
                  <span className="text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Selected Filters Display - Mobile Optimized */}
          {selectedFeatures.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg mobile-card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <button
                  onClick={() => setSelectedFeatures([])}
                  className="text-xs underline self-start sm:self-auto touch-target"
                  style={{color: 'hsl(174, 100%, 29%)'}}
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-black text-white text-xs rounded-full touch-target"
                  >
                    <span className="truncate max-w-[120px] sm:max-w-none">{feature}</span>
                    <button
                      onClick={() => handleFeatureToggle(feature)}
                      className="ml-1 hover:bg-gray-700 rounded-full p-1 touch-target"
                      aria-label={`Remove ${feature} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                Searching for {
                  filters.category === undefined
                    ? 'all properties'
                    : filters.category === 'sale'
                      ? 'properties for sale'
                      : 'properties for rent'
                } with {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Feature Search Results */}
          {selectedFeatures.length > 0 && (
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Feature Search Results ({filteredProperties.length} properties found)
                  </h3>
                  <button
                    onClick={() => setSelectedFeatures([])}
                    className="text-sm underline text-gray-600 hover:text-gray-800"
                  >
                    Clear filters
                  </button>
                </div>

                {filteredProperties.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      No properties found
                    </h4>
                    <p className="text-gray-600 mb-4">
                      No {
                        filters.category === undefined
                          ? 'properties'
                          : filters.category === 'sale'
                            ? 'properties for sale'
                            : 'properties for rent'
                      } match your selected features. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Property Listings Header - Mobile Optimized */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
          {selectedProvider
            ? `${selectedProvider.businessName} Properties (${rentalProperties.length})`
            : selectedFeatures.length > 0
              ? `Properties with Selected Features (${rentalProperties.length})`
              : filters.category === undefined
                ? `All Properties (${rentalProperties.length})`
                : filters.category === 'sale'
                  ? `Properties for Sale (${rentalProperties.length})`
                  : `Properties for Rent (${rentalProperties.length})`
          }
        </h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          {selectedProvider
            ? `All properties listed by ${selectedProvider.businessName}`
            : selectedFeatures.length > 0
              ? `Showing properties that match your selected features`
              : filters.category === undefined
                ? "Browse all available properties for sale and rent"
                : filters.category === 'sale'
                  ? "Browse available properties for sale"
                  : "Browse available properties for rent"
          }
        </p>
      </div>

      {/* Results - Mobile Optimized Grid */}
      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {rentalProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Home className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Try adjusting your search filters or check back later for new listings.</p>
          </div>
        ) : (
          rentalProperties.map((property) => (
            <Card key={property.id} className="brutal-card mobile-card overflow-hidden hover-scale transition-transform duration-200 hover:-translate-y-0.5">
              <div className="relative">
                <img
                  src={property.images[0]?.url || '/placeholder.svg'}
                  alt={property.title}
                  className="aspect-[4/3] sm:aspect-[16/10] object-cover w-full"
                  loading="lazy"
                />
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                    {property.category === 'short-term-rental' ? 'Short-term' : 'Long-term'}
                  </Badge>
                </div>
                {property.isFeatured && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-xs">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3 p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">{property.title}</CardTitle>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{property.location.city}, {property.location.state}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0 p-4 sm:p-6">
                {/* Property Features - Mobile Optimized */}
                {property.type !== 'land' && (
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                    {property.features.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{property.features.bedrooms}</span>
                      </div>
                    )}
                    {property.features.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{property.features.bathrooms}</span>
                      </div>
                    )}
                    {property.features.parking && (
                      <div className="flex items-center">
                        <Car className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span>{property.features.parking}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price and Stats - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      {property.currency} {property.price.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      /{property.category === 'short-term-rental' ? 'night' : 'month'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{property.views}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>{property.inquiries}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button - Mobile Optimized */}
                <Link to={`/property/${property.id}`}>
                  <Button className="w-full mobile-button" variant="outline">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>


    </main>
  );
};

export default Rentals;
