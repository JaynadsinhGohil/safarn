import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Layout widths:
   * narrow: max-w-3xl (e.g. Settings, Notifications)
   * default: max-w-5xl (e.g. Shared Itinerary, generic views)
   * wide: max-w-7xl (e.g. Dashboard, My Trips, Explore, Budget)
   * full: max-w-[1400px] or 100% (e.g. Itinerary Builder)
   */
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full';
  noPadding?: boolean;
}

export function PageContainer({ 
  children, 
  className, 
  maxWidth = 'wide',
  noPadding = false,
  ...props 
}: PageContainerProps) {
  
  const maxWidthClasses = {
    narrow: 'max-w-3xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
    full: 'max-w-[1400px]' // Matches standard 2xl container
  };

  return (
    <div 
      className={cn(
        "mx-auto w-full",
        !noPadding && "px-4 md:px-8 py-6 md:py-10",
        maxWidthClasses[maxWidth],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
