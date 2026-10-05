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
  DollarSign,
  ShoppingBag,
  Users,
  ShoppingCart,
  Palette,
  Calendar,
  Download,
  ChevronDown,
  TrendingUp,
  MoreVertical,
  CheckCircle2,
  Circle,
  Package,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  salesChartData,
  categoryData,
  recentOrders,
  topProducts,
  storeHealthItems,
  kpiCards,
  type OrderStatus,
  type KpiIcon,
} from "./data";
import { StatusDot } from "./StatusDot";
import UserAvatar from "./UserAvatar";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatYAxis = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  "En produccion": {
    label: "En producción",
    className: "bg-infoMuted text-info",
  },
  Pagado: { label: "Pagado", className: "bg-surfaceMuted text-success" },
  Enviado: { label: "Enviado", className: "bg-infoMuted text-info" },
  Pendiente: { label: "Pendiente", className: "bg-warningMuted text-warningForeground" },
  Cancelado: { label: "Cancelado", className: "bg-dangerMuted text-dangerStrong" },
};

const kpiTones: Record<KpiIcon, { icon: string; surface: string; chart: string }> = {
  dollar: { icon: "text-primary", surface: "bg-accentMuted", chart: "var(--primary)" },
  bag: { icon: "text-danger", surface: "bg-dangerMuted", chart: "var(--danger)" },
  users: { icon: "text-success", surface: "bg-surfaceMuted", chart: "var(--success)" },
  cart: { icon: "text-info", surface: "bg-infoMuted", chart: "var(--info)" },
  palette: { icon: "text-warningForeground", surface: "bg-warningMuted", chart: "var(--warning-foreground)" },
};

// ── KPI Icon renderer ─────────────────────────────────────────────────────────
function KpiIconEl({ icon, className }: { icon: KpiIcon; className: string }) {
  const props = { className, strokeWidth: 1.75 };
  switch (icon) {
    case "dollar":  return <DollarSign {...props} />;
    case "bag":     return <ShoppingBag {...props} />;
    case "users":   return <Users {...props} />;
    case "cart":    return <ShoppingCart {...props} />;
    case "palette": return <Palette {...props} />;
    default:        return <DollarSign {...props} />;
  }
}

