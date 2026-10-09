import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ShoppingBag,
  Download,
  Filter,
  Search,
  ChevronDown,
  UserRound,
  Store,
  CalendarDays,
  MoreHorizontal,
  Eye,
  FileText,
  CreditCard,
  MapPin,
  History,
  FileDown,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown";
import { PageHeader } from "@/shared/ui/page-header";

/* ── Tipos ─────────────────────────────────────────────────────── */
interface OrderProduct {
  name: string;
  qty: number;
  unitPrice: string;
  subtotal: string;
  image: string;
}

interface Order {
  id: string;
  customer: string;
  customerEmail: string;
  customerPhone: string;
  store: string;
  storeBanner: string;
  date: string;
  time: string;
  total: string;
  status: "Pendiente" | "En producción" | "Enviado" | "Entregado" | "Cancelado";
  paymentStatus: "Pendiente" | "Pagado" | "Reembolsado";
  paymentMethod: string;
  products: OrderProduct[];
}

/* ── Datos Mock Enriquecidos ───────────────────────────────────── */
const mockOrdersDetail: Order[] = [
  {
    id: "#ORD-10254",
    customer: "Carlos Pérez",
    customerEmail: "carlos.perez@email.com",
    customerPhone: "(321) 456-7890",
    store: "Creative Print Store",
    storeBanner:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    date: "02 May, 2026",
    time: "10:42 AM",
    total: "$189.900",
    status: "En producción",
    paymentStatus: "Pagado",
    paymentMethod: "Transferencia bancaria",
    products: [
      {
        name: "Tarjetas de presentación",
        qty: 2,
        unitPrice: "$25.000",
        subtotal: "$50.000",
        image:
          "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Diseño personalizado",
        qty: 1,
        unitPrice: "$40.000",
        subtotal: "$40.000",
        image:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Volantes publicitarios",
        qty: 1,
        unitPrice: "$30.900",
        subtotal: "$30.900",
        image:
          "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Sticker redondo",
        qty: 3,
        unitPrice: "$3.000",
        subtotal: "$9.000",
        image:
          "https://images.unsplash.com/photo-1600429863137-0b0a04c7dedd?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Sobre personalizado",
        qty: 2,
        unitPrice: "$15.000",
        subtotal: "$30.000",
        image:
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Bolsa ecológica",
        qty: 1,
        unitPrice: "$30.000",
        subtotal: "$30.000",
        image:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=80&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "#ORD-10253",
    customer: "María González",
    customerEmail: "maria.gonzalez@email.com",
    customerPhone: "(320) 654-3210",
    store: "Urban Style Prints",
    storeBanner:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    date: "02 May, 2026",
    time: "09:15 AM",
    total: "$99.800",
    status: "Pendiente",
    paymentStatus: "Pendiente",
    paymentMethod: "PSE Bancolombia",
    products: [
      {
        name: "Camisetas personalizadas",
        qty: 2,
        unitPrice: "$45.000",
        subtotal: "$90.000",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Stickers troquelados",
        qty: 1,
        unitPrice: "$9.800",
        subtotal: "$9.800",
        image:
          "https://images.unsplash.com/photo-1600429863137-0b0a04c7dedd?w=80&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "#ORD-10252",
    customer: "Juan Ramírez",
    customerEmail: "juan.ramirez@email.com",
    customerPhone: "(315) 987-6543",
    store: "Print House CO",
    storeBanner:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
    date: "01 May, 2026",
    time: "04:30 PM",
    total: "$259.900",
    status: "Enviado",
    paymentStatus: "Pagado",
    paymentMethod: "Tarjeta •••• 4242",
    products: [
      {
        name: "Banners 80x200",
        qty: 1,
        unitPrice: "$75.000",
        subtotal: "$75.000",
        image:
          "https://images.unsplash.com/photo-1559234935-bf74c048aef6?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Afiche A3",
        qty: 2,
        unitPrice: "$40.000",
        subtotal: "$80.000",
        image:
          "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Tarjetas de presentación",
        qty: 2,
        unitPrice: "$25.000",
        subtotal: "$50.000",
        image:
          "https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Carpeta institucional",
        qty: 1,
        unitPrice: "$35.000",
        subtotal: "$35.000",
        image:
          "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Membrete con logo",
        qty: 1,
        unitPrice: "$19.900",
        subtotal: "$19.900",
        image:
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=80&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "#ORD-10251",
    customer: "Laura Martínez",
    customerEmail: "laura.martinez@email.com",
    customerPhone: "(316) 789-0123",
    store: "Color Express",
    storeBanner:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&auto=format&fit=crop&q=80",
    date: "01 May, 2026",
    time: "11:05 AM",
    total: "$149.900",
    status: "Entregado",
    paymentStatus: "Pagado",
    paymentMethod: "Mastercard •••• 8888",
    products: [
      {
        name: "Catálogos impresos",
        qty: 1,
        unitPrice: "$60.000",
        subtotal: "$60.000",
        image:
          "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Flyers DL",
        qty: 2,
        unitPrice: "$40.000",
        subtotal: "$80.000",
        image:
          "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Separadores",
        qty: 1,
        unitPrice: "$9.900",
        subtotal: "$9.900",
        image:
          "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=80&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "#ORD-10250",
    customer: "Andrés López",
    customerEmail: "andres.lopez@email.com",
    customerPhone: "(317) 456-8901",
    store: "Creative Print Store",
    storeBanner:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
    date: "30 Abr, 2026",
    time: "03:20 PM",
    total: "$49.900",
    status: "Cancelado",
    paymentStatus: "Reembolsado",
    paymentMethod: "Nequi •••• 2345",
    products: [
      {
        name: "Caja personalizada",
        qty: 1,
        unitPrice: "$49.900",
        subtotal: "$49.900",
        image:
          "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=80&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "#ORD-10249",
    customer: "Sofia Herrera",
    customerEmail: "sofia.herrera@email.com",
    customerPhone: "(318) 234-5678",
    store: "Urban Style Prints",
    storeBanner:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    date: "30 Abr, 2026",
    time: "02:10 PM",
    total: "$89.900",
    status: "Pendiente",
    paymentStatus: "Pendiente",
    paymentMethod: "PSE Davivienda",
    products: [
      {
        name: "Etiquetas adhesivas",
        qty: 2,
        unitPrice: "$28.000",
        subtotal: "$56.000",
        image:
          "https://images.unsplash.com/photo-1600429863137-0b0a04c7dedd?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Stickers",
        qty: 1,
        unitPrice: "$18.900",
        subtotal: "$18.900",
        image:
          "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&auto=format&fit=crop&q=80",
      },
      {
        name: "Empaque kraft",
        qty: 1,
        unitPrice: "$34.900",
        subtotal: "$34.900",
        image:
          "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=80&auto=format&fit=crop&q=80",
      },
    ],
  },
];

/* ── Sub-Componente: Imagen de Producto con Fallback ──────────── */
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = React.useState(false);

  return error || !src ? (
    <div
      className="h-9 w-9 rounded-[5px] shrink-0 border border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-center overflow-hidden"
      title={alt}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  ) : (
    <div className="h-9 w-9 rounded-[5px] shrink-0 border border-[var(--border)] overflow-hidden bg-[var(--surface-muted)]">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

/* ── Componente Principal ──────────────────────────────────────── */
export default function Orders() {
  const outletContext = useOutletContext<{ sidebarCollapsed?: boolean }>();
  const isSidebarCollapsed = outletContext?.sidebarCollapsed ?? false;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [paymentFilter, setPaymentFilter] = useState("Todos");
  const [perPage, setPerPage] = useState("12");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [exportNotice, setExportNotice] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2000);
  };

  const filtered = mockOrdersDetail.filter((o) => {
    const term = search.toLowerCase();
    const matchSearch =
      o.id.toLowerCase().includes(term) ||
      o.customer.toLowerCase().includes(term) ||
      o.store.toLowerCase().includes(term);
    const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
    const matchPayment =
      paymentFilter === "Todos" || o.paymentStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const isPanelOpen = selectedOrder !== null;

  /* ── Tarjetas Visibles: Oculta la tarjeta del pedido seleccionado si el panel está abierto ── */
  const visibleOrders = isPanelOpen
    ? filtered.filter((order) => order.id !== selectedOrder.id)
    : filtered;

  /*
   * ── Matriz de Columnas Dinámica según Sidebar y Panel de Detalles ──────────
   * SIDEBAR VISIBLE:
   *   - Sin detalles: 3 columnas
   *   - Con detalles: 2 columnas (+ 1 columna del panel)
   * SIDEBAR OCULTO / COLAPSADO:
   *   - Sin detalles: 4 columnas
   *   - Con detalles: 3 columnas (+ 1 columna del panel)
   */
  let gridColsClass = "";
  if (!isSidebarCollapsed) {
    // Sidebar Visible
    gridColsClass = isPanelOpen
      ? "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";
  } else {
    // Sidebar Colapsado / Oculto
    gridColsClass = isPanelOpen
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4";
  }

  const gridClass = `grid ${gridColsClass} gap-4 transition-all duration-300`;

  return (
    <div className="p-3.5 sm:p-4 space-y-4 bg-[var(--background)] min-h-full">
      {/* ── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Pedidos"
        description="Consulta y audita todos los pedidos de las tiendas de la plataforma."
        icon={ShoppingBag}
        action={
          <>
            <button
              type="button"
              onClick={() => {
                setExportNotice(true);
                setTimeout(() => setExportNotice(false), 2000);
              }}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-[5px] px-3 py-1.5 bg-white hover:bg-[var(--surface-muted)] transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              {exportNotice ? "Exportando..." : "Exportar"}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] border border-[var(--border-strong)] rounded-[5px] px-3 py-1.5 bg-[var(--info-muted)] hover:bg-[var(--info-muted)] transition-colors"
            >
              <Filter className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>Filtros</span>
            </button>
          </>
        }
      />

      {/* ── Barra de Búsqueda y Filtros ────────────────────────── */}
      <div className="bg-white rounded-[5px] border border-[var(--border)] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido, cliente o tienda..."
            className="w-full h-9 pl-9 pr-3.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-white border border-[var(--border)] rounded-[5px] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_rgba(37,99,235,0.08)] shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative inline-flex items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[var(--border)] bg-white pl-3.5 pr-8 text-xs font-medium text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)] shadow-2xs"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En producción">En producción</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
          </div>

          <div className="relative inline-flex items-center">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[var(--border)] bg-white pl-3.5 pr-8 text-xs font-medium text-[var(--text-secondary)] outline-none transition-all appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)] shadow-2xs"
            >
              <option value="Todos">Todos los pagos</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Reembolsado">Reembolsado</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
          </div>

          <button
            type="button"
            className="flex h-9 items-center gap-1.5 rounded-[5px] border border-[var(--border)] bg-white px-3.5 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors"
          >
            <Filter className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* ── Layout principal (Grid + Panel Lateral) ─────────────── */}
      <div className="flex gap-4 items-stretch">
        {/* ── Área de Tarjetas ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4 flex flex-col justify-between">
          {/* Grid de Tarjetas */}
          <div className={gridClass}>
            {visibleOrders.map((order) => {
              const preview = order.products.slice(0, 3);
              const extra = order.products.length - 3;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[5px] border border-[var(--border)] shadow-2xs hover:border-[var(--border-strong)] hover:shadow-xs transition-all duration-200 flex flex-col"
                >
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Encabezado: ID + menú */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[14px] font-bold text-[var(--text-primary)] leading-tight">
                          {order.id}
                        </h3>
                        <p className="text-[12px] font-bold text-[var(--text-primary)] mt-0.5">
                          {order.status}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="h-7 w-7 -mr-0.5 flex items-center justify-center rounded-[5px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors focus:outline-none shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[185px] rounded-[5px] p-1 shadow-md border border-[var(--border)] bg-white z-50"
                        >
                          <DropdownMenuItem
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded-[5px] hover:bg-[var(--surface-muted)] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            <span>Ver detalles</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => showNotice("Abriendo factura...")}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            <span>Ver factura</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => showNotice("Abriendo pago...")}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            <span>Ver pago</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              showNotice("Abriendo seguimiento...")
                            }
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                          >
                            <MapPin className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            <span>Ver seguimiento</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => showNotice("Abriendo historial...")}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                          >
                            <History className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            <span>Ver historial</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => showNotice("Exportando PDF...")}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-[var(--text-secondary)] rounded hover:bg-[var(--surface-muted)] cursor-pointer"
                          >
                            <FileDown className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            <span>Exportar PDF</span>
                          </DropdownMenuItem>
                          <div className="my-1 border-t border-[var(--surface-muted)]" />
                          <DropdownMenuItem
                            onClick={() => showNotice("Incidencia reportada")}
                            className="flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-red-600 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                            <span>Reportar incidencia</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Info: Cliente, Tienda, Fecha */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-[12px]">
                        <UserRound className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="font-medium text-[var(--text-secondary)] truncate">
                          {order.customer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px]">
                        <Store className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="text-[var(--text-secondary)] truncate">
                          {order.store}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px]">
                        <CalendarDays className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="text-[var(--text-secondary)] truncate">
                          Registrado el {order.date} - {order.time}
                        </span>
                      </div>
                    </div>

                    {/* Separador */}
                    <div className="border-t border-[var(--surface-muted)] my-2" />

                    {/* Productos — máximo 3 con contenedor circular */}
                    <div className="space-y-2 flex-1">
                      {preview.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <ProductImage src={p.image} alt={p.name} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11.5px] font-medium text-[var(--text-secondary)] truncate leading-tight">
                              {p.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-[11.5px]">
                            <span className="text-[var(--text-muted)]">x{p.qty}</span>
                            <span className="font-semibold text-[var(--text-primary)]">
                              {p.unitPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                      {extra > 0 && (
                        <p className="text-[11px] text-[var(--text-muted)] pl-11">
                          +{extra} producto{extra > 1 ? "s" : ""} más
                        </p>
                      )}
                    </div>

                    {/* Separador + Total */}
                    <div className="border-t border-[var(--surface-muted)] mt-3 pt-3 flex items-center justify-between">
                      <span className="text-[12px] text-[var(--text-secondary)] font-medium">
                        Total
                      </span>
                      <span className="text-[13px] font-bold text-[var(--text-primary)]">
                        {order.total}
                      </span>
                    </div>
                  </div>

                  {/* Botón Ver Detalles */}
                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="w-full h-8 rounded-[5px] border border-[var(--primary)] text-xs font-semibold text-[var(--primary)] bg-white hover:bg-[var(--info-muted)] transition-colors cursor-pointer shadow-2xs"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleOrders.length === 0 && (
            <div className="bg-white rounded-[5px] border border-[var(--border)] p-12 text-center text-[var(--text-secondary)]">
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          )}

          {/* ── Paginación ──────────────────────────────────────── */}
          <div className="bg-white rounded-[5px] border border-[var(--border)] p-3 px-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 mt-4">
            <p className="shrink-0 text-xs text-[var(--text-secondary)]">
              Mostrando <span className="font-semibold text-[var(--text-primary)]">1</span>{" "}
              a{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {Math.min(Number(perPage), filtered.length || 12)}
              </span>{" "}
              de <span className="font-semibold text-[var(--text-primary)]">248</span>{" "}
              pedidos
            </p>

            <div className="flex max-w-full shrink-0 items-center gap-2 overflow-x-auto">
              <button
                type="button"
                className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs"
              >
                «
              </button>
              <button
                type="button"
                className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs"
              >
                ‹
              </button>
              <button
                type="button"
                className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold shadow-2xs"
              >
                1
              </button>
              {[2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors"
                >
                  {p}
                </button>
              ))}
              <span className="h-[34px] w-7 min-w-7 shrink-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
                ...
              </span>
              <button
                type="button"
                className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center text-xs font-medium transition-colors"
              >
                21
              </button>
              <button
                type="button"
                className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs"
              >
                ›
              </button>
              <button
                type="button"
                className="h-[34px] w-[34px] min-w-[34px] shrink-0 rounded-[5px] border border-[var(--border)] bg-white flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors text-xs"
              >
                »
              </button>
            </div>

            <div className="relative shrink-0">
              <select
                value={perPage}
                onChange={(e) => setPerPage(e.target.value)}
                className="h-[34px] min-w-[132px] rounded-[5px] border border-[var(--border)] bg-white pl-3 pr-8 text-xs text-[var(--text-secondary)] outline-none appearance-none cursor-pointer hover:border-[var(--border-strong)] focus:border-[var(--primary)] shadow-2xs"
              >
                <option value="12">12 por página</option>
                <option value="24">24 por página</option>
                <option value="48">48 por página</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)]" />
            </div>
          </div>
        </div>

        {/* ── Panel Lateral de Detalles ─────────────────────────── */}
        <div
          className={`
            shrink-0 transition-all duration-300 ease-in-out overflow-hidden self-stretch
            ${isPanelOpen ? "w-[340px] xl:w-[380px] opacity-100" : "w-0 opacity-0 pointer-events-none"}
          `}
        >
          {selectedOrder && (
            <div className="bg-white rounded-[5px] border border-[var(--border)] shadow-xs w-[340px] xl:w-[380px] flex flex-col h-full overflow-hidden">
              {/* Encabezado del Panel */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[var(--text-primary)]">
                    Detalle del pedido
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="h-7 w-7 rounded-[4px] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Contenido Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Imagen del Banner de la Tienda */}
                <div className="h-36 w-full bg-[var(--surface-muted)] shrink-0">
                  <img
                    src={selectedOrder.storeBanner}
                    alt={selectedOrder.store}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-4">
                  {/* ID del Pedido + Fecha + Tienda */}
                  <div>
                    <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                      {selectedOrder.id}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Registrado el {selectedOrder.date} - {selectedOrder.time}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Store className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" />
                      <p className="text-xs font-semibold text-[var(--text-secondary)]">
                        {selectedOrder.store}
                      </p>
                    </div>
                  </div>

                  {/* Información del Pedido */}
                  <div>
                    <h5 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2.5">
                      Información del Pedido
                    </h5>
                    <div className="bg-[var(--surface-muted)] rounded-[5px] border border-[var(--border)] divide-y divide-[var(--border-muted)] text-xs">
                      {[
                        { label: "Cliente", value: selectedOrder.customer },
                        { label: "Correo", value: selectedOrder.customerEmail },
                        {
                          label: "Teléfono",
                          value: selectedOrder.customerPhone,
                        },
                        { label: "Estado", value: selectedOrder.status },
                        { label: "Pago", value: selectedOrder.paymentStatus },
                        {
                          label: "Método de pago",
                          value: selectedOrder.paymentMethod,
                        },
                        { label: "Total", value: selectedOrder.total },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex items-start justify-between px-3 py-2 gap-3"
                        >
                          <span className="text-[var(--text-secondary)] shrink-0">
                            {label}
                          </span>
                          <span className="font-normal text-[var(--text-primary)] text-right">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Productos del Pedido */}
                  <div>
                    <h5 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wide mb-2.5">
                      Productos del Pedido
                    </h5>

                    {/* Cabecera de la tabla */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 pb-1.5 border-b border-[var(--border)]">
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Producto
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-center">
                        Cant.
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">
                        P. Unit.
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">
                        Subtotal
                      </span>
                    </div>

                    {/* Filas de productos */}
                    <div className="divide-y divide-[var(--surface-muted)]">
                      {selectedOrder.products.map((p, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center py-2 px-2"
                        >
                          <span className="text-xs text-[var(--text-secondary)] font-normal truncate">
                            {p.name}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-normal text-center w-8">
                            {p.qty}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] font-normal text-right whitespace-nowrap">
                            {p.unitPrice}
                          </span>
                          <span className="text-xs font-normal text-[var(--text-primary)] text-right whitespace-nowrap">
                            {p.subtotal}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total del pedido */}
                    <div className="flex items-center justify-between px-2 pt-2.5 mt-2 border-t border-[var(--border)]">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        Total del Pedido
                      </span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {selectedOrder.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones del Panel */}
              <div className="shrink-0 border-t border-[var(--border)] p-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => showNotice("Abriendo factura...")}
                  className="flex-1 h-8 rounded-[5px] border border-[var(--border)] bg-white text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileText className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  <span>Ver factura</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 h-8 rounded-[5px] bg-[var(--primary)] text-xs font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors cursor-pointer shadow-2xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notificación Flotante */}
      {notice && (
        <div className="fixed bottom-5 right-5 z-50 bg-[var(--text-primary)] text-white text-xs px-3.5 py-2 rounded-[5px] shadow-lg flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[var(--primary)]" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
