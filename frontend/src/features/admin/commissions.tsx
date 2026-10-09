import React, { useState } from 'react';
import { DollarSign, Download, Filter, Eye, PenTool, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { StatusBadge } from '@/shared/ui/status-badge';
import { TableActions } from '@/shared/ui/table-actions';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TableFilterSelect } from '@/shared/ui/table-filter-select';
import { TablePagination } from '@/shared/ui/table-pagination';
import { mockCommissions } from './data';

const getCommissionActions = (status: string): TableAction[] => {
  const isPendiente = status.toLowerCase() === 'pendiente';
  if (isPendiente) {
    return [
      { label: 'Ver detalle', icon: Eye },
      { label: 'Ver diseño relacionado', icon: PenTool },
      { label: 'Aprobar pago', icon: ThumbsUp },
      { label: 'Rechazar pago', icon: ThumbsDown, destructive: true },
    ];
  }
  return [
    { label: 'Ver detalle', icon: Eye },
    { label: 'Ver diseño relacionado', icon: PenTool },
  ];
};

export default function Commissions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = mockCommissions.filter((c) => {
    const matchSearch =
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.design.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {/* Header */}
      <PageHeader
        title="Comisiones de Diseñadores"
        description="Monitorea las comisiones devengadas por diseñadores a través del marketplace."
        icon={DollarSign}
        action={
          <button className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Download className="h-3.5 w-3.5 text-foregroundSubtle" /> Exportar
          </button>
        }
      />

      {/* Table Section */}
      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Toolbar */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted p-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Registro de Comisiones</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar value={search} onChange={setSearch} placeholder="Buscar diseñador o diseño..." width="w-52" />
            <TableFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={['Todos', 'Pagado', 'Pendiente', 'Rechazado'].map((s) => ({
                value: s,
                label: s,
              }))}
            />
            <button className="flex h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-sm text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Filter className="h-3.5 w-3.5 text-foregroundSubtle" /> Filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {['Diseñador', 'Diseño', 'Tienda Distribuidora', 'Unidades Vendidas', 'Comisión Generada', 'Fecha Corte', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((comm, idx) => (
                <tr
                  key={comm.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? 'bg-surface hover:bg-surfaceStrong' : 'bg-surfaceMuted hover:bg-surfaceStrong'}`}
                >
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{comm.user}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{comm.design}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{comm.store}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{comm.sales}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{comm.commission}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{comm.date}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3"><StatusBadge status={comm.status} /></td>
                  <td className="border-b border-borderMuted px-4 py-3"><TableActions actions={getCommissionActions(comm.status)} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-foregroundMuted">
                    No se encontraron comisiones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalItems={mockCommissions.length} itemLabel="registros" totalPages={1} />
      </div>
    </div>
  );
}
