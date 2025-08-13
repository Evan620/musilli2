import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProperties } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { PropertyFormData, PropertyType, PropertyCategory } from "@/types";
import { Home, MapPin, DollarSign, Upload, Plus } from "lucide-react";

const AddProperty = () => {
  const navigate = useNavigate();
  const { addProperty, isLoading } = useProperties();
  const { user } = useAuth();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    type: "house",
    category: "sale",
    price: 0,
    currency: "USD",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    features: {
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      areaUnit: "sqft",
      parking: 0,
      furnished: false,
      petFriendly: false,
      amenities: "",
      utilities: "",
    },
    images: [],
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PropertyFormData],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }
    setFormData(prev => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title || !formData.description || !formData.location.city) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (formData.features.area <= 0) {
      setError("Area must be greater than 0");
      return;
    }

    const success = await addProperty(formData);
    
    if (success) {
      toast({
        title: "Property added successfully",
        description: user?.role === 'admin' 
          ? "Property has been published" 
          : "Property submitted for admin approval",
      });
      navigate("/dashboard/provider");
    } else {
      setError("Failed to add property. Please try again.");
    }
  };

  if (!user) {
    return <div>Please log in to add properties.</div>;
  }

  return (
    <main className="container mx-auto py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gradient flex items-center gap-2">
          <Plus className="w-8 h-8" />
          Add New Property
        </h1>
        <p className="text-muted-foreground">
          Create a new property listing for sale, rent, or short-term rental
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Modern 3BR Villa with Pool"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type *</Label>
                <Select value={formData.type} onValueChange={(value: PropertyType) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="airbnb">Airbnb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your property in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Listing Category *</Label>
                <Select value={formData.category} onValueChange={(value: PropertyCategory) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="short-term-rental">Short-term Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price * {formData.category === 'rent' ? '(per month)' : formData.category === 'short-term-rental' ? '(per night)' : ''}
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="GHS">GHS (₵)</SelectItem>
                    <SelectItem value="KES">KES (KSh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={formData.location.address}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Region</Label>
                <Input
                  id="state"
                  placeholder="State or region"
                  value={formData.location.state}
                  onChange={(e) => handleInputChange('location.state', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={formData.location.country}
                  onChange={(e) => handleInputChange('location.country', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  placeholder="ZIP code"
                  value={formData.location.zipCode}
                  onChange={(e) => handleInputChange('location.zipCode', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Features */}
        {formData.type !== 'land' && (
          <Card className="brutal-card">
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.features.bedrooms || ''}
                    onChange={(e) => handleInputChange('features.bedrooms', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={formData.features.bathrooms || ''}
                    onChange={(e) => handleInputChange('features.bathrooms', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parking">Parking Spaces</Label>
                  <Input
                    id="parking"
                    type="number"
                    min="0"
                    value={formData.features.parking || ''}
                    onChange={(e) => handleInputChange('features.parking', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={formData.features.furnished}
                    onCheckedChange={(checked) => handleInputChange('features.furnished', checked)}
                  />
                  <Label htmlFor="furnished">Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petFriendly"
                    checked={formData.features.petFriendly}
                    onCheckedChange={(checked) => handleInputChange('features.petFriendly', checked)}
                  />
                  <Label htmlFor="petFriendly">Pet Friendly</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Area and Additional Features */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle>Area & Additional Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="area">Area *</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="0"
                  value={formData.features.area || ''}
                  onChange={(e) => handleInputChange('features.area', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaUnit">Area Unit</Label>
                <Select value={formData.features.areaUnit} onValueChange={(value) => handleInputChange('features.areaUnit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">Square Feet</SelectItem>
                    <SelectItem value="sqm">Square Meters</SelectItem>
                    <SelectItem value="acres">Acres</SelectItem>
                    <SelectItem value="hectares">Hectares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                placeholder="e.g., Swimming Pool, Gym, Security, Garden"
                value={formData.features.amenities}
                onChange={(e) => handleInputChange('features.amenities', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utilities">Utilities (comma-separated)</Label>
              <Input
                id="utilities"
                placeholder="e.g., Electricity, Water, Internet, Gas"
                value={formData.features.utilities}
                onChange={(e) => handleInputChange('features.utilities', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="brutal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Property Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="images">Upload Images (max 10)</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Upload high-quality images of your property. The first image will be used as the main photo.
              </p>
            </div>
            {formData.images.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {formData.images.length} image(s) selected
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Adding Property..." : "Add Property"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </main>
  );
};

export default AddProperty;
