import * as React from 'react';
import { FilterOption } from '../../data/filters.data';
import { ChevronDown } from 'lucide-react';

interface ProductFiltersProps {
  filters: FilterOption[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ filters }) => {
  return (
    <div className="flex min-w-0 items-center gap-2.5 overflow-x-auto scrollbar-none py-2 pb-6">
      {filters.map((filter) => {
        const isSelected = filter.id === 'todos';
        return (
          <button
            key={filter.id}
            type="button"
            className={`
              inline-flex items-center gap-1.5
              px-4 py-2 text-xs sm:text-sm font-semibold rounded-full
              whitespace-nowrap transition-all duration-200
              ${
                isSelected
                  ? 'bg-primary text-primaryForeground shadow-subtle'
                  : 'border border-border bg-surface text-foregroundMuted hover:bg-surfaceMuted'
              }
            `}
          >
            <span>{filter.label}</span>
            {filter.isDropdown && (
              <ChevronDown className="w-3.5 h-3.5 text-foregroundSubtle" />
            )}
          </button>
        );
      })}
    </div>
  );
};
