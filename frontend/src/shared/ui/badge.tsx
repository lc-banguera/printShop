import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
}

const badgeVariants = {
  default:
    'inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-inverse)] uppercase',
  secondary:
    'inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-secondary)] uppercase ring-1 ring-[var(--border)]',
  outline:
    'inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-transparent px-2.5 py-1 text-[11px] font-medium tracking-[0.08em] text-[var(--text-secondary)] uppercase',
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = 'default', ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants[variant], className)} {...props} />
));
Badge.displayName = 'Badge';

export { Badge };
