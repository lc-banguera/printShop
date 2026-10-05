import * as React from 'react';
import { cn } from '@/shared/utils/cn';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  className,
  icon,
  label,
  badge,
  ...props
}) => {
  return (
    <button
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-textSecondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        className
      )}
      aria-label={label}
      {...props}
    >
      <span className="relative text-accentPink flex items-center justify-center">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accentPink text-[9px] font-bold text-white leading-none">
            {badge}
          </span>
        )}
      </span>
      <span className="text-textSecondary font-semibold text-[14px]">{label}</span>
    </button>
  );
};
