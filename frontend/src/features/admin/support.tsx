import React, { useState } from 'react';
import { Filter, MessageSquare, CheckCircle2, Download, UserRound, Eye, ArrowRight, History } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { StatusBadge } from '@/shared/ui/status-badge';
import { TableActions } from '@/shared/ui/table-actions';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TableFilterSelect } from '@/shared/ui/table-filter-select';
import { TablePagination } from '@/shared/ui/table-pagination';
import { mockSupportTickets } from './data';

const getSupportActions = (status: string): TableAction[] => {
  const norm = status.toLowerCase();
  if (norm === 'pendiente') {
    return [
      { label: 'Ver detalles', icon: Eye },
      { label: 'Atender solicitud', icon: ArrowRight },
    ];
  }
  if (norm === 'en revisión' || norm === 'en revision' || norm === 'en proceso') {
    return [
      { label: 'Ver detalles', icon: Eye },
      { label: 'Responder', icon: MessageSquare },
      { label: 'Finalizar atención', icon: CheckCircle2 },
    ];
  }
  // Procesado
  return [
    { label: 'Ver detalles', icon: Eye },
    { label: 'Ver historial', icon: History },
  ];
};

export default function Support() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = mockSupportTickets.filter((t) => {
    const matchSearch =
      t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {/* Header */}
      <PageHeader
        title="Centro de Soporte"
        description="Atiende reportes de usuarios, problemas con pedidos y asistencia técnica."
        icon={MessageSquare}
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
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Tickets de Soporte</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar value={search} onChange={setSearch} placeholder="Buscar ticket, usuario o asunto..." width="w-52" />
            <TableFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={['Todos', 'Pendiente', 'En revisión', 'Procesado'].map((s) => ({
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
                {['ID Ticket', 'Usuario', 'Asunto', 'Categoría', 'Prioridad', 'Fecha Creación', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((tkt, idx) => (
                <tr
                  key={tkt.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? 'bg-surface hover:bg-surfaceStrong' : 'bg-surfaceMuted hover:bg-surfaceStrong'}`}
                >
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 font-mono text-xs text-foregroundMuted">{tkt.id}</td>
                  <td className="border-b border-borderMuted px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-accentMuted text-primary">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <span className="truncate text-sm font-normal leading-tight text-foregroundMuted">{tkt.user}</span>
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{tkt.subject}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{tkt.category}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{tkt.priority}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{tkt.date}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3"><StatusBadge status={tkt.status} /></td>
                  <td className="border-b border-borderMuted px-4 py-3"><TableActions actions={getSupportActions(tkt.status)} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-foregroundMuted">
                    No se encontraron tickets con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalItems={mockSupportTickets.length} itemLabel="tickets" totalPages={1} />
      </div>
    </div>
  );
}
