import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TreePine, DollarSign, MapPin, Zap, Droplets, 
  Wifi, Navigation, Plus, X, Save, Ruler 
} from "lucide-react";
import { 
  Property, 
  LandZoning, 
  DevelopmentStatus 
} from "@/types";

interface LandPropertyFormProps {
  initialData?: Partial<Property>;
  onSave: (data: Partial<Property>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LandPropertyForm = ({ 
  initialData, 
  onSave, 
  onCancel, 
  isLoading = false 
}: LandPropertyFormProps) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    description: '',
    price: 500000,
    currency: 'KSH',
    type: 'land',
    status: 'published',
    ...initialData
  });

  const [landDetails, setLandDetails] = useState({
    zoning: 'residential' as LandZoning,
    developmentStatus: 'raw_land' as DevelopmentStatus,
    acreage: 1,
    electricityAvailable: false,
    waterConnectionAvailable: false,
    sewerConnectionAvailable: false,
    internetAvailable: false,
    roadAccess: true,
    soilType: '',
    topography: '',
    nearbyAmenities: [] as string[]
  });

  const [newAmenity, setNewAmenity] = useState("");

  const handleInputChange = (field: keyof Property, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLandDetailChange = (field: string, value: any) => {
    setLandDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAmenity = () => {
    if (!newAmenity.trim()) return;
    
    const currentAmenities = landDetails.nearbyAmenities || [];
    if (!currentAmenities.includes(newAmenity.trim())) {
      handleLandDetailChange('nearbyAmenities', [...currentAmenities, newAmenity.trim()]);
    }
    setNewAmenity("");
  };

  const removeAmenity = (amenity: string) => {
    const currentAmenities = landDetails.nearbyAmenities || [];
    handleLandDetailChange('nearbyAmenities', currentAmenities.filter(a => a !== amenity));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine form data with land details
    const combinedData = {
      ...formData,
      landDetails
    };
    onSave(combinedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData?.id ? 'Edit Land Property' : 'Add Land Property'}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Land
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="land">Land Details</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="location">Location & Amenities</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TreePine className="w-5 h-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Prime 5-Acre Land in Kiambu"
                    required
                  />
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price || 0}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    placeholder="500000"
                    required
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KSH">KSH (Kenyan Shilling)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the land property..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Land Details Tab */}
        <TabsContent value="land" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Land Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zoning */}
                <div className="space-y-2">
                  <Label htmlFor="zoning">Zoning *</Label>
                  <Select 
                    value={landDetails.zoning} 
                    onValueChange={(value) => handleLandDetailChange('zoning', value as LandZoning)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zoning" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                      <SelectItem value="mixed_use">Mixed Use</SelectItem>
                      <SelectItem value="recreational">Recreational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Development Status */}
                <div className="space-y-2">
                  <Label htmlFor="developmentStatus">Development Status *</Label>
                  <Select 
                    value={landDetails.developmentStatus} 
                    onValueChange={(value) => handleLandDetailChange('developmentStatus', value as DevelopmentStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw_land">Raw Land</SelectItem>
                      <SelectItem value="partially_developed">Partially Developed</SelectItem>
                      <SelectItem value="ready_to_build">Ready to Build</SelectItem>
                      <SelectItem value="subdivided">Subdivided</SelectItem>
                      <SelectItem value="titled">Titled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Acreage */}
                <div className="space-y-2">
                  <Label htmlFor="acreage">Acreage</Label>
                  <Input
                    id="acreage"
                    type="number"
                    min="0"
                    step="0.1"
                    value={landDetails.acreage || 0}
                    onChange={(e) => handleLandDetailChange('acreage', Number(e.target.value))}
                    placeholder="1.0"
                  />
                </div>

                {/* Soil Type */}
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Input
                    id="soilType"
                    value={landDetails.soilType || ""}
                    onChange={(e) => handleLandDetailChange('soilType', e.target.value)}
                    placeholder="e.g., Clay, Sandy, Loam"
                  />
                </div>

                {/* Topography */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="topography">Topography</Label>
                  <Input
                    id="topography"
                    value={landDetails.topography || ""}
                    onChange={(e) => handleLandDetailChange('topography', e.target.value)}
                    placeholder="e.g., Flat, Gently sloping, Hilly"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Infrastructure Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Utilities */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Utilities</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="electricity"
                      checked={landDetails.electricityAvailable || false}
                      onCheckedChange={(checked) => handleLandDetailChange('electricityAvailable', checked)}
                    />
                    <Label htmlFor="electricity" className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Electricity Available
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="water"
                      checked={landDetails.waterConnectionAvailable || false}
                      onCheckedChange={(checked) => handleLandDetailChange('waterConnectionAvailable', checked)}
                    />
                    <Label htmlFor="water" className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Water Connection Available
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sewer"
                      checked={landDetails.sewerConnectionAvailable || false}
                      onCheckedChange={(checked) => handleLandDetailChange('sewerConnectionAvailable', checked)}
                    />
                    <Label htmlFor="sewer">Sewer Connection Available</Label>
                  </div>
                </div>

                {/* Connectivity */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Connectivity</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="internet"
                      checked={landDetails.internetAvailable || false}
                      onCheckedChange={(checked) => handleLandDetailChange('internetAvailable', checked)}
                    />
                    <Label htmlFor="internet" className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      Internet Available
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="roadAccess"
                      checked={landDetails.roadAccess || false}
                      onCheckedChange={(checked) => handleLandDetailChange('roadAccess', checked)}
                    />
                    <Label htmlFor="roadAccess" className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Road Access
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location & Amenities Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Nearby Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Amenity */}
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Enter nearby amenity (e.g., School, Hospital, Shopping Center)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                />
                <Button 
                  type="button" 
                  onClick={addAmenity}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Amenities List */}
              <div className="flex flex-wrap gap-2">
                {landDetails.nearbyAmenities?.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeAmenity(amenity)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
};
