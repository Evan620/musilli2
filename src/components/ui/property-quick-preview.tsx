import { useState } from 'react';
import { Heart, Share2, Calendar, Users, Bed, Bath, MapPin, Star, Wifi, Car, Utensils } from 'lucide-react';
import { Button } from './button';

interface PropertyQuickPreviewProps {
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    category: string;
    images: { url: string; alt: string }[];
    location: { city: string; state: string };
    features: {
      bedrooms?: number;
      bathrooms?: number;
      guests?: number;
    };
    amenities?: string[];
    rating?: number;
    reviews?: number;
  };
  onClose: () => void;
  onViewDetails: () => void;
}

export const PropertyQuickPreview = ({ property, onClose, onViewDetails }: PropertyQuickPreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'WiFi': <Wifi className="w-4 h-4" />,
    'Parking': <Car className="w-4 h-4" />,
    'Kitchen': <Utensils className="w-4 h-4" />,
  };

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative">
          {/* Image Gallery */}
          <div className="relative h-64 overflow-hidden">
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
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  →
                </button>
                
                {/* Image Dots */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
            
            {/* Action Buttons */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Price */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-black mb-1">{property.title}</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{property.location.city}, {property.location.state}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-black">
                {property.currency} {property.price.toLocaleString()}
              </div>
              {property.category === 'rent' && (
                <div className="text-sm text-gray-500">/month</div>
              )}
            </div>
          </div>

          {/* Rating */}
          {property.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-black fill-current" />
                <span className="font-semibold">{property.rating}</span>
              </div>
              {property.reviews && (
                <span className="text-gray-500">({property.reviews} reviews)</span>
              )}
            </div>
          )}

          {/* Features */}
          <div className="flex items-center gap-6 text-gray-600">
            {property.features.guests && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{property.features.guests} guests</span>
              </div>
            )}
            {property.features.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.features.bedrooms} bed</span>
              </div>
            )}
            {property.features.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.features.bathrooms} bath</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {property.features.amenities && property.features.amenities.length > 0 && (
            <div>
              <h4 className="font-semibold text-black mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {property.features.amenities.slice(0, 6).map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {amenityIcons[amenity] || <span className="w-4 h-4">•</span>}
                    <span>{amenity}</span>
                  </div>
                ))}
                {property.features.amenities.length > 6 && (
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    +{property.features.amenities.length - 6} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onViewDetails}
              className="flex-1 bg-black hover:bg-gray-800 text-white rounded-xl"
            >
              View Details
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white rounded-xl"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
