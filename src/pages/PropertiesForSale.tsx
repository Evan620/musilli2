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

const PropertiesForSale = () => {
  const { searchProperties, properties } = useProperties();
  const { getProvider } = useProviders();
  const [searchParams, setSearchParams] = useSearchParams();

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
    category: "sale",  // Always filter for sale properties
    providerId: providerId || undefined,  // Filter by provider if specified
    sortBy: "date",
    sortOrder: "desc",
  });

  // State for search properties by feature
  const [searchType, setSearchType] = useState<'sale' | 'rent'>('sale');
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

  // Initialize filters from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get('type');
    const urlFilters: PropertySearchFilters = {
      query: searchParams.get('query') || "",
      category: "sale", // Always sale for this page
      type: typeParam && typeParam !== "all" ? typeParam : "", // Only set type if it's not "all"
      city: searchParams.get('city') || "",
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
      providerId: providerId || undefined,
      sortBy: (searchParams.get('sortBy') as any) || "date",
      sortOrder: (searchParams.get('sortOrder') as any) || "desc",
    };
    setFilters(urlFilters);
  }, [searchParams, providerId]);

  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL parameters
    const newSearchParams = new URLSearchParams();

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
    const allProperties = searchProperties({ category: "sale" });
    const uniqueCities = Array.from(new Set(allProperties.map(p => p.location.city)));
    return uniqueCities.sort();
  }, [searchProperties]);

  // Filter properties for sale
  const saleProperties = results.filter(p => p.category === 'sale');

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gradient">
            {selectedProvider
              ? `Properties for Sale by ${selectedProvider.businessName}`
              : 'Properties for Sale'
            }
          </h1>
          {!selectedProvider && searchParams.toString() && (
            <Link
              to="/properties-for-sale"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              View All Properties
            </Link>
          )}
        </div>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {selectedProvider
            ? `Browse properties for sale listed by ${selectedProvider.businessName} in ${selectedProvider.city}.`
            : 'Discover amazing properties for sale from verified providers.'
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
              placeholder="Search properties for sale..."
              value={filters.query || ""}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filter Row - Mobile Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange('type', value === "all" ? "" : value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">Houses</SelectItem>
                <SelectItem value="apartment">Apartments</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.city || "all"} onValueChange={(value) => handleFilterChange('city', value === "all" ? "" : value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.bedrooms?.toString() || "all"} onValueChange={(value) => handleFilterChange('bedrooms', value === "all" ? undefined : Number(value))}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Bedrooms</SelectItem>
                <SelectItem value="1">1+ Bedroom</SelectItem>
                <SelectItem value="2">2+ Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy || "date"} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{saleProperties.length} properties found</span>
            {selectedProvider && (
              <span>by {selectedProvider.businessName}</span>
            )}
          </div>
        </div>
      </section>

      {/* Results - Mobile Optimized Grid */}
      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {saleProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Home className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              {filters.type ?
                `No ${filters.type} properties available for sale. Try viewing all property types.` :
                'Try adjusting your search filters or check back later for new listings.'
              }
            </p>
            {(filters.type || filters.city || filters.query) && (
              <Link
                to="/properties-for-sale"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Home className="w-4 h-4" />
                View All Properties
              </Link>
            )}
          </div>
        ) : (
          saleProperties.map((property) => (
            <Card key={property.id} className="brutal-card mobile-card overflow-hidden hover-scale transition-transform duration-200 hover:-translate-y-0.5">
              <div className="relative">
                <img
                  src={property.images[0]?.url || '/placeholder.svg'}
                  alt={property.title}
                  className="aspect-[4/3] object-cover w-full"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    For Sale
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                    {property.type}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg line-clamp-2 mb-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{property.location.city}, {property.location.state}</span>
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {property.currency} {property.price.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.features.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.features.bathrooms}</span>
                    </div>
                    {property.features.parking > 0 && (
                      <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>{property.features.parking}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{property.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{property.inquiries}</span>
                      </div>
                    </div>
                    <Link to={`/property/${property.id}`}>
                      <Button size="sm" className="text-xs">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
};

export default PropertiesForSale;
