import { useState, useEffect } from 'react';
import { Sun, Moon, MapPin, Thermometer, Clock, User, Sparkles } from 'lucide-react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  location?: string;
  propertyTypes: string[];
  priceRange: [number, number];
  visitCount: number;
  lastVisit?: Date;
}

interface PersonalizationProps {
  onPreferencesChange?: (preferences: UserPreferences) => void;
}

export const AIPersonalization = ({ onPreferencesChange }: PersonalizationProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'auto',
    propertyTypes: [],
    priceRange: [0, 1000000],
    visitCount: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('musilli-preferences');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      setPreferences(prev => ({ ...prev, ...parsed, visitCount: parsed.visitCount + 1 }));
    } else {
      setPreferences(prev => ({ ...prev, visitCount: 1 }));
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Simulate weather API call
          setWeather({ temp: 72, condition: 'sunny' });
          setPreferences(prev => ({ ...prev, location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` }));
        },
        () => {
          // Fallback location
          setPreferences(prev => ({ ...prev, location: 'Unknown' }));
        }
      );
    }

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    // Generate personalized greeting
    const hour = currentTime.getHours();
    const isReturning = preferences.visitCount > 1;
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    let personalGreeting = '';
    if (isReturning) {
      personalGreeting = `Welcome back! This is visit #${preferences.visitCount}`;
    } else {
      personalGreeting = 'Welcome to Musilli homes!';
    }

    setGreeting(`${timeGreeting}! ${personalGreeting}`);

    // Save preferences
    localStorage.setItem('musilli-preferences', JSON.stringify(preferences));
    onPreferencesChange?.(preferences);
  }, [preferences, currentTime, onPreferencesChange]);

  const getThemeBasedOnTime = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  };

  const getRecommendedProperties = () => {
    // AI-like property recommendations based on user behavior
    const recommendations = [];
    
    if (preferences.visitCount === 1) {
      recommendations.push('Popular properties in your area');
    } else if (preferences.visitCount < 5) {
      recommendations.push('Properties similar to ones you viewed');
    } else {
      recommendations.push('Exclusive properties matching your preferences');
    }

    if (weather?.condition === 'sunny') {
      recommendations.push('Properties with outdoor spaces');
    }

    return recommendations;
  };

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-gray-200 transform transition-all duration-500 hover:scale-105">
        {/* Personalized Greeting */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{greeting}</h3>
            <p className="text-xs text-gray-600">Personalized for you</p>
          </div>
        </div>

        {/* Current Context */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {weather && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Thermometer className="w-3 h-3" />
              <span>{weather.temp}°F, {weather.condition}</span>
            </div>
          )}
          
          {preferences.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>Near you</span>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Recommended for you:</h4>
          {getRecommendedProperties().map((rec, index) => (
            <div key={index} className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
              {rec}
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-600">Theme</span>
          <button
            onClick={() => {
              const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
              setPreferences(prev => ({ ...prev, theme: newTheme }));
            }}
            className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1 transition-colors"
          >
            {preferences.theme === 'light' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            <span className="capitalize">{preferences.theme}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dynamic Theme Provider
export const DynamicThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accentColor, setAccentColor] = useState('#000000');

  useEffect(() => {
    const hour = new Date().getHours();
    const autoTheme = hour >= 6 && hour < 18 ? 'light' : 'dark';
    setTheme(autoTheme);

    // Dynamic accent color based on time
    const hue = (hour * 15) % 360;
    setAccentColor(`hsl(${hue}, 70%, 50%)`);

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', autoTheme);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, []);

  return (
    <div className={`theme-${theme}`} style={{ '--accent-color': accentColor } as React.CSSProperties}>
      {children}
    </div>
  );
};

// Behavioral Adaptation Hook
export const useBehavioralAdaptation = () => {
  const [userBehavior, setUserBehavior] = useState({
    scrollSpeed: 'normal',
    interactionStyle: 'normal',
    preferredSections: [] as string[]
  });

  useEffect(() => {
    let scrollStartTime = 0;
    let totalScrollDistance = 0;
    let interactionCount = 0;

    const handleScroll = () => {
      if (scrollStartTime === 0) {
        scrollStartTime = Date.now();
      }
      totalScrollDistance += Math.abs(window.scrollY);
    };

    const handleClick = () => {
      interactionCount++;
    };

    const analyzeScrollBehavior = () => {
      const scrollTime = Date.now() - scrollStartTime;
      const avgScrollSpeed = totalScrollDistance / scrollTime;
      
      if (avgScrollSpeed > 0.5) {
        setUserBehavior(prev => ({ ...prev, scrollSpeed: 'fast' }));
      } else if (avgScrollSpeed < 0.1) {
        setUserBehavior(prev => ({ ...prev, scrollSpeed: 'slow' }));
      }

      if (interactionCount > 10) {
        setUserBehavior(prev => ({ ...prev, interactionStyle: 'active' }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);

    const analysisInterval = setInterval(analyzeScrollBehavior, 10000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      clearInterval(analysisInterval);
    };
  }, []);

  return userBehavior;
};
