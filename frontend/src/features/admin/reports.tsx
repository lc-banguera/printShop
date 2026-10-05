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
    <div className="p-4 space-y-4 bg-[#F8FAFC] min-h-full">
      {/* Header */}
      <PageHeader
        title="Reportes y Analíticas"
        description="Genera, visualiza y exporta informes ejecutivos de la plataforma."
        icon={BarChart3}
        action={
          <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[5px] px-3.5 py-1.5 transition-colors shadow-2xs">
            <Download className="h-3.5 w-3.5" /> Exportar Consolidado
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-[5px] border border-[#E5E7EB] shadow-2xs p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-[#111827]">Distribución de Ingresos de la Plataforma</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: '5px', border: '1px solid #E2E8F0', fontSize: 12, padding: '4px 8px' }}
                formatter={(v) => [`$${v}`, 'Monto']}
              />
              <Bar dataKey="valor" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Generate Custom Report Form */}
        <div className="bg-white rounded-[5px] border border-[#E5E7EB] shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#111827] mb-3 pb-2 border-b border-[#E5E7EB]">Generar Reporte Personalizado</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475569]">Tipo de Reporte</label>
                <select className="w-full h-8 px-2.5 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[5px] outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-2xs">
                  <option>Ventas y Transacciones</option>
                  <option>Actividad de Tiendas</option>
                  <option>Moderación y Diseños</option>
                  <option>Suscripciones y Planes</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#475569]">Rango de Fecha</label>
                <select className="w-full h-8 px-2.5 text-xs text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[5px] outline-none focus:border-[#2563EB] focus:bg-white transition-all shadow-2xs">
                  <option>Últimos 30 días</option>
                  <option>Este trimestre</option>
                  <option>Este año</option>
                  <option>Histórico</option>
                </select>
              </div>
            </div>
          </div>
          <button className="w-full mt-3 h-8.5 text-xs font-semibold text-white bg-[#2563EB] rounded-[5px] hover:bg-[#1D4ED8] transition-colors shadow-2xs cursor-pointer">
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Available Reports Table */}
      <div className="bg-white rounded-[5px] border border-[#E5E7EB] shadow-2xs w-full overflow-hidden">
        <div className="p-3 border-b border-[#E5E7EB] bg-white">
          <h2 className="text-xs sm:text-sm font-bold text-[#111827]">Reportes Listos para Descarga</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#2563EB] text-white">
                {['Nombre del Reporte', 'Fecha de Generación', 'Tamaño', 'Formato', 'Acción'].map((h) => (
                  <th key={h} className="px-3.5 py-2.5 font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {reportTypes.map((rep, idx) => (
                <tr
                  key={rep.id}
                  className={`transition-colors ${idx % 2 === 0 ? 'bg-white hover:bg-[#F8FAFC]' : 'bg-[#F8FAFC] hover:bg-[#F1F5F9]'}`}
                >
                  <td className="px-3.5 py-2.5 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#64748B]" />
                      <span className="font-normal text-[#334155] text-xs">{rep.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-[#475569] border-b border-[#F1F5F9]">{rep.date}</td>
                  <td className="px-3.5 py-2.5 text-[#475569] border-b border-[#F1F5F9]">{rep.size}</td>
                  <td className="px-3.5 py-2.5 border-b border-[#F1F5F9]">
                    <span className="inline-flex items-center rounded-[3px] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]">
                      {rep.type}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 border-b border-[#F1F5F9]">
                    <button className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer">
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
