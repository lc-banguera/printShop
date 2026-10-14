import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/shared/utils/cn';

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string;
  alt?: string;
  fallback?: string;
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, src, alt, fallback = 'AS', ...props }, ref) => (
    <AvatarPrimitive.Root ref={ref} className={cn('inline-flex h-11 w-11 overflow-hidden rounded-full border border-border bg-surface shadow-subtle', className)} {...props}>
      <AvatarPrimitive.Image className="h-full w-full object-cover" src={src} alt={alt} />
      <AvatarPrimitive.Fallback className="grid h-full w-full place-items-center bg-surface-muted text-sm font-medium text-foreground-muted" delayMs={600}>
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
);
Avatar.displayName = 'Avatar';

export { Avatar };
