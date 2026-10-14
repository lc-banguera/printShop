import * as React from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  Palette,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthlyPerformance = [
  { month: "Ene", ventas: 14200000, pedidos: 180, clientes: 75 },
  { month: "Feb", ventas: 18500000, pedidos: 240, clientes: 98 },
  { month: "Mar", ventas: 16800000, pedidos: 210, clientes: 88 },
  { month: "Abr", ventas: 22400000, pedidos: 310, clientes: 130 },
  { month: "May", ventas: 24680000, pedidos: 356, clientes: 142 },
];

const categoryPerformance = [
  { category: "Camisetas", valor: 12350000 },
  { category: "Hoodies", valor: 6180000 },
  { category: "Tazas", valor: 2960000 },
  { category: "Gorras", valor: 1970000 },
  { category: "Bolsos", valor: 1220000 },
];

export default function StoreReports() {
  const [timeRange, setTimeRange] = React.useState("Últimos 30 días");

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
            Reportes y Estadísticas
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Analiza el rendimiento histórico de ventas, pedidos y productos más
            demandados.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs font-semibold text-[#334155] bg-white border border-[#E2E8F0] px-3 py-2 rounded-[6px] shadow-2xs focus:outline-none focus:border-[#2563EB]"
          >
            <option value="Últimos 7 días">Últimos 7 días</option>
            <option value="Últimos 30 días">Últimos 30 días</option>
            <option value="Este año">Este año (2026)</option>
          </select>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3.5 py-2 rounded-[6px] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* ── Resumen de Métricas ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Ingresos Netos
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            $ 24.680.000
          </p>
          <span className="text-[11px] text-[#16A34A] font-semibold mt-1 inline-flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +28.6% vs mes anterior
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Pedidos Completados
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">356</p>
          <span className="text-[11px] text-[#16A34A] font-semibold mt-1 inline-flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.3%
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Ticket Promedio
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">$ 69.326</p>
          <span className="text-[11px] text-[#16A34A] font-semibold mt-1 inline-flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +9.7%
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Clientes Recurrentes
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">42.8%</p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Alta fidelización
          </span>
        </div>
      </div>

      {/* ── Gráficos con Recharts ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfico de Tendencia de Ventas (2 columnas) */}
        <div className="lg:col-span-2 p-5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Tendencia de Ventas Mensuales ($ COP)
              </h2>
              <p className="text-xs text-[#64748B]">
                Crecimiento sostenido durante los últimos 5 meses
              </p>
            </div>
            <span className="text-xs font-medium text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 rounded-[5px]">
              Promedio: $ 19.3M / mes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformance}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `$ ${Number(value).toLocaleString("es-CO")}`,
                    "Ventas",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Ventas por Categoría */}
        <div className="p-5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Ventas por Categoría
            </h2>
            <p className="text-xs text-[#64748B]">
              Distribución de ingresos según el tipo de producto
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                  tick={{ fontSize: 10, fill: "#64748B" }}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#334155" }}
                  width={75}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `$ ${Number(value).toLocaleString("es-CO")}`,
                    "Total",
                  ]}
                />
                <Bar dataKey="valor" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-[#64748B] pt-2 border-t border-[#F1F5F9] flex justify-between">
            <span>Categoría líder: <b>Camisetas (50%)</b></span>
            <span className="text-[#2563EB] font-semibold">Ver detalle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
