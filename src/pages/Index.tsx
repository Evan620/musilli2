import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, MapPin, Home, Building2, TrendingUp, Users, Star, Award, Shield, Calendar, Eye, MessageSquare, Bed, Bath, ChevronLeft, TreePine, Palette, Download, Ruler, Phone } from "lucide-react";
import { useProperties } from "@/contexts/PropertyContext";
import { useProviders } from "@/contexts/ProviderContext";
import { useScrollAnimation, useParallaxEffect, use3DScrollEffect } from "@/hooks/useScrollAnimation";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { LiveActivityFeed } from "@/components/ui/live-activity-feed";
import { PropertyQuickPreview } from "@/components/ui/property-quick-preview";
import { ChatWidget } from "@/components/ui/chat-widget";
import { GeometricBackground, FloatingElements } from "@/components/ui/geometric-background";
import { MortgageCalculator } from "@/components/ui/mortgage-calculator";
import { PropertyValuationCalculator } from "@/components/ui/property-valuation-calculator";
import { InteractiveTimeline } from "@/components/ui/interactive-timeline";
import { PlanPreviewModal } from "@/components/ui/plan-preview-modal";
import { PlanPurchaseModal } from "@/components/ui/plan-purchase-modal";
import { useState } from "react";

const Index = () => {
  const { properties } = useProperties();
  const { approvedProviders } = useProviders();
  const pageRef = useScrollAnimation();

  // State for search properties by feature
  const [searchType, setSearchType] = useState<'sale' | 'rent'>('sale');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const features = [
    'Private Pool',
    'Upgraded',
    'Large Plot',
    'Close to Park',
    'Brand New',
    'Furnished',
    'Vacant on Transfer',
    'Water Views',
    'Road Access',
    'Title Deed Ready',
    'Electricity Connection',
    'Water Access'
  ];

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Filter properties based on selected features and search type
  const getFilteredProperties = () => {
    if (selectedFeatures.length === 0) return [];

    return properties.filter(property => {
      // Filter by category (sale/rent)
      if (property.category !== searchType) return false;

      // Check if property has any of the selected features
      const propertyFeatures = property.features.amenities || [];
      return selectedFeatures.some(feature =>
        propertyFeatures.some(amenity =>
          amenity.toLowerCase().includes(feature.toLowerCase()) ||
          feature.toLowerCase().includes(amenity.toLowerCase())
        )
      );
    });
  };

  const filteredProperties = getFilteredProperties();

  // Get count of properties for each feature
  const getFeatureCount = (feature: string) => {
    return properties.filter(property => {
      if (property.category !== searchType) return false;
      const propertyFeatures = property.features.amenities || [];
      return propertyFeatures.some(amenity =>
        amenity.toLowerCase().includes(feature.toLowerCase()) ||
        feature.toLowerCase().includes(amenity.toLowerCase())
      );
    }).length;
  };
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorPrice, setCalculatorPrice] = useState(500000);
  const [showValuationCalculator, setShowValuationCalculator] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPlanPreview, setShowPlanPreview] = useState(false);
  const [showPlanPurchase, setShowPlanPurchase] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState<any>(null);

  // Architectural plans data
  const architecturalPlans = [
    {
      id: "1",
      title: "Minimalist 3-Bedroom Villa",
      image: "/api/placeholder/300/200",
      category: "Villa",
      bedrooms: 3,
      bathrooms: 2,
      area: 2500,
      areaUnit: "sqft",
      price: 150000,
      currency: "KSH",
      description: "Modern minimalist design with open-plan living and large windows. Perfect for contemporary families seeking clean lines and functional spaces.",
      features: ["Open Plan Living", "Large Windows", "Modern Kitchen", "Master Suite", "Walk-in Closet", "Covered Patio"],
      isFeatured: true,
      downloads: 234
    },
    {
      id: "2",
      title: "Urban Duplex Concept",
      image: "/api/placeholder/300/200",
      category: "Duplex",
      bedrooms: 4,
      bathrooms: 3,
      area: 3200,
      areaUnit: "sqft",
      price: 200000,
      currency: "KSH",
      description: "Two-story duplex perfect for urban living with rooftop terrace. Maximizes space efficiency while maintaining comfort and style.",
      features: ["Two Stories", "Rooftop Terrace", "Urban Design", "Efficient Layout", "Modern Finishes", "Parking Space"],
      isFeatured: false,
      downloads: 156
    },
    {
      id: "3",
      title: "Eco-Friendly Cottage",
      image: "/api/placeholder/300/200",
      category: "Cottage",
      bedrooms: 2,
      bathrooms: 1,
      area: 1200,
      areaUnit: "sqft",
      price: 80000,
      currency: "KSH",
      description: "Sustainable design with solar panels and rainwater harvesting. Built with eco-friendly materials and energy-efficient systems.",
      features: ["Solar Panels", "Rainwater Harvesting", "Eco Materials", "Energy Efficient", "Natural Lighting", "Garden Space"],
      isFeatured: true,
      downloads: 189
    }
  ];

  // Handler functions for architectural plans
  const handlePlanPreview = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanPreview(true);
  };

  const handlePlanPurchase = (plan: any) => {
    setPlanToPurchase(plan);
    setShowPlanPurchase(true);
    setShowPlanPreview(false);
  };

  const handlePurchaseSuccess = (planId: string) => {
    setShowPlanPurchase(false);
    setPlanToPurchase(null);
    // Here you could add success notification or redirect to download page
    alert(`Successfully purchased plan! Download links sent to your email.`);
  };

  const closePlanModals = () => {
    setShowPlanPreview(false);
    setShowPlanPurchase(false);
    setSelectedPlan(null);
    setPlanToPurchase(null);
  };

  // Handler for main search functionality
  const handleMainSearch = () => {
    // Navigate to rentals page with search parameters
    window.location.href = '/rentals';
  };

  // Handler for property valuation
  const handleGetValuation = () => {
    // Open property valuation calculator
    setShowValuationCalculator(true);
  };

  // Handler for call action
  const handleCall = (propertyTitle: string) => {
    // In a real app, this would initiate a call or show contact info
    alert(`Calling about: ${propertyTitle}\nPhone: +254 700 123 456`);
  };

  // Handler for WhatsApp action
  const handleWhatsApp = (propertyTitle: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in: ${propertyTitle}`);
    const whatsappUrl = `https://wa.me/254700123456?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handler for navigation tabs
  const handleForSale = () => {
    window.location.href = '/rentals?type=sale';
  };

  const handleForRent = () => {
    window.location.href = '/rentals?type=rent';
  };

  const handleProject = () => {
    // Navigate to projects page or show coming soon message
    alert('Projects section coming soon! Stay tuned for exciting new developments.');
  };

  // Initialize scroll effects
  useParallaxEffect();
  use3DScrollEffect();

  // Get latest 4 published properties
  const latestProperties = properties
    .filter(property => property.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Get partner agent properties (from all approved providers)
  const approvedProviderIds = approvedProviders.map(provider => provider.id);
  const partnerProperties = properties
    .filter(property =>
      property.status === 'published' &&
      approvedProviderIds.includes(property.providerId)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Musilli homes",
    url: "/",
    potentialAction: {
      "@type": "SearchAction",
      target: "/rentals?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main ref={pageRef} className="relative">
      {/* Hero Section - BuyRentKenya Style */}
      <section className="hero-section relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Dark Green Cityscape Background */}
        <div className="absolute inset-0">
          {/* Sky gradient - Dark Green Theme */}
          <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, hsl(158, 64%, 15%) 0%, hsl(158, 54%, 20%) 25%, hsl(158, 44%, 25%) 50%, hsl(174, 100%, 29%) 100%)'}}></div>

          {/* Cityscape silhouette - Dark Green Theme */}
          <div className="absolute bottom-0 left-0 right-0 h-48">
            <svg viewBox="0 0 1200 200" className="w-full h-full" style={{fill: 'hsl(158, 64%, 8%, 0.6)'}}>
              <polygon points="0,200 0,150 50,150 50,100 100,100 100,120 150,120 150,80 200,80 200,140 250,140 250,90 300,90 300,160 350,160 350,110 400,110 400,130 450,130 450,70 500,70 500,150 550,150 550,95 600,95 600,170 650,170 650,85 700,85 700,145 750,145 750,75 800,75 800,155 850,155 850,105 900,105 900,135 950,135 950,65 1000,65 1000,175 1050,175 1050,115 1100,115 1100,165 1150,165 1150,125 1200,125 1200,200"></polygon>
            </svg>
          </div>

          {/* Additional building layers for depth - Dark Green Theme */}
          <div className="absolute bottom-0 left-0 right-0 h-32">
            <svg viewBox="0 0 1200 120" className="w-full h-full" style={{fill: 'hsl(158, 64%, 5%, 0.4)'}}>
              <polygon points="0,120 0,80 80,80 80,60 160,60 160,90 240,90 240,50 320,50 320,100 400,100 400,70 480,70 480,110 560,110 560,40 640,40 640,85 720,85 720,95 800,95 800,55 880,55 880,105 960,105 960,75 1040,75 1040,115 1120,115 1120,65 1200,65 1200,120"></polygon>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Main heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Search for property in Kenya
            </h1>

            {/* Search Interface */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-2xl max-w-4xl mx-auto">
              {/* Tab buttons */}
              <div className="flex mb-6">
                <button
                  onClick={handleForSale}
                  className="text-white px-6 py-2 rounded-l-md font-medium hover:opacity-90 transition-opacity"
                  style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                >
                  FOR SALE
                </button>
                <button
                  onClick={handleForRent}
                  className="text-white px-6 py-2 font-medium hover:opacity-90 transition-opacity"
                  style={{backgroundColor: 'hsl(158, 64%, 20%)'}}
                >
                  FOR RENT
                </button>
                <Link to="/land">
                  <button className="text-white px-6 py-2 font-medium hover:opacity-90 transition-opacity" style={{backgroundColor: 'hsl(120, 60%, 40%)'}}>
                    LAND
                  </button>
                </Link>
                <Link to="/drawings">
                  <button className="text-white px-6 py-2 font-medium hover:opacity-90 transition-opacity" style={{backgroundColor: 'hsl(280, 60%, 50%)'}}>
                    PLANS
                  </button>
                </Link>
                <button
                  onClick={handleProject}
                  className="text-white px-6 py-2 rounded-r-md font-medium hover:opacity-90 transition-opacity"
                  style={{backgroundColor: 'hsl(158, 44%, 35%)'}}
                >
                  PROJECT
                </button>
              </div>

              {/* Search form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Category</option>
                    <option>Houses</option>
                    <option>Apartments</option>
                    <option>Land</option>
                    <option>Commercial</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Enter a location, Province, Town or Suburb"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <input
                    type="text"
                    placeholder="Max. Price"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Link to="/advanced-search" className="font-medium underline text-teal-600 hover:text-teal-800">
                  Advanced Search
                </Link>
                <Button
                  onClick={handleMainSearch}
                  className="text-white px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
                  style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Partner Agents Properties Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12" style={{color: 'hsl(158, 64%, 20%)'}}>Browse our partner agents properties</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerProperties.length > 0 ? (
              partnerProperties.map((property) => (
                <Link key={property.id} to={`/property/${property.id}`} className="block">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                      <img
                        src={property.images[0]?.url || "/api/placeholder/300/200"}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-black group-hover:text-gray-800">{property.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location.city}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span>Delivery Date: Dec 2025</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span>Price from: {property.currency} {property.price.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        <span>Developer: {approvedProviders.find(p => p.id === property.providerId)?.businessName || 'Partner Agent'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCall(property.title);
                          }}
                          className="flex items-center gap-1 px-3 py-2 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                          style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                        >
                          <Phone className="w-3 h-3" />
                          Call
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleWhatsApp(property.title);
                          }}
                          className="flex items-center gap-1 px-3 py-2 border-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                          style={{
                            borderColor: 'hsl(174, 100%, 29%)',
                            color: 'hsl(174, 100%, 29%)'
                          }}
                        >
                          <MessageSquare className="w-3 h-3" />
                          WhatsApp
                        </button>
                        <div className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600">
                          <Eye className="w-3 h-3" />
                          View Details
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Fallback to show message if no partner properties
              <div className="col-span-full text-center py-12">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Partner Properties Available</h3>
                <p className="text-gray-600">Partner agent properties will be displayed here when available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Properties by Feature Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" style={{color: 'hsl(158, 64%, 20%)'}}>Search properties by feature</h2>
            <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setSearchType('sale')}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  searchType === 'sale'
                    ? 'text-white border-b-2'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={searchType === 'sale' ? {
                  backgroundColor: 'hsl(174, 100%, 29%)',
                  borderBottomColor: 'hsl(174, 100%, 29%)'
                } : {}}
              >
                FOR SALE
              </button>
              <button
                onClick={() => setSearchType('rent')}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  searchType === 'rent'
                    ? 'text-white border-b-2'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={searchType === 'rent' ? {
                  backgroundColor: 'hsl(174, 100%, 29%)',
                  borderBottomColor: 'hsl(174, 100%, 29%)'
                } : {}}
              >
                FOR RENT
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {features.map((feature) => {
              const count = getFeatureCount(feature);

              const getFeatureIcon = (feature: string) => {
                switch (feature) {
                  case 'Private Pool': return '🏊';
                  case 'Upgraded': return '⬆️';
                  case 'Large Plot': return '📐';
                  case 'Close to Park': return '🌳';
                  case 'Brand New': return '✨';
                  case 'Furnished': return '🛋️';
                  case 'Vacant on Transfer': return '🔄';
                  case 'Water Views': return '🌊';
                  case 'Road Access': return '🛣️';
                  case 'Title Deed Ready': return '📋';
                  case 'Electricity Connection': return '⚡';
                  case 'Water Access': return '💧';
                  default: return '';
                }
              };

              return (
                <button
                  key={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    selectedFeatures.includes(feature)
                      ? 'text-white shadow-md transform scale-105'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  style={selectedFeatures.includes(feature) ? {
                    backgroundColor: 'hsl(174, 100%, 29%)',
                    borderColor: 'hsl(174, 100%, 29%)'
                  } : {}}
                  title={`${count} properties available`}
                >
                  <span className="text-base">{getFeatureIcon(feature)}</span>
                  <span>{feature}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Filters Display */}
          {selectedFeatures.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                <button
                  onClick={() => setSelectedFeatures([])}
                  className="text-xs underline" style={{color: 'hsl(174, 100%, 29%)'}}
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs rounded-full"
                  >
                    {feature}
                    <button
                      onClick={() => handleFeatureToggle(feature)}
                      className="ml-1 hover:bg-gray-700 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Searching for {searchType === 'sale' ? 'properties for sale' : 'properties for rent'} with {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Search Results or Property thumbnails */}
          <div className="mb-4">
            {selectedFeatures.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Search Results ({filteredProperties.length} properties found)
                  </h3>
                  <Link
                    to={`/properties?type=${searchType}&features=${selectedFeatures.join(',')}`}
                    className="text-sm underline" style={{color: 'hsl(174, 100%, 29%)'}}
                  >
                    View all results
                  </Link>
                </div>

                {filteredProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProperties.slice(0, 3).map((property) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="block bg-white rounded-lg p-4 shadow-sm border hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm group-hover:text-gray-700">{property.title}</h4>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {property.category === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{property.location.city}, {property.location.country}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mb-2">
                          KSH {property.price.toLocaleString()}
                          {property.category === 'rent' && '/month'}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {property.features.amenities?.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="text-xs px-2 py-1 rounded text-white" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs underline group-hover:no-underline" style={{color: 'hsl(174, 100%, 29%)'}}>
                          View Details →
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      No properties found
                    </h4>
                    <p className="text-gray-600 mb-4">
                      No {searchType === 'sale' ? 'properties for sale' : 'properties for rent'} match your selected features. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4">
                <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img src="/api/placeholder/128/96" alt="Property" className="w-full h-full object-cover" />
                </div>
                <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img src="/api/placeholder/128/96" alt="Property" className="w-full h-full object-cover" />
                </div>
                <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img src="/api/placeholder/128/96" alt="Property" className="w-full h-full object-cover" />
                </div>
                <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  <img src="/api/placeholder/128/96" alt="Property" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Prime Land Opportunities Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: 'hsl(158, 64%, 20%)'}}>
              Prime Land Opportunities
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover exceptional land parcels for development, investment, and agriculture. From residential plots to commercial opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Residential Land */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'hsl(158, 64%, 20%)'}}>Residential Plots</h3>
              <p className="text-gray-600 mb-4">
                Prime locations perfect for building your dream home. Fully serviced plots with utilities and road access.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}></span>
                  Electricity & Water Ready
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}></span>
                  Gated Communities Available
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}></span>
                  Title Deeds Ready
                </li>
              </ul>
              <Link to="/land?query=residential">
                <Button
                  className="w-full text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                  style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                >
                  View Residential Land
                </Button>
              </Link>
            </div>

            {/* Commercial Land */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'hsl(158, 64%, 20%)'}}>Commercial Land</h3>
              <p className="text-gray-600 mb-4">
                Strategic locations for business development. Shopping centers, offices, and retail opportunities.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}></span>
                  High Traffic Areas
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}></span>
                  Commercial Zoning
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}></span>
                  Investment Potential
                </li>
              </ul>
              <Link to="/land?query=commercial">
                <Button
                  className="w-full text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                  style={{backgroundColor: 'hsl(158, 64%, 20%)'}}
                >
                  View Commercial Land
                </Button>
              </Link>
            </div>

            {/* Agricultural Land */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(120, 60%, 40%)'}}>
                <TreePine className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'hsl(158, 64%, 20%)'}}>Agricultural Land</h3>
              <p className="text-gray-600 mb-4">
                Fertile farmland for agriculture and livestock. Perfect for farming ventures and agribusiness.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(120, 60%, 40%)'}}></span>
                  Fertile Soil
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(120, 60%, 40%)'}}></span>
                  Water Access
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: 'hsl(120, 60%, 40%)'}}></span>
                  Large Acreage Available
                </li>
              </ul>
              <Link to="/land?query=agricultural">
                <Button
                  className="w-full text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                  style={{backgroundColor: 'hsl(120, 60%, 40%)'}}
                >
                  View Agricultural Land
                </Button>
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link to="/land">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                style={{backgroundColor: 'hsl(158, 64%, 20%)'}}
              >
                <TreePine className="w-5 h-5 mr-2" />
                Explore All Land Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* House Architectural Plans Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: 'hsl(158, 64%, 20%)'}}>
              House Architectural Plans
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Professional architectural drawings and blueprints for your dream home. Ready-to-build plans with detailed specifications and 3D renders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {architecturalPlans.map((plan) => (
              <div key={plan.id} className="bg-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative mb-4">
                  <img
                    src={plan.image}
                    alt={`${plan.title} Plan`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {plan.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{color: 'hsl(158, 64%, 20%)'}}>{plan.title}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  {plan.description.split('.')[0]}.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {plan.bedrooms} Beds
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {plan.bathrooms} Baths
                  </div>
                  <div className="flex items-center">
                    <Ruler className="w-4 h-4 mr-1" />
                    {plan.area.toLocaleString()} {plan.areaUnit}
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                    {plan.currency} {plan.price.toLocaleString()}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Download className="w-4 h-4 mr-1" />
                    {plan.downloads} downloads
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePlanPreview(plan)}
                    className="flex-1 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                    style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                  >
                    Preview
                  </Button>
                  <Button
                    onClick={() => handlePlanPurchase(plan)}
                    variant="outline"
                    className="flex-1 border-2 text-sm font-medium rounded-lg hover:bg-opacity-10 transition-colors"
                    style={{
                      borderColor: 'hsl(174, 100%, 29%)',
                      color: 'hsl(174, 100%, 29%)'
                    }}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            ))}


          </div>

          {/* Features Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(174, 100%, 29%)'}}>
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: 'hsl(158, 64%, 20%)'}}>Professional Designs</h3>
                <p className="text-gray-600 text-sm">
                  Created by licensed architects with years of experience in residential design
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: 'hsl(158, 64%, 20%)'}}>Instant Download</h3>
                <p className="text-gray-600 text-sm">
                  Get complete plans package immediately after purchase with all necessary documents
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: 'hsl(120, 60%, 40%)'}}>
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{color: 'hsl(158, 64%, 20%)'}}>Building Approved</h3>
                <p className="text-gray-600 text-sm">
                  All plans meet local building codes and regulations for hassle-free construction
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link to="/drawings">
              <Button
                size="lg"
                className="px-8 py-4 text-lg font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                style={{backgroundColor: 'hsl(158, 64%, 20%)'}}
              >
                <Palette className="w-5 h-5 mr-2" />
                Browse All Architectural Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Get an instant property valuation Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div
            className="relative rounded-2xl overflow-hidden p-6 md:p-8"
            style={{backgroundColor: 'hsl(158, 64%, 20%)'}}
          >
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Get an instant property valuation
                </h2>
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full"
                  style={{backgroundColor: 'hsl(174, 100%, 29%)', color: 'white'}}
                >
                  New
                </span>
              </div>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Thinking of selling your home? Knowing its current price is a good place to start. Get an accurate, independent valuation and a detailed report here.
              </p>
              <button
                onClick={handleGetValuation}
                className="px-8 py-3 rounded-lg font-semibold text-black transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Geometric Background */}
        <GeometricBackground pattern="dots" className="opacity-30" />
        <FloatingElements />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 fade-in-up visible">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Trusted by <span className="text-black">Thousands</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our growing community of property owners, investors, and dreamers who have found their perfect match
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat Card 1 */}
            <div className="group perspective-1000 fade-in-up visible">
              <div className="card-3d scroll-3d-card bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center transform-3d hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <AnimatedCounter
                  end={1000}
                  suffix="+"
                  className="text-3xl font-bold text-black mb-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="text-gray-600 font-medium text-base">Premium Properties</div>
                <div className="text-sm text-gray-500 mt-1">Luxury homes & rentals</div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="group perspective-1000 fade-in-up visible">
              <div className="card-3d scroll-3d-card bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center transform-3d hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <AnimatedCounter
                  end={500}
                  suffix="+"
                  className="text-3xl font-bold text-black mb-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="text-gray-600 font-medium text-base">Verified Providers</div>
                <div className="text-sm text-gray-500 mt-1">Trusted partners</div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="group perspective-1000 fade-in-up visible">
              <div className="card-3d scroll-3d-card bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center transform-3d hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <AnimatedCounter
                  end={98}
                  suffix="%"
                  className="text-3xl font-bold text-black mb-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="text-gray-600 font-medium text-base">Customer Satisfaction</div>
                <div className="text-sm text-gray-500 mt-1">5-star reviews</div>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="group perspective-1000 fade-in-up visible">
              <div className="card-3d scroll-3d-card bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center transform-3d hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-black mb-2 group-hover:scale-105 transition-transform duration-300">24/7</div>
                <div className="text-gray-600 font-medium text-base">Support Available</div>
                <div className="text-sm text-gray-500 mt-1">Always here to help</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 fade-in-up visible">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Featured <span className="text-black">Properties</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties and exclusive investment opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {latestProperties.map((property, index) => (
              <div key={property.id} className="group perspective-1000 stagger-animation" style={{animationDelay: `${index * 0.1}s`}}>
                <Card
                  className="interactive-card card-3d overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white cursor-pointer pulse-glow"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={property.images[0]?.url || '/placeholder.svg'}
                      alt={property.images[0]?.alt || property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-black text-white border-0 shadow-lg">
                        {property.category === 'sale' ? 'For Sale' :
                         property.category === 'rent' ? 'For Rent' : 'Short Term'}
                      </Badge>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-xl px-3 py-2">
                      <span className="text-white text-sm font-bold">
                        {property.currency} {property.price.toLocaleString()}
                        {property.category === 'rent' && '/month'}
                      </span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link to={`/property/${property.id}`}>
                        <Button className="w-full bg-white text-black hover:bg-gray-100 backdrop-blur-sm border border-gray-200">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl text-black group-hover:text-gray-700 transition-colors line-clamp-1 mb-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {property.description}
                      </p>
                    </div>

                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-black" />
                      <span className="line-clamp-1">{property.location.city}, {property.location.state}</span>
                    </div>

                    {property.features.bedrooms && (
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-black" />
                          <span>{property.features.bedrooms} Bed</span>
                        </div>
                        {property.features.bathrooms && (
                          <div className="flex items-center gap-2">
                            <Bath className="w-4 h-4 text-black" />
                            <span>{property.features.bathrooms} Bath</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="text-2xl font-bold text-black">
                        {property.currency} {property.price.toLocaleString()}
                        {property.category === 'rent' && <span className="text-sm font-normal text-gray-600">/month</span>}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        For {property.category}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{property.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{property.inquiries}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-black fill-current" />
                        <span className="text-sm font-medium text-gray-700">4.8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {latestProperties.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-12 h-12 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">No Properties Available</h3>
              <p className="text-gray-500 text-lg">Check back soon for new listings!</p>
            </div>
          )}

          <div className="text-center mt-16">
            <Link to="/rentals?showAll=true">
              <Button size="lg" className="h-12 px-8 text-white text-base font-semibold rounded-xl shadow-lg scale-on-hover" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
                <TrendingUp className="w-5 h-5 mr-2" />
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(135deg, hsl(158, 64%, 95%) 0%, hsl(174, 100%, 95%) 100%)'}}>
        {/* Morphing Background Shapes */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-black morphing-shape"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-black morphing-shape" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-black morphing-shape" style={{animationDelay: '4s'}}></div>
        </div>
        <GeometricBackground pattern="grid" className="opacity-20" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 fade-in-up visible">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Our <span className="text-black">Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From luxury vacation rentals to investment opportunities, we provide comprehensive real estate solutions
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Luxury Rentals Card */}
            <div className="group perspective-1000">
              <Card className="card-3d border-0 shadow-2xl overflow-hidden bg-white h-full">
                <div className="relative h-80 bg-black flex items-center justify-center overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gray-800/20 animate-pulse"></div>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl floating-animation"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg floating-animation" style={{animationDelay: '1s'}}></div>

                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 backdrop-blur-sm">
                      <Home className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Luxury Rentals</h3>
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600 text-base leading-relaxed">
                    Premium vacation homes and BnB properties from verified hosts with exceptional amenities and service
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Star className="w-5 h-5 text-black fill-current" />
                      <span className="font-medium">4.9 Average Rating</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-black" />
                      <span className="font-medium">Verified Properties</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-5 h-5 text-black" />
                      <span className="font-medium">24/7 Support</span>
                    </div>
                  </div>

                  <Link to="/rentals" className="block">
                    <Button className="w-full h-10 text-white text-base font-semibold rounded-lg scale-on-hover" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
                      Browse Rentals
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Prime Land Card */}
            <div className="group perspective-1000">
              <Card className="card-3d border-0 shadow-2xl overflow-hidden bg-white h-full">
                <div className="relative h-80 bg-black flex items-center justify-center overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gray-800/20 animate-pulse"></div>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl floating-animation"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg floating-animation" style={{animationDelay: '1s'}}></div>

                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 backdrop-blur-sm">
                      <MapPin className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Prime Land</h3>
                  </div>
                </div>

                <CardContent className="p-8 space-y-6">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Investment-grade land parcels in prime locations with high growth potential and excellent returns
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="font-medium">High ROI Potential</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Award className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Premium Locations</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5" style={{color: 'hsl(174, 100%, 29%)'}} />
                      <span className="font-medium">Legal Verification</span>
                    </div>
                  </div>

                  <Link to="/land" className="block">
                    <Button className="w-full h-12 text-white text-lg font-semibold rounded-xl scale-on-hover" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
                      View Land Plots
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Architectural Designs Card */}
            <div className="group perspective-1000">
              <Card className="card-3d border-0 shadow-2xl overflow-hidden bg-white h-full">
                <div className="relative h-80 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 flex items-center justify-center overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 animate-pulse"></div>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl floating-animation"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg floating-animation" style={{animationDelay: '1s'}}></div>

                  <div className="relative z-10 text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 backdrop-blur-sm">
                      <Palette className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">House Plans & Blueprints</h3>
                  </div>
                </div>

                <CardContent className="p-8 space-y-6">
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Ready-to-build house plans and architectural blueprints. Professional designs with detailed specifications for immediate construction.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Download className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Instant Download</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Palette className="w-5 h-5" style={{color: 'hsl(174, 100%, 29%)'}} />
                      <span className="font-medium">Professional Plans</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Shield className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">Building Approved</span>
                    </div>
                  </div>

                  <Link to="/drawings" className="block">
                    <Button className="w-full h-12 text-white text-lg font-semibold rounded-xl scale-on-hover" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
                      Browse House Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gray-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-gray-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 fade-in-up visible">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              What Our <span className="text-black">Clients Say</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from satisfied customers who found their perfect properties through our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="group perspective-1000">
              <Card className="card-3d border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white p-6 h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-black fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-gray-700 text-base leading-relaxed italic">
                    "Musilli homes made finding our dream vacation rental effortless. The property exceeded our expectations and the host was incredibly responsive."
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <div>
                      <div className="font-semibold text-black">Sarah Johnson</div>
                      <div className="text-gray-500 text-sm">Vacation Rental Guest</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Testimonial 2 */}
            <div className="group perspective-1000">
              <Card className="card-3d border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white p-8 h-full">
                <div className="space-y-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    "As a property investor, I've found some incredible land deals through this platform. The verification process gives me confidence in every purchase."
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                      <div className="font-semibold text-black">Michael Chen</div>
                      <div className="text-gray-500 text-sm">Real Estate Investor</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Testimonial 3 */}
            <div className="group perspective-1000">
              <Card className="card-3d border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white p-8 h-full">
                <div className="space-y-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    "The architectural design service helped us visualize our dream home perfectly. The attention to detail and creativity was outstanding."
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <div>
                      <div className="font-semibold text-black">Emily Rodriguez</div>
                      <div className="text-gray-500 text-sm">Homeowner</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              <div className="flex flex-col items-center space-y-2">
                <AnimatedCounter
                  end={4.9}
                  suffix="/5"
                  className="text-3xl font-bold text-gray-700"
                />
                <div className="text-sm text-gray-500">Average Rating</div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <AnimatedCounter
                  end={2500}
                  suffix="+"
                  className="text-3xl font-bold text-gray-700"
                />
                <div className="text-sm text-gray-500">Happy Customers</div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <AnimatedCounter
                  end={99}
                  suffix="%"
                  className="text-3xl font-bold text-gray-700"
                />
                <div className="text-sm text-gray-500">Satisfaction Rate</div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="text-3xl font-bold text-gray-700">24/7</div>
                <div className="text-sm text-gray-500">Customer Support</div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center items-center gap-8 mt-12 opacity-40">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-5 h-5" />
                <span>Award Winner 2024</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-5 h-5" />
                <span>Trusted by 10K+</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <InteractiveTimeline />

      {/* CTA Section */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gray-900/10"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white/3 rounded-full blur-3xl floating-animation" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/2 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-12 fade-in-up visible">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-shadow-glow">
                Ready to Start Your
                <span className="block text-white">
                  Real Estate Journey?
                </span>
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Join thousands of property owners and investors who trust Musilli homes for their real estate needs
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 bg-white text-black hover:bg-gray-200 text-base font-bold rounded-xl shadow-2xl scale-on-hover transform-3d">
                  <Users className="w-5 h-5 mr-3 text-black" />
                  <span className="text-black">Become a Provider</span>
                </Button>
              </Link>
              <Link to="/rentals?showAll=true">
                <Button size="lg" className="h-12 px-8 bg-white/20 border-2 border-white text-white hover:bg-white backdrop-blur-sm text-base font-bold rounded-xl shadow-2xl scale-on-hover group">
                  <Search className="w-5 h-5 mr-3 text-white group-hover:text-black" />
                  <span className="text-white group-hover:text-black">Browse Properties</span>
                </Button>
              </Link>
            </div>

            {/* Additional CTA Elements */}
            <div className="grid md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/20">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold">Secure & Verified</h3>
                <p className="text-gray-300 text-sm">All properties are thoroughly verified for your peace of mind</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold">High Returns</h3>
                <p className="text-gray-300 text-sm">Maximize your investment potential with our premium properties</p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-lg font-bold">Award-Winning Service</h3>
                <p className="text-gray-300 text-sm">Experience exceptional service that sets us apart</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Components */}
      <LiveActivityFeed />
      <ChatWidget />

      {/* Property Quick Preview Modal */}
      {selectedProperty && (
        <PropertyQuickPreview
          property={{
            ...selectedProperty,
            amenities: ['WiFi', 'Parking', 'Kitchen', 'Pool', 'Gym', 'Spa'],
            rating: 4.8,
            reviews: 124
          }}
          onClose={() => setSelectedProperty(null)}
          onViewDetails={() => {
            setSelectedProperty(null);
            // Navigate to property details
          }}
        />
      )}

      {/* Mortgage Calculator Modal */}
      <MortgageCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        initialPrice={calculatorPrice}
      />

      {/* Property Valuation Calculator Modal */}
      <PropertyValuationCalculator
        isOpen={showValuationCalculator}
        onClose={() => setShowValuationCalculator(false)}
      />

      {/* Plan Preview Modal */}
      {showPlanPreview && selectedPlan && (
        <PlanPreviewModal
          plan={selectedPlan}
          onClose={closePlanModals}
          onPurchase={handlePlanPurchase}
        />
      )}

      {/* Plan Purchase Modal */}
      {showPlanPurchase && planToPurchase && (
        <PlanPurchaseModal
          plan={planToPurchase}
          onClose={closePlanModals}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
};

export default Index;
