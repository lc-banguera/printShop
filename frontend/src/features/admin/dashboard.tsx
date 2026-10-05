import * as React from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Store,
  Users,
  ShoppingBag,
  DollarSign,
  Palette,
  Calendar,
  Download,
  ChevronDown,
} from "lucide-react";

// Chart data matching exact days and progression of the reference image
const revenueData = [
  { day: "1 May", ingresos: 32000, pedidos: 150 },
  { day: "6 May", ingresos: 58000, pedidos: 340 },
  { day: "11 May", ingresos: 48000, pedidos: 280 },
  { day: "16 May", ingresos: 72000, pedidos: 420 },
  { day: "21 May", ingresos: 62000, pedidos: 380 },
  { day: "26 May", ingresos: 88000, pedidos: 510 },
  { day: "31 May", ingresos: 82000, pedidos: 480 },
];

const planData = [
  { name: "Básico", value: 112, pct: "45.2%", color: "var(--primary)" },
  { name: "Profesional", value: 78, pct: "31.5%", color: "var(--info)" },
  { name: "Avanzado", value: 38, pct: "15.3%", color: "var(--accent-dark)" },
  { name: "Enterprise", value: 20, pct: "8.1%", color: "var(--success)" },
];

export default function Dashboard() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1600px] flex-col justify-between space-y-6 p-4 sm:p-6 xl:p-8">
      <div className="space-y-6">
        {/* ── Welcome & Controls Banner ─────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated sm:flex-row sm:items-center sm:p-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Bienvenido al area de control de PrintShop
              </h1>
            </div>
            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-foregroundMuted">
              Acceso unicamente para administradores para conocer métricas
              generales, ventas y rendimiento de la plataforma.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
            <button
              type="button"
              className="flex min-h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Calendar className="h-4 w-4 text-foregroundSubtle" />
              <span>Últimos 30 días</span>
            </button>

            <button
              type="button"
              className="flex min-h-10 items-center gap-2 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors duration-normal hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* ── 5 KPI Cards Row matching exact reference ──────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Card 1: Tiendas Activas */}
          <div className="group flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-elevated">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-foregroundMuted">
                Tiendas Activas
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accentMuted text-primary">
                <Store className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="mb-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
              248
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span className="font-semibold text-success">↑ +18.6%</span>
              <span className="text-foregroundSubtle">vs. mes anterior</span>
            </div>
          </div>

          {/* Card 2: Usuarios Registrados */}
          <div className="group flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-elevated">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-foregroundMuted">
                Usuarios Registrados
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accentMuted text-primary">
                <Users className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="mb-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
              12.584
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span className="font-semibold text-success">↑ +22.4%</span>
              <span className="text-foregroundSubtle">vs. mes anterior</span>
            </div>
          </div>

          {/* Card 3: Pedidos Totales */}
          <div className="group flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-elevated">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-foregroundMuted">
                Pedidos Totales
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accentMuted text-primary">
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="mb-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
              5.862
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span className="font-semibold text-success">↑ +15.7%</span>
              <span className="text-foregroundSubtle">vs. mes anterior</span>
            </div>
          </div>

          {/* Card 4: Ingresos Totales */}
          <div className="group flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-elevated">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-foregroundMuted">
                Ingresos Totales
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accentMuted text-primary">
                <DollarSign className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="mb-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
              $256.890
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span className="font-semibold text-success">↑ +23.1%</span>
              <span className="text-foregroundSubtle">vs. mes anterior</span>
            </div>
          </div>

          {/* Card 5: Diseños Creados */}
          <div className="group flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-elevated">
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-foregroundMuted">
                Diseños Creados
              </span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-accentMuted text-primary">
                <Palette className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="mb-2 text-3xl font-bold leading-tight tracking-tight text-foreground">
              18.742
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span className="font-semibold text-success">↑ +31.8%</span>
              <span className="text-foregroundSubtle">vs. mes anterior</span>
            </div>
          </div>
        </div>

        {/* ── Main Charts Row: Ingresos vs. Pedidos & Distribución por Plan ─ */}
        <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
          {/* Chart 1: Ingresos vs. Pedidos (approx 8 cols) */}
          <div className="flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated sm:p-6 xl:col-span-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Ingresos vs. Pedidos
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-foregroundMuted">
                      Ingresos ($)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-info" />
                    <span className="text-xs font-medium text-foregroundMuted">
                      Pedidos
                    </span>
                  </div>
                </div>
              </div>

              {/* Month Dropdown Selector */}
              <button
                type="button"
                className="flex min-h-9 items-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foregroundMuted transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Mayo 2026</span>
                <ChevronDown className="h-3.5 w-3.5 text-foregroundSubtle" />
              </button>
            </div>

            {/* Smooth Wave Area Chart */}
            <div className="h-[260px] w-full min-w-0 pt-2 sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient
                      id="gradIngresos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.16}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradPedidos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--info)"
                        stopOpacity={0.16}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--info)"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-muted)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--foreground-subtle)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 100000]}
                    ticks={[0, 25000, 50000, 75000, 100000]}
                    tick={{ fontSize: 10, fill: "var(--foreground-subtle)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v === 0 ? "$0" : `$${v / 1000}K`)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 600]}
                    ticks={[0, 150, 300, 450, 600]}
                    tick={{ fontSize: 10, fill: "var(--foreground-subtle)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "var(--radius-control)",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--surface-elevated)",
                      boxShadow: "var(--shadow-elevated)",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                    formatter={(v: any, name: any) => [
                      name === "ingresos"
                        ? `$${Number(v).toLocaleString()}`
                        : v,
                      name === "ingresos" ? "Ingresos" : "Pedidos",
                    ]}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="ingresos"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#gradIngresos)"
                    dot={false}
                    activeDot={{ r: 4.5, fill: "var(--primary)" }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="pedidos"
                    stroke="var(--info)"
                    strokeWidth={2.5}
                    fill="url(#gradPedidos)"
                    dot={false}
                    activeDot={{ r: 4.5, fill: "var(--info)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Distribución por Plan (approx 4 cols) */}
          <div className="flex min-w-0 flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated sm:p-6 xl:col-span-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Distribución por Plan
              </h2>
              <Link
                to="/admin/plans"
                className="rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Ver planes
              </Link>
            </div>

            <div className="my-auto flex flex-col items-center justify-center gap-5 py-4 sm:flex-row sm:gap-6">
              {/* Donut Chart with center 248 Tiendas */}
              <div className="relative shrink-0 flex items-center justify-center">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {planData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-foreground">248</span>
                  <span className="text-xs font-medium text-foregroundSubtle">
                    Tiendas
                  </span>
                </div>
              </div>

              {/* Legend matching reference with exact percentages */}
              <div className="flex w-full flex-col gap-3 sm:w-auto">
                {planData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between sm:justify-start gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-foregroundMuted">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {item.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="pt-2 text-center text-xs text-foregroundSubtle">
        © 2026 PrintShop. Todos los derechos reservados.
      </footer>
    </div>
  );
}
