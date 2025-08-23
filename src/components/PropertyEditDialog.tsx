import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Property, PropertyFormData } from '@/types';
import { useProperties } from '@/contexts/PropertyContext';
import { useToast } from "@/hooks/use-toast";

interface PropertyEditDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const PropertyEditDialog: React.FC<PropertyEditDialogProps> = ({
  property,
  isOpen,
  onClose,
  onSave
}) => {
  const { updateProperty } = useProperties();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<PropertyFormData>>({});

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        type: property.type,
        category: property.category,
        price: property.price,
        currency: property.currency,
        location: {
          address: property.location.address,
          city: property.location.city,
          state: property.location.state,
          country: property.location.country,
          zipCode: property.location.zipCode
        },
        features: {
          bedrooms: property.features.bedrooms,
          bathrooms: property.features.bathrooms,
          area: property.features.area,
          parking: property.features.parking,
          furnished: property.features.furnished,
          amenities: Array.isArray(property.features.amenities)
            ? property.features.amenities.join(', ')
            : property.features.amenities || '',
          utilities: Array.isArray(property.features.utilities)
            ? property.features.utilities.join(', ')
            : property.features.utilities || ''
        }
      });
    }
  }, [property]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleFeaturesChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!property) return;

    setIsLoading(true);
    try {
      const success = await updateProperty(property.id, formData);
      if (success) {
        toast({
          title: "Property Updated",
          description: "The property has been updated successfully.",
        });
        onSave();
        onClose();
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update the property. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.location?.city || ''}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.location?.state || ''}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.location?.address || ''}
                onChange={(e) => handleLocationChange('address', e.target.value)}
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.features?.bedrooms || ''}
                  onChange={(e) => handleFeaturesChange('bedrooms', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.features?.bathrooms || ''}
                  onChange={(e) => handleFeaturesChange('bathrooms', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="area">Area (sq ft)</Label>
                <Input
                  id="area"
                  type="number"
                  value={formData.features?.area || ''}
                  onChange={(e) => handleFeaturesChange('area', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parking">Parking</Label>
                <Input
                  id="parking"
                  type="number"
                  value={formData.features?.parking || ''}
                  onChange={(e) => handleFeaturesChange('parking', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Amenities and Utilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Textarea
                  id="amenities"
                  placeholder="e.g., Swimming Pool, Gym, Security, Garden"
                  value={formData.features?.amenities || ''}
                  onChange={(e) => handleFeaturesChange('amenities', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilities">Utilities (comma-separated)</Label>
                <Textarea
                  id="utilities"
                  placeholder="e.g., Electricity, Water, Internet, Gas"
                  value={formData.features?.utilities || ''}
                  onChange={(e) => handleFeaturesChange('utilities', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
