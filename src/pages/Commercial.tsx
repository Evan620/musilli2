import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { 
  Search, Building2, MapPin, Car, TrendingUp, Users, 
  BarChart3, Calendar, DollarSign, Square, Eye, Phone, MessageSquare 
} from "lucide-react";
import { commercialService } from "@/lib/supabase-commercial";
import { CommercialSearchFilters, CommercialPropertyType, BuildingClass, CommercialZoning, LeaseType } from "@/types";
import { paramsToCommercialFilters } from "@/utils/filterParams";

const Commercial = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<CommercialSearchFilters>({
    query: "",
    sortBy: "date",
    sortOrder: "desc"
  });

  // Load commercial properties
  const loadCommercialProperties = async () => {
    setIsLoading(true);
    try {
      console.log('🏢 Loading commercial properties with filters:', filters);
      const result = await commercialService.searchCommercialProperties(filters);
      
      if (result.success) {
        setProperties(result.data);
        console.log('✅ Commercial properties loaded:', result.data.length);
      } else {
        console.error('❌ Failed to load commercial properties:', result.error);
        setProperties([]);
      }
    } catch (error) {
      console.error('❌ Exception loading commercial properties:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommercialProperties();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof CommercialSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };

  // Initialize filters from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters = paramsToCommercialFilters(params);
    if (Object.values(urlFilters).some(v => v !== undefined && v !== null && v !== '')) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, []);

  // Format commercial type for display
  const formatCommercialType = (type: CommercialPropertyType) => {
    const typeMap: Record<CommercialPropertyType, string> = {
      'office_class_a': 'Class A Office',
      'office_class_b': 'Class B Office', 
      'office_class_c': 'Class C Office',
      'coworking_space': 'Co-working Space',
      'executive_suite': 'Executive Suite',
      'shopping_center': 'Shopping Center',
      'strip_mall': 'Strip Mall',
      'standalone_retail': 'Retail Space',
      'restaurant': 'Restaurant',
      'popup_space': 'Pop-up Space',
      'warehouse': 'Warehouse',
      'manufacturing': 'Manufacturing',
      'flex_space': 'Flex Space',
      'cold_storage': 'Cold Storage',
      'logistics_center': 'Logistics Center',
      'retail_office_mixed': 'Mixed Use (Retail/Office)',
      'residential_commercial_mixed': 'Mixed Use (Residential/Commercial)',
      'hotel_retail_mixed': 'Mixed Use (Hotel/Retail)'
    };
    return typeMap[type] || type;
  };

  // Format building class for display
  const formatBuildingClass = (buildingClass?: BuildingClass) => {
    if (!buildingClass) return '';
    const classMap: Record<BuildingClass, string> = {
      'class_a': 'Class A',
      'class_b': 'Class B',
      'class_c': 'Class C'
    };
    return classMap[buildingClass];
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800 dark:text-white">
            Commercial Properties
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Discover premium office spaces, retail locations, warehouses, and mixed-use properties for your business needs
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="w-5 h-5" />
              Find Commercial Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Query */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={filters.query || ""}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Commercial Type */}
              <Select value={filters.commercialType || "all"} onValueChange={(value) => handleFilterChange('commercialType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="office_class_a">Class A Office</SelectItem>
                  <SelectItem value="office_class_b">Class B Office</SelectItem>
                  <SelectItem value="office_class_c">Class C Office</SelectItem>
                  <SelectItem value="coworking_space">Co-working Space</SelectItem>
                  <SelectItem value="shopping_center">Shopping Center</SelectItem>
                  <SelectItem value="standalone_retail">Retail Space</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="flex_space">Flex Space</SelectItem>
                </SelectContent>
              </Select>

              {/* Building Class */}
              <Select value={filters.buildingClass || "all"} onValueChange={(value) => handleFilterChange('buildingClass', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Building Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="class_a">Class A</SelectItem>
                  <SelectItem value="class_b">Class B</SelectItem>
                  <SelectItem value="class_c">Class C</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={filters.sortBy || "date"} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="occupancy">Occupancy Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Min Size */}
              <Input
                type="number"
                placeholder="Min Size (sqft)"
                value={filters.minSize || ""}
                onChange={(e) => handleFilterChange('minSize', e.target.value ? Number(e.target.value) : undefined)}
              />

              {/* Max Size */}
              <Input
                type="number"
                placeholder="Max Size (sqft)"
                value={filters.maxSize || ""}
                onChange={(e) => handleFilterChange('maxSize', e.target.value ? Number(e.target.value) : undefined)}
              />

              {/* Min Rent */}
              <Input
                type="number"
                placeholder="Min Rent/sqft"
                value={filters.minRent || ""}
                onChange={(e) => handleFilterChange('minRent', e.target.value ? Number(e.target.value) : undefined)}
              />

              {/* Max Rent */}
              <Input
                type="number"
                placeholder="Max Rent/sqft"
                value={filters.maxRent || ""}
                onChange={(e) => handleFilterChange('maxRent', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Zoning */}
              <Select value={filters.zoning || "all"} onValueChange={(value) => handleFilterChange('zoning', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Zoning" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zoning</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>

              {/* Lease Type */}
              <Select value={filters.leaseType || "all"} onValueChange={(value) => handleFilterChange('leaseType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Lease Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lease Types</SelectItem>
                  <SelectItem value="triple_net">Triple Net (NNN)</SelectItem>
                  <SelectItem value="gross">Gross</SelectItem>
                  <SelectItem value="modified_gross">Modified Gross</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="ground_lease">Ground Lease</SelectItem>
                </SelectContent>
              </Select>

              {/* Min Parking */}
              <Input
                type="number"
                placeholder="Min Parking Spaces"
                value={filters.minParking || ""}
                onChange={(e) => handleFilterChange('minParking', e.target.value ? Number(e.target.value) : undefined)}
              />

              {/* Required Amenities (CSV) */}
              <Input
                type="text"
                placeholder="Required Amenities (CSV)"
                onBlur={(e) => handleFilterChange('requiredAmenities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={() => setFilters({ query: "", sortBy: "date", sortOrder: "desc" })}>Clear</Button>
              <Button onClick={loadCommercialProperties} disabled={isLoading}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-300">
            {isLoading ? 'Searching...' : `${properties.length} commercial properties found`}
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="bg-slate-300 w-full h-48 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="bg-slate-300 h-6 rounded mb-2"></div>
                  <div className="bg-slate-300 h-4 rounded mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="bg-slate-300 h-4 w-16 rounded"></div>
                    <div className="bg-slate-300 h-4 w-20 rounded"></div>
                  </div>
                  <div className="bg-slate-300 h-10 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : properties.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Commercial Properties Found</h3>
              <p className="text-slate-500">Try adjusting your search filters or check back later for new listings.</p>
            </div>
          ) : (
            properties.map((property) => (
              <Card key={property.property_id} className="group overflow-hidden border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative">
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-slate-400" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      {formatCommercialType(property.commercial_type)}
                    </Badge>
                  </div>
                  {property.building_class && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                        {formatBuildingClass(property.building_class)}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location.city}, {property.location.state}</span>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {property.available_space && (
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-slate-500" />
                        <span>{property.available_space.toLocaleString()} sqft</span>
                      </div>
                    )}
                    {property.parking_spaces > 0 && (
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-slate-500" />
                        <span>{property.parking_spaces} spaces</span>
                      </div>
                    )}
                    {property.rent_per_sqft && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-500" />
                        <span>KSH {property.rent_per_sqft}/sqft</span>
                      </div>
                    )}
                    {property.occupancy_rate && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-500" />
                        <span>{property.occupancy_rate}% occupied</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {property.amenities.slice(0, 3).map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {property.currency} {property.price.toLocaleString()}
                    </span>
                    <div className="text-sm text-slate-500">
                      {property.rent_per_sqft && `KSH ${property.rent_per_sqft}/sqft monthly`}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to={`/property/${property.property_id}`} className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default Commercial;
