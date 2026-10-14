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
    <div className="mb-4 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Filtros segmentados */}
      <div className="flex flex-wrap items-center gap-1 rounded-[5px] border border-slate-200 bg-slate-100 p-1">
        {model3DFilters.map((filter) => {
          const isActive = filter.id === activeFilter;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id as Model3DFilterId)}
              className={[
                'inline-flex min-h-9 items-center rounded-[4px] px-4 py-1.5 text-xs font-semibold tracking-[-0.01em] transition-colors duration-150 active:scale-[0.98] sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1',
                isActive
                  ? 'bg-[#0D1014] text-white'
                  : 'text-slate-600 hover:bg-white hover:text-[#0D1014]',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Barra de búsqueda */}
      <div className="flex h-11 w-full items-center gap-2 overflow-hidden rounded-[5px] border border-slate-300 bg-white px-3.5 transition-colors focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-300 sm:w-64">
        <Search className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar elementos"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-[#0D1014] outline-none placeholder:text-slate-500"
        />
      </div>
    </div>
  );
};

export default Models3DFilters;
