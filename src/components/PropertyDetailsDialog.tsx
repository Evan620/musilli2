import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Property } from '@/types';
import { MapPin, Bed, Bath, Car, Home, Eye, Calendar } from 'lucide-react';

interface PropertyDetailsDialogProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyDetailsDialog: React.FC<PropertyDetailsDialogProps> = ({
  property,
  isOpen,
  onClose
}) => {
  if (!property) return null;

  const getStatusBadge = (status: Property['status']) => {
    const variants = {
      published: 'default',
      pending: 'secondary',
      draft: 'outline',
      rejected: 'destructive',
      sold: 'default',
      rented: 'default',
    } as const;

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Property Details</span>
            {getStatusBadge(property.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Images */}
          {property.images && property.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.slice(0, 6).map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt || `Property image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Property Overview</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-lg font-semibold">{property.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-2xl font-bold text-green-600">
                    {property.currency} {property.price.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Type & Category</label>
                  <p className="capitalize">{property.type} • For {property.category}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Performance</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{property.views} views</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{property.inquiries} inquiries</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Listed</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Provider</label>
                  <p>{property.provider?.businessName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div className="space-y-1">
                {property.location.address && (
                  <p className="font-medium">{property.location.address}</p>
                )}
                <p className="text-gray-600">
                  {property.location.city}, {property.location.state}
                  {property.location.zipCode && ` ${property.location.zipCode}`}
                </p>
                <p className="text-gray-600">{property.location.country}</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Bed className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                  <p className="font-semibold">{property.features.bedrooms}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Bath className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                  <p className="font-semibold">{property.features.bathrooms}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-semibold">{property.features.area} {property.features.areaUnit}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Car className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Parking</p>
                  <p className="font-semibold">{property.features.parking}</p>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="flex flex-wrap gap-2 mt-4">
              {property.features.furnished && (
                <Badge variant="secondary">Furnished</Badge>
              )}
              {property.features.petFriendly && (
                <Badge variant="secondary">Pet Friendly</Badge>
              )}
            </div>
          </div>

          {/* Amenities */}
          {property.features.amenities && property.features.amenities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Utilities */}
          {property.features.utilities && property.features.utilities.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Utilities</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.utilities.map((utility, index) => (
                  <Badge key={index} variant="outline">
                    {utility}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
