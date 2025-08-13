import { useState, useEffect } from 'react';
import { Snowflake, Sun, Leaf, Flower, Palette, Moon, Star } from 'lucide-react';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type ThemeMode = 'light' | 'dark' | 'luxury' | 'minimal' | 'seasonal';

interface SeasonalTheme {
  season: Season;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  particles: string[];
  effects: string[];
}

const seasonalThemes: Record<Season, SeasonalTheme> = {
  spring: {
    season: 'spring',
    colors: {
      primary: '#10B981', // Green
      secondary: '#F59E0B', // Yellow
      accent: '#EC4899', // Pink
      background: '#F0FDF4', // Light green
      text: '#065F46'
    },
    particles: ['🌸', '🌿', '🦋', '🌱'],
    effects: ['bloom', 'gentle-breeze']
  },
  summer: {
    season: 'summer',
    colors: {
      primary: '#3B82F6', // Blue
      secondary: '#F59E0B', // Orange
      accent: '#EF4444', // Red
      background: '#EFF6FF', // Light blue
      text: '#1E3A8A'
    },
    particles: ['☀️', '🏖️', '🌊', '🏄'],
    effects: ['sun-rays', 'heat-shimmer']
  },
  autumn: {
    season: 'autumn',
    colors: {
      primary: '#D97706', // Orange
      secondary: '#DC2626', // Red
      accent: '#92400E', // Brown
      background: '#FEF3C7', // Light yellow
      text: '#92400E'
    },
    particles: ['🍂', '🍁', '🌰', '🦃'],
    effects: ['falling-leaves', 'warm-glow']
  },
  winter: {
    season: 'winter',
    colors: {
      primary: '#1E40AF', // Dark blue
      secondary: '#6366F1', // Indigo
      accent: '#8B5CF6', // Purple
      background: '#F8FAFC', // Light gray
      text: '#1E293B'
    },
    particles: ['❄️', '⛄', '🎿', '🏔️'],
    effects: ['snowfall', 'frost-glow']
  }
};

export const SeasonalThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [themeMode, setThemeMode] = useState<ThemeMode>('seasonal');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Determine current season based on date
    const now = new Date();
    const month = now.getMonth();
    
    let season: Season;
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'autumn';
    else season = 'winter';

    setCurrentSeason(season);
  }, []);

  useEffect(() => {
    if (themeMode === 'seasonal') {
      applySeasonalTheme(currentSeason);
    }
  }, [currentSeason, themeMode]);

  const applySeasonalTheme = (season: Season) => {
    setIsTransitioning(true);
    const theme = seasonalThemes[season];
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--seasonal-primary', theme.colors.primary);
    root.style.setProperty('--seasonal-secondary', theme.colors.secondary);
    root.style.setProperty('--seasonal-accent', theme.colors.accent);
    root.style.setProperty('--seasonal-background', theme.colors.background);
    root.style.setProperty('--seasonal-text', theme.colors.text);
    
    // Add seasonal class
    root.className = root.className.replace(/season-\w+/g, '');
    root.classList.add(`season-${season}`);
    
    setTimeout(() => setIsTransitioning(false), 1000);
  };

  return (
    <div className={`seasonal-theme ${isTransitioning ? 'transitioning' : ''}`}>
      {children}
      <SeasonalEffects season={currentSeason} />
      <ThemeControls 
        currentMode={themeMode} 
        onModeChange={setThemeMode}
        currentSeason={currentSeason}
        onSeasonChange={setCurrentSeason}
      />
    </div>
  );
};

const SeasonalEffects = ({ season }: { season: Season }) => {
  const theme = seasonalThemes[season];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Seasonal Particles */}
      <div className="seasonal-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          >
            {theme.particles[Math.floor(Math.random() * theme.particles.length)]}
          </div>
        ))}
      </div>

      {/* Season-specific effects */}
      {season === 'winter' && <SnowfallEffect />}
      {season === 'autumn' && <FallingLeavesEffect />}
      {season === 'summer' && <SunRaysEffect />}
      {season === 'spring' && <BloomEffect />}
    </div>
  );
};

const SnowfallEffect = () => (
  <div className="snowfall">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="snowflake absolute text-white opacity-70"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${5 + Math.random() * 10}s`
        }}
      >
        ❄
      </div>
    ))}
  </div>
);

const FallingLeavesEffect = () => (
  <div className="falling-leaves">
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        className="leaf absolute opacity-60"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${8 + Math.random() * 12}s`
        }}
      >
        🍂
      </div>
    ))}
  </div>
);

const SunRaysEffect = () => (
  <div className="sun-rays absolute top-0 left-0 w-full h-full">
    <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-radial from-yellow-300/20 to-transparent rounded-full animate-pulse"></div>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute top-10 right-10 w-1 h-20 bg-gradient-to-b from-yellow-300/30 to-transparent origin-bottom"
        style={{
          transform: `rotate(${i * 45}deg)`,
          transformOrigin: '50% 100%'
        }}
      />
    ))}
  </div>
);

const BloomEffect = () => (
  <div className="bloom-effect">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-4 h-4 bg-pink-300/30 rounded-full animate-ping"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${2 + Math.random() * 3}s`
        }}
      />
    ))}
  </div>
);

const ThemeControls = ({ 
  currentMode, 
  onModeChange, 
  currentSeason, 
  onSeasonChange 
}: {
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  currentSeason: Season;
  onSeasonChange: (season: Season) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    { id: 'light', name: 'Light', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { id: 'luxury', name: 'Luxury', icon: <Star className="w-4 h-4" /> },
    { id: 'minimal', name: 'Minimal', icon: <Palette className="w-4 h-4" /> },
    { id: 'seasonal', name: 'Seasonal', icon: <Flower className="w-4 h-4" /> }
  ] as const;

  const seasons = [
    { id: 'spring', name: 'Spring', icon: <Flower className="w-4 h-4" /> },
    { id: 'summer', name: 'Summer', icon: <Sun className="w-4 h-4" /> },
    { id: 'autumn', name: 'Autumn', icon: <Leaf className="w-4 h-4" /> },
    { id: 'winter', name: 'Winter', icon: <Snowflake className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/80 text-white rounded-full p-3 backdrop-blur-sm hover:bg-black/90 transition-colors"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 min-w-48 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Theme Mode</h3>
          <div className="space-y-2 mb-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id as ThemeMode)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentMode === mode.id
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {mode.icon}
                <span>{mode.name}</span>
              </button>
            ))}
          </div>

          {currentMode === 'seasonal' && (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">Season</h3>
              <div className="grid grid-cols-2 gap-2">
                {seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => onSeasonChange(season.id as Season)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      currentSeason === season.id
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {season.icon}
                    <span className="text-sm">{season.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
