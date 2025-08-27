import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { landService } from "@/lib/supabase-land";
import { Property, LandZoning, DevelopmentStatus } from "@/types";
import { LandPropertyForm } from "@/components/ui/land-property-form";
import {
  TreePine,
  MapPin,
  Zap,
  Droplets,
  Wifi,
  Navigation,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Eye,
  Edit,
  FileText,
  Plus,
  X
} from "lucide-react";

interface LandAnalytics {
  totalLandListings: number;
  averagePricePerAcre: number;
  popularZoning: { zoning: string; count: number }[];
  developmentStatusBreakdown: { status: string; count: number }[];
  infrastructureAvailability: {
    electricity: number;
    water: number;
    sewer: number;
    internet: number;
  };
}

export const LandManagement = () => {
  const [landProperties, setLandProperties] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<LandAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLand, setEditingLand] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    zoning: "all",
    developmentStatus: "all",
    electricityAvailable: undefined as boolean | undefined,
    waterConnectionAvailable: undefined as boolean | undefined,
    priceRange: { min: 0, max: 0 }
  });

  useEffect(() => {
    loadLandData();
  }, []);

  const loadLandData = async () => {
    setIsLoading(true);
    try {
      const [properties, analyticsData] = await Promise.all([
        landService.searchLandProperties({}),
        landService.getLandAnalytics()
      ]);
      
      setLandProperties(properties);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading land data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const searchFilters = {
        zoning: filters.zoning === "all" ? undefined : filters.zoning,
        developmentStatus: filters.developmentStatus === "all" ? undefined : filters.developmentStatus,
        electricityAvailable: filters.electricityAvailable === "any" ? undefined : filters.electricityAvailable,
        waterConnectionAvailable: filters.waterConnectionAvailable === "any" ? undefined : filters.waterConnectionAvailable,
        city: searchQuery || undefined
      };
      const properties = await landService.searchLandProperties(searchFilters);
      setLandProperties(properties);
    } catch (error) {
      console.error('Error searching land properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add land
  const handleAddLand = () => {
    setEditingLand(null);
    setShowAddForm(true);
  };

  // Handle edit land
  const handleEditLand = (land: Property) => {
    setEditingLand(land);
    setShowAddForm(true);
  };

  // Handle save land
  const handleSaveLand = async (formData: any) => {
    setIsSubmitting(true);
    try {
      console.log('🏞️ Saving land property:', formData);

      if (editingLand) {
        // Update existing land
        console.log('Updating existing land property...');
        alert('Update functionality will be implemented soon!');
      } else {
        // Create new land
        console.log('Creating new land property...');
        alert('Create functionality will be implemented soon! This would create a new land property with the provided details.');
      }

      setShowAddForm(false);
      setEditingLand(null);
      loadLandData(); // Refresh the list
    } catch (error) {
      console.error('❌ Error saving land property:', error);
      alert('Failed to save land property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingLand(null);
  };

  const getZoningColor = (zoning: string) => {
    const colors: { [key: string]: string } = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      industrial: 'bg-gray-100 text-gray-800',
      agricultural: 'bg-yellow-100 text-yellow-800',
      mixed_use: 'bg-purple-100 text-purple-800',
      recreational: 'bg-pink-100 text-pink-800'
    };
    return colors[zoning] || 'bg-gray-100 text-gray-800';
  };

  const getDevelopmentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      raw_land: 'bg-red-100 text-red-800',
      partially_developed: 'bg-yellow-100 text-yellow-800',
      ready_to_build: 'bg-green-100 text-green-800',
      subdivided: 'bg-blue-100 text-blue-800',
      titled: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Land Properties Management</h2>
        <Button
          onClick={handleAddLand}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Land Property
        </Button>
      </div>

      {/* Land Analytics Overview */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Land Listings</CardTitle>
              <TreePine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLandListings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Price/Acre</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSH {analytics.averagePricePerAcre.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Electricity</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.infrastructureAvailability.electricity}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.infrastructureAvailability.electricity / analytics.totalLandListings) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Water</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.infrastructureAvailability.water}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.infrastructureAvailability.water / analytics.totalLandListings) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Land Properties</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter Land Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search by City</label>
                  <Input
                    placeholder="Enter city name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Zoning</label>
                  <Select value={filters.zoning} onValueChange={(value) => setFilters(prev => ({ ...prev, zoning: value }))}>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Development Status</label>
                  <Select value={filters.developmentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, developmentStatus: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Infrastructure</label>
                  <Select 
                    value={filters.electricityAvailable?.toString() || ""} 
                    onValueChange={(value) => setFilters(prev => ({ 
                      ...prev, 
                      electricityAvailable: value === "" ? undefined : value === "true" 
                    }))}
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
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleSearch} className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    zoning: "all",
                    developmentStatus: "all",
                    electricityAvailable: undefined,
                    waterConnectionAvailable: undefined,
                    priceRange: { min: 0, max: 0 }
                  });
                  loadLandData();
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Land Properties List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Land Properties ({landProperties.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {landProperties.length === 0 ? (
                <div className="text-center py-8">
                  <TreePine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No land properties found</h3>
                  <p className="text-muted-foreground">Try adjusting your search filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {landProperties.map((property) => (
                    <div key={property.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <img
                              src={property.images[0]?.url || '/placeholder.svg'}
                              alt={property.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4" />
                                {property.location.city}, {property.location.state}
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-lg text-green-600">
                                  {property.currency} {property.price.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({property.features.area} {property.features.areaUnit})
                                </span>
                              </div>

                              {/* Land-specific badges */}
                              <div className="flex flex-wrap gap-2 mb-2">
                                {property.landDetails?.zoning && (
                                  <Badge className={getZoningColor(property.landDetails.zoning)}>
                                    {property.landDetails.zoning.replace('_', ' ')}
                                  </Badge>
                                )}
                                {property.landDetails?.developmentStatus && (
                                  <Badge className={getDevelopmentStatusColor(property.landDetails.developmentStatus)}>
                                    {property.landDetails.developmentStatus.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>

                              {/* Infrastructure indicators */}
                              <div className="flex items-center gap-3 text-sm">
                                {property.landDetails?.electricityAvailable && (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <Zap className="w-4 h-4" />
                                    <span>Electricity</span>
                                  </div>
                                )}
                                {property.landDetails?.waterConnectionAvailable && (
                                  <div className="flex items-center gap-1 text-blue-600">
                                    <Droplets className="w-4 h-4" />
                                    <span>Water</span>
                                  </div>
                                )}
                                {property.landDetails?.internetCoverage && (
                                  <div className="flex items-center gap-1 text-purple-600">
                                    <Wifi className="w-4 h-4" />
                                    <span>Internet</span>
                                  </div>
                                )}
                                {property.landDetails?.roadAccess && (
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Navigation className="w-4 h-4" />
                                    <span>{property.landDetails.roadAccess.replace('_', ' ')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
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

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Popular Zoning Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Popular Zoning Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.popularZoning.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{item.zoning.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / analytics.totalLandListings) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Development Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Development Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.developmentStatusBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / analytics.totalLandListings) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Land Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLand ? 'Edit Land Property' : 'Add Land Property'}
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
              <LandPropertyForm
                initialData={editingLand || undefined}
                onSave={handleSaveLand}
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
