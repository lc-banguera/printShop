import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const badgeVariants = {
  default: 'inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white',
  secondary: 'inline-flex items-center rounded-full bg-surface text-text-primary ring-1 ring-border',
  outline: 'inline-flex items-center rounded-full border border-border bg-transparent px-2.5 py-1 text-xs text-text-secondary'
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants[variant], className)} {...props} />
));
Badge.displayName = 'Badge';

export { Badge };
