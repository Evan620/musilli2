import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Car, Wifi, 
  Calendar, Users, Star, Phone, MessageSquare, Camera,
  Home, DollarSign, Ruler, Shield, CheckCircle
} from 'lucide-react';
import { useProperties } from "@/contexts/PropertyContext";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  // Find the property by ID
  const property = properties.find(p => p.id === id);

  useEffect(() => {
    if (!property) {
      // If property not found, redirect to 404 or back to rentals
      navigate('/rentals');
    }
  }, [property, navigate]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Link to="/rentals">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleContact = () => {
    const message = encodeURIComponent(`Hi, I'm interested in: ${property.title}`);
    const whatsappUrl = `https://wa.me/254700123456?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    alert(`Calling about: ${property.title}\nPhone: +254 700 123 456`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-96">
                <img
                  src={property.images[currentImageIndex]?.url || '/placeholder.svg'}
                  alt={property.images[currentImageIndex]?.alt || property.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                      →
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      <Camera className="w-4 h-4 inline mr-1" />
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}

                {/* Property Badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    className="text-white font-semibold"
                    style={{backgroundColor: property.category === 'rent' ? 'hsl(174, 100%, 29%)' : 'hsl(158, 64%, 20%)'}}
                  >
                    For {property.category === 'rent' ? 'Rent' : 'Sale'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location.city}, {property.location.state}
                  </div>
                  <div className="text-3xl font-bold mb-4" style={{color: 'hsl(174, 100%, 29%)'}}>
                    {property.currency} {property.price.toLocaleString()}
                    {property.category === 'rent' && <span className="text-lg text-gray-500">/month</span>}
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.features.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-gray-500" />
                      <span>{property.features.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {property.features.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-gray-500" />
                      <span>{property.features.bathrooms} Bathrooms</span>
                    </div>
                  )}
                  {property.features.guests && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>{property.features.guests} Guests</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gray-500" />
                    <span>{property.type}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contact Property Owner</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleCall}
                    className="w-full text-white font-semibold rounded-lg"
                    style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button
                    onClick={handleContact}
                    variant="outline"
                    className="w-full border-2 font-semibold rounded-lg"
                    style={{
                      borderColor: 'hsl(174, 100%, 29%)',
                      color: 'hsl(174, 100%, 29%)'
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property ID</span>
                    <span className="font-medium">{property.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="secondary">{property.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span className="font-medium">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Properties */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Similar Properties</h3>
                <div className="text-center text-gray-500">
                  <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Similar properties will be shown here</p>
                </div>
                <Link to="/rentals?showAll=true" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Browse All Properties
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
