import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  Undo2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";
import { CustomerPortalMenu } from "./customer-portal-menu";

// ── Tipos del Dominio de Devoluciones ─────────────────────────────────────────
export type ReturnsFilter = "active" | "history";

export interface ReturnItem {
  id: string;
  orderId: string;
  orderNumber: string;
  productName: string;
  reason: string;
  date: string;
  status: "in_review" | "approved" | "rejected" | "completed";
  statusLabel: string;
  statusColor: string;
  trackingNumber?: string;
}

// ── Datos de Demostración ───────────────────────────────────────────────────
// Casos de historial cuando el usuario consulta solicitudes anteriores
const DEMO_RETURNS_HISTORY: ReturnItem[] = [
  {
    id: "ret-01",
    orderId: "ord-871",
    orderNumber: "#ORD-2026-871",
    productName: "Sudadera Capucha Unisex (Talla L)",
    reason: "Ajuste de talla incorrecto respecto a las medidas",
    date: "14 Feb 2026",
    status: "completed",
    statusLabel: "Resuelta",
    statusColor: "text-emerald-700 bg-emerald-500",
  },
  {
    id: "ret-02",
    orderId: "ord-850",
    orderNumber: "#ORD-2026-850",
    productName: "Tote Bag Algodón 100% Orgánico",
    reason: "Detalle de estampación descentrado",
    date: "28 Ene 2026",
    status: "completed",
    statusLabel: "Resuelta",
    statusColor: "text-emerald-700 bg-emerald-500",
  },
];

