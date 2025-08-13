import { useEffect, useRef, useState } from 'react';
import { Palette, Brush, Image, Music } from 'lucide-react';

interface PropertyMoodBoard {
  propertyId: string;
  colors: string[];
  mood: 'modern' | 'classic' | 'rustic' | 'luxury' | 'minimalist';
  elements: string[];
}

// Generative Art Background
export const GenerativeBackground = ({ seed = Date.now() }: { seed?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      generateArt();
    };

    const generateArt = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Seeded random number generator
      let seedValue = seed;
      const random = () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };

      // Generate unique pattern based on seed
      const numShapes = 20 + Math.floor(random() * 30);
      
      for (let i = 0; i < numShapes; i++) {
        const x = random() * canvas.width;
        const y = random() * canvas.height;
        const size = 20 + random() * 100;
        const opacity = 0.1 + random() * 0.3;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        
        // Random shape type
        const shapeType = Math.floor(random() * 4);
        
        switch (shapeType) {
          case 0: // Circle
            ctx.beginPath();
            ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${random() * 360}, 70%, 80%)`;
            ctx.fill();
            break;
            
          case 1: // Rectangle
            ctx.fillStyle = `hsl(${random() * 360}, 70%, 80%)`;
            ctx.fillRect(x, y, size, size * (0.5 + random() * 0.5));
            break;
            
          case 2: // Triangle
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x + size / 2, y + size);
            ctx.closePath();
            ctx.fillStyle = `hsl(${random() * 360}, 70%, 80%)`;
            ctx.fill();
            break;
            
          case 3: // Line
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size * Math.cos(random() * Math.PI * 2), y + size * Math.sin(random() * Math.PI * 2));
            ctx.strokeStyle = `hsl(${random() * 360}, 70%, 80%)`;
            ctx.lineWidth = 2 + random() * 5;
            ctx.stroke();
            break;
        }
        
        ctx.restore();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [seed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// Property Mood Board Component
export const PropertyMoodBoard = ({ property }: { property: any }) => {
  const [moodBoard, setMoodBoard] = useState<PropertyMoodBoard | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Generate mood board based on property characteristics
    const generateMoodBoard = () => {
      const price = property.price || 0;
      const type = property.type || 'house';
      
      let mood: PropertyMoodBoard['mood'] = 'modern';
      let colors: string[] = [];
      let elements: string[] = [];

      // Determine mood based on price and type
      if (price > 1000000) {
        mood = 'luxury';
        colors = ['#D4AF37', '#000000', '#FFFFFF', '#8B4513'];
        elements = ['🏛️', '💎', '🥂', '🎭'];
      } else if (type === 'apartment') {
        mood = 'modern';
        colors = ['#2563EB', '#F3F4F6', '#1F2937', '#10B981'];
        elements = ['🏢', '💻', '☕', '🎨'];
      } else if (type === 'cottage' || type === 'cabin') {
        mood = 'rustic';
        colors = ['#92400E', '#FEF3C7', '#065F46', '#DC2626'];
        elements = ['🌲', '🔥', '🦌', '🏔️'];
      } else {
        mood = 'classic';
        colors = ['#374151', '#F9FAFB', '#EF4444', '#059669'];
        elements = ['🏡', '🌺', '📚', '🕯️'];
      }

      setMoodBoard({
        propertyId: property.id,
        mood,
        colors,
        elements
      });
    };

    generateMoodBoard();
  }, [property]);

  if (!moodBoard) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-10"
      >
        <Palette className="w-4 h-4 text-gray-700" />
      </button>

      {isVisible && (
        <div className="absolute top-16 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 w-64 z-20 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Brush className="w-4 h-4" />
            Property Mood
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Style: </span>
              <span className="text-sm font-medium capitalize">{moodBoard.mood}</span>
            </div>
            
            <div>
              <span className="text-sm text-gray-600 block mb-2">Color Palette:</span>
              <div className="flex gap-2">
                {moodBoard.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-600 block mb-2">Elements:</span>
              <div className="flex gap-2 text-lg">
                {moodBoard.elements.map((element, index) => (
                  <span key={index} className="opacity-80">{element}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Watercolor Effect Component
export const WatercolorEffect = ({ imageUrl, className = '' }: { imageUrl: string; className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply watercolor effect
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple watercolor effect by reducing saturation and adding blur
      for (let i = 0; i < data.length; i += 4) {
        // Reduce saturation
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i] * 0.7 + avg * 0.3;     // Red
        data[i + 1] = data[i + 1] * 0.7 + avg * 0.3; // Green
        data[i + 2] = data[i + 2] * 0.7 + avg * 0.3; // Blue
        
        // Increase brightness slightly
        data[i] = Math.min(255, data[i] * 1.1);
        data[i + 1] = Math.min(255, data[i + 1] * 1.1);
        data[i + 2] = Math.min(255, data[i + 2] * 1.1);
      }
      
      ctx.putImageData(imageData, 0, 0);
      setIsProcessed(true);
    };
    
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          isProcessed ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: 'blur(0.5px)' }}
      />
      {!isProcessed && (
        <img
          src={imageUrl}
          alt="Original"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

// Architectural Sketch Overlay
export const ArchitecturalSketch = ({ children, intensity = 0.3 }: { children: React.ReactNode; intensity?: number }) => {
  return (
    <div className="relative">
      {children}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 48%, rgba(0,0,0,${intensity}) 49%, rgba(0,0,0,${intensity}) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(0,0,0,${intensity}) 49%, rgba(0,0,0,${intensity}) 51%, transparent 52%)
          `,
          backgroundSize: '4px 4px'
        }}
      />
    </div>
  );
};

// Musical Property Signature
export const PropertyMusicSignature = ({ property }: { property: any }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const generatePropertySound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Generate frequency based on property characteristics
    const baseFreq = 220; // A3
    const priceMultiplier = Math.log(property.price || 100000) / Math.log(1000000); // 0-1 range
    const frequency = baseFreq * (1 + priceMultiplier);

    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.type = property.type === 'luxury' ? 'sine' : 'triangle';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1);

    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <button
      onClick={generatePropertySound}
      className={`p-2 rounded-full transition-all ${
        isPlaying 
          ? 'bg-blue-500 text-white animate-pulse' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title="Play property sound signature"
    >
      <Music className="w-4 h-4" />
    </button>
  );
};
