import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

const reportTypes = [
  { id: 'REP-001', name: 'Reporte de Ventas Mensuales', date: 'Ayer', size: '2.4 MB', type: 'PDF' },
  { id: 'REP-002', name: 'Auditoría de Diseños y Copyright', date: 'Hace 3 días', size: '1.2 MB', type: 'Excel' },
  { id: 'REP-003', name: 'Reporte de Suscripciones y Churn', date: '01 Ago 2026', size: '850 KB', type: 'PDF' },
  { id: 'REP-004', name: 'Consolidado de Comisiones a Diseñadores', date: '28 Jul 2026', size: '3.1 MB', type: 'Excel' },
];

export default function Reports() {
  const chartData = [
    { name: 'Suscripciones', valor: 24500 },
    { name: 'Venta Directa', valor: 18900 },
    { name: 'Comisiones Diseños', valor: 5520 },
  ];

  return (
    <div className="p-4 space-y-4 bg-[var(--surface-muted)] min-h-full">
      {/* Header */}
      <PageHeader
        title="Reportes y Analíticas"
        description="Genera, visualiza y exporta informes ejecutivos de la plataforma."
        icon={BarChart3}
        action={
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[5px] px-3.5 py-1.5 transition-colors shadow-2xs">
            <Download className="h-3.5 w-3.5" /> Exportar Consolidado
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Distribución de Ingresos de la Plataforma</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: '5px', border: '1px solid var(--border)', fontSize: 12, padding: '4px 8px' }}
                formatter={(v) => [`$${v}`, 'Monto']}
              />
              <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Generate Custom Report Form */}
        <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border)]">Generar Reporte Personalizado</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Tipo de Reporte</label>
                <select className="w-full h-8 px-2.5 text-xs text-[var(--text-secondary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs">
                  <option>Ventas y Transacciones</option>
                  <option>Actividad de Tiendas</option>
                  <option>Moderación y Diseños</option>
                  <option>Suscripciones y Planes</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Rango de Fecha</label>
                <select className="w-full h-8 px-2.5 text-xs text-[var(--text-secondary)] bg-[var(--surface-muted)] border border-[var(--border)] rounded-[5px] outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs">
                  <option>Últimos 30 días</option>
                  <option>Este trimestre</option>
                  <option>Este año</option>
                  <option>Histórico</option>
                </select>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 h-8.5 text-xs font-semibold text-white bg-[var(--primary)] rounded-[5px] hover:bg-[var(--primary-hover)] transition-colors shadow-2xs cursor-pointer">
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Available Reports Table */}
      <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs w-full overflow-hidden">
        <div className="p-3 border-b border-[var(--border)] bg-white">
          <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Reportes Listos para Descarga</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                {['Nombre del Reporte', 'Fecha de Generación', 'Tamaño', 'Formato', 'Acción'].map((h) => (
                  <th key={h} className="px-3.5 py-2.5 font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {reportTypes.map((rep, idx) => (
                <tr
                  key={rep.id}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-white hover:bg-[var(--surface-muted)]' : 'bg-[var(--surface-muted)] hover:bg-[var(--border-muted)]'}`}
                >
                  <td className="px-3.5 py-2.5 border-b border-[var(--border-muted)]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                      <span className="font-normal text-[var(--text-secondary)] text-xs">{rep.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{rep.date}</td>
                  <td className="px-3.5 py-2.5 text-[var(--text-secondary)] border-b border-[var(--border-muted)]">{rep.size}</td>
                  <td className="px-3.5 py-2.5 border-b border-[var(--border-muted)]">
                    <span className="inline-flex items-center rounded-[3px] bg-[var(--info-muted)] border border-[var(--border-strong)] px-2 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                      {rep.type}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-[var(--border-muted)]">
                    <button className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] cursor-pointer">
                      <Download className="h-3 w-3" />
                      Descargar
                    </button>
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
