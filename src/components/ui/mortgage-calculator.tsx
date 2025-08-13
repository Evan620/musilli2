import { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface MortgageCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrice?: number;
}

export const MortgageCalculator = ({ isOpen, onClose, initialPrice = 15000000 }: MortgageCalculatorProps) => { // 15M KSH default
  const [homePrice, setHomePrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(initialPrice * 0.2);
  const [interestRate, setInterestRate] = useState(12.5); // Typical Kenyan mortgage rate
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    calculateMortgage();
  }, [homePrice, downPayment, interestRate, loanTerm]);

  const calculateMortgage = () => {
    const principal = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalPayment(0);
      return;
    }

    const monthlyPaymentCalc = 
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPaymentCalc = monthlyPaymentCalc * numberOfPayments;
    const totalInterestCalc = totalPaymentCalc - principal;

    setMonthlyPayment(monthlyPaymentCalc);
    setTotalPayment(totalPaymentCalc);
    setTotalInterest(totalInterestCalc);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black">Mortgage Calculator</h3>
              <p className="text-sm text-gray-600">Estimate your monthly payments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Home Price */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Home Price
            </label>
            <Input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="w-full"
              placeholder="500,000"
            />
          </div>

          {/* Down Payment */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Down Payment
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="flex-1"
                placeholder="100,000"
              />
              <div className="flex items-center px-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                {((downPayment / homePrice) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <Percent className="w-4 h-4 inline mr-1" />
              Interest Rate
            </label>
            <Input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full"
              placeholder="6.5"
            />
          </div>

          {/* Loan Term */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Loan Term (Years)
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-black focus:outline-none"
            >
              <option value={15}>15 years</option>
              <option value={20}>20 years</option>
              <option value={25}>25 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>

          {/* Results */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-black">Monthly Payment Breakdown</h4>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Principal & Interest</span>
              <span className="font-semibold text-black text-lg">
                {formatCurrency(monthlyPayment)}
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Interest</span>
                <span className="text-gray-900">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Payment</span>
                <span className="text-gray-900">{formatCurrency(totalPayment)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white"
            >
              Close
            </Button>
            <Button className="flex-1 bg-black hover:bg-gray-800 text-white">
              Get Pre-Approved
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