// ── Mini sparkline (static aesthetic) ───────────────────────────────────────
function MiniChart({ color, icon }: { color: string; icon: KpiIcon }) {
  const points = [
    [0, 18], [10, 12], [20, 15], [30, 8], [40, 14], [50, 6], [60, 10], [70, 4], [80, 7],
  ];
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  return (
    <svg viewBox="0 0 80 22" className="w-full h-[28px] mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${icon}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={path + " L80,22 L0,22 Z"} fill={`url(#grad-${icon})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-control border border-border bg-surfaceElevated p-3 text-xs shadow-elevated">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
          <span className="text-foregroundMuted">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {entry.dataKey === "ventas"
              ? `$${(entry.value / 1000000).toFixed(2)}M`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Store Health Gauge ────────────────────────────────────────────────────────
function StoreHealthGauge({ percent }: { percent: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  // Show only 75% of circle (270 deg arc) for gauge look
  const arcLength = circ * 0.75;
  const filled = arcLength * (percent / 100);
  const gap = arcLength - filled;

  return (
    <div className="flex items-center justify-center relative w-[120px] h-[120px] mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
        {/* Track */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="var(--border-muted)"
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${circ - arcLength}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="var(--success)"
          strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight text-foreground">{percent}%</span>
        <span className="text-xs font-semibold text-success">Excelente</span>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StoreDashboard() {
  const healthPercent = Math.round(
    (storeHealthItems.filter((i) => i.done).length / storeHealthItems.length) * 100
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-6 p-4 sm:p-6 xl:p-8">

      {/* ── Header Row ────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 rounded-card border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-start sm:p-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            ¡Hola, Juan! 👋
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-foregroundMuted">
            Aquí tienes el resumen de tu tienda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <button
            type="button"
            className="flex min-h-10 items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Calendar className="h-4 w-4 text-foregroundSubtle" />
            <span>01 Mayo, 2026 – 21 Mayo, 2026</span>
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

      {/* ── KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="group flex min-w-0 flex-col rounded-card border border-border bg-surface p-5 shadow-card transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-elevated"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="min-w-0 text-sm font-semibold text-foregroundMuted">
                {card.label}
              </span>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${kpiTones[card.icon].surface}`}
              >
                <KpiIconEl icon={card.icon} className={`h-5 w-5 ${kpiTones[card.icon].icon}`} />
              </div>
            </div>
            <p className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
              {card.value}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-success" />
              <span className="text-xs font-semibold text-success">
                {card.change}
              </span>
              <span className="text-xs text-foregroundSubtle">vs. periodo anterior</span>
            </div>
            <MiniChart color={kpiTones[card.icon].chart} icon={card.icon} />
          </div>
        ))}
      </div>

      {/* ── Charts Row ────────────────────────────────────────────── */}
      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Sales Area Chart */}
        <div className="min-w-0 rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">Ventas</h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-1.5 text-xs text-foregroundMuted">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  Ventas
                </span>
                <span className="flex items-center gap-1.5 text-xs text-foregroundMuted">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                  Pedidos
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex min-h-9 items-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foregroundMuted transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Últimos 21 días
              <ChevronDown className="h-3.5 w-3.5 text-foregroundSubtle" />
            </button>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesChartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pedidosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--danger)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "var(--foreground-subtle)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={formatYAxis}
                tick={{ fontSize: 10, fill: "var(--foreground-subtle)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "var(--foreground-subtle)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="ventas"
                name="Ventas"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#ventasGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--primary)" }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="pedidos"
                name="Pedidos"
                stroke="var(--danger)"
                strokeWidth={2}
                fill="url(#pedidosGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--danger)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Donut */}
        <div className="min-w-0 rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Ventas por Categoría</h2>
            <Link
              to="/store/reports"
              className="rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ver reporte
            </Link>
          </div>

          <div className="relative mb-4 flex items-center justify-center">
            <PieChart width={160} height={160}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={2}
                stroke="white"
              >
                {categoryData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-base font-bold leading-none text-foreground">$24.68M</p>
              <p className="mt-1 text-xs font-medium text-foregroundMuted">Total</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-borderMuted pt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-foregroundMuted">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{cat.amount}</span>
                  <span className="w-8 text-right text-foregroundSubtle">({cat.value}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ────────────────────────────────────────────── */}
      <div className="grid min-w-0 grid-cols-1 gap-5 pb-4 lg:grid-cols-2 xl:grid-cols-3">

        {/* Recent Orders */}
        <div className="min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow duration-normal hover:shadow-elevated">
          <div className="flex items-center justify-between gap-3 border-b border-borderMuted px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Pedidos Recientes</h2>
            <Link
              to="/store/orders"
              className="rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ver todos
            </Link>
          </div>

          <div className="divide-y divide-borderMuted">
            {recentOrders.map((order) => {
              const cfg = orderStatusConfig[order.status];
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-normal hover:bg-surfaceMuted focus-within:bg-surfaceMuted"
                >
                  {/* Avatar */}
                  <UserAvatar name={order.customer} className="w-8 h-8" iconClassName="w-4 h-4" />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{order.id}</span>
                      <StatusDot status={cfg.label} />
                    </div>
                    <p className="truncate text-xs text-foregroundMuted">
                      {order.customer} · {order.products} producto{order.products > 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">{order.total}</span>
                    <button
                      type="button"
                      aria-label={`Más acciones para el pedido ${order.id}`}
                      className="rounded-control p-2 text-foregroundSubtle transition-colors duration-normal hover:bg-surfaceStrong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow duration-normal hover:shadow-elevated">
          <div className="flex items-center justify-between gap-3 border-b border-borderMuted px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">Productos Más Vendidos</h2>
            <Link
              to="/store/products"
              className="rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ver todos
            </Link>
          </div>

          <div className="divide-y divide-borderMuted">
            {topProducts.map((product) => (
              <div
                key={product.rank}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-normal hover:bg-surfaceMuted"
              >
                <span className="w-4 shrink-0 text-xs font-bold text-foregroundSubtle">
                  {product.rank}
                </span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-10 w-10 shrink-0 rounded-control bg-surfaceMuted object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="text-xs text-foregroundSubtle">{product.sales} ventas</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-foreground">
                  {product.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Store Health + Pending Tasks */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Health */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated">
            <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">Estado de tu Tienda</h2>

            <StoreHealthGauge percent={healthPercent} />

            <div className="mt-5 space-y-3 border-t border-borderMuted pt-4">
              {storeHealthItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-borderStrong" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      item.done ? "text-foregroundMuted" : "text-foregroundSubtle"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="rounded-card border border-border bg-surface p-5 shadow-card transition-shadow duration-normal hover:shadow-elevated">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-foreground">Tareas Pendientes</h2>
              <Link
                to="/store/orders"
                className="rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Ver todas
              </Link>
            </div>

            <div className="space-y-2.5">
              {/* Task 1 */}
              <Link
                to="/store/orders"
                className="group flex items-center gap-3 rounded-control p-3 transition-colors duration-normal hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accentMuted">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    12 pedidos por enviar
                  </p>
                  <p className="text-xs text-foregroundSubtle">
                    Tienes pedidos listos para envío
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-foregroundSubtle transition-colors group-hover:text-primary" />
              </Link>

              {/* Task 2 */}
              <Link
                to="/store/designs"
                className="group flex items-center gap-3 rounded-control p-3 transition-colors duration-normal hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-warningMuted">
                  <Palette className="h-4 w-4 text-warningForeground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    3 diseños requieren aprobación
                  </p>
                  <p className="text-xs text-foregroundSubtle">
                    Revisa los diseños pendientes
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-foregroundSubtle transition-colors group-hover:text-warningForeground" />
              </Link>

              {/* Task 3 */}
              <Link
                to="/store/products"
                className="group flex items-center gap-3 rounded-control p-3 transition-colors duration-normal hover:bg-surfaceMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-dangerMuted">
                  <AlertCircle className="h-4 w-4 text-dangerStrong" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Actualizar inventario
                  </p>
                  <p className="text-xs text-foregroundSubtle">
                    5 productos con bajo inventario
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-foregroundSubtle transition-colors group-hover:text-dangerStrong" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
