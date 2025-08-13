import { useState } from 'react';
import { Search, Home, FileText, Key, CheckCircle } from 'lucide-react';

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  completed: boolean;
}

const buyingSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Search & Discover',
    description: 'Browse our curated selection of premium properties',
    icon: <Search className="w-5 h-5" />,
    duration: '1-2 weeks',
    completed: true
  },
  {
    id: 2,
    title: 'Property Viewing',
    description: 'Schedule viewings and virtual tours',
    icon: <Home className="w-5 h-5" />,
    duration: '1-2 weeks',
    completed: true
  },
  {
    id: 3,
    title: 'Documentation',
    description: 'Complete paperwork and legal requirements',
    icon: <FileText className="w-5 h-5" />,
    duration: '2-3 weeks',
    completed: false
  },
  {
    id: 4,
    title: 'Finalization',
    description: 'Final inspection and key handover',
    icon: <Key className="w-5 h-5" />,
    duration: '1 week',
    completed: false
  },
  {
    id: 5,
    title: 'Move In',
    description: 'Welcome to your new home!',
    icon: <CheckCircle className="w-5 h-5" />,
    duration: '1 day',
    completed: false
  }
];

const rentalSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Search & Filter',
    description: 'Find the perfect rental property',
    icon: <Search className="w-5 h-5" />,
    duration: '1-3 days',
    completed: true
  },
  {
    id: 2,
    title: 'Book Viewing',
    description: 'Schedule a property tour',
    icon: <Home className="w-5 h-5" />,
    duration: '1-2 days',
    completed: true
  },
  {
    id: 3,
    title: 'Application',
    description: 'Submit rental application and documents',
    icon: <FileText className="w-5 h-5" />,
    duration: '1-2 days',
    completed: false
  },
  {
    id: 4,
    title: 'Approval & Lease',
    description: 'Sign lease agreement and pay deposit',
    icon: <Key className="w-5 h-5" />,
    duration: '2-3 days',
    completed: false
  },
  {
    id: 5,
    title: 'Move In',
    description: 'Get your keys and settle in!',
    icon: <CheckCircle className="w-5 h-5" />,
    duration: '1 day',
    completed: false
  }
];

export const InteractiveTimeline = () => {
  const [activeTab, setActiveTab] = useState<'buying' | 'renting'>('buying');
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const currentSteps = activeTab === 'buying' ? buyingSteps : rentalSteps;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="timeline-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#timeline-pattern)" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Your Journey to the Perfect Property
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow our streamlined process to find and secure your ideal property
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab('buying')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'buying'
                  ? 'bg-black text-white shadow-lg'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Buying Process
            </button>
            <button
              onClick={() => setActiveTab('renting')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'renting'
                  ? 'bg-black text-white shadow-lg'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Rental Process
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div 
              className="absolute left-8 top-0 w-0.5 bg-black transition-all duration-1000 ease-out"
              style={{ height: `${(currentSteps.filter(s => s.completed).length / currentSteps.length) * 100}%` }}
            ></div>

            {/* Timeline Steps */}
            <div className="space-y-8">
              {currentSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative flex items-start gap-6 transition-all duration-300 ${
                    hoveredStep === step.id ? 'transform scale-105' : ''
                  }`}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Step Icon */}
                  <div
                    className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      step.completed
                        ? 'bg-black text-white shadow-lg'
                        : hoveredStep === step.id
                        ? 'bg-gray-800 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 ${
                        step.completed
                          ? 'border-black shadow-xl'
                          : hoveredStep === step.id
                          ? 'border-gray-300 shadow-xl transform translateY(-2px)'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-black">{step.title}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                      
                      {step.completed && (
                        <div className="flex items-center gap-2 mt-3 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Ready to start your property journey?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
              Start {activeTab === 'buying' ? 'Buying' : 'Renting'} Process
            </button>
            <button className="px-8 py-3 border-2 border-black text-black rounded-xl font-semibold hover:bg-black hover:text-white transition-colors">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
