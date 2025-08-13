import { useState } from 'react';
import { X, CreditCard, Download, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface PlanPurchaseModalProps {
  plan: {
    id: string;
    title: string;
    price: number;
    currency: string;
    category: string;
  };
  onClose: () => void;
  onSuccess: (planId: string) => void;
}

export const PlanPurchaseModal = ({ plan, onClose, onSuccess }: PlanPurchaseModalProps) => {
  const [step, setStep] = useState<'payment' | 'processing' | 'success'>('payment');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (paymentMethod === 'mpesa') {
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^254\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid Kenyan phone number (254...)';
      }
    } else {
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required';
      }
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      }
      if (!formData.name) {
        newErrors.name = 'Cardholder name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess(plan.id);
      }, 2000);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{borderColor: 'hsl(174, 100%, 29%)'}}></div>
          <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we process your payment...</p>
          {paymentMethod === 'mpesa' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                Check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your architectural plan has been purchased successfully. Download links have been sent to your email.
          </p>
          <Button
            onClick={() => onSuccess(plan.id)}
            className="w-full text-white font-semibold rounded-lg"
            style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete Purchase</h2>
            <p className="text-gray-600 text-sm">{plan.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{plan.title}</span>
              <span className="font-semibold">{plan.currency} {plan.price.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center font-semibold">
              <span>Total</span>
              <span style={{color: 'hsl(174, 100%, 29%)'}}>{plan.currency} {plan.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'mpesa'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 rounded mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-sm font-medium">M-Pesa</span>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Credit Card</span>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {paymentMethod === 'mpesa' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="254712345678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  You'll receive a payment prompt on this number
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <Input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={errors.cardNumber ? 'border-red-500' : ''}
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <Input
                      type="text"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={errors.expiryDate ? 'border-red-500' : ''}
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <Input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className={errors.cvv ? 'border-red-500' : ''}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Your payment information is encrypted and secure. We never store your payment details.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full text-white font-semibold rounded-lg h-12"
              style={{backgroundColor: 'hsl(174, 100%, 29%)'}}
            >
              Complete Purchase - {plan.currency} {plan.price.toLocaleString()}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
