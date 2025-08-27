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
  Building2, DollarSign, Square, Car, Calendar, 
  Users, Shield, Plus, X, Save, AlertCircle 
} from "lucide-react";
import { 
  CommercialPropertyDetails, 
  CommercialPropertyType, 
  BuildingClass, 
  CommercialZoning, 
  LeaseType 
} from "@/types";

interface CommercialPropertyFormProps {
  initialData?: Partial<CommercialPropertyDetails>;
  onSave: (data: Partial<CommercialPropertyDetails>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CommercialPropertyForm = ({ 
  initialData, 
  onSave, 
  onCancel, 
  isLoading = false 
}: CommercialPropertyFormProps) => {
  const [formData, setFormData] = useState<Partial<CommercialPropertyDetails>>({
    commercialType: 'office_class_a',
    zoningType: 'commercial',
    loadingDocks: 0,
    parkingSpaces: 0,
    securityDepositMonths: 1,
    occupancyCertificateValid: false,
    fireSafetyCompliant: false,
    adaCompliant: false,
    signageRights: false,
    driveThroughAvailable: false,
    restaurantApproved: false,
    anchorTenants: [],
    tenantMix: [],
    permittedUses: [],
    ...initialData
  });

  const [newAmenity, setNewAmenity] = useState("");
  const [newTenant, setNewTenant] = useState("");
  const [newPermittedUse, setNewPermittedUse] = useState("");

  const handleInputChange = (field: keyof CommercialPropertyDetails, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: 'anchorTenants' | 'tenantMix' | 'permittedUses', value: string) => {
    if (!value.trim()) return;
    
    const currentArray = formData[field] || [];
    if (!currentArray.includes(value.trim())) {
      handleInputChange(field, [...currentArray, value.trim()]);
    }
    
    // Clear input
    if (field === 'anchorTenants') setNewTenant("");
    if (field === 'permittedUses') setNewPermittedUse("");
  };

  const removeFromArray = (field: 'anchorTenants' | 'tenantMix' | 'permittedUses', value: string) => {
    const currentArray = formData[field] || [];
    handleInputChange(field, currentArray.filter(item => item !== value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData?.id ? 'Edit Commercial Property' : 'Add Commercial Property'}
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Property
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="building">Building Details</TabsTrigger>
          <TabsTrigger value="lease">Lease Terms</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Property Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Commercial Type */}
                <div className="space-y-2">
                  <Label htmlFor="commercialType">Commercial Type *</Label>
                  <Select 
                    value={formData.commercialType} 
                    onValueChange={(value) => handleInputChange('commercialType', value as CommercialPropertyType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select commercial type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office_class_a">Class A Office</SelectItem>
                      <SelectItem value="office_class_b">Class B Office</SelectItem>
                      <SelectItem value="office_class_c">Class C Office</SelectItem>
                      <SelectItem value="coworking_space">Co-working Space</SelectItem>
                      <SelectItem value="executive_suite">Executive Suite</SelectItem>
                      <SelectItem value="shopping_center">Shopping Center</SelectItem>
                      <SelectItem value="strip_mall">Strip Mall</SelectItem>
                      <SelectItem value="standalone_retail">Retail Space</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="flex_space">Flex Space</SelectItem>
                      <SelectItem value="cold_storage">Cold Storage</SelectItem>
                      <SelectItem value="logistics_center">Logistics Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Building Class */}
                <div className="space-y-2">
                  <Label htmlFor="buildingClass">Building Class</Label>
                  <Select 
                    value={formData.buildingClass || ""} 
                    onValueChange={(value) => handleInputChange('buildingClass', value as BuildingClass)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select building class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class_a">Class A</SelectItem>
                      <SelectItem value="class_b">Class B</SelectItem>
                      <SelectItem value="class_c">Class C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Zoning Type */}
                <div className="space-y-2">
                  <Label htmlFor="zoningType">Zoning Type *</Label>
                  <Select 
                    value={formData.zoningType} 
                    onValueChange={(value) => handleInputChange('zoningType', value as CommercialZoning)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select zoning type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="mixed_use">Mixed Use</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Built */}
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.yearBuilt || ""}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Building Details Tab */}
        <TabsContent value="building" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="w-5 h-5" />
                Building Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Building Size */}
                <div className="space-y-2">
                  <Label htmlFor="totalBuildingSize">Total Building Size (sqft)</Label>
                  <Input
                    id="totalBuildingSize"
                    type="number"
                    min="0"
                    value={formData.totalBuildingSize || ""}
                    onChange={(e) => handleInputChange('totalBuildingSize', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 50000"
                  />
                </div>

                {/* Available Space */}
                <div className="space-y-2">
                  <Label htmlFor="availableSpace">Available Space (sqft)</Label>
                  <Input
                    id="availableSpace"
                    type="number"
                    min="0"
                    value={formData.availableSpace || ""}
                    onChange={(e) => handleInputChange('availableSpace', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 25000"
                  />
                </div>

                {/* Ceiling Height */}
                <div className="space-y-2">
                  <Label htmlFor="ceilingHeight">Ceiling Height (ft)</Label>
                  <Input
                    id="ceilingHeight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.ceilingHeight || ""}
                    onChange={(e) => handleInputChange('ceilingHeight', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 12.5"
                  />
                </div>

                {/* Loading Docks */}
                <div className="space-y-2">
                  <Label htmlFor="loadingDocks">Loading Docks</Label>
                  <Input
                    id="loadingDocks"
                    type="number"
                    min="0"
                    value={formData.loadingDocks || 0}
                    onChange={(e) => handleInputChange('loadingDocks', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                {/* Parking Spaces */}
                <div className="space-y-2">
                  <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                  <Input
                    id="parkingSpaces"
                    type="number"
                    min="0"
                    value={formData.parkingSpaces || 0}
                    onChange={(e) => handleInputChange('parkingSpaces', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>

                {/* Parking Ratio */}
                <div className="space-y-2">
                  <Label htmlFor="parkingRatio">Parking Ratio (per 1000 sqft)</Label>
                  <Input
                    id="parkingRatio"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.parkingRatio || ""}
                    onChange={(e) => handleInputChange('parkingRatio', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 4.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anchor Tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tenant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Occupancy Rate */}
              <div className="space-y-2">
                <Label htmlFor="currentOccupancyRate">Current Occupancy Rate (%)</Label>
                <Input
                  id="currentOccupancyRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.currentOccupancyRate || ""}
                  onChange={(e) => handleInputChange('currentOccupancyRate', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 85.5"
                />
              </div>

              {/* Anchor Tenants */}
              <div className="space-y-2">
                <Label>Anchor Tenants</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTenant}
                    onChange={(e) => setNewTenant(e.target.value)}
                    placeholder="Enter tenant name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('anchorTenants', newTenant))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray('anchorTenants', newTenant)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.anchorTenants?.map((tenant, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tenant}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeFromArray('anchorTenants', tenant)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lease Terms Tab */}
        <TabsContent value="lease" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Lease Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Lease Type */}
                <div className="space-y-2">
                  <Label htmlFor="leaseType">Lease Type</Label>
                  <Select 
                    value={formData.leaseType || ""} 
                    onValueChange={(value) => handleInputChange('leaseType', value as LeaseType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lease type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="triple_net">Triple Net (NNN)</SelectItem>
                      <SelectItem value="gross">Gross Lease</SelectItem>
                      <SelectItem value="modified_gross">Modified Gross</SelectItem>
                      <SelectItem value="percentage">Percentage Lease</SelectItem>
                      <SelectItem value="ground_lease">Ground Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rent per sqft */}
                <div className="space-y-2">
                  <Label htmlFor="rentPerSqft">Rent per sqft (Monthly)</Label>
                  <Input
                    id="rentPerSqft"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rentPerSqft || ""}
                    onChange={(e) => handleInputChange('rentPerSqft', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 25.50"
                  />
                </div>

                {/* CAM Charges */}
                <div className="space-y-2">
                  <Label htmlFor="camCharges">CAM Charges (per sqft)</Label>
                  <Input
                    id="camCharges"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.camCharges || ""}
                    onChange={(e) => handleInputChange('camCharges', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 5.00"
                  />
                </div>

                {/* Lease Term Min */}
                <div className="space-y-2">
                  <Label htmlFor="leaseTermMin">Min Lease Term (months)</Label>
                  <Input
                    id="leaseTermMin"
                    type="number"
                    min="1"
                    value={formData.leaseTermMin || ""}
                    onChange={(e) => handleInputChange('leaseTermMin', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 12"
                  />
                </div>

                {/* Lease Term Max */}
                <div className="space-y-2">
                  <Label htmlFor="leaseTermMax">Max Lease Term (months)</Label>
                  <Input
                    id="leaseTermMax"
                    type="number"
                    min="1"
                    value={formData.leaseTermMax || ""}
                    onChange={(e) => handleInputChange('leaseTermMax', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 120"
                  />
                </div>

                {/* Security Deposit */}
                <div className="space-y-2">
                  <Label htmlFor="securityDepositMonths">Security Deposit (months)</Label>
                  <Input
                    id="securityDepositMonths"
                    type="number"
                    min="0"
                    value={formData.securityDepositMonths || 1}
                    onChange={(e) => handleInputChange('securityDepositMonths', Number(e.target.value))}
                    placeholder="1"
                  />
                </div>

                {/* Annual Escalation */}
                <div className="space-y-2">
                  <Label htmlFor="annualEscalation">Annual Escalation (%)</Label>
                  <Input
                    id="annualEscalation"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.annualEscalation || ""}
                    onChange={(e) => handleInputChange('annualEscalation', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 3.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance & Permits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Compliance Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="occupancyCertificate"
                      checked={formData.occupancyCertificateValid || false}
                      onCheckedChange={(checked) => handleInputChange('occupancyCertificateValid', checked)}
                    />
                    <Label htmlFor="occupancyCertificate">Valid Occupancy Certificate</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fireSafety"
                      checked={formData.fireSafetyCompliant || false}
                      onCheckedChange={(checked) => handleInputChange('fireSafetyCompliant', checked)}
                    />
                    <Label htmlFor="fireSafety">Fire Safety Compliant</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="adaCompliant"
                      checked={formData.adaCompliant || false}
                      onCheckedChange={(checked) => handleInputChange('adaCompliant', checked)}
                    />
                    <Label htmlFor="adaCompliant">ADA Compliant</Label>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signageRights"
                      checked={formData.signageRights || false}
                      onCheckedChange={(checked) => handleInputChange('signageRights', checked)}
                    />
                    <Label htmlFor="signageRights">Signage Rights Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="driveThrough"
                      checked={formData.driveThroughAvailable || false}
                      onCheckedChange={(checked) => handleInputChange('driveThroughAvailable', checked)}
                    />
                    <Label htmlFor="driveThrough">Drive-Through Available</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restaurantApproved"
                      checked={formData.restaurantApproved || false}
                      onCheckedChange={(checked) => handleInputChange('restaurantApproved', checked)}
                    />
                    <Label htmlFor="restaurantApproved">Restaurant Use Approved</Label>
                  </div>
                </div>
              </div>

              {/* Permitted Uses */}
              <div className="space-y-2">
                <Label>Permitted Uses</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPermittedUse}
                    onChange={(e) => setNewPermittedUse(e.target.value)}
                    placeholder="Enter permitted use"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('permittedUses', newPermittedUse))}
                  />
                  <Button 
                    type="button" 
                    onClick={() => addToArray('permittedUses', newPermittedUse)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.permittedUses?.map((use, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {use}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeFromArray('permittedUses', use)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
};
