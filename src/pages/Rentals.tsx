import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/contexts/PropertyContext";
import { PropertySearchFilters } from "@/types";

import { Search, MapPin, Eye, MessageSquare, Bed, Bath, Car, Home } from "lucide-react";

const Rentals = () => {
  const { searchProperties, properties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if we should show all properties (from "View All Properties" button)
  const showAllProperties = searchParams.get('showAll') === 'true';

  const [filters, setFilters] = useState<PropertySearchFilters>({
    query: "",
    category: showAllProperties ? "sale" : "rent",  // When showing all properties, default to sale
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

      return categoryMatch &&
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

    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "" && v !== "all") {
        newSearchParams.set(k, v.toString());
      }
    });
    setSearchParams(newSearchParams);
  };

  const results = useMemo(() => {
    return searchProperties(filters);
  }, [filters, searchProperties]);

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
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gradient">
          {showAllProperties ? 'All Properties' : 'Rental Properties'}
        </h1>
        <p className="text-muted-foreground">
          {showAllProperties
            ? 'Discover amazing properties for sale and rent from verified providers.'
            : 'Discover amazing rental properties and short-term stays from verified providers.'
          }
        </p>
      </header>

      {/* Search and Filters */}
      <section className="brutal-card p-6 mb-8 animate-fade-in">
        <div className={`grid gap-4 ${showAllProperties ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search properties..."
              value={filters.query || ""}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>

          {showAllProperties && (
            <Select value={filters.category || "all"} onValueChange={(value) => handleFilterChange('category', value === "all" ? undefined : value)}>
              <SelectTrigger>
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
            <SelectTrigger>
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
            <SelectTrigger>
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
          >
            Clear Filters
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {rentalProperties.length} properties found
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer">
              Long-term Rentals
            </Badge>
            <Badge variant="outline" className="cursor-pointer">
              Short-term Stays
            </Badge>
          </div>
        </div>
      </section>

      {/* Search Properties by Feature Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" style={{color: 'hsl(158, 64%, 20%)'}}>Search properties by feature</h2>
            <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setSearchType('sale');
                  setFilters(prev => ({ ...prev, category: 'sale' }));
                }}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
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
                className={`px-6 py-2 text-sm font-medium transition-colors ${
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
                  className={`px-6 py-2 text-sm font-medium transition-colors ${
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

          <div className="flex flex-wrap gap-3 mb-8">
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
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
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
                  <span className="text-base">{getFeatureIcon(feature)}</span>
                  <span>{feature}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Filters Display */}
          {selectedFeatures.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <button
                  onClick={() => setSelectedFeatures([])}
                  className="text-xs underline" style={{color: 'hsl(174, 100%, 29%)'}}
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full"
                  >
                    {feature}
                    <button
                      onClick={() => handleFeatureToggle(feature)}
                      className="ml-1 hover:bg-gray-700 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
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



      {/* Property Listings Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {selectedFeatures.length > 0
            ? `Properties with Selected Features (${rentalProperties.length})`
            : filters.category === undefined
              ? `All Properties (${rentalProperties.length})`
              : filters.category === 'sale'
                ? `Properties for Sale (${rentalProperties.length})`
                : `Properties for Rent (${rentalProperties.length})`
          }
        </h2>
        <p className="text-gray-600">
          {selectedFeatures.length > 0
            ? `Showing properties that match your selected features: ${selectedFeatures.join(', ')}`
            : filters.category === undefined
              ? "Browse all available properties for sale and rent"
              : filters.category === 'sale'
                ? "Browse available properties for sale"
                : "Browse available properties for rent"
          }
        </p>
      </div>

      {/* Results */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rentalProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters or check back later for new listings.</p>
          </div>
        ) : (
          rentalProperties.map((property) => (
            <Card key={property.id} className="brutal-card overflow-hidden hover-scale transition-transform duration-200 hover:-translate-y-0.5">
              <div className="relative">
                <img
                  src={property.images[0]?.url || '/placeholder.svg'}
                  alt={property.title}
                  className="aspect-[16/10] object-cover w-full"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-black">
                    {property.category === 'short-term-rental' ? 'Short-term' : 'Long-term'}
                  </Badge>
                </div>
                {property.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location.city}, {property.location.state}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Property Features */}
                {property.type !== 'land' && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    {property.features.bedrooms && (
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.features.bedrooms}
                      </div>
                    )}
                    {property.features.bathrooms && (
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-1" />
                        {property.features.bathrooms}
                      </div>
                    )}
                    {property.features.parking && (
                      <div className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        {property.features.parking}
                      </div>
                    )}
                  </div>
                )}

                {/* Price and Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      {property.currency} {property.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{property.category === 'short-term-rental' ? 'night' : 'month'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {property.views}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {property.inquiries}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link to={`/property/${property.id}`}>
                  <Button className="w-full mt-4" variant="outline">
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
