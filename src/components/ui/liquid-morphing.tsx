import { useEffect, useRef } from 'react';

interface LiquidMorphingProps {
  colors?: string[];
  speed?: number;
  className?: string;
}

export const LiquidMorphing = ({ 
  colors = ['#000000', '#333333', '#666666'],
  speed = 0.01,
  className = ''
}: LiquidMorphingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createGradient = (time: number) => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time * 0.5) * 100,
        canvas.height / 2 + Math.cos(time * 0.3) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) / 2
      );

      colors.forEach((color, index) => {
        const stop = index / (colors.length - 1);
        const alpha = 0.1 + Math.sin(time + index) * 0.05;
        gradient.addColorStop(stop, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
      });

      return gradient;
    };

    const drawLiquidShape = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = Math.min(canvas.width, canvas.height) / 4;

      ctx.beginPath();
      
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const radius = baseRadius + 
          Math.sin(angle * 3 + time) * 20 +
          Math.sin(angle * 5 + time * 1.5) * 10 +
          Math.sin(angle * 7 + time * 2) * 5;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (angle === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fillStyle = createGradient(time);
      ctx.fill();

      // Add secondary shapes
      for (let i = 0; i < 3; i++) {
        const offsetX = Math.sin(time + i * 2) * 100;
        const offsetY = Math.cos(time + i * 2.5) * 100;
        const shapeRadius = baseRadius * (0.3 + Math.sin(time + i) * 0.1);

        ctx.beginPath();
        ctx.arc(centerX + offsetX, centerY + offsetY, shapeRadius, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length] + '20';
        ctx.fill();
      }
    };

    const animate = () => {
      timeRef.current += speed;
      drawLiquidShape(timeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// Glass Morphism 2.0 Component
export const GlassMorphism = ({ 
  children, 
  intensity = 'medium',
  className = '' 
}: { 
  children: React.ReactNode; 
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}) => {
  const intensityClasses = {
    light: 'bg-white/5 backdrop-blur-sm border border-white/10',
    medium: 'bg-white/10 backdrop-blur-md border border-white/20',
    heavy: 'bg-white/20 backdrop-blur-lg border border-white/30'
  };

  return (
    <div className={`relative ${intensityClasses[intensity]} rounded-2xl ${className}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 rounded-2xl pointer-events-none"></div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Neumorphism Component
export const Neumorphism = ({ 
  children, 
  variant = 'raised',
  className = '' 
}: { 
  children: React.ReactNode; 
  variant?: 'raised' | 'inset' | 'flat';
  className?: string;
}) => {
  const variantClasses = {
    raised: 'shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.7)]',
    inset: 'shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.7)]',
    flat: 'shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.7)]'
  };

  return (
    <div className={`bg-gray-100 rounded-2xl ${variantClasses[variant]} transition-all duration-300 hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.8)] ${className}`}>
      {children}
    </div>
  );
};
