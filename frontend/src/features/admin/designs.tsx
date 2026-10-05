import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Filter, PenTool, Image as ImageIcon, FileText, Eye, BarChart2, Package, MessageSquareDot, Ban, CalendarX, Trash2, History } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { TableActions } from '@/shared/ui/table-actions';
import { StatusBadge } from '@/shared/ui/status-badge';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TableFilterSelect } from '@/shared/ui/table-filter-select';
import { TablePagination } from '@/shared/ui/table-pagination';
import { mockDesigns } from './data';

const statuses = ['Todos', 'Aprobado', 'Pendiente', 'En revisión', 'Rechazado'];

const designActions: TableAction[] = [
  { label: 'Ver diseño', icon: Eye },
  { label: 'Ver estadísticas', icon: BarChart2 },
  { label: 'Ver productos asociados', icon: Package },
  { label: 'Solicitar cambios', icon: MessageSquareDot },
  { label: 'Deshabilitar diseño', icon: Ban, destructive: true },
  { label: 'Programar eliminación', icon: CalendarX, destructive: true },
  { label: 'Eliminar inmediatamente', icon: Trash2, destructive: true },
  { label: 'Ver historial', icon: History },
];

export default function Designs() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filtered = mockDesigns.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {/* Header */}
      <PageHeader
        title="Diseños"
        description="Modera, revisa y autoriza los diseños subidos por la comunidad."
        icon={PenTool}
        action={
          <>
            <button className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors shadow-2xs">
              <Download className="h-3.5 w-3.5 text-foregroundSubtle" /> Exportar
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-primaryForeground bg-primary hover:bg-primaryHover rounded-[5px] px-3.5 py-1.5 transition-colors shadow-2xs">
              <Plus className="h-3.5 w-3.5" /> Subir Diseño Oficial
            </button>
          </>
        }
      />

      {/* Table Section */}
      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Toolbar */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted p-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Catálogo de Diseños</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o autor..." width="w-52" />
            <TableFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statuses.map((s) => ({ value: s, label: s }))}
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
                {['Nombre del Diseño', 'Imagen', 'Autor / Diseñador', 'Categoría', 'Fecha Subida', 'Calificación', 'Ventas', 'Estado', 'Acciones'].map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((design, idx) => (
                <tr
                  key={design.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? 'bg-surface hover:bg-surfaceStrong' : 'bg-surfaceMuted hover:bg-surfaceStrong'}`}
                >
                  <td className="border-b border-borderMuted px-4 py-3">
                    <span className="text-sm font-medium leading-tight text-foreground">{design.name}</span>
                  </td>
                  <td className="border-b border-borderMuted px-4 py-3">
                    {design.image ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surfaceMuted">
                        <img
                          src={design.image}
                          alt={design.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border bg-surfaceMuted text-foregroundSubtle">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{design.author}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{design.category}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{design.date}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-medium text-foregroundMuted">
                    {design.rating ? `${design.rating} / 5.0` : '—'}
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{design.sales}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3"><StatusBadge status={design.status} /></td>
                  <td className="border-b border-borderMuted px-4 py-3">
                    <TableActions
                      actions={designActions.map((action) =>
                        action.label === 'Ver diseño'
                          ? {
                              ...action,
                              onSelect: () => navigate(`/admin/designs/${design.id}`),
                            }
                          : action
                      )}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-foregroundMuted">
                    No se encontraron diseños con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalItems={mockDesigns.length} itemLabel="diseños" totalPages={1} />
      </div>
    </div>
  );
}
