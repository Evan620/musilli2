import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProperties } from "@/contexts/PropertyContext";
import { landService } from "@/lib/supabase-land";
import { PropertySearchFilters, Property } from "@/types";
import { Search, MapPin, Eye, MessageSquare, Ruler, TreePine, Zap, Droplets, Navigation } from "lucide-react";

const Land = () => {
  const { searchProperties } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();
  const [landProperties, setLandProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<PropertySearchFilters>({
    query: "",
    type: "land",
    category: "sale",
    sortBy: "date",
    sortOrder: "desc",
  });

  // Enhanced land-specific filters
  const [landFilters, setLandFilters] = useState({
    zoning: "all",
    developmentStatus: "all",
    electricityAvailable: undefined as boolean | undefined,
    waterConnectionAvailable: undefined as boolean | undefined,
    sewerConnectionAvailable: undefined as boolean | undefined,
    internetCoverage: undefined as boolean | undefined,
    minArea: undefined as number | undefined,
    maxArea: undefined as number | undefined,
  });

  // Load land properties with enhanced filtering
  const loadLandProperties = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading land properties with filters:', { ...filters, ...landFilters });

      // Try enhanced land search first, fallback to basic search
      const searchFilters = {
        zoning: landFilters.zoning === "all" ? undefined : landFilters.zoning,
        developmentStatus: landFilters.developmentStatus === "all" ? undefined : landFilters.developmentStatus,
        electricityAvailable: landFilters.electricityAvailable,
        waterConnectionAvailable: landFilters.waterConnectionAvailable,
        sewerConnectionAvailable: landFilters.sewerConnectionAvailable,
        internetCoverage: landFilters.internetCoverage,
        minArea: landFilters.minArea,
        maxArea: landFilters.maxArea,
        city: filters.city,
        priceRange: filters.minPrice || filters.maxPrice ? {
          min: filters.minPrice || 0,
          max: filters.maxPrice || 0
        } : undefined
      } as const;

      const enhancedResults = await landService.searchLandProperties(searchFilters);

      if (enhancedResults.length > 0) {
        console.log('✅ Using enhanced land search results:', enhancedResults.length);
        setLandProperties(enhancedResults);
      } else {
        // Fallback to basic property search
        console.log('⚠️ Falling back to basic property search');
        const basicResults = searchProperties(filters);
        const landOnly = basicResults.filter(p => p.type === 'land');
        setLandProperties(landOnly);
      }
    } catch (error) {
      console.error('❌ Error loading land properties:', error);
      // Fallback to basic search on error
      const basicResults = searchProperties(filters);
      const landOnly = basicResults.filter(p => p.type === 'land');
      setLandProperties(landOnly);
    } finally {
      setIsLoading(false);
    }
  };

  // Load properties on mount and when filters change
  useEffect(() => {
    loadLandProperties();
  }, [
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    landFilters.zoning,
    landFilters.developmentStatus,
    landFilters.electricityAvailable,
    landFilters.waterConnectionAvailable,
    landFilters.sewerConnectionAvailable,
    landFilters.internetCoverage,
    landFilters.minArea,
    landFilters.maxArea,
  ]);

  // Handle land-specific filter changes
  const handleLandFilterChange = (key: string, value: any) => {
    setLandFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle basic filter changes
  const handleFilterChange = (key: keyof PropertySearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // Get unique cities for filter dropdown
  const cities = useMemo(() => {
    const allLand = searchProperties({ type: "land" });
    const uniqueCities = Array.from(new Set(allLand.map(p => p.location.city)));
    return uniqueCities.sort();
  }, [searchProperties]);

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gradient">Land for Sale</h1>
        <p className="text-muted-foreground">
          Discover prime land opportunities for development, investment, and agriculture.
        </p>
      </header>

      {/* Search and Filters */}
      <section className="brutal-card p-6 mb-8 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search land..."
              value={filters.query || ""}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10"
            />
          </div>

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

          <Select value={landFilters.zoning} onValueChange={(value) => handleLandFilterChange('zoning', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Zoning" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zoning</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="agricultural">Agricultural</SelectItem>
              <SelectItem value="mixed_use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>

          <Select value={landFilters.developmentStatus} onValueChange={(value) => handleLandFilterChange('developmentStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Development Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="raw_land">Raw Land</SelectItem>
              <SelectItem value="partially_developed">Partially Developed</SelectItem>
              <SelectItem value="ready_to_build">Ready to Build</SelectItem>
              <SelectItem value="subdivided">Subdivided</SelectItem>
              <SelectItem value="titled">Titled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Infrastructure Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Select
            value={landFilters.electricityAvailable === undefined ? "any" : landFilters.electricityAvailable.toString()}
            onValueChange={(value) => handleLandFilterChange('electricityAvailable', value === "any" ? undefined : value === "true")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Electricity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">With Electricity</SelectItem>
              <SelectItem value="false">Without Electricity</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={landFilters.waterConnectionAvailable === undefined ? "any" : landFilters.waterConnectionAvailable.toString()}
            onValueChange={(value) => handleLandFilterChange('waterConnectionAvailable', value === "any" ? undefined : value === "true")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Water Connection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">With Water</SelectItem>
              <SelectItem value="false">Without Water</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={landFilters.sewerConnectionAvailable === undefined ? "any" : landFilters.sewerConnectionAvailable.toString()}
            onValueChange={(value) => handleLandFilterChange('sewerConnectionAvailable', value === "any" ? undefined : value === "true")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sewer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">With Sewer</SelectItem>
              <SelectItem value="false">Without Sewer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={landFilters.internetCoverage === undefined ? "any" : landFilters.internetCoverage.toString()}
            onValueChange={(value) => handleLandFilterChange('internetCoverage', value === "any" ? undefined : value === "true")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Internet Coverage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">With Internet</SelectItem>
              <SelectItem value="false">Without Internet</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={loadLandProperties}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Search Land'}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setFilters({
                query: "",
                type: "land",
                category: "sale",
                sortBy: "date",
                sortOrder: "desc",
              });
              setLandFilters({
                zoning: "all",
                developmentStatus: "all",
                electricityAvailable: undefined,
                waterConnectionAvailable: undefined,
                sewerConnectionAvailable: undefined,
                internetCoverage: undefined,
                minArea: undefined,
                maxArea: undefined,
              });
            }}
          >
            Clear Filters
          </Button>
        </div>

        {/* Area and Price Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <Input
            type="number"
            placeholder="Min Area"
            value={landFilters.minArea ?? ''}
            onChange={(e) => handleLandFilterChange('minArea', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            type="number"
            placeholder="Max Area"
            value={landFilters.maxArea ?? ''}
            onChange={(e) => handleLandFilterChange('maxArea', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            type="number"
            placeholder="Min Price (KSH)"
            value={filters.minPrice ?? ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            type="number"
            placeholder="Max Price (KSH)"
            value={filters.maxPrice ?? ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </section>

      {/* Results */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Searching land properties...</h3>
            <p className="text-muted-foreground">Please wait while we find the best land opportunities for you.</p>
          </div>
        ) : landProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <TreePine className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No land found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters or check back later for new listings.</p>
          </div>
        ) : (
          landProperties.map((property) => (
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
                    Land
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
                {/* Land Features */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Ruler className="w-4 h-4 mr-1" />
                    {property.features.area} {property.features.areaUnit}
                  </div>
                </div>

                {/* Land-specific Information */}
                {property.landDetails && (
                  <div className="mb-3 space-y-2">
                    {/* Zoning and Development Status */}
                    <div className="flex flex-wrap gap-1">
                      {property.landDetails.zoning && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {property.landDetails.zoning.replace('_', ' ')}
                        </Badge>
                      )}
                      {property.landDetails.developmentStatus && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          {property.landDetails.developmentStatus.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    {/* Infrastructure Icons */}
                    <div className="flex items-center gap-3 text-sm">
                      {property.landDetails.electricityAvailable && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Zap className="w-4 h-4" />
                          <span className="text-xs">Electricity</span>
                        </div>
                      )}
                      {property.landDetails.waterConnectionAvailable && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Droplets className="w-4 h-4" />
                          <span className="text-xs">Water</span>
                        </div>
                      )}
                      {property.landDetails.roadAccess && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Navigation className="w-4 h-4" />
                          <span className="text-xs">{property.landDetails.roadAccess.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback: Show amenities if no land details */}
                {!property.landDetails && property.features.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {property.features.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.features.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.features.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Price and Stats */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary">
                      {property.currency} {property.price.toLocaleString()}
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {property.currency} {Math.round(property.price / property.features.area).toLocaleString()}/{property.features.areaUnit}
                    </div>
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
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
};

export default Land;
