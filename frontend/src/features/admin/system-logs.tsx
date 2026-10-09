import React, { useState } from 'react';
import { Database, RefreshCw, Filter, Download, Eye, Activity, User, Folder, Copy } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { TableActions } from '@/shared/ui/table-actions';
import { PageHeader } from '@/shared/ui/page-header';
import { TableSearchBar } from '@/shared/ui/table-search-bar';
import { TableFilterSelect } from '@/shared/ui/table-filter-select';
import { TablePagination } from '@/shared/ui/table-pagination';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  service: string;
  message: string;
}

const initialLogs: LogEntry[] = [
  { id: '1', timestamp: '2026-08-16 10:15:32', level: 'INFO', service: 'AuthService', message: "Usuario 'ana@creativamx.com' inició sesión correctamente." },
  { id: '2', timestamp: '2026-08-16 10:14:12', level: 'WARNING', service: 'CatalogService', message: 'Intento de subir imagen sin metadatos de resolución requeridos.' },
  { id: '3', timestamp: '2026-08-16 10:12:05', level: 'ERROR', service: 'PaymentService', message: 'Transacción fallida para Tienda Express: Gateway Timeout.' },
  { id: '4', timestamp: '2026-08-16 10:10:45', level: 'INFO', service: 'SubscriptionService', message: "Plan Premium renovado automáticamente para 'Creative Print Store'." },
  { id: '5', timestamp: '2026-08-16 10:09:12', level: 'ERROR', service: 'MailerService', message: "Fallo al enviar correo de confirmación de pedido a 'cliente@mail.com'." },
  { id: '6', timestamp: '2026-08-16 10:08:00', level: 'INFO', service: 'OrderService', message: 'Pedido #ORD-10254 creado exitosamente.' },
];

const logActions: TableAction[] = [
  { label: 'Ver detalles', icon: Eye },
  { label: 'Ver evento', icon: Activity },
  { label: 'Ver usuario relacionado', icon: User },
  { label: 'Ver recurso relacionado', icon: Folder },
  { label: 'Copiar información', icon: Copy },
];

export default function SystemLogs() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('Todos');

  const filtered = initialLogs.filter((l) => {
    const matchSearch =
      l.service.toLowerCase().includes(search.toLowerCase()) ||
      l.message.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'Todos' || l.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="p-4 space-y-4 bg-surfaceMuted min-h-full">
      {/* Header */}
      <PageHeader
        title="Logs del Sistema"
        description="Registro de eventos y errores en tiempo real del backend Spring Boot."
        icon={Database}
        action={
          <>
            <button className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Download className="h-3.5 w-3.5 text-foregroundSubtle" /> Exportar
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary rounded-[5px] px-3 py-1.5 hover:bg-infoMuted transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar Logs
            </button>
          </>
        }
      />

      {/* Table Section */}
      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Toolbar */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted p-4">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Eventos Recientes</h2>
          <div className="flex flex-wrap items-center gap-2">
            <TableSearchBar value={search} onChange={setSearch} placeholder="Buscar por mensaje o servicio..." width="w-52" />
            <TableFilterSelect
              value={levelFilter}
              onChange={setLevelFilter}
              options={['Todos', 'INFO', 'WARNING', 'ERROR'].map((lv) => ({
                value: lv,
                label: lv,
              }))}
            />
            <button className="flex h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 text-sm text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Filter className="h-3.5 w-3.5 text-foregroundSubtle" /> Filtros
            </button>
          </div>
        </div>

        {/* Content with Product Detail table style */}
        <div className="min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full text-xs text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {['Marca de Tiempo', 'Nivel', 'Servicio', 'Mensaje', 'Acciones'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filtered.map((log, idx) => (
                <tr
                  key={log.id}
                  className={`transition-colors duration-normal ${idx % 2 === 0 ? 'bg-surface hover:bg-surfaceStrong' : 'bg-surfaceMuted hover:bg-surfaceStrong'}`}
                >
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 font-mono text-xs text-foregroundMuted">{log.timestamp}</td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3">
                    <span className={`rounded-badge border px-2.5 py-1 text-[11px] font-semibold ${
                      log.level === 'ERROR'
                        ? 'bg-dangerMuted text-dangerStrong border-danger/20'
                        : log.level === 'WARNING'
                        ? 'bg-warningMuted text-warningForeground border-warning/30'
                        : 'bg-infoMuted text-info border-info/20'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-medium text-foreground">{log.service}</td>
                  <td className="border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">{log.message}</td>
                  <td className="border-b border-borderMuted px-4 py-3"><TableActions actions={logActions} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-foregroundMuted">
                    No se encontraron registros de logs con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination totalItems={initialLogs.length} itemLabel="eventos" totalPages={1} />
      </div>
    </div>
  );
}
