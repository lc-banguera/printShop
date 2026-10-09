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
    <div className="mb-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {model3DFilters.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id as Model3DFilterId)}
              className={[
                'inline-flex min-h-10 items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
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

      <div className="flex h-11 w-full items-center gap-2 overflow-hidden rounded-xl border border-border bg-white px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:w-56">
        <Search className="h-4 w-4 shrink-0 text-foregroundSubtle" />
        <input
          type="text"
          placeholder="Buscar elementos"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-foregroundSubtle"
        />
      </div>
    </div>
  );
};

export default Models3DFilters;
