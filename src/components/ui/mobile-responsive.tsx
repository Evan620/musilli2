import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Mobile-optimized container component
interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ 
  children, 
  className = '', 
  noPadding = false 
}) => {
  return (
    <div className={cn(
      'mobile-container',
      !noPadding && 'mobile-padding',
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized button component
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({ 
  children, 
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <Button
      className={cn(
        'mobile-button touch-target',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const MobileCard: React.FC<MobileCardProps> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <Card className={cn(
      'mobile-card',
      paddingClasses[padding],
      className
    )}>
      {children}
    </Card>
  );
};

// Mobile-optimized grid component
interface MobileGridProps {
  children: React.ReactNode;
  cols?: {
    mobile: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileGrid: React.FC<MobileGridProps> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = ''
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8'
  };

  const gridCols = `grid-cols-${cols.mobile}`;
  const tabletCols = cols.tablet ? `sm:grid-cols-${cols.tablet}` : '';
  const desktopCols = cols.desktop ? `lg:grid-cols-${cols.desktop}` : '';

  return (
    <div className={cn(
      'grid',
      gridCols,
      tabletCols,
      desktopCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized text component
interface MobileTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
}

export const MobileText: React.FC<MobileTextProps> = ({ 
  children, 
  variant = 'body',
  className = ''
}) => {
  const variantClasses = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-bold leading-tight',
    h3: 'text-lg sm:text-xl font-semibold leading-tight',
    body: 'text-sm sm:text-base leading-relaxed',
    caption: 'text-xs sm:text-sm text-muted-foreground'
  };

  const Component = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return React.createElement(Component, {
    className: cn(variantClasses[variant], className)
  }, children);
};

// Mobile-optimized input wrapper
interface MobileInputWrapperProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export const MobileInputWrapper: React.FC<MobileInputWrapperProps> = ({ 
  children, 
  label,
  className = ''
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mobile-text">
          {label}
        </label>
      )}
      <div className="mobile-button">
        {children}
      </div>
    </div>
  );
};

// Mobile-optimized section wrapper
interface MobileSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const MobileSection: React.FC<MobileSectionProps> = ({ 
  children, 
  title,
  subtitle,
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'py-6 sm:py-8',
    md: 'py-8 sm:py-12',
    lg: 'py-12 sm:py-16'
  };

  return (
    <section className={cn(paddingClasses[padding], className)}>
      <MobileContainer>
        {(title || subtitle) && (
          <div className="mb-6 sm:mb-8">
            {title && (
              <MobileText variant="h2" className="mb-2">
                {title}
              </MobileText>
            )}
            {subtitle && (
              <MobileText variant="body" className="text-muted-foreground">
                {subtitle}
              </MobileText>
            )}
          </div>
        )}
        {children}
      </MobileContainer>
    </section>
  );
};

// Mobile-optimized filter bar
interface MobileFilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFilterBar: React.FC<MobileFilterBarProps> = ({ 
  children, 
  className = ''
}) => {
  return (
    <div className={cn(
      'space-y-4 p-4 sm:p-6 bg-white rounded-lg shadow-sm border mobile-card',
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-optimized stats display
interface MobileStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const MobileStats: React.FC<MobileStatsProps> = ({ 
  stats, 
  className = ''
}) => {
  return (
    <div className={cn(
      'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg',
      className
    )}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          {stat.icon && (
            <div className="flex justify-center mb-2">
              {stat.icon}
            </div>
          )}
          <div className="text-base sm:text-lg font-bold text-primary">
            {stat.value}
          </div>
          <div className="text-xs text-muted-foreground">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
