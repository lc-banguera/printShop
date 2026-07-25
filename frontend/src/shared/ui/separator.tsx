import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/shared/utils/cn';

const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(
  ({ className, decorative = true, orientation = 'horizontal', ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      className={cn(
        orientation === 'vertical'
          ? 'h-full w-px bg-border'
          : 'w-full h-px bg-border',
        className
      )}
      orientation={orientation}
      decorative={decorative}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
