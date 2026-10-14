import * as React from 'react';
import { cn } from '@/shared/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, className }) => (
  <div
    className={cn(
      'mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-5',
      className
    )}
  >
    <div className="min-w-0">
      <div className="flex items-center gap-2.5">
        <h1 className="text-lg font-semibold leading-tight tracking-[-0.02em] text-[var(--text-primary)] sm:text-xl">
          {title}
        </h1>
      </div>
      {description && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{description}</p>}
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

