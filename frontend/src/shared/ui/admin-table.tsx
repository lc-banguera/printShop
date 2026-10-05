import * as React from 'react';
import { cn } from '@/shared/utils/cn';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
}

export function AdminTable<T extends { id: string }>({
  columns,
  data,
  className,
  emptyMessage = 'No hay datos para mostrar.',
}: AdminTableProps<T>) {
  return (
    <div className={cn('w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card', className)}>
      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm text-foregroundMuted">
        <thead>
          <tr className="border-b border-border bg-surfaceMuted text-foreground">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-borderMuted">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm font-normal text-foregroundMuted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  'transition-colors duration-normal hover:bg-surfaceStrong focus-within:bg-surfaceStrong',
                  idx % 2 === 0 ? 'bg-surface' : 'bg-surfaceMuted'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn('whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted last:border-b-0', col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default AdminTable;
