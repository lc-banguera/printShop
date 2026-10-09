import React, { useState } from 'react';
import { CalendarDays, Plus, Download, Filter, Store, Eye, CreditCard, RefreshCw, PauseCircle, Ban, Check } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { mockSubscriptions } from '@/features/admin/data';
import { TableActions } from '@/shared/ui/table-actions';
import { StatusBadge } from '@/shared/ui/status-badge';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TableFilterSelect } from '@/shared/ui/table-filter-select';
import { TablePagination } from '@/shared/ui/table-pagination';
import { ConfirmationModal } from '@/shared/ui/confirmation-modal';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [subToCancel, setSubToCancel] = useState<(typeof mockSubscriptions)[0] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2400);
  };

  const filtered = subscriptions.filter((s) => {
    const matchSearch =
      s.store.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || s.status === statusFilter;
    const matchPlan = planFilter === 'Todos' || s.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const getSubscriptionActions = (sub: (typeof mockSubscriptions)[0]): TableAction[] => [
    { label: 'Ver detalles', icon: Eye, onSelect: () => showNotice(`Detalles de ${sub.store}`) },
    { label: 'Cambiar plan', icon: CreditCard, onSelect: () => showNotice(`Cambiar plan de ${sub.store}`) },
    { label: 'Renovar suscripción', icon: RefreshCw, onSelect: () => showNotice(`Suscripción renovada para ${sub.store}`) },
    {
      label: 'Cancelar suscripción',
      icon: Ban,
      destructive: true,
      onSelect: () => setSubToCancel(sub),
    },
  ];

  const handleConfirmCancel = () => {
    if (!subToCancel) return;
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === subToCancel.id ? { ...s, status: 'Inactiva' } : s))
    );
    showNotice(`Suscripción de "${subToCancel.store}" cancelada`);
    setSubToCancel(null);
  };

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {notice && (
        <div className="fixed top-5 right-5 z-50 bg-foreground text-primaryForeground px-4 py-2.5 rounded-[5px] shadow-lg flex items-center gap-2 text-xs">
          <Check className="h-3.5 w-3.5 text-success" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Suscripciones"
        description="Administra todos los planes y suscripciones de la plataforma"
        icon={CalendarDays}
        action={
          <>
            <button
              type="button"
              onClick={() => showNotice('Listado de suscripciones exportado')}
              className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="h-3.5 w-3.5 text-foregroundSubtle" /> Exportar
            </button>
            <button
              type="button"
              onClick={() => showNotice('Nueva suscripción')}
              className="flex items-center gap-1.5 text-xs font-semibold text-primaryForeground bg-primary hover:bg-primaryHover rounded-[5px] px-3.5 py-1.5 transition-colors shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Suscripción
            </button>
          </>
        }
      />

      {/* Table Section */}
      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Toolbar */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted p-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Listado de Suscripciones</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar value={search} onChange={setSearch} placeholder="Buscar tienda o suscripción..." width="w-52" />
            <TableFilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'Todos', label: 'Todos' },
                { value: 'Activa', label: 'Activa' },
                { value: 'Inactiva', label: 'Inactiva' },
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Vencida', label: 'Vencida' },
              ]}
            />
            <TableFilterSelect
              value={planFilter}
              onChange={setPlanFilter}
              options={[
                { value: 'Todos', label: 'Todos' },
                { value: 'Básico', label: 'Básico' },
                { value: 'Profesional', label: 'Profesional' },
                { value: 'Premium', label: 'Premium' },
              ]}
            />
            <button
              type="button"
              className="flex h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-sm text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Filter className="h-3.5 w-3.5 text-foregroundSubtle" /> Filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {['Tienda', 'Plan', 'Estado', 'Inicio', 'Próximo Pago', 'Valor Mensual', 'Método de Pago', 'Acciones'].map((col) => (
                  <th key={col} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((sub, idx) => (
                <tr
                  key={sub.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? 'bg-surface hover:bg-surfaceStrong' : 'bg-surfaceMuted hover:bg-surfaceStrong'}`}
                >
                  <td className="border-b border-borderMuted px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surfaceMuted text-foregroundMuted">
                        <Store className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-tight text-foreground">{sub.store}</p>
                        <p className="mt-0.5 truncate text-xs leading-tight text-foregroundSubtle">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3"><StatusBadge status={sub.plan} /></td>
                  <td className="px-3.5 py-2.5 border-b border-surfaceMuted">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-foregroundMuted">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          sub.status === 'Activa'
                            ? 'bg-success'
                            : sub.status === 'Pendiente'
                            ? 'bg-warning'
                            : 'bg-danger'
                        }`}
                      />
                      {sub.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{sub.startDate}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{sub.nextPayment}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{sub.amount}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm text-foregroundMuted">{sub.method}</td>
                  <td className="border-b border-borderMuted px-4 py-3"><TableActions actions={getSubscriptionActions(sub)} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-foregroundMuted">
                    No se encontraron suscripciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalItems={filtered.length} itemLabel="suscripciones" totalPages={1} />
      </div>

      {/* Confirmation Modal */}
      {subToCancel && (
        <ConfirmationModal
          isOpen={Boolean(subToCancel)}
          onClose={() => setSubToCancel(null)}
          onConfirm={handleConfirmCancel}
          title="Cancelar suscripción"
          description={`¿Estás seguro de que deseas cancelar la suscripción de "${subToCancel.store}"? El servicio permanecerá activo hasta el final del periodo facturado.`}
          confirmText="Cancelar suscripción"
          variant="danger"
        />
      )}
    </div>
  );
}
