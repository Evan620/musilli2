import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Home, DollarSign, Calendar, Bed, Bath, Car, Wifi, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdvancedSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    propertyType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    lotSize: '',
    keywords: ''
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const propertyTypes = [
    'House', 'Apartment', 'Condo', 'Townhouse', 'Villa', 'Studio', 'Duplex', 'Penthouse'
  ];

  const amenities = [
    'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Balcony', 'Terrace', 
    'Security', 'Elevator', 'Air Conditioning', 'Heating', 'Fireplace', 'Storage'
  ];

  const features = [
    'Furnished', 'Pet Friendly', 'Newly Renovated', 'Luxury Finishes', 
    'City View', 'Ocean View', 'Mountain View', 'Quiet Neighborhood', 
    'Near Schools', 'Near Shopping', 'Near Transport', 'Gated Community'
  ];

  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const clearAllFilters = () => {
    setSearchFilters({
      location: '',
      propertyType: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      yearBuilt: '',
      lotSize: '',
      keywords: ''
    });
    setSelectedAmenities([]);
    setSelectedFeatures([]);
  };

  const handleSearch = () => {
    // Build search query parameters
    const params = new URLSearchParams();
    
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (selectedAmenities.length > 0) {
      params.append('amenities', selectedAmenities.join(','));
    }
    
    if (selectedFeatures.length > 0) {
      params.append('features', selectedFeatures.join(','));
    }

    // Navigate to rentals page with search parameters
    window.location.href = `/rentals?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{color: 'hsl(158, 64%, 20%)'}}>
            Advanced Property Search
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find your perfect property with our comprehensive search filters. Narrow down your options by location, price, amenities, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Filters */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Basic Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="City, neighborhood, or address"
                        value={searchFilters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <select
                      value={searchFilters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Any Type</option>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <Input
                    placeholder="e.g., modern, spacious, renovated"
                    value={searchFilters.keywords}
                    onChange={(e) => handleFilterChange('keywords', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Price & Size */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Price & Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Price (KSH)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={searchFilters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Price (KSH)
                    </label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={searchFilters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <select
                      value={searchFilters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <select
                      value={searchFilters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Built
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 2020"
                      value={searchFilters.yearBuilt}
                      onChange={(e) => handleFilterChange('yearBuilt', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {amenities.map(amenity => (
                    <button
                      key={amenity}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedAmenities.includes(amenity)
                          ? 'text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                      style={selectedAmenities.includes(amenity) ? {
                        backgroundColor: 'hsl(174, 100%, 29%)',
                        borderColor: 'hsl(174, 100%, 29%)'
                      } : {}}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Special Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {features.map(feature => (
                    <button
                      key={feature}
                      onClick={() => handleFeatureToggle(feature)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                        selectedFeatures.includes(feature)
                          ? 'text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                      style={selectedFeatures.includes(feature) ? {
                        backgroundColor: 'hsl(158, 64%, 20%)',
                        borderColor: 'hsl(158, 64%, 20%)'
                      } : {}}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Active Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(searchFilters).map(([key, value]) => 
                    value && (
                      <Badge key={key} variant="secondary" className="mr-2 mb-2">
                        {key}: {value}
                      </Badge>
                    )
                  )}
                  {selectedAmenities.map(amenity => (
                    <Badge key={amenity} variant="secondary" className="mr-2 mb-2">
                      {amenity}
                    </Badge>
                  ))}
                  {selectedFeatures.map(feature => (
                    <Badge key={feature} variant="secondary" className="mr-2 mb-2">
                      {feature}
                    </Badge>
                  ))}
                  {(Object.values(searchFilters).some(v => v) || selectedAmenities.length > 0 || selectedFeatures.length > 0) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Search Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSearch}
                  className="w-full text-white font-semibold rounded-lg h-12"
                  style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </Button>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full border-2 font-semibold rounded-lg h-12"
                    style={{
                      borderColor: 'hsl(158, 64%, 20%)',
                      color: 'hsl(158, 64%, 20%)'
                    }}
                  >
                    Back to Home
                  </Button>
                </Link>
              </div>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/rentals" className="block text-sm text-teal-600 hover:text-teal-800">
                    Browse All Properties
                  </Link>
                  <Link to="/land" className="block text-sm text-teal-600 hover:text-teal-800">
                    Land for Sale
                  </Link>
                  <Link to="/drawings" className="block text-sm text-teal-600 hover:text-teal-800">
                    House Plans
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
