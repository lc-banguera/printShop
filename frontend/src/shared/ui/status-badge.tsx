import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex min-h-6 items-center whitespace-nowrap rounded-badge bg-surfaceMuted px-2 py-0.5 text-xs font-medium leading-normal text-foregroundMuted', className)}>
      {status}
    </span>
  );
}
