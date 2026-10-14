import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLocaleLowerCase('es');
  const dotTone = normalizedStatus.includes('cancel') || normalizedStatus.includes('fall')
    ? 'bg-foregroundMuted'
    : normalizedStatus.includes('pend') || normalizedStatus.includes('paus')
      ? 'bg-foregroundSubtle'
      : 'bg-foreground';

  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium leading-normal text-foregroundMuted', className)}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotTone)} aria-hidden="true" />
      {status}
    </span>
  );
}
