import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, TrendingUp, TrendingDown, Activity, Users, MessageSquare } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location: string;
}

interface MarketData {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  volume: number;
  avgPrice: number;
}

interface SocialMention {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook';
  text: string;
  timestamp: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
}

// Weather Integration Component
export const WeatherIntegration = ({ propertyLocation }: { propertyLocation?: string }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate weather API call
    const fetchWeather = async () => {
      setLoading(true);
      
      // Mock weather data
      setTimeout(() => {
        const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        setWeather({
          temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C (typical Kenyan weather)
          condition: randomCondition,
          location: propertyLocation || 'Current Location'
        });
        setLoading(false);
      }, 1000);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [propertyLocation]);

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-5 h-5 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-5 h-5 text-blue-500" />;
      default: return <Sun className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2">
      {getWeatherIcon(weather.condition)}
      <span className="font-medium">{weather.temperature}°C</span>
      <span className="text-xs text-gray-500">{weather.location}</span>
    </div>
  );
};

// Market Pulse Component
export const MarketPulse = () => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const updateMarketData = () => {
      const trends: MarketData['trend'][] = ['up', 'down', 'stable'];
      const randomTrend = trends[Math.floor(Math.random() * trends.length)];
      
      setMarketData({
        trend: randomTrend,
        percentage: Math.random() * 10 - 5, // -5% to +5%
        volume: Math.floor(Math.random() * 1000) + 500,
        avgPrice: Math.floor(Math.random() * 10000000) + 20000000 // KSH 20M-30M
      });
    };

    updateMarketData();
    const interval = setInterval(updateMarketData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: MarketData['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: MarketData['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!marketData) return null;

  return (
    <div className="fixed top-20 left-4 z-40 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-xs font-medium text-gray-700">LIVE MARKET</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Trend</span>
          <div className="flex items-center gap-1">
            {getTrendIcon(marketData.trend)}
            <span className={`text-sm font-medium ${getTrendColor(marketData.trend)}`}>
              {marketData.percentage > 0 ? '+' : ''}{marketData.percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Volume</span>
          <span className="text-sm font-medium text-gray-900">{marketData.volume}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Avg Price</span>
          <span className="text-sm font-medium text-gray-900">
            KSH {marketData.avgPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Social Proof Stream Component
export const SocialProofStream = () => {
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Mock social mentions
    const mockMentions: SocialMention[] = [
      {
        id: '1',
        platform: 'twitter',
        text: 'Just found my dream home through @MusilliHomes! Amazing service 🏡',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        sentiment: 'positive'
      },
      {
        id: '2',
        platform: 'instagram',
        text: 'The virtual tour feature is incredible! #RealEstate #Innovation',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        sentiment: 'positive'
      },
      {
        id: '3',
        platform: 'facebook',
        text: 'Highly recommend Musilli homes for anyone looking for premium properties',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        sentiment: 'positive'
      }
    ];

    setMentions(mockMentions);

    // Rotate mentions every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % mockMentions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPlatformIcon = (platform: SocialMention['platform']) => {
    switch (platform) {
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'facebook': return '👥';
    }
  };

  const getSentimentColor = (sentiment: SocialMention['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'negative': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (mentions.length === 0) return null;

  const currentMention = mentions[currentIndex];

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-sm">
      <div className={`bg-white border-2 rounded-2xl shadow-lg p-4 transition-all duration-500 ${getSentimentColor(currentMention.sentiment)}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{getPlatformIcon(currentMention.platform)}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-800 mb-2">{currentMention.text}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 capitalize">{currentMention.platform}</span>
              <span className="text-xs text-gray-500">
                {Math.floor((Date.now() - currentMention.timestamp.getTime()) / 60000)}m ago
              </span>
            </div>
          </div>
        </div>

        {/* Mention indicators */}
        <div className="flex justify-center gap-1 mt-3">
          {mentions.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Live Property Status Component
export const LivePropertyStatus = ({ propertyId }: { propertyId: string }) => {
  const [status, setStatus] = useState<'available' | 'pending' | 'sold' | 'viewing'>('available');
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    // Simulate real-time status updates
    const updateStatus = () => {
      const statuses: typeof status[] = ['available', 'pending', 'viewing'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
      setViewerCount(Math.floor(Math.random() * 20) + 1);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [propertyId]);

  const getStatusColor = (status: typeof status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'sold': return 'bg-red-500';
      case 'viewing': return 'bg-blue-500';
    }
  };

  const getStatusText = (status: typeof status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'pending': return 'Pending';
      case 'sold': return 'Sold';
      case 'viewing': return 'In Viewing';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`}></div>
        <span className="text-sm font-medium text-gray-700">{getStatusText(status)}</span>
      </div>
      
      {status === 'viewing' && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{viewerCount} viewing now</span>
        </div>
      )}
    </div>
  );
};
