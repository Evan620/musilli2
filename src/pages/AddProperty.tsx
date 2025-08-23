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
import { Home, MapPin, Banknote, Upload, Plus } from "lucide-react";
import {
  compressImages,
  getOptimalCompressionSettings,
  validateImageFile,
  formatFileSize
} from "@/utils/imageCompression";
import { ImageCompressionProgress } from "@/components/ImageCompressionProgress";

const AddProperty = () => {
  const navigate = useNavigate();
  const { addProperty, isLoading } = useProperties();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    isUploading: boolean;
    current: number;
    total: number;
    currentFileName: string;
  }>({
    isUploading: false,
    current: 0,
    total: 0,
    currentFileName: ""
  });

  const [compressionState, setCompressionState] = useState<{
    isCompressing: boolean;
    progress: number;
    currentFile: string;
    totalFiles: number;
    completedFiles: number;
    stats?: {
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    };
  }>({
    isCompressing: false,
    progress: 0,
    currentFile: '',
    totalFiles: 0,
    completedFiles: 0
  });



  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    type: "house",
    category: "sale",
    price: 0,
    currency: "KSH",
    location: {
      address: "",
      city: "",
      state: "",
      country: "Kenya",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate number of files
    if (files.length > 10) {
      setError("Maximum 10 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    if (validFiles.length === 0) return;

    setError(""); // Clear any previous errors

    try {
      // Start compression
      setCompressionState({
        isCompressing: true,
        progress: 0,
        currentFile: '',
        totalFiles: validFiles.length,
        completedFiles: 0
      });

      // Calculate total original size
      const totalOriginalSize = validFiles.reduce((sum, file) => sum + file.size, 0);

      // Compress images
      const compressionResults = await compressImages(
        validFiles,
        getOptimalCompressionSettings(validFiles[0]), // Use settings based on first file
        (progress, currentFile) => {
          setCompressionState(prev => ({
            ...prev,
            progress,
            currentFile,
            completedFiles: Math.floor((progress / 100) * validFiles.length)
          }));
        }
      );

      // Calculate total compressed size and compression ratio
      const totalCompressedSize = compressionResults.reduce((sum, result) => sum + result.compressedSize, 0);
      const overallCompressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

      // Update form data with compressed files
      const compressedFiles = compressionResults.map(result => result.compressedFile);
      setFormData(prev => ({ ...prev, images: compressedFiles }));

      // Show compression stats
      setCompressionState(prev => ({
        ...prev,
        isCompressing: false,
        progress: 100,
        stats: {
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          compressionRatio: overallCompressionRatio
        }
      }));

      // Log compression results
      console.log('🖼️ Image compression completed:', {
        originalFiles: validFiles.length,
        originalSize: formatFileSize(totalOriginalSize),
        compressedSize: formatFileSize(totalCompressedSize),
        compressionRatio: `${Math.round(overallCompressionRatio)}%`,
        results: compressionResults
      });

      // Show success toast
      toast({
        title: "Images Optimized!",
        description: `${validFiles.length} image${validFiles.length > 1 ? 's' : ''} compressed by ${Math.round(overallCompressionRatio)}% while maintaining quality.`,
      });

    } catch (error) {
      console.error('Image compression failed:', error);
      setError("Failed to compress images. Using original files.");
      setFormData(prev => ({ ...prev, images: validFiles }));
      setCompressionState(prev => ({ ...prev, isCompressing: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Debug: Log form data to see what's being submitted
    console.log('🔍 Form data being submitted:', formData);

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

    // Set up progress tracking
    if (formData.images.length > 0) {
      setUploadProgress({
        isUploading: true,
        current: 0,
        total: formData.images.length,
        currentFileName: ""
      });
    }

    try {
      console.log('🚀 Starting property creation...');

      const success = await addProperty(formData, (current, total, fileName) => {
        console.log(`📊 Upload progress: ${current}/${total} - ${fileName}`);
        setUploadProgress({
          isUploading: true,
          current,
          total,
          currentFileName: fileName
        });
      });

      // Reset upload progress
      setUploadProgress({
        isUploading: false,
        current: 0,
        total: 0,
        currentFileName: ""
      });

      if (success) {
        console.log('✅ Property created successfully');
        toast({
          title: "Property added successfully",
          description: user?.role === 'admin'
            ? "Property has been published"
            : "Property submitted for admin approval",
        });
        // Redirect based on user role
        if (user?.role === 'admin') {
          navigate("/dashboard/admin");
        } else {
          navigate("/dashboard/provider");
        }
      } else {
        console.error('❌ Property creation failed');
        setError("Failed to add property. Please check the console for details and try again.");
      }
    } catch (error) {
      console.error('❌ Unexpected error during property creation:', error);
      setError(`Unexpected error: ${error}. Please try again.`);

      // Reset upload progress on error
      setUploadProgress({
        isUploading: false,
        current: 0,
        total: 0,
        currentFileName: ""
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p>Please log in to add properties.</p>
          <Button
            onClick={() => navigate('/login')}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
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
              <Banknote className="w-5 h-5" />
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
                    <SelectItem value="KSH">KSH (Kenyan Shilling)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
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
                <br />
                <span className="text-blue-600">✨ Images will be automatically optimized for faster loading while maintaining quality.</span>
              </p>
            </div>

            {/* Image Compression Progress */}
            <ImageCompressionProgress
              isCompressing={compressionState.isCompressing}
              progress={compressionState.progress}
              currentFile={compressionState.currentFile}
              stats={compressionState.stats}
              totalFiles={compressionState.totalFiles}
              completedFiles={compressionState.completedFiles}
            />

            {formData.images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {formData.images.length} image(s) selected
                  </div>
                  {compressionState.stats && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      {formatFileSize(compressionState.stats.compressedSize)} total
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {formData.images.slice(0, 4).map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                          Primary
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  ))}
                  {formData.images.length > 4 && (
                    <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-500">
                      +{formData.images.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="space-y-4">
          {/* Upload Progress */}
          {uploadProgress.isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Uploading Images...
                </span>
                <span className="text-sm text-blue-600">
                  {uploadProgress.current} of {uploadProgress.total}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                  }}
                ></div>
              </div>

              {/* Current File */}
              {uploadProgress.currentFileName && (
                <p className="text-xs text-blue-600 truncate">
                  Uploading: {uploadProgress.currentFileName}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || uploadProgress.isUploading || compressionState.isCompressing}
              className="flex-1"
            >
              {compressionState.isCompressing
                ? `Optimizing Images (${Math.round(compressionState.progress)}%)...`
                : uploadProgress.isUploading
                  ? `Uploading Images (${uploadProgress.current}/${uploadProgress.total})...`
                  : isLoading
                    ? "Adding Property..."
                    : "Add Property"
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isLoading || uploadProgress.isUploading || compressionState.isCompressing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default AddProperty;
