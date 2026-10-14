import * as React from "react";
import { createPortal } from "react-dom";
import {
  Clock3,
  Download,
  Eye,
  FileText,
  MapPin,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";
import hoodieImage from "@/resources/mockup/hoddie.png";
import shirtImage from "@/resources/mockup/t-shirt-mockup.png";
import toteImage from "@/resources/landing_principal/images/shopping-bag-standard-fitted.png";
import capImage from "@/resources/mockup/gorra.png";

interface DemoOrder {
  id: string;
  product: string;
  details: string[];
  images: string[];
  date: string;
  status: "En proceso" | "Entregado" | "Cancelado";
  statusKey: "processing" | "delivered" | "cancelled";
  total: string;
  subtotal: string;
  shipping: string;
  address: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const orderStatusTabs = [
  { id: "all", label: "Todos" },
  { id: "processing", label: "En proceso" },
  { id: "delivered", label: "Entregados" },
  { id: "cancelled", label: "Cancelados" },
] as const;

const demoOrders: DemoOrder[] = [
  {
    id: "ORD-2026-894",
    product: "Sudadera Capucha Unisex",
    images: [hoodieImage],
    details: ["Talla L", "Azul Marino", "3 unidades", "DTG Premium"],
    date: "10 Feb, 2026",
    status: "En proceso",
    statusKey: "processing",
    total: "$ 185.000",
    subtotal: "$ 170.000",
    shipping: "$ 15.000",
    address: "Calle Serrano 45, 3º Izq, 28001 Madrid",
    carrier: "Envia Express",
    trackingNumber: "ENV-994821034",
    estimatedDelivery: "14 Feb, 2026",
  },
  {
    id: "ORD-2026-871",
    product: "Camiseta Algodón Orgánico 180g",
    images: [shirtImage],
    details: ["Talla M", "Blanco Óptico", "15 unidades", "Serigrafía 2 tintas"],
    date: "02 Feb, 2026",
    status: "Entregado",
    statusKey: "delivered",
    total: "$ 240.000",
    subtotal: "$ 225.000",
    shipping: "$ 15.000",
    address: "Calle Serrano 45, 3º Izq, 28001 Madrid",
    carrier: "Coordinadora",
    trackingNumber: "COO-441029482",
    estimatedDelivery: "06 Feb, 2026",
  },
  {
    id: "ORD-2026-850",
    product: "Tote Bag Lona Reforzada 320g",
    images: [toteImage],
    details: ["Color Crudo", "50 unidades", "Impresión Digital"],
    date: "15 Ene, 2026",
    status: "Entregado",
    statusKey: "delivered",
    total: "$ 450.000",
    subtotal: "$ 430.000",
    shipping: "$ 20.000",
    address: "Calle Serrano 45, 3º Izq, 28001 Madrid",
    carrier: "Servientrega",
    trackingNumber: "SER-881920311",
    estimatedDelivery: "19 Ene, 2026",
  },
  {
    id: "ORD-2026-812",
    product: "Gorra Trucker 5 Paneles",
    images: [capImage],
    details: ["Negro/Blanco", "1 unidad", "Bordado Frontal 3D"],
    date: "28 Ago, 2026",
    status: "Cancelado",
    statusKey: "cancelled",
    total: "$ 58.500",
    subtotal: "$ 49.500",
    shipping: "$ 9.000",
    address: "Calle Serrano 45, 3º Izq, 28001 Madrid",
  },
];

// ── Menú de Tres Puntos para la Columna Acciones ──────────────────────────────
function OrderActionsMenu({
  order,
  onAction,
}: {
  order: DemoOrder;
  onAction: (type: "detail" | "tracking" | "receipt") => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0, openUp: false });

  const updateMenuPosition = React.useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const menuWidth = 185;
    const estimatedMenuHeight = 150;
    const openUp = rect.bottom + estimatedMenuHeight > window.innerHeight && rect.top > estimatedMenuHeight;
    setMenuPosition({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8),
      openUp,
    });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    updateMenuPosition();
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={cn(
          customerIconButtonClass,
          "h-7 w-7 text-slate-400",
          open && "bg-slate-100 text-slate-800",
        )}
        aria-label={`Acciones para el pedido ${order.id}`}
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[80] min-w-[185px] border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            borderRadius: 5,
            transform: menuPosition.openUp ? "translateY(-100%)" : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAction("detail");
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Ver detalles</span>
          </button>

          {order.statusKey === "processing" && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAction("tracking");
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Truck className="h-3.5 w-3.5 text-slate-400" />
              <span>Rastrear paquete</span>
            </button>
          )}

          {order.statusKey === "delivered" && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAction("receipt");
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Descargar comprobante</span>
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

export function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<DemoOrder | null>(null);
  const [activeModalType, setActiveModalType] = React.useState<"detail" | "tracking" | "receipt" | null>(null);

  const filteredOrders = React.useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return demoOrders.filter((order) => {
      const matchesTab = activeTab === "all" || order.statusKey === activeTab;
      const matchesSearch =
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.product.toLowerCase().includes(term);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const openOrderAction = (order: DemoOrder, type: "detail" | "tracking" | "receipt") => {
    setSelectedOrder(order);
    setActiveModalType(type);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setActiveModalType(null);
  };

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* ── Encabezado ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Mis pedidos
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Consulta el estado de producción de tus prendas, comprobantes y números de seguimiento.
          </p>
        </div>
      </div>

      {/* ── Filtros y Buscador Unificados ─────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5 bg-slate-100 p-1 border border-slate-200/60"
          style={{ borderRadius: 5 }}
          role="tablist"
          aria-label="Filtro de pedidos"
        >
          {orderStatusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-h-8 px-3.5 text-xs font-semibold transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900",
              )}
              style={{ borderRadius: 5 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por ID o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[42px] w-full border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            style={{ borderRadius: 5 }}
          />
        </div>
      </div>

      {/* ── Tabla de Pedidos ──────────────────────────────────────────────── */}
      <div
        className="overflow-hidden border border-slate-200 bg-white shadow-xs"
        style={{ borderRadius: 5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                <th className="w-[14%] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">
                  Nº Pedido
                </th>
                <th className="w-[30%] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">
                  Producto / Artículos
                </th>
                <th className="w-[14%] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">
                  Fecha
                </th>
                <th className="w-[16%] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider">
                  Estado
                </th>
                <th className="w-[14%] px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                  Total
                </th>
                <th className="w-[12%] px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <button
                      type="button"
                      onClick={() => openOrderAction(order, "detail")}
                      className="hover:text-slate-600 transition-colors hover:underline text-left"
                    >
                      {order.id}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex shrink-0 items-center gap-1" aria-label={`Imágenes de ${order.product}`}>
                        {order.images.slice(0, 3).map((image, index) => (
                          <img
                            key={`${order.id}-image-${index}`}
                            src={image}
                            alt={`${order.product} ${index + 1}`}
                            className="h-9 w-9 border border-slate-200 bg-slate-50 object-contain p-0.5"
                            style={{ borderRadius: 5 }}
                          />
                        ))}
                        {order.images.length === 0 && (
                          <span
                            className="flex h-9 w-9 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400"
                            style={{ borderRadius: 5 }}
                            aria-label="Imagen no disponible"
                          >
                            <Package className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{order.product}</p>
                        <div className="space-y-0.5 text-[10.5px] text-slate-400">
                          {order.details.map((detail) => (
                            <span key={detail} className="block truncate">{detail}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{order.date}</td>
                  {/* Estado refinado: ● Punto + Texto (sin cápsula de color) */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-700">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          order.statusKey === "processing" && "bg-sky-500",
                          order.statusKey === "delivered" && "bg-emerald-500",
                          order.statusKey === "cancelled" && "bg-rose-500",
                        )}
                        aria-hidden="true"
                      />
                      <span>{order.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">{order.total}</td>
                  {/* Columna Acciones con Menú Contextual de Tres Puntos */}
                  <td className="px-4 py-3.5 text-right">
                    <OrderActionsMenu
                      order={order}
                      onAction={(type) => openOrderAction(order, type)}
                    />
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">
                    <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    No hay pedidos que coincidan con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Interactivo de Acciones de Pedido ──────────────────────── */}
      {selectedOrder && activeModalType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
            style={{ borderRadius: 5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pedido #{selectedOrder.id}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModalType === "detail" && "Detalles de la compra"}
                  {activeModalType === "tracking" && "Seguimiento logístico"}
                  {activeModalType === "receipt" && "Comprobante de compra"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar modal"
                className={cn(customerIconButtonClass, "h-8 w-8")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido según tipo de acción */}
            <div className="mt-4 space-y-4 text-xs">
              {activeModalType === "detail" && (
                <>
                  <div
                    className="bg-slate-50 p-3.5 space-y-2 border border-slate-200/60"
                    style={{ borderRadius: 5 }}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">{selectedOrder.product}</span>
                      <span className="font-bold text-slate-900">{selectedOrder.subtotal}</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      {selectedOrder.details.map((detail) => (
                        <p key={detail}>{detail}</p>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between text-slate-500">
                      <span>Envío</span>
                      <span>{selectedOrder.shipping}</span>
                    </div>
                    <div className="pt-1 flex justify-between font-bold text-slate-900 text-sm">
                      <span>Total abonado</span>
                      <span className="text-slate-900">{selectedOrder.total}</span>
                    </div>
                  </div>

                  <div
                    className="border border-slate-200 p-3.5"
                    style={{ borderRadius: 5 }}
                  >
                    <p className="font-semibold text-slate-800">Dirección de entrega</p>
                    <p className="mt-1 text-slate-500">{selectedOrder.address}</p>
                  </div>
                </>
              )}

              {activeModalType === "tracking" && (
                <div className="space-y-4">
                  <div
                    className="bg-slate-50 border border-slate-200 p-3.5 text-slate-800"
                    style={{ borderRadius: 5 }}
                  >
                    <p className="font-bold">Transportista: {selectedOrder.carrier}</p>
                    <p className="text-[11px] mt-0.5 text-slate-600">Guía de rastreo: <span className="font-mono font-semibold text-slate-800">{selectedOrder.trackingNumber}</span></p>
                    <p className="text-[11px] mt-1 text-slate-600">Estimación de entrega: {selectedOrder.estimatedDelivery}</p>
                  </div>

                  <div className="space-y-2.5 pl-2 border-l-2 border-slate-300 ml-2">
                    <div className="relative pl-3">
                      <span className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-slate-900" />
                      <p className="font-bold text-slate-900">En centro logístico y distribución</p>
                      <p className="flex flex-col text-[10px] text-slate-400">
                        <span>Hoy</span>
                        <span>09:30 AM</span>
                      </p>
                    </div>
                    <div className="relative pl-3">
                      <span className="absolute -left-[19px] top-1 h-3 w-3 rounded-full bg-slate-400" />
                      <p className="font-medium text-slate-600">Salida de fábrica textil PrintShop</p>
                      <p className="flex flex-col text-[10px] text-slate-400">
                        <span>Ayer</span>
                        <span>17:45 PM</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModalType === "receipt" && (
                <div
                  className="border border-slate-200 p-4 bg-slate-50/50 space-y-3"
                  style={{ borderRadius: 5 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">PrintShop S.A.S.</p>
                      <p className="text-[10px] text-slate-400">Factura simplificada #{selectedOrder.id}-REC</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Pagado
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-500 pt-2 border-t border-slate-200">
                    <p>Fecha de emisión: {selectedOrder.date}</p>
                    <p>Total facturado: <span className="font-bold text-slate-900">{selectedOrder.total}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Descargando comprobante oficial para ${selectedOrder.id}`);
                      closeModal();
                    }}
                    className="w-full mt-2 inline-flex h-8 items-center justify-center gap-2 bg-slate-900 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                    style={{ borderRadius: 5 }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pie de modal */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="h-8 border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                style={{ borderRadius: 5 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerOrdersPage;
