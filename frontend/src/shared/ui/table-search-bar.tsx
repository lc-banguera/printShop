import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface TableSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

export function TableSearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
  width = 'w-52',
}: TableSearchBarProps) {
  return (
    <div
      className={cn(
        'flex h-10 min-w-0 items-center gap-2.5 rounded-control border border-border bg-surface px-3.5 shadow-subtle transition-[border-color,box-shadow,background-color] duration-normal',
        'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        'hover:border-borderStrong',
        width,
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-foregroundSubtle" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foregroundSubtle"
      />
    </div>
  );
}

export default TableSearchBar;
