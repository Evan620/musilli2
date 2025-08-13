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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4" style={{color: 'hsl(158, 64%, 20%)'}}>
              Real Estate Partners in Kenya
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Connect with verified and admin-approved real estate professionals across Kenya. Our partners are trusted agents
              and agencies ready to help you find your perfect property or sell your current one.
            </p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              All partners shown below have been verified and approved by our admin team
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, city, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Plans</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="rating">Sort by Rating</option>
              <option value="listings">Sort by Listings</option>
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-gray-600 mb-6">
            Showing {filteredProviders.length} of {approvedProviders.length} approved partners
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <img
                      src={provider.logo}
                      alt={`${provider.businessName} logo`}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {provider.businessName}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPlanBadgeColor(provider.subscriptionPlan)}>
                            {provider.subscriptionPlan.charAt(0).toUpperCase() + provider.subscriptionPlan.slice(1)}
                          </Badge>
                          {provider.isVerified && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{provider.rating}</span>
                          <span className="text-gray-500 text-sm">({provider.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {provider.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                          {provider.totalListings}
                        </div>
                        <div className="text-xs text-gray-500">Properties</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                          {provider.yearsInBusiness}
                        </div>
                        <div className="text-xs text-gray-500">Years</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                          {provider.reviews}
                        </div>
                        <div className="text-xs text-gray-500">Reviews</div>
                      </div>
                    </div>

                    {/* Location and Contact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {provider.city}, {provider.state}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {provider.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {provider.email}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {provider.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-white"
                        style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                        onClick={() => window.open(`tel:${provider.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`mailto:${provider.email}`, '_self')}
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Link to={`/rentals?provider=${provider.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-2"
                          style={{
                            borderColor: 'hsl(158, 64%, 20%)',
                            color: 'hsl(158, 64%, 20%)'
                          }}
                        >
                          View Properties
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

        {/* Why Work with Partners Section */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8" style={{color: 'hsl(158, 64%, 20%)'}}>
            Why you should work with a real estate agency
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-gray-600 text-sm">
                Professional agents provide expert advice and market insights to help you make informed decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Market Knowledge</h3>
              <p className="text-gray-600 text-sm">
                Access to comprehensive market data and pricing trends to ensure you get the best deal.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Verified Partners</h3>
              <p className="text-gray-600 text-sm">
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
