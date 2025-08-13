import { useState } from 'react';
import { X, Download, Eye, Bed, Bath, Ruler, Star, Share2, Heart, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from './button';

interface PlanPreviewModalProps {
  plan: {
    id: string;
    title: string;
    price: number;
    currency: string;
    category: string;
    image: string;
    description: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    areaUnit: string;
    features: string[];
    downloads: number;
    isFeatured?: boolean;
  };
  onClose: () => void;
  onPurchase: (planId: string) => void;
}

export const PlanPreviewModal = ({ plan, onClose, onPurchase }: PlanPreviewModalProps) => {
  const [currentView, setCurrentView] = useState<'floor-plan' | '3d-render' | 'elevation'>('floor-plan');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const planViews = {
    'floor-plan': {
      title: 'Floor Plan',
      image: plan.image,
      description: 'Detailed floor plan with room layouts and dimensions'
    },
    '3d-render': {
      title: '3D Render',
      image: '/api/placeholder/600/400',
      description: 'Photorealistic 3D visualization of the completed home'
    },
    'elevation': {
      title: 'Elevation Views',
      image: '/api/placeholder/600/400',
      description: 'Front, side, and rear elevation drawings'
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: plan.title,
          text: plan.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{plan.title}</h2>
            <p className="text-gray-600 mt-1">{plan.category} • {plan.bedrooms} bed, {plan.bathrooms} bath</p>
          </div>
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
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-140px)]">
          {/* Plan Viewer */}
          <div className="flex-1 bg-gray-50 relative">
            {/* View Controls */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              {Object.entries(planViews).map(([key, view]) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === key
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'bg-white/80 text-gray-600 hover:bg-white'
                  }`}
                >
                  {view.title}
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-md"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-md"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-md"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Plan Image */}
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={planViews[currentView].image}
                alt={planViews[currentView].title}
                className="max-w-full max-h-full object-contain transition-transform duration-300"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`
                }}
              />
            </div>

            {/* View Description */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm text-gray-700">{planViews[currentView].description}</p>
            </div>
          </div>

          {/* Plan Details Sidebar */}
          <div className="w-full lg:w-96 bg-white p-6 overflow-y-auto">
            {/* Price and Stats */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold" style={{color: 'hsl(174, 100%, 29%)'}}>
                  {plan.currency} {plan.price.toLocaleString()}
                </div>
                {plan.isFeatured && (
                  <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bed className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-medium">{plan.bedrooms}</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-medium">{plan.bathrooms}</div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Ruler className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <div className="text-sm font-medium">{plan.area.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{plan.areaUnit}</div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Download className="w-4 h-4 mr-1" />
                {plan.downloads} downloads
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{plan.description}</p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <Star className="w-3 h-3 mr-2 text-yellow-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">What's Included</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Complete architectural drawings</li>
                <li>• Detailed floor plans</li>
                <li>• Elevation views (all sides)</li>
                <li>• 3D renderings</li>
                <li>• Material specifications</li>
                <li>• Structural details</li>
                <li>• Building permit ready</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => onPurchase(plan.id)}
                className="w-full text-white font-semibold rounded-lg h-12"
                style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
              >
                <Download className="w-4 h-4 mr-2" />
                Buy Now - {plan.currency} {plan.price.toLocaleString()}
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 font-semibold rounded-lg h-12"
                style={{
                  borderColor: 'hsl(174, 100%, 29%)',
                  color: 'hsl(174, 100%, 29%)'
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Request Customization
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
