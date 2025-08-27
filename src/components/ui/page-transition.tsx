import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Immediate visibility for seamless refresh
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`transition-opacity duration-150 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface FadeTransitionProps {
  children: ReactNode;
  show: boolean;
  className?: string;
}

export const FadeTransition = ({ children, show, className = '' }: FadeTransitionProps) => {
  return (
    <div 
      className={`transition-all duration-200 ease-out ${
        show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface SlideTransitionProps {
  children: ReactNode;
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const SlideTransition = ({ 
  children, 
  show, 
  direction = 'up', 
  className = '' 
}: SlideTransitionProps) => {
  const getTransform = () => {
    if (show) return 'translate-x-0 translate-y-0';
    
    switch (direction) {
      case 'up': return 'translate-y-4';
      case 'down': return '-translate-y-4';
      case 'left': return 'translate-x-4';
      case 'right': return '-translate-x-4';
      default: return 'translate-y-4';
    }
  };

  return (
    <div 
      className={`transition-all duration-300 ease-out ${
        show ? 'opacity-100' : 'opacity-0'
      } ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
};
