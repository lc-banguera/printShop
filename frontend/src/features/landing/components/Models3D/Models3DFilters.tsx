import * as React from 'react';
import { Search } from 'lucide-react';
import { model3DFilters, Model3DFilterId } from '../../data/models3d.data';

interface Models3DFiltersProps {
  activeFilter: Model3DFilterId;
  onFilterChange: (id: Model3DFilterId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Models3DFilters: React.FC<Models3DFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {model3DFilters.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id as Model3DFilterId)}
              className={[
                'inline-flex items-center gap-1 rounded-control border px-3 py-1.5 text-[11px] font-medium transition-all duration-150 sm:text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
                isActive
                  ? 'border-primary bg-primary text-primaryForeground shadow-subtle'
                  : 'border-border bg-surface text-foregroundMuted shadow-subtle hover:border-borderStrong hover:text-foreground',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex h-8 items-center gap-1.5 overflow-hidden rounded-control border border-border bg-surface px-2.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search className="h-3.5 w-3.5 shrink-0 text-foregroundSubtle" />
        <input
          type="text"
          placeholder="Buscar elementos"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] text-foreground outline-none placeholder:text-foregroundSubtle sm:w-36 sm:text-xs"
        />
      </div>
    </div>
  );
};

export default Models3DFilters;
