import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'wide' | 'full';
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, variant = 'default', as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'mx-auto w-full px-4 md:px-6 lg:px-8',
          {
            'max-w-7xl': variant === 'default',
            'max-w-screen-2xl': variant === 'wide',
            'max-w-full': variant === 'full',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';
