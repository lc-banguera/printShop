import * as React from "react";
import {
  CheckCircle2,
  Clock3,
  Crown,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/features/auth";
import { getDesignResources } from "@/features/designer/services/design-resources";
import hoodieProductImage from "@/resources/mockup/hoddie.png";
import { cn } from "@/shared/utils/cn";

const demoActiveOrder = {
  id: "PS-2048",
  item: "Hoodie Premium Oversized, Estampado Directo (DTG)",
  date: "08 Oct, 2026",
  estimatedDelivery: "14 Oct, 2026",
  status: "En producción",
  stepIndex: 2, // 0: Confirmado, 1: Preparación, 2: En producción, 3: Enviado, 4: Entregado
  steps: ["Confirmado", "Preparación", "En producción", "Enviado", "Entregado"],
};

const demoRecentOrders = [
  {
    id: "PS-2048",
    product: "Hoodie Premium Oversized",
    date: "08 Oct, 2026",
    status: "En proceso",
    statusTone: "blue",
    total: "$ 129.900",
  },
  {
    id: "PS-2035",
    product: "Pack camisetas x3 algodón 240g",
    date: "27 Sep, 2026",
    status: "Entregado",
    statusTone: "green",
    total: "$ 189.700",
  },
  {
    id: "PS-2022",
    product: "Taza cerámica sublimada 11oz",
    date: "12 Sep, 2026",
    status: "Entregado",
    statusTone: "green",
    total: "$ 42.900",
  },
];

export function CustomerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : "Creador";
  const recentDesigns = React.useMemo(() => getDesignResources().slice(0, 4), []);

  return (
    <div className="space-y-6 pb-8">
      {/* ── 1. Hero Creativo y Bienvenida ─────────────────────────────────── */}
      <section className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="relative flex flex-col justify-between overflow-hidden p-6 sm:p-7">
          <div className="relative z-10 max-w-xl">
            <h1 className="mt-3.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Hola, {firstName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-foregroundMuted">
              Crea prendas únicas con nuestro Diseñador, supervisa la producción textil de tus pedidos y gestiona tus recursos creativos en un solo lugar.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/designerv"
              className="inline-flex h-[42px] items-center justify-center rounded-[5px] bg-slate-900 px-4 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-slate-700 active:scale-[0.98]"
            >
              <span>Abrir Diseñador</span>
            </Link>
            <Link
              to="/products"
              className="inline-flex h-[42px] items-center justify-center rounded-[5px] border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
            >
              <span>Explorar catálogo</span>
            </Link>
          </div>
        </div>

        {/* Tarjeta de Membresía / Beneficios Creativos */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]/40 p-6 shadow-[0_2px_12px_rgba(217,119,6,0.06)]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#92400E]">
                <Crown className="h-3.5 w-3.5 text-[#D97706]" />
                Membresía Creativa
              </span>
              <span className="text-[11px] font-semibold text-[#B45309]">Nivel Gold</span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-[#78350F]">
              Ventajas exclusivas de impresión
            </h2>
            <ul className="mt-3 space-y-1.5 text-xs text-[#92400E]">
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
                <span>15% de descuento en pedidos textiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
                <span>Exportación en alta resolución (300 DPI)</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#D97706]" />
                <span>Prioridad en cola de fabricación</span>
              </li>
            </ul>
          </div>
          <div className="relative z-10 mt-5 pt-3 border-t border-[#FDE68A]/60">
            <Link
              to="/plans"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#92400E] transition-colors hover:text-[#78350F]"
            >
              <span>Gestionar suscripción y beneficios</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Estado del último pedido ──────────────────────────────────── */}
      <section className="w-full px-5 py-5 sm:px-6 sm:py-6" aria-labelledby="latest-order-heading">
        <div className="flex items-start justify-between border-b border-borderMuted pb-5">
          <div>
            <h2 id="latest-order-heading" className="text-lg font-semibold tracking-tight text-foreground">
              Estado de tu último pedido
            </h2>
            <div className="mt-2 space-y-0.5 text-sm text-foregroundMuted">
              <p>Pedido {demoActiveOrder.id}</p>
              <p>{demoActiveOrder.date}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 py-5 sm:flex-row sm:items-center">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden border border-border bg-white" style={{ borderRadius: 5 }}>
            <img src={hoodieProductImage} alt="Hoodie Premium Oversized" className="h-full w-full object-contain p-2" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">Hoodie Premium Oversized</h3>
          <p className="mt-1 text-sm text-foregroundMuted">Negro, Talla L</p>
            <p className="mt-2 text-sm text-foregroundMuted">3 artículos en el pedido</p>
            <p className="mt-3 text-base font-medium text-foreground">Total: $185.000</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2" aria-label="Progreso del pedido">
          {demoActiveOrder.steps.map((step, idx) => {
            const isReached = idx <= demoActiveOrder.stepIndex;
            const isCurrent = idx === demoActiveOrder.stepIndex;
            return (
              <div key={step} className="min-w-0 text-center">
                <div className={cn("h-1.5 w-full rounded-full", isReached ? "bg-emerald-500" : "bg-slate-300")} />
                <span className={cn("mt-2 block truncate text-xs", isCurrent ? "font-semibold text-foreground" : "text-foregroundMuted")}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-0.5 text-sm text-foregroundMuted">
          <p>
            Estado actual: <span className="font-medium text-foreground">{demoActiveOrder.status}</span>
          </p>
          <p>
            Entrega estimada: <span className="font-medium text-foreground">{demoActiveOrder.estimatedDelivery}</span>
          </p>
        </div>
      </section>

      {/* ── 4. Galería de Diseños Recientes ───────────────────────────────── */}
      <section className="p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-borderMuted pb-3.5">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Mis diseños recientes
            </h2>
            <p className="text-xs text-foregroundMuted mt-0.5">
              Continuar la edición en el Diseñador
            </p>
          </div>
       </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recentDesigns.map((design) => (
            <Link
              key={design.id}
              to="/designerv"
              className="group relative overflow-hidden transition-all duration-200 active:scale-[0.98]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#F1F5F9]">
                <img
                  src={design.image}
                  alt={design.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 group-hover:opacity-100">
                  <span className="bg-white px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                    Abrir en Diseñador
                  </span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="truncate text-xs font-semibold text-foreground">{design.name}</p>
                <p className="truncate text-[10px] text-foregroundMuted">{design.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. Historial de Pedidos Recientes ─────────────────────────────── */}
      <section className="rounded-[20px] border border-border bg-surface p-5 shadow-subtle sm:p-6">
        <div className="flex items-center justify-between border-b border-borderMuted pb-3.5">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Historial de pedidos recientes
            </h2>
            <p className="text-xs text-foregroundMuted mt-0.5">
              Detalle de tus compras y comprobantes emitidos
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 text-[11px] font-semibold uppercase tracking-wider text-foregroundMuted">
                <th className="pb-2.5">Nº Pedido</th>
                <th className="pb-2.5">Artículo principal</th>
                <th className="pb-2.5">Fecha</th>
                <th className="pb-2.5">Estado</th>
                <th className="pb-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {demoRecentOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surfaceMuted/50">
                  <td className="py-3 font-semibold text-foreground">
                    <Link to="/account/orders" className="hover:text-primary transition-colors">
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-3 text-foregroundMuted">{order.product}</td>
                  <td className="py-3 text-foregroundMuted">{order.date}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-foregroundMuted">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          order.statusTone === "green" ? "bg-emerald-500" : "bg-blue-500",
                        )}
                      />
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-foreground">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CustomerDashboardPage;
