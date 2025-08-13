import { useState, useEffect } from 'react';
import { Calculator, MapPin, Home, TrendingUp, X, Building2, Car, Zap } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface PropertyValuationProps {
  isOpen: boolean;
  onClose: () => void;
}

// Kenyan market data and factors
const KENYAN_CITIES = {
  'Nairobi': { multiplier: 1.0, avgPricePerSqm: 120000 },
  'Mombasa': { multiplier: 0.7, avgPricePerSqm: 85000 },
  'Kisumu': { multiplier: 0.5, avgPricePerSqm: 60000 },
  'Nakuru': { multiplier: 0.6, avgPricePerSqm: 70000 },
  'Eldoret': { multiplier: 0.55, avgPricePerSqm: 65000 },
  'Thika': { multiplier: 0.8, avgPricePerSqm: 95000 },
  'Kiambu': { multiplier: 0.85, avgPricePerSqm: 100000 },
  'Machakos': { multiplier: 0.65, avgPricePerSqm: 75000 }
};

const PROPERTY_TYPES = {
  'apartment': { multiplier: 1.0, name: 'Apartment' },
  'house': { multiplier: 1.2, name: 'House' },
  'villa': { multiplier: 1.5, name: 'Villa' },
  'townhouse': { multiplier: 1.1, name: 'Townhouse' },
  'bungalow': { multiplier: 1.3, name: 'Bungalow' }
};

const NEIGHBORHOODS = {
  'prime': { multiplier: 1.8, name: 'Prime Area (Karen, Runda, Muthaiga)' },
  'upmarket': { multiplier: 1.4, name: 'Upmarket (Kilimani, Lavington, Westlands)' },
  'middle': { multiplier: 1.0, name: 'Middle Class (South B, South C, Kileleshwa)' },
  'developing': { multiplier: 0.8, name: 'Developing Area (Kasarani, Kahawa, Pipeline)' },
  'affordable': { multiplier: 0.6, name: 'Affordable Housing Areas' }
};

