import React, { useState } from 'react';
import { Plus, Megaphone, Pause, Play, Download, Eye, BarChart2, Copy, Trash2 } from 'lucide-react';
import type { TableAction } from '@/shared/ui/table-actions';
import { StatusBadge } from '@/shared/ui/status-badge';
import { TableActions } from '@/shared/ui/table-actions';
import { PageHeader } from '@/shared/ui/page-header';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'Activa' | 'Pausada' | 'Completada';
  reach: string;
  clicks: string;
  conversion: string;
  spend: string;
}

const initialCampaigns: Campaign[] = [
  { id: '1', name: 'Cyber Week PrintShop 2026', type: 'Email + Push', status: 'Activa', reach: '45,000', clicks: '8,920', conversion: '3.2%', spend: '$350' },
  { id: '2', name: 'Cupón Creadores Nuevos', type: 'Cupón Descuento', status: 'Activa', reach: '12,000', clicks: '2,100', conversion: '5.8%', spend: '$120' },
  { id: '3', name: 'Campaña Retención Starter Plan', type: 'Email Marketing', status: 'Pausada', reach: '8,500', clicks: '640', conversion: '1.1%', spend: '$45' },
  { id: '4', name: 'Aniversario Descuento Diseños', type: 'Banner Principal', status: 'Completada', reach: '120,000', clicks: '24,500', conversion: '4.5%', spend: '$500' },
];

export default function Marketing() {
  const [list, setList] = useState<Campaign[]>(initialCampaigns);

  const toggleStatus = (id: string) => {
    setList(
      list.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Activa' ? 'Pausada' : 'Activa';
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="p-4 space-y-4 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <PageHeader
        title="Marketing y Campañas"
        description="Crea cupones globales, banners publicitarios y notificaciones masivas para la plataforma."
        icon={Megaphone}
        action={
          <>
            <button className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-[5px] px-3 py-1.5 bg-white hover:bg-[var(--surface-muted)] transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> Exportar
            </button>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[5px] px-3.5 py-1.5 transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Plus className="h-3.5 w-3.5" /> Nueva Campaña
            </button>
          </>
        }
      />

      {/* Campaigns list table */}
      <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs w-full overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-white">
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Lista de Campañas y Promociones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                {['Campaña', 'Tipo', 'Alcance', 'Clicks', 'Conversión', 'Inversión', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-3.5 py-2.5 font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {list.map((camp, idx) => (
                <tr
                  key={camp.id}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-white hover:bg-[var(--surface-muted)]' : 'bg-[var(--surface-muted)] hover:bg-[var(--border-muted)]'}`}
                >
                  <td className="px-3.5 py-2.5 font-normal text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{camp.name}</td>
                  <td className="px-3.5 py-2.5 font-normal text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{camp.type}</td>
                  <td className="px-3.5 py-2.5 font-normal text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{camp.reach}</td>
                  <td className="px-3.5 py-2.5 font-normal text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{camp.clicks}</td>
                  <td className="px-3.5 py-2.5 font-normal text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{camp.conversion}</td>
                  <td className="px-3.5 py-2.5 font-normal text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{camp.spend}</td>
                  <td className="px-3.5 py-2.5 border-b border-[var(--border-muted)]">
                    <StatusBadge status={camp.status} />
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-[var(--border-muted)]">
                    <TableActions
                      actions={[
                        { label: 'Ver campaña', icon: Eye },
                        { label: 'Ver estadísticas', icon: BarChart2 },
                        { label: camp.status === 'Activa' ? 'Pausar campaña' : 'Activar campaña', icon: camp.status === 'Activa' ? Pause : Play, onSelect: () => toggleStatus(camp.id) },
                        { label: 'Duplicar campaña', icon: Copy },
                        { label: 'Eliminar campaña', icon: Trash2, destructive: true },
                      ] as TableAction[]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