// ── Ilustración Fiel del Estado Vacío (Caja con camiseta y flecha de retorno) ─
function ReturnsEmptyIllustration() {
  return (
    <div className="relative mx-auto flex h-[210px] w-[340px] select-none items-center justify-center sm:h-[230px] sm:w-[380px]">
      <svg
        viewBox="0 0 380 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Sombra de apoyo en la base */}
        <ellipse
          cx="190"
          cy="205"
          rx="145"
          ry="14"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />

        {/* Planta decorativa izquierda */}
        <g transform="translate(135, 80)">
          {/* Maceta */}
          <path
            d="M22 68L26 88H42L46 68H22Z"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1.2"
          />
          {/* Hojas verdes */}
          <path
            d="M24 68C18 52 14 38 18 28C26 34 30 50 28 68Z"
            fill="#34D399"
          />
          <path
            d="M28 68C32 48 38 32 48 24C50 36 44 54 36 68Z"
            fill="#10B981"
          />
          <path
            d="M34 68C40 54 48 44 58 40C56 52 48 62 40 68Z"
            fill="#059669"
          />
        </g>

        {/* Caja de cartón central abierta en perspectiva */}
        <g transform="translate(160, 60)">
          {/* Cara trasera interna de la caja */}
          <path d="M20 50L80 25L145 45L85 70L20 50Z" fill="#E2C9A6" />
          {/* Tapa trasera abierta */}
          <path
            d="M80 25L95 2L155 22L145 45L80 25Z"
            fill="#F3DEC2"
            stroke="#D1B48C"
            strokeWidth="1"
          />
          <path
            d="M20 50L5 30L65 8L80 25L20 50Z"
            fill="#DEC29E"
            stroke="#C9A87C"
            strokeWidth="1"
          />

          {/* Papel de seda lila protector dentro de la caja */}
          <path
            d="M30 65C38 52 50 55 60 48C70 42 85 45 95 38C105 32 120 36 135 45L125 72C110 75 95 70 85 76C75 82 60 78 50 82L30 65Z"
            fill="#DDD6FE"
          />

          {/* Camiseta blanca doblada dentro de la caja */}
          <rect
            x="44"
            y="42"
            width="72"
            height="42"
            rx="4"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          {/* Estampado de la camiseta (montaña y sol geométrico) */}
          <circle cx="88" cy="54" r="5" fill="#F59E0B" />
          <path d="M66 68L78 54L86 64L94 56L104 68H66Z" fill="#0284C7" />
          <path d="M78 54L86 64L94 56L98 62L92 68H72L78 54Z" fill="#0EA5E9" />

          {/* Papel de seda sobresaliendo hacia el frente */}
          <path
            d="M25 72C35 68 45 74 58 70C65 78 78 74 90 80L80 92L25 72Z"
            fill="#C4B5FD"
          />

          {/* Cara frontal izquierda de la caja */}
          <path
            d="M15 75L85 102V155L15 125V75Z"
            fill="#F5E4CE"
            stroke="#D9BE9B"
            strokeWidth="1.2"
          />
          {/* Cara frontal derecha de la caja */}
          <path
            d="M85 102L155 72V122L85 155V102Z"
            fill="#EBD2B2"
            stroke="#D1B48C"
            strokeWidth="1.2"
          />

          {/* Tapa frontal izquierda abierta hacia abajo */}
          <path
            d="M15 75L2 90L65 115L85 102L15 75Z"
            fill="#F5E4CE"
            stroke="#D9BE9B"
            strokeWidth="1"
          />
          {/* Tapa frontal derecha abierta hacia abajo */}
          <path
            d="M85 102L105 120L168 88L155 72L85 102Z"
            fill="#E0C4A0"
            stroke="#C7A57E"
            strokeWidth="1"
          />

          {/* Etiqueta de envío en la cara izquierda */}
          <rect
            x="24"
            y="98"
            width="28"
            height="34"
            rx="2"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          <line
            x1="28"
            y1="104"
            x2="44"
            y2="104"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="28"
            y1="110"
            x2="48"
            y2="110"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <line
            x1="28"
            y1="114"
            x2="42"
            y2="114"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          {/* Código de barras simulado */}
          <line
            x1="28"
            y1="122"
            x2="48"
            y2="122"
            stroke="#334155"
            strokeWidth="4"
            strokeDasharray="1 1.5"
          />

          {/* Símbolo de flecha de retorno grabado en la cara derecha */}
          <path
            d="M125 114C125 114 116 116 112 124C108 132 114 139 122 139C128 139 133 135 133 131"
            stroke="#6366F1"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M118 111L111 115L117 122"
            stroke="#6366F1"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Destellos / trazos de dinamismo morados arriba a la derecha */}
        <line
          x1="295"
          y1="55"
          x2="305"
          y2="50"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="300"
          y1="65"
          x2="312"
          y2="67"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="292"
          y1="78"
          x2="304"
          y2="84"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// ── Menú de Tres Puntos para Filas de Devoluciones ───────────────────────────
function ReturnActionsMenu({
  item,
  onViewOrder,
}: {
  item: ReturnItem;
  onViewOrder: (orderId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className={cn(
          customerIconButtonClass,
          "h-8 w-8 text-slate-400",
          open && "bg-slate-100 text-slate-800",
        )}
        aria-label="Acciones de la solicitud"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <CustomerPortalMenu
        open={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
        minWidth={190}
      >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onViewOrder(item.orderId);
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span>Ver pedido original</span>
          </button>
          <Link
            to="/account/support"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Consultar con soporte</span>
          </Link>
      </CustomerPortalMenu>
    </div>
  );
}

// ── Página Principal de Devoluciones ─────────────────────────────────────────
export function CustomerReturnsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState<ReturnsFilter>("active");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Casos activos (vacío inicialmente para reflejar el estado real aprobado en la imagen)
  const [activeReturns] = React.useState<ReturnItem[]>([]);
  const [historyReturns] = React.useState<ReturnItem[]>(DEMO_RETURNS_HISTORY);

  // Filtrado por texto y pestaña
  const displayedItems = React.useMemo(() => {
    const list = filter === "active" ? activeReturns : historyReturns;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q),
    );
  }, [filter, activeReturns, historyReturns, searchQuery]);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-150">
      {/* ── Encabezado Principal ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Devoluciones
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Consulta tus solicitudes y revisa las opciones disponibles para
            tus pedidos.
          </p>
        </div>
      </div>

      {/* ── Fila de Filtros y Búsqueda ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Pestañas: Solicitudes activas | Historial */}
        <div
          className="flex flex-wrap gap-1.5 bg-slate-100 p-1 border border-slate-200/60"
          style={{ borderRadius: 5 }}
          role="tablist"
          aria-label="Filtro de solicitudes"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "active"}
            onClick={() => setFilter("active")}
            className={cn(
              "min-h-8 px-3.5 text-xs font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
              filter === "active"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900",
            )}
            style={{ borderRadius: 5 }}
          >
            <span>Solicitudes activas</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "history"}
            onClick={() => setFilter("history")}
            className={cn(
              "min-h-8 px-3.5 text-xs font-semibold transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
              filter === "history"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900",
            )}
            style={{ borderRadius: 5 }}
          >
            <span>Historial</span>
          </button>
        </div>

        {/* Buscador de pedidos */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por pedido..."
            className="h-[42px] w-full border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            style={{ borderRadius: 5 }}
            aria-label="Buscar solicitudes por número de pedido"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={cn(customerIconButtonClass, "absolute right-2.5 top-1/2 h-7 w-7 -translate-y-1/2")}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Contenido Principal (Estado Vacío / Lista) ────────────────────── */}
      {displayedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-200">
          {/* Ilustración 3D de la caja y camiseta */}
          <ReturnsEmptyIllustration />

          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            {filter === "active"
              ? "No tienes devoluciones en curso"
              : searchQuery
                ? "No se encontraron solicitudes con esa búsqueda"
                : "Sin solicitudes en el historial"}
          </h2>
          <p className="mt-1.5 max-w-md text-xs text-slate-500 sm:text-sm">
            {filter === "active"
              ? "Cuando inicies una solicitud, aquí podrás consultar su estado y los próximos pasos."
              : searchQuery
                ? "Intenta con otro número de pedido o restablece el filtro para ver los registros."
                : "Las devoluciones y garantías que hayas tramitado anteriormente se guardarán aquí."}
          </p>

          {/* Botón Consultar pedidos -> */}
          <Link
            to="/account/orders"
            className="mt-6 inline-flex items-center gap-2 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            style={{ borderRadius: 5 }}
          >
            <span>Consultar pedidos</span>
          </Link>
        </div>
      ) : (
        /* Lista de Solicitudes (para Historial o búsqueda) */
        <div
          className="overflow-hidden border border-slate-200 bg-white divide-y divide-slate-100"
          style={{ borderRadius: 5 }}
          role="list"
          aria-label="Listado de devoluciones"
        >
          {displayedItems.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className="flex items-start justify-between gap-3 p-4 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Icono monocromático gris neutro */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-500"
                  style={{ borderRadius: 5 }}
                  aria-hidden="true"
                >
                  <Package className="h-4 w-4" strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <div className="space-y-0.5">
                      <h3 className="text-[13px] font-semibold text-slate-900">
                        {item.orderNumber}
                      </h3>
                      <p className="text-[12px] text-slate-600">{item.productName}</p>
                    </div>
                    {/* Estado semántico discreto: ● Resuelta */}
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item.statusLabel}
                    </span>
                  </div>

                  <p className="mt-1 text-[12.5px] text-slate-500">
                    <span className="font-medium text-slate-600">Motivo:</span>{" "}
                    {item.reason}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>Solicitado el {item.date}</span>
                  </div>
                </div>
              </div>

              {/* Menú de acciones */}
              <div className="ml-2 shrink-0 pt-0.5">
                <ReturnActionsMenu
                  item={item}
                  onViewOrder={() => navigate("/account/orders")}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bloque Informativo de 3 Pasos (Idéntico a la imagen aprobada) ─ */}
      <div
        className="grid grid-cols-1 divide-y divide-slate-100 border border-slate-200 bg-white md:grid-cols-3 md:divide-x md:divide-y-0"
        style={{ borderRadius: 5 }}
      >
        {/* Paso 1 */}
        <Link
          to="/account/orders"
          className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-slate-500"
              style={{ borderRadius: 5 }}
              aria-hidden="true"
            >
              <FileText className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                Selecciona el pedido
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                Elige el pedido desde tu historial para iniciar la solicitud.
              </p>
            </div>
          </div>
        </Link>

        {/* Paso 2 */}
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-slate-500"
              style={{ borderRadius: 5 }}
              aria-hidden="true"
            >
              <Package className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-900">
                Indica el motivo
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                Cuéntanos el motivo de la devolución.
              </p>
            </div>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="flex items-center justify-between p-4 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-slate-500"
              style={{ borderRadius: 5 }}
              aria-hidden="true"
            >
              <Truck className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-slate-900">
                Consulta el seguimiento
              </h4>
              <p className="mt-0.5 text-[11px] text-slate-500 leading-tight">
                Aquí podrás ver el estado de tu solicitud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerReturnsPage;
