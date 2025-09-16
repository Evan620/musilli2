import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, TrendingUp, Users, BarChart3, DollarSign,
  Search, Filter, Eye, Edit, Trash2, Plus, Calendar,
  Square, Car, MapPin, Clock, X
} from "lucide-react";
import { commercialService } from "@/lib/supabase-commercial";
import { propertyService } from "@/lib/supabase-properties";
import { CommercialSearchFilters, CommercialPropertyType, BuildingClass } from "@/types";
import { CommercialPropertyForm } from "@/components/ui/commercial-property-form";

const CommercialManagement = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<CommercialSearchFilters>({
    query: "",
    sortBy: "date",
    sortOrder: "desc"
  });

  // Load commercial properties
  const loadCommercialProperties = async () => {
    setIsLoading(true);
    try {
      console.log('🏢 Loading commercial properties for admin...');
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

  // Load analytics
  const loadAnalytics = async () => {
    try {
      console.log('📊 Loading commercial analytics...');
      const result = await commercialService.getCommercialAnalytics();
      
      if (result.success) {
        setAnalytics(result.data);
        console.log('✅ Commercial analytics loaded:', result.data);
      } else {
        console.error('❌ Failed to load commercial analytics:', result.error);
      }
    } catch (error) {
      console.error('❌ Exception loading commercial analytics:', error);
    }
  };

  useEffect(() => {
    loadCommercialProperties();
    loadAnalytics();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof CommercialSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  };

  // Handle add commercial property
  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowAddForm(true);
  };

  // Handle edit commercial property
  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  // Handle save commercial property
  const handleSaveProperty = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('🏢 Saving commercial property:', formData);

      // Split into base property and commercial details
      const { title, description, price, currency, images, location, features, ...commercialDetails } = formData || {};

      if (editingProperty?.id) {
        // Update base property
        await propertyService.updateProperty(editingProperty.id, {
          title,
          description,
          price,
          currency,
          type: 'commercial'
        } as any);

        // Upsert commercial details
        await commercialService.createCommercialProperty(editingProperty.id, commercialDetails);
      } else {
        // Create base property first (admin auto-publish)
        const created = await propertyService.createProperty({
          title,
          description,
          type: 'commercial',
          category: 'rent',
          price,
          currency,
          location: {
            address: location?.address || '',
            city: location?.city || '',
            state: location?.state || '',
            country: location?.country || 'Kenya',
            zipCode: location?.zipCode || ''
          },
          features: {
            bedrooms: 0,
            bathrooms: 0,
            area: features?.area || 0,
            areaUnit: features?.areaUnit || 'sqft',
            parking: features?.parking || 0,
            furnished: false,
            petFriendly: false,
            amenities: '',
            utilities: ''
          },
          images: images || []
        } as any);

        if (!created.success || !created.propertyId) {
          throw new Error(created.error || 'Failed to create base property');
        }

        // Attach commercial details
        await commercialService.createCommercialProperty(created.propertyId, commercialDetails);
      }

      setShowAddForm(false);
      setEditingProperty(null);
      await loadCommercialProperties();
    } catch (error) {
      console.error('❌ Error saving commercial property:', error);
      alert('Failed to save commercial property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingProperty(null);
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Commercial Properties Management</h2>
        <Button
          onClick={handleAddProperty}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Commercial Property
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="leases">Lease Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.total_commercial_properties || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Commercial properties listed
                </p>
              </CardContent>
            </Card>

            {/* Total Available Space */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Space</CardTitle>
                <Square className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.total_available_space?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Square feet available
                </p>
              </CardContent>
            </Card>

            {/* Average Rent */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rent/sqft</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KSH {analytics?.average_rent_per_sqft?.toFixed(2) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Monthly rent per square foot
                </p>
              </CardContent>
            </Card>

            {/* Average Occupancy */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.average_occupancy_rate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average occupancy rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Properties by Type Chart */}
          {analytics?.properties_by_type && (
            <Card>
              <CardHeader>
                <CardTitle>Properties by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.properties_by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatCommercialType(type as CommercialPropertyType)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(Number(count) / analytics.total_commercial_properties) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{String(count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filter Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Search Query */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                    <SelectItem value="shopping_center">Shopping Center</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
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
            </CardContent>
          </Card>

          {/* Properties List */}
          <Card>
            <CardHeader>
              <CardTitle>Commercial Properties ({properties.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Commercial Properties Found</h3>
                  <p className="text-gray-500">Try adjusting your search filters or add new commercial properties.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.property_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                            <Badge variant="secondary">
                              {formatCommercialType(property.commercial_type)}
                            </Badge>
                            {property.building_class && (
                              <Badge variant="outline">
                                {property.building_class.replace('_', ' ').toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{property.location.city}, {property.location.state}</span>
                            </div>
                            {property.available_space && (
                              <div className="flex items-center gap-1">
                                <Square className="w-4 h-4" />
                                <span>{property.available_space.toLocaleString()} sqft</span>
                              </div>
                            )}
                            {property.rent_per_sqft && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span>KSH {property.rent_per_sqft}/sqft</span>
                              </div>
                            )}
                            {property.occupancy_rate && (
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                <span>{property.occupancy_rate}% occupied</span>
                              </div>
                            )}
                          </div>

                          <div className="text-lg font-bold text-blue-600">
                            {property.currency} {property.price.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProperty(property)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Advanced Analytics Coming Soon</h3>
            <p className="text-gray-500">Detailed commercial property analytics and reporting will be available here.</p>
          </div>
        </TabsContent>

        {/* Lease Management Tab */}
        <TabsContent value="leases" className="space-y-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Lease Management Coming Soon</h3>
            <p className="text-gray-500">Lease tracking, tenant management, and rental income reporting will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Commercial Property Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProperty ? 'Edit Commercial Property' : 'Add Commercial Property'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <CommercialPropertyForm
                initialData={editingProperty}
                onSave={handleSaveProperty}
                onCancel={handleCancelForm}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialManagement;
