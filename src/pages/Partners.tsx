import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, MapPin, Building2, Star, Phone, Mail, Globe,
  Users, Home, TrendingUp, Award, CheckCircle, Filter
} from 'lucide-react';
import { useProviders } from "@/contexts/ProviderContext";

const Partners = () => {
  const [searchParams] = useSearchParams();
  const { approvedProviders } = useProviders();
  const [filteredProviders, setFilteredProviders] = useState(approvedProviders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('filter') || '');
  const [sortBy, setSortBy] = useState('rating');

  // Get unique cities for filter
  const cities = [...new Set(approvedProviders.map(p => p.city))];

  useEffect(() => {
    let filtered = approvedProviders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(provider => provider.city === selectedCity);
    }

    // Plan filter
    if (selectedPlan) {
      filtered = filtered.filter(provider => provider.subscriptionPlan === selectedPlan);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'listings':
          return b.totalListings - a.totalListings;
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        case 'experience':
          return b.yearsInBusiness - a.yearsInBusiness;
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  }, [searchTerm, selectedCity, selectedPlan, sortBy, approvedProviders]);

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-500 text-white';
      case 'premium':
        return 'bg-orange-500 text-white';
      case 'basic':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mobile-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto mobile-padding py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{color: 'hsl(158, 64%, 20%)'}}>
              Real Estate Partners in Kenya
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed">
              Connect with verified and admin-approved real estate professionals across Kenya. Our partners are trusted agents
              and agencies ready to help you find your perfect property or sell your current one.
            </p>
            <div className="mt-3 sm:mt-4 inline-flex items-center px-3 py-2 rounded-full text-xs sm:text-sm bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="text-center">All partners shown below have been verified and approved by our admin team</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar - Full Width on Mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, city, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base mobile-button !text-black placeholder:text-gray-500"
                style={{ color: '#000000' }}
              />
            </div>

            {/* Filter Dropdowns - Stack on Mobile, Grid on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-base mobile-button bg-white !text-black"
                style={{ color: '#000000' }}
              >
                <option value="" style={{ color: '#000000' }}>All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city} style={{ color: '#000000' }}>{city}</option>
                ))}
              </select>

              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-base mobile-button bg-white !text-black"
                style={{ color: '#000000' }}
              >
                <option value="" style={{ color: '#000000' }}>All Plans</option>
                <option value="basic" style={{ color: '#000000' }}>Basic</option>
                <option value="premium" style={{ color: '#000000' }}>Premium</option>
                <option value="enterprise" style={{ color: '#000000' }}>Enterprise</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-base mobile-button bg-white !text-black sm:col-span-2 lg:col-span-1"
                style={{ color: '#000000' }}
              >
                <option value="rating" style={{ color: '#000000' }}>Sort by Rating</option>
                <option value="listings" style={{ color: '#000000' }}>Sort by Listings</option>
                <option value="name" style={{ color: '#000000' }}>Sort by Name</option>
                <option value="experience" style={{ color: '#000000' }}>Sort by Experience</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
            Showing {filteredProviders.length} of {approvedProviders.length} approved partners
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="container mx-auto mobile-padding py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-300 mobile-card">
              <CardContent className="p-4 sm:p-6">
                {/* Mobile-First Layout */}
                <div className="space-y-4">
                  {/* Header Section - Logo, Name, and Rating */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <img
                        src={provider.logo}
                        alt={`${provider.businessName} logo`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border"
                      />
                    </div>

                    {/* Name and Badges */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {provider.businessName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${getPlanBadgeColor(provider.subscriptionPlan)} text-xs`}>
                          {provider.subscriptionPlan.charAt(0).toUpperCase() + provider.subscriptionPlan.slice(1)}
                        </Badge>
                        {provider.isVerified && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Rating - Moved to top right */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-sm sm:text-base">{provider.rating}</span>
                      </div>
                      <span className="text-gray-500 text-xs">({provider.reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {provider.description}
                  </p>

                  {/* Stats - Mobile Optimized */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                        {provider.totalListings}
                      </div>
                      <div className="text-xs text-gray-500">Properties</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                        {provider.yearsInBusiness}
                      </div>
                      <div className="text-xs text-gray-500">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                        {provider.reviews}
                      </div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                  </div>

                  {/* Location and Contact - Mobile Optimized */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{provider.city}, {provider.state}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{provider.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{provider.email}</span>
                    </div>
                  </div>

                  {/* Specialties - Mobile Optimized */}
                  <div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {provider.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {provider.specialties.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                    {/* Primary Action - Call */}
                    <Button
                      className="w-full sm:flex-1 text-white mobile-button"
                      style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                      onClick={() => window.open(`tel:${provider.phone}`, '_self')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:flex-1">
                      <Button
                        variant="outline"
                        className="mobile-button"
                        onClick={() => window.open(`mailto:${provider.email}`, '_self')}
                      >
                        <Mail className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Email</span>
                        <span className="sm:hidden">Email</span>
                      </Button>
                      <Link to={`/rentals?provider=${provider.id}`} className="block">
                        <Button
                          variant="outline"
                          className="w-full border-2 mobile-button"
                          style={{
                            borderColor: 'hsl(158, 64%, 20%)',
                            color: 'hsl(158, 64%, 20%)'
                          }}
                        >
                          <Building2 className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View Properties</span>
                          <span className="sm:hidden">Properties</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all partners.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCity('');
                setSelectedPlan('');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Why Work with Partners Section - Mobile Optimized */}
        <div className="mt-12 sm:mt-16 bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 leading-tight" style={{color: 'hsl(158, 64%, 20%)'}}>
            Why you should work with a real estate agency
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Expert Guidance</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Professional agents provide expert advice and market insights to help you make informed decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Market Knowledge</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Access to comprehensive market data and pricing trends to ensure you get the best deal.
              </p>
            </div>
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Verified Partners</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                All our partners are verified professionals with proven track records and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