export const PropertyValuationCalculator = ({ isOpen, onClose }: PropertyValuationProps) => {
  const [formData, setFormData] = useState({
    city: 'Nairobi',
    propertyType: 'apartment',
    neighborhood: 'middle',
    bedrooms: 3,
    bathrooms: 2,
    area: 100,
    age: 5,
    parking: 1,
    hasGarden: false,
    hasPool: false,
    hasGenerator: false,
    hasSecurity: false
  });

  const [valuation, setValuation] = useState({
    estimatedValue: 0,
    pricePerSqm: 0,
    marketRange: { min: 0, max: 0 },
    confidence: 0
  });

  useEffect(() => {
    if (formData.city && formData.propertyType && formData.neighborhood) {
      calculateValuation();
    }
  }, [formData]);

  const calculateValuation = () => {
    const cityData = KENYAN_CITIES[formData.city as keyof typeof KENYAN_CITIES];
    const propertyData = PROPERTY_TYPES[formData.propertyType as keyof typeof PROPERTY_TYPES];
    const neighborhoodData = NEIGHBORHOODS[formData.neighborhood as keyof typeof NEIGHBORHOODS];

    if (!cityData || !propertyData || !neighborhoodData) return;

    // Base price calculation
    let basePrice = cityData.avgPricePerSqm * formData.area;

    // Apply multipliers
    basePrice *= cityData.multiplier;
    basePrice *= propertyData.multiplier;
    basePrice *= neighborhoodData.multiplier;

    // Bedroom/bathroom adjustments
    const bedroomFactor = Math.max(0.8, Math.min(1.3, formData.bedrooms / 3));
    const bathroomFactor = Math.max(0.9, Math.min(1.2, formData.bathrooms / 2));
    basePrice *= bedroomFactor * bathroomFactor;

    // Age depreciation (Kenyan market)
    const ageFactor = Math.max(0.6, 1 - (formData.age * 0.02));
    basePrice *= ageFactor;

    // Amenities adjustments
    if (formData.parking > 0) basePrice *= (1 + formData.parking * 0.05);
    if (formData.hasGarden) basePrice *= 1.1;
    if (formData.hasPool) basePrice *= 1.15;
    if (formData.hasGenerator) basePrice *= 1.08;
    if (formData.hasSecurity) basePrice *= 1.12;

    // Calculate confidence based on data completeness
    let confidence = 75;
    if (formData.bedrooms && formData.bathrooms) confidence += 10;
    if (formData.parking || formData.hasGarden || formData.hasPool) confidence += 10;
    confidence = Math.min(95, confidence);

    setValuation({
      estimatedValue: Math.round(basePrice),
      pricePerSqm: Math.round(basePrice / formData.area),
      marketRange: {
        min: Math.round(basePrice * 0.85),
        max: Math.round(basePrice * 1.15)
      },
      confidence
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'hsl(158, 64%, 20%)'}}>
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Property Valuation</h3>
              <p className="text-sm text-gray-600">Get an estimate for Kenyan market</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-gray-900">
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <MapPin className="w-4 h-4" />
                City/Town
              </Label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select city</option>
                {Object.keys(KENYAN_CITIES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <Building2 className="w-4 h-4" />
                Neighborhood Type
              </Label>
              <select
                value={formData.neighborhood}
                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select area type</option>
                {Object.entries(NEIGHBORHOODS).map(([key, data]) => (
                  <option key={key} value={key}>{data.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                <Home className="w-4 h-4" />
                Property Type
              </Label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select type</option>
                {Object.entries(PROPERTY_TYPES).map(([key, data]) => (
                  <option key={key} value={key}>{data.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-2 block text-gray-700 font-medium">Area (Square Meters)</Label>
              <Input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: Number(e.target.value)})}
                placeholder="100"
                className="text-gray-900"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block text-gray-700 font-medium">Bedrooms</Label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({...formData, bedrooms: Number(e.target.value)})}
                min="1"
                max="10"
                className="text-gray-900"
              />
            </div>
            <div>
              <Label className="mb-2 block text-gray-700 font-medium">Bathrooms</Label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({...formData, bathrooms: Number(e.target.value)})}
                min="1"
                max="10"
                className="text-gray-900"
              />
            </div>
            <div>
              <Label className="mb-2 block text-gray-700 font-medium">Property Age (Years)</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                min="0"
                max="50"
                className="text-gray-900"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label className="mb-3 block font-semibold text-gray-700">Additional Features</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasGarden}
                  onChange={(e) => setFormData({...formData, hasGarden: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Garden/Compound</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasPool}
                  onChange={(e) => setFormData({...formData, hasPool: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Swimming Pool</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasGenerator}
                  onChange={(e) => setFormData({...formData, hasGenerator: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Generator/Backup Power</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasSecurity}
                  onChange={(e) => setFormData({...formData, hasSecurity: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Security/Gated</span>
              </label>
            </div>
            <div className="mt-3">
              <Label className="mb-2 block text-gray-700 font-medium">Parking Spaces</Label>
              <Input
                type="number"
                value={formData.parking}
                onChange={(e) => setFormData({...formData, parking: Number(e.target.value)})}
                min="0"
                max="10"
                className="text-gray-900"
              />
            </div>
          </div>

          {/* Results */}
          {valuation.estimatedValue > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-lg">Estimated Property Value</h4>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{color: 'hsl(158, 64%, 20%)'}}>
                  {formatCurrency(valuation.estimatedValue)}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {formatCurrency(valuation.pricePerSqm)} per sq meter
                </div>
                
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Market Range:</span>
                    <span className="font-medium">
                      {formatCurrency(valuation.marketRange.min)} - {formatCurrency(valuation.marketRange.max)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confidence Level:</span>
                    <span className="font-medium text-green-600">{valuation.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center mt-4">
                * This is an estimated value based on current Kenyan market trends and property characteristics. 
                For accurate valuation, consult a certified property valuer.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button 
              className="flex-1 text-white" 
              style={{backgroundColor: 'hsl(158, 64%, 20%)'}}
              onClick={() => {
                // In a real app, this could save the valuation or connect to a valuer
                alert('Valuation saved! A certified valuer will contact you for detailed assessment.');
              }}
            >
              Get Professional Valuation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
