import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface StatCardProps {
  icon?: React.ComponentType<{ className?: string }> | React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  sub?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  positive = true,
  sub,
  className,
}) => (
  <div className={cn('min-w-[140px] flex-1 rounded-card border border-border bg-surface p-4 shadow-card', className)}>
    <div className="mb-2 flex items-start justify-between gap-2">
      <span className="truncate text-xs font-semibold text-foreground-muted">{label}</span>
      {Icon && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-info-muted text-info">
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-extrabold leading-tight text-foreground">{value}</span>
      {change && (
        <div className="mt-1 flex items-center gap-1 text-[11px]">
          <span className={cn('font-bold', positive ? 'text-success' : 'text-danger-strong')}>
            {positive ? '↑' : '↓'} {change}
          </span>
          <span className="font-normal text-foreground-subtle">vs. mes anterior</span>
        </div>
      )}
      {sub && !change && (
        <span className="mt-0.5 truncate text-[11px] text-foreground-subtle">{sub}</span>
      )}
    </div>
  </div>
);

export default StatCard;
