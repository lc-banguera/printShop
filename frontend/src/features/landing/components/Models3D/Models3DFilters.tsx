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
                'inline-flex items-center gap-1 rounded-[8px] border px-3 py-1.5 text-[11px] font-medium transition-all duration-150 sm:text-xs',
                isActive
                  ? 'border-[#111827] bg-[#111827] text-white shadow-[0_2px_8px_rgba(17,24,39,0.12)]'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[#D1D5DB] hover:text-[#111827]',
              ].join(' ')}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex h-8 items-center gap-1.5 overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 transition-colors focus-within:border-[#BFC3D6]">
        <Search className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Buscar elementos"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] text-foreground outline-none placeholder:text-[#9CA3AF] sm:w-36 sm:text-xs"
        />
      </div>
    </div>
  );
};

export default Models3DFilters;
