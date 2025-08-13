import { useState, useEffect } from 'react';
import { Trophy, Star, Target, Gift, Zap, Crown, Medal, Award } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserProgress {
  level: number;
  xp: number;
  xpToNext: number;
  achievements: Achievement[];
  streak: number;
  totalPoints: number;
}

const initialAchievements: Achievement[] = [
  {
    id: 'first-visit',
    title: 'Welcome Explorer',
    description: 'Visit Musilli homes for the first time',
    icon: <Star className="w-5 h-5" />,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rarity: 'common'
  },
  {
    id: 'property-viewer',
    title: 'Property Enthusiast',
    description: 'View 10 different properties',
    icon: <Target className="w-5 h-5" />,
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'search-master',
    title: 'Search Master',
    description: 'Perform 25 property searches',
    icon: <Zap className="w-5 h-5" />,
    progress: 0,
    maxProgress: 25,
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'luxury-seeker',
    title: 'Luxury Connoisseur',
    description: 'View 5 luxury properties over $1M',
    icon: <Crown className="w-5 h-5" />,
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'property-collector',
    title: 'Property Collector',
    description: 'Save 20 properties to favorites',
    icon: <Medal className="w-5 h-5" />,
    progress: 0,
    maxProgress: 20,
    unlocked: false,
    rarity: 'legendary'
  }
];

export const GamificationSystem = () => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 0,
    xpToNext: 100,
    achievements: initialAchievements,
    streak: 0,
    totalPoints: 0
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('musilli-progress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('musilli-progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const addXP = (amount: number, reason: string) => {
    setUserProgress(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpToNext: (newLevel * 100) - newXP,
        totalPoints: prev.totalPoints + amount
      };
    });
  };

  const updateAchievementProgress = (achievementId: string, increment: number = 1) => {
    setUserProgress(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement => {
        if (achievement.id === achievementId) {
          const newProgress = Math.min(achievement.progress + increment, achievement.maxProgress);
          const justUnlocked = !achievement.unlocked && newProgress >= achievement.maxProgress;
          
          if (justUnlocked) {
            setNewAchievement(achievement);
            setTimeout(() => setNewAchievement(null), 4000);
            addXP(getRarityXP(achievement.rarity), `Achievement: ${achievement.title}`);
          }

          return {
            ...achievement,
            progress: newProgress,
            unlocked: newProgress >= achievement.maxProgress
          };
        }
        return achievement;
      })
    }));
  };

  const getRarityXP = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 10;
      case 'rare': return 25;
      case 'epic': return 50;
      case 'legendary': return 100;
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
    }
  };

  // Expose functions for other components to use
  (window as any).gamification = {
    addXP,
    updateAchievementProgress,
    viewProperty: () => updateAchievementProgress('property-viewer'),
    performSearch: () => updateAchievementProgress('search-master'),
    viewLuxury: () => updateAchievementProgress('luxury-seeker'),
    saveFavorite: () => updateAchievementProgress('property-collector')
  };

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold">Level {userProgress.level}</span>
          </div>
          
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((userProgress.level * 100 - userProgress.xpToNext) / 100) * 100}%` }}
            />
          </div>
          
          <span className="text-xs text-gray-600">{userProgress.xp} XP</span>
        </div>
      </div>

      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 shadow-2xl transform animate-bounce">
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-xl">You reached Level {userProgress.level}</p>
            </div>
          </div>
        </div>
      )}

      {/* New Achievement */}
      {newAchievement && (
        <div className="fixed top-24 right-4 z-50 bg-white rounded-2xl shadow-2xl p-4 border-2 border-yellow-300 animate-slide-in-right">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRarityColor(newAchievement.rarity)}`}>
              {newAchievement.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Achievement Unlocked!</h3>
              <p className="text-sm text-gray-600">{newAchievement.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Panel */}
      <AchievementsPanel achievements={userProgress.achievements} />
    </>
  );
};

const AchievementsPanel = ({ achievements }: { achievements: Achievement[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform z-40"
      >
        <Award className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getRarityColor = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 bg-gray-100';
    case 'rare': return 'text-blue-600 bg-blue-100';
    case 'epic': return 'text-purple-600 bg-purple-100';
    case 'legendary': return 'text-yellow-600 bg-yellow-100';
  }
};
