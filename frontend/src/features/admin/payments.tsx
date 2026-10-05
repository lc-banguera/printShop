import React, { useState } from 'react';
import { Filter, CreditCard, Download, Eye, AlertCircle, Info } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { StatusBadge } from '@/shared/ui/status-badge';
import { TableActions } from '@/shared/ui/table-actions';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TableFilterSelect } from '@/shared/ui/table-filter-select';
import { TablePagination } from '@/shared/ui/table-pagination';
import { mockPayments } from './data';

const getPaymentActions = (status: string): TableAction[] => {
  const norm = status.toLowerCase();
  if (norm === 'fallido') {
    return [
      { label: 'Ver detalles', icon: Eye },
      { label: 'Ver información del fallo', icon: AlertCircle },
    ];
  }
  if (norm === 'reembolsado') {
    return [
      { label: 'Ver detalles', icon: Eye },
      { label: 'Ver información del reembolso', icon: Info },
    ];
  }
  return [
    { label: 'Ver detalles', icon: Eye },
  ];
};

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = mockPayments.filter((p) => {
    const matchSearch =
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {/* Header */}
      <PageHeader
        title="Pagos y Facturas"
        description="Listado e historial de facturas cobradas y transferencias efectuadas."
        icon={CreditCard}
        action={
          <button className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors shadow-2xs">
            <Download className="h-3.5 w-3.5 text-foregroundSubtle" /> Exportar
          </button>
        }
      />

      {/* Table Section */}
      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Toolbar */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted p-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Historial de Pagos</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar value={search} onChange={setSearch} placeholder="Buscar por ID o tienda..." width="w-52" />
            <TableFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={['Todos', 'Completado', 'Pendiente', 'Procesando'].map((s) => ({
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
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {['ID Pago', 'Tienda / Destinatario', 'Tipo', 'Método', 'Monto', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((pay, idx) => (
                <tr
                  key={pay.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? 'bg-surface hover:bg-surfaceStrong' : 'bg-surfaceMuted hover:bg-surfaceStrong'}`}
                >
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 font-mono text-xs text-foregroundMuted">{pay.id}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{pay.customer}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{pay.type}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{pay.method}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{pay.amount}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{pay.date}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3"><StatusBadge status={pay.status} /></td>
                  <td className="border-b border-borderMuted px-4 py-3"><TableActions actions={getPaymentActions(pay.status)} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-foregroundMuted">
                    No se encontraron pagos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalItems={mockPayments.length} itemLabel="transacciones" totalPages={1} />
      </div>
    </div>
  );
}
