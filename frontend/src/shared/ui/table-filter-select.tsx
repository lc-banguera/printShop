import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface TableFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function TableFilterSelect({
  value,
  onChange,
  options,
  className,
}: TableFilterSelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 max-w-full appearance-none cursor-pointer rounded-control border border-border bg-surface pl-3.5 pr-9 text-sm text-foregroundMuted shadow-subtle outline-none transition-[border-color,box-shadow,background-color] duration-normal',
          'hover:border-borderStrong',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-foregroundSubtle" aria-hidden="true" />
    </div>
  );
}

export default TableFilterSelect;
