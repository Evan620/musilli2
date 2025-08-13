import { useEffect, useRef } from 'react';

interface GeometricBackgroundProps {
  pattern?: 'dots' | 'grid' | 'lines' | 'circles';
  className?: string;
  animated?: boolean;
}

export const GeometricBackground = ({ 
  pattern = 'dots', 
  className = '',
  animated = false 
}: GeometricBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawPattern();
    };

    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;

      switch (pattern) {
        case 'dots':
          drawDots();
          break;
        case 'grid':
          drawGrid();
          break;
        case 'lines':
          drawLines();
          break;
        case 'circles':
          drawCircles();
          break;
      }
    };

    const drawDots = () => {
      const spacing = 30;
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawGrid = () => {
      const spacing = 40;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawLines = () => {
      const spacing = 60;
      for (let i = 0; i < canvas.width + canvas.height; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(0, i);
        ctx.stroke();
      }
    };

    const drawCircles = () => {
      const spacing = 80;
      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrame: number;
    if (animated) {
      let offset = 0;
      const animate = () => {
        offset += 0.5;
        ctx.save();
        ctx.translate(offset % 40, offset % 40);
        drawPattern();
        ctx.restore();
        animationFrame = requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [pattern, animated]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

// Floating Elements Component
export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-black/5 rotate-45 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-6 h-6 border border-black/5 rounded-full floating-animation"></div>
      <div className="absolute bottom-40 left-20 w-3 h-8 bg-black/5 floating-animation" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-60 left-1/3 w-5 h-5 bg-black/5 rounded-full floating-animation" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-60 right-1/3 w-4 h-4 border border-black/5 rotate-45 floating-animation" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-1/2 right-10 w-2 h-6 bg-black/5 floating-animation" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
};
