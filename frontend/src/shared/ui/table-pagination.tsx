import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface TablePaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems: number;
  itemsPerPage?: number;
  itemLabel?: string;
  className?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PAGE_BTN =
  'flex h-10 w-10 min-w-10 shrink-0 select-none items-center justify-center rounded-control text-sm font-medium transition-colors duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40';

export function TablePagination({
  currentPage = 1,
  totalPages = 5,
  totalItems,
  itemsPerPage = 20,
  itemLabel = 'registros',
  className,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  // Build visible page numbers
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPages();

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page: number) => {
    if (onPageChange && page !== currentPage) onPageChange(page);
  };

  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-col items-start justify-between gap-3 border-t border-border bg-surfaceMuted px-4 py-4 sm:flex-row sm:items-center',
        className
      )}
    >
      {/* Left: showing info */}
      <p className="min-w-0 text-xs text-foregroundMuted">
        Mostrando <span className="font-semibold text-foreground">{from}</span> a{' '}
        <span className="font-semibold text-foreground">{to}</span> de{' '}
        <span className="font-semibold text-foreground">{totalItems.toLocaleString('es-MX')}</span> {itemLabel}
      </p>

      {/* Right: pagination controls */}
      <div className="flex w-full max-w-full min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 sm:w-auto sm:shrink-0 sm:pb-0">
        {/* Prev Button */}
        <button
          type="button"
          className={cn(
            PAGE_BTN,
            'border border-border bg-surface text-foregroundMuted shadow-subtle hover:bg-surfaceStrong'
          )}
          disabled={currentPage === 1}
          onClick={handlePrev}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Individual Page Number Buttons */}
        <div className="flex shrink-0 items-center gap-1.5">
          {pages.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-10 w-7 min-w-7 shrink-0 select-none items-center justify-center text-xs tracking-widest text-foregroundSubtle"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page as number)}
                className={cn(
                  PAGE_BTN,
                  page === currentPage
                    ? 'bg-primary font-semibold text-primaryForeground shadow-subtle'
                    : 'border border-border bg-surface text-foregroundMuted hover:bg-surfaceStrong'
                )}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className={cn(
            PAGE_BTN,
            'border border-border bg-surface text-foregroundMuted shadow-subtle hover:bg-surfaceStrong'
          )}
          disabled={currentPage === totalPages}
          onClick={handleNext}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Per page selector */}
        <div className="relative ml-1.5 shrink-0">
          <select
            value={itemsPerPage}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="h-10 min-w-[132px] appearance-none cursor-pointer rounded-control border border-border bg-surface pl-2.5 pr-7 text-xs font-medium text-foregroundMuted shadow-subtle outline-none transition-colors duration-normal hover:border-borderStrong focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foregroundSubtle" />
        </div>
      </div>
    </div>
  );
}

export default TablePagination;
