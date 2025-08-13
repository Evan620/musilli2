import { useState, useEffect } from 'react';
import { Eye, Heart, MessageSquare, MapPin } from 'lucide-react';

interface Activity {
  id: string;
  user: string;
  action: 'viewed' | 'liked' | 'inquired' | 'booked';
  property: string;
  location: string;
  timestamp: Date;
  avatar: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    user: 'Sarah M.',
    action: 'viewed',
    property: 'Luxury Villa in Miami',
    location: 'Miami Beach, FL',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    avatar: 'S'
  },
  {
    id: '2',
    user: 'John D.',
    action: 'liked',
    property: 'Modern Apartment',
    location: 'New York, NY',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    avatar: 'J'
  },
  {
    id: '3',
    user: 'Emily R.',
    action: 'inquired',
    property: 'Beachfront Condo',
    location: 'Los Angeles, CA',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    avatar: 'E'
  },
  {
    id: '4',
    user: 'Michael C.',
    action: 'booked',
    property: 'Downtown Loft',
    location: 'Chicago, IL',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    avatar: 'M'
  }
];

const getActionIcon = (action: Activity['action']) => {
  switch (action) {
    case 'viewed':
      return <Eye className="w-3 h-3" />;
    case 'liked':
      return <Heart className="w-3 h-3 fill-current" />;
    case 'inquired':
      return <MessageSquare className="w-3 h-3" />;
    case 'booked':
      return <MapPin className="w-3 h-3" />;
  }
};

const getActionColor = (action: Activity['action']) => {
  switch (action) {
    case 'viewed':
      return 'text-blue-600';
    case 'liked':
      return 'text-red-500';
    case 'inquired':
      return 'text-green-600';
    case 'booked':
      return 'text-purple-600';
  }
};

const getActionText = (action: Activity['action']) => {
  switch (action) {
    case 'viewed':
      return 'viewed';
    case 'liked':
      return 'liked';
    case 'inquired':
      return 'inquired about';
    case 'booked':
      return 'booked';
  }
};

const getTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const currentActivity = activities[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 transform transition-all duration-500 hover:scale-105">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
            {currentActivity.avatar}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-900 truncate">
                {currentActivity.user}
              </span>
              <span className={`${getActionColor(currentActivity.action)} flex items-center gap-1`}>
                {getActionIcon(currentActivity.action)}
                {getActionText(currentActivity.action)}
              </span>
            </div>
            
            <div className="text-xs text-gray-600 truncate">
              {currentActivity.property}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentActivity.location}
              </span>
              <span className="text-xs text-gray-400">
                {getTimeAgo(currentActivity.timestamp)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Activity indicator dots */}
        <div className="flex justify-center gap-1 mt-3">
          {activities.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-black' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
