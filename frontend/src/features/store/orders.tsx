import * as React from "react";
import { createPortal } from "react-dom";
import {
  ShoppingBag,
  Search,
  Download,
  Eye,
  MapPin,
  X,
  Truck,
  Package,
  Wrench,
  CheckCircle2,
  ArrowRight,
  FileText,
  ZoomIn,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import StatusDot from "./StatusDot";
import UserAvatar from "./UserAvatar";
import {
  StoreOrderFull,
  OrderFilterOption,
  OrderActionDefinition,
  OrderActionType,
  OrderItemSnapshot,
  Shipment,
} from "./orders/types";
import { initialMockOrders } from "./orders/mockData";
import {
  isTransitionAllowed,
  executeOrderAction,
  getMainDisplayStatus,
  getAvailableOrderActions,
  ActionPayload,
} from "./orders/stateMachine";
import {
  getOrderActionAvailability,
  getAggregatedShippingStatus,
} from "./orders/orderActions";
import { OrderActionModal } from "./orders/OrderActionModal";
// ShipmentTrackingModal removed: tracking opens external carrier URL directly
import { OrderItemDetailModal } from "./orders/OrderItemDetailModal";
import { PaymentSummaryPanel } from "./orders/PaymentSummaryPanel";
import { StoreReliabilityCard } from "./orders/StoreReliabilityCard";
import { OrderActionsMenu } from "./orders/OrderActionsMenu";
import { ImagePreviewModal } from "./orders/ImagePreviewModal";

// Re-export types for external consumers
export type { StoreOrderFull, OrderFilterOption, OrderActionType };

export default function StoreOrders() {
  const [orders, setOrders] =
    React.useState<StoreOrderFull[]>(initialMockOrders);
  const [statusFilter, setStatusFilter] =
    React.useState<OrderFilterOption>("Todos");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedOrder, setSelectedOrder] =
    React.useState<StoreOrderFull | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] =
    React.useState<OrderItemSnapshot | null>(null);

  // Modal de acción contextual
  const [isActionModalOpen, setIsActionModalOpen] = React.useState(false);
  const [actionTargetOrder, setActionTargetOrder] =
    React.useState<StoreOrderFull | null>(null);
  const [currentAction, setCurrentAction] =
    React.useState<OrderActionDefinition | null>(null);

  // Previsualización de imágenes desde el detalle o timeline (z-[120])
  const [detailPreviewImageUrl, setDetailPreviewImageUrl] =
    React.useState<string | null>(null);
  const [detailPreviewImageTitle, setDetailPreviewImageTitle] =
    React.useState<string | undefined>(undefined);

  // Rastreo: abre URL externa de la transportadora directamente

  // Toast de retroalimentación
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sincronizar el pedido seleccionado cuando cambie la lista de pedidos
  React.useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find((o) => o.id === selectedOrder.id);
      if (refreshed) {
        setSelectedOrder(refreshed);
      }
    }
  }, [orders]);
  // Bloquear scroll del body cuando el modal de detalle esté abierto
  React.useEffect(() => {
    if (!selectedOrder) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedOrder]);

  // Manejador de teclado para cerrar el modal con Escape
  React.useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedOrderItem) {
          setSelectedOrderItem(null);
        } else {
          setSelectedOrder(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOrder, selectedOrderItem]);

  // Estadísticas para las cards de KPIs calculadas desde el nuevo modelo multidimensional
  const stats = React.useMemo(() => {
    return {
      total: orders.length,
      pendientes: orders.filter((o) => {
        const cat = getMainDisplayStatus(o).category;
        return cat === "Pendiente";
      }).length,
      produccion: orders.filter((o) => {
        const cat = getMainDisplayStatus(o).category;
        return cat === "En producción";
      }).length,
      enviados: orders.filter((o) => {
        const cat = getMainDisplayStatus(o).category;
        return cat === "Enviado";
      }).length,
      entregados: orders.filter((o) => {
        const cat = getMainDisplayStatus(o).category;
        return cat === "Entregado";
      }).length,
      cancelados: orders.filter((o) => o.orderStatus === "CANCELLED").length,
    };
  }, [orders]);

  // Filtrado de pedidos
  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      const display = getMainDisplayStatus(order);
      let matchFilter = true;

      if (statusFilter !== "Todos") {
        if (statusFilter === "Cancelados") {
          matchFilter = order.orderStatus === "CANCELLED";
        } else {
          // Map plural filter options to singular categories
          const filterCategoryMap: Record<string, string> = {
            Pendientes: "Pendiente",
            "En producción": "En producción",
            Enviados: "Enviado",
            Entregados: "Entregado",
          };
          const expectedCategory =
            filterCategoryMap[statusFilter] ?? statusFilter;
          matchFilter = display.category === expectedCategory;
        }
      }

      const term = searchQuery.toLowerCase().trim();
      if (!term) return matchFilter;

      const hasShipmentMatch = (order.shipments || []).some(
        (s) =>
          s.trackingNumber.toLowerCase().includes(term) ||
          s.carrier.toLowerCase().includes(term),
      );

      const matchSearch =
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term) ||
        (order.trackingNumber &&
          order.trackingNumber.toLowerCase().includes(term)) ||
        hasShipmentMatch ||
        order.items.some(
          (i) =>
            i.productName.toLowerCase().includes(term) ||
            i.designName.toLowerCase().includes(term),
        );

      return matchFilter && matchSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // Abrir rastreo externo de transportadora
  const handleOpenTracking = (
    order: StoreOrderFull,
    targetShipment?: Shipment,
  ) => {
    const shp = targetShipment || order.shipments?.[0];
    if (!shp) {
      showToast("Este pedido aún no cuenta con guías de envío para rastrear.");
      return;
    }
    const url = shp.trackingUrl || order.trackingNumber;
    if (!url) {
      showToast("No hay URL de rastreo disponible para esta guía.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Abrir modal de acción validando permisos
  const handleTriggerAction = (
    order: StoreOrderFull,
    actionDef: OrderActionDefinition,
  ) => {
    if (actionDef.type === "RASTREAR_GUIA") {
      handleOpenTracking(order);
      return;
    }

    if (!isTransitionAllowed(order, actionDef.type)) {
      alert(
        `La acción ${actionDef.label} no está permitida para el estado actual del pedido.`,
      );
      return;
    }

    setActionTargetOrder(order);
    setCurrentAction(actionDef);
    setIsActionModalOpen(true);
  };

  // Confirmar ejecución de acción
  const handleConfirmAction = (
    actionType: OrderActionType,
    payload: ActionPayload,
  ) => {
    if (!actionTargetOrder) return;

    const updated = executeOrderAction(
      actionTargetOrder,
      actionType,
      payload,
      "Juan Pérez (Taller PrintShop)",
    );

    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setIsActionModalOpen(false);
    setActionTargetOrder(null);
    setCurrentAction(null);

    showToast(
      `Acción "${actionType}" aplicada exitosamente al pedido ${updated.id}`,
    );
  };

  // Mapeos legibles de dimensiones para el modal
  const getDimensionLabel = (dim: string, val: string) => {
    switch (dim) {
      case "order":
        return val === "OPEN"
          ? "Abierto"
          : val === "COMPLETED"
            ? "Completado"
            : val === "CANCELLED"
              ? "Cancelado"
              : "Archivado";
      case "payment":
        return val === "PAID"
          ? "Pagado"
          : val === "PENDING"
            ? "Pago pendiente"
            : val === "FAILED"
              ? "Pago fallido"
              : val === "REFUNDED"
                ? "Reembolsado"
                : "Anulado";
      case "production":
        return val === "NOT_STARTED"
          ? "No iniciada"
          : val === "IN_PRODUCTION"
            ? "En producción"
            : "Terminado";
      case "shipping":
        return val === "NOT_SHIPPED"
          ? "No despachado"
          : val === "SHIPPED" ||
              val === "IN_TRANSIT" ||
              val === "OUT_FOR_DELIVERY"
            ? "Enviado"
            : "Entregado";
      case "issue":
        return val === "NONE"
          ? "Sin novedades"
          : val === "REPORTED"
            ? "Novedad activa"
            : val === "UNDER_REVIEW"
              ? "En revisión"
              : "Resuelta";
      case "return":
        return val === "NONE"
          ? "Sin devolución"
          : val === "REQUESTED"
            ? "Solicitud radicada"
            : val === "IN_REVIEW"
              ? "En dictamen"
              : val === "APPROVED"
                ? "Garantía aprobada"
                : val === "REJECTED"
                  ? "Rechazada"
                  : "Completada";
      default:
        return val;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* Toast Notificación flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#111827] text-white text-xs px-4 py-3 rounded-[4px] shadow-xl border border-[#374151] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Máquina de estados operativa, envíos y auditoría de despacho en
            tiempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast("Exportando pedidos en formato CSV...")}
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-[4px] bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Pedidos</span>
        </button>
      </div>

      {/* ── KPIS ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Todos",
            count: stats.total,
            filter: "Todos" as OrderFilterOption,
          },
          {
            label: "Pendientes",
            count: stats.pendientes,
            filter: "Pendientes" as OrderFilterOption,
          },
          {
            label: "En producción",
            count: stats.produccion,
            filter: "En producción" as OrderFilterOption,
          },
          {
            label: "Enviados",
            count: stats.enviados,
            filter: "Enviados" as OrderFilterOption,
          },
          {
            label: "Entregados",
            count: stats.entregados,
            filter: "Entregados" as OrderFilterOption,
          },
          {
            label: "Cancelados",
            count: stats.cancelados,
            filter: "Cancelados" as OrderFilterOption,
          },
        ].map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => setStatusFilter(kpi.filter)}
            className={cn(
              "p-3 rounded-[4px] border text-left transition-all",
              statusFilter === kpi.filter
                ? "bg-white border-[#2563EB] shadow-xs ring-1 ring-[#2563EB]/20"
                : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]",
            )}
          >
            <span className="text-[11px] font-semibold text-[#64748B] block">
              {kpi.label}
            </span>
            <span className="text-xl font-black text-[#111827] mt-0.5 block">
              {kpi.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── BARRA DE BÚSQUEDA Y FILTRO ──────────────────────────────── */}
      <div className="bg-white p-3.5 rounded-[4px] border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, cliente, guía o prenda..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-primary text-[#111827] placeholder-[#94A3B8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-[#64748B] whitespace-nowrap">
            Mostrando{" "}
            <span className="font-bold text-[#111827]">
              {filteredOrders.length}
            </span>{" "}
            de {orders.length} pedidos
          </span>
        </div>
      </div>

      {/* ── TABLA DE PEDIDOS ────────────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-semibold">
                <th className="py-2.5 px-4">ID Pedido</th>
                <th className="py-2.5 px-4">Cliente</th>
                <th className="py-2.5 px-4">Producto</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Total</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-semibold text-[#64748B] mb-1">
                      No se encontraron pedidos
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Prueba cambiando los filtros o el término de búsqueda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const display = getMainDisplayStatus(order);
                  const availableActions = getAvailableOrderActions(order);
                  const primaryAction = availableActions.find(
                    (a) => a.isPrimary,
                  );
                  const hasShipments = (order.shipments || []).length > 0;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-[#111827]">
                        {order.id}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={order.customerName}
                            className="w-7 h-7"
                          />
                          <div>
                            <p className="font-semibold text-[#111827] leading-tight">
                              {order.customerName}
                            </p>
                            <p className="text-[10.5px] text-[#64748B]">
                              {order.customerEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={order.items[0]?.image}
                            alt=""
                            className="w-7 h-7 rounded object-cover border border-[#E2E8F0]"
                          />
                          <div>
                            <p className="font-medium text-[#111827] truncate max-w-[160px]">
                              {order.items[0]?.productName}
                            </p>
                            <p className="text-[10px] text-[#64748B]">
                              {order.items.length > 1
                                ? `+ ${order.items.length - 1} artículo(s) más`
                                : `${order.items[0]?.variant || ""} • ${order.items[0]?.designName || ""}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[#64748B] whitespace-nowrap">
                        {order.date}
                      </td>
                      <td className="py-2.5 px-4 font-black text-[#111827] whitespace-nowrap">
                        $ {order.total.toLocaleString("es-CO")}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusDot status={display.label} />
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Reemplazar botones múltiples por menú de tres puntos */}
                          <OrderActionsMenu
                            order={order}
                            onTriggerAction={(o, a) =>
                              handleTriggerAction(o, a)
                            }
                            onOpenTracking={(o) => handleOpenTracking(o)}
                            onViewDetail={(o) => setSelectedOrder(o)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: DETALLE COMPLETO DEL PEDIDO (PORTAL AL BODY) ───────── */}
      {selectedOrder &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle del Pedido ${selectedOrder.id}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedOrder(null);
                setSelectedOrderItem(null);
              }
            }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-hidden animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[4px] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-150"
            >
              {/* Header del modal (fijo en la parte superior) */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] p-4 sm:p-5 shrink-0 bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#111827]">
                      Pedido {selectedOrder.id}
                    </h2>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Registrado {selectedOrder.date} <br />
                    Forma de pago:{" "}
                    <span className="font-medium text-[#111827]">
                      {selectedOrder.paymentMethod}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setSelectedOrderItem(null);
                  }}
                  aria-label="Cerrar detalle del pedido"
                  title="Cerrar detalle"
                  className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] rounded-[4px] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido deslizable del modal (único contenedor con scroll) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 min-h-0">
                {/* 1. Resumen del Estado del Pedido */}
                <div className="p-3.5 rounded-[4px] bg-white border border-[#E5E7EB] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                    Resumen del Estado del Pedido
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        Ciclo de Vida
                      </span>
                      <StatusDot
                        status={getDimensionLabel(
                          "order",
                          selectedOrder.orderStatus,
                        )}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        Estado de Pago
                      </span>
                      <StatusDot
                        status={getDimensionLabel(
                          "payment",
                          selectedOrder.paymentStatus,
                        )}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        Producción en Taller
                      </span>
                      <StatusDot
                        status={
                          selectedOrder.fulfillmentType === "READY_TO_SHIP"
                            ? "Listo para despacho"
                            : getDimensionLabel(
                                "production",
                                selectedOrder.productionStatus,
                              )
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-[#64748B] block font-medium">
                        Logística y Entrega
                      </span>
                      <StatusDot
                        status={getDimensionLabel(
                          "shipping",
                          getAggregatedShippingStatus(selectedOrder),
                        )}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Barra de Acciones Contextuales */}
                {(() => {
                  const availabilities =
                    getOrderActionAvailability(selectedOrder);
                  const visible = availabilities.filter(
                    (a) => a.status !== "HIDDEN",
                  );
                  if (visible.length === 0) return null;

                  return (
                    <div className="p-3.5 rounded-[4px] bg-white border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                          Acciones Operativas Disponibles
                        </span>
                        <p className="text-xs text-[#475569] font-medium mt-0.5">
                          Acciones permitidas según el estado actual del pedido.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {visible.map((item, idx) => {
                          if (item.status === "DISABLED") {
                            return (
                              <div
                                key={item.action.type || idx}
                                className="relative group"
                              >
                                <button
                                  type="button"
                                  disabled
                                  title={item.reason}
                                  className="h-8 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-semibold rounded-[4px] bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed opacity-60 whitespace-nowrap"
                                >
                                  <span>{item.action.label}</span>
                                </button>
                                <span className="sr-only">{item.reason}</span>
                              </div>
                            );
                          }

                          const act = item.action;
                          if (act.isPrimary) {
                            return (
                              <button
                                key={act.type}
                                type="button"
                                onClick={() =>
                                  handleTriggerAction(selectedOrder, act)
                                }
                                className="h-8 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[4px] shadow-2xs transition-colors whitespace-nowrap"
                              >
                                <span>{act.label}</span>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={act.type}
                              type="button"
                              onClick={() =>
                                handleTriggerAction(selectedOrder, act)
                              }
                              className={cn(
                                "h-8 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-semibold rounded-[4px] transition-colors border shadow-2xs whitespace-nowrap",
                                act.isDestructive
                                  ? "bg-white text-[#EF4444] border-[#FCA5A5] hover:bg-[#FEF2F2]"
                                  : "bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#111827]",
                              )}
                            >
                              <span>{act.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Info del Cliente y Entrega */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-[4px] bg-white border border-[#E5E7EB] shadow-2xs text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                      Cliente
                    </span>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={selectedOrder.customerName}
                        className="w-8 h-8 shrink-0 rounded-[50%]"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#111827] truncate">
                          {selectedOrder.customerName}
                        </p>
                        <p className="text-[#64748B] text-[11px] truncate">
                          {selectedOrder.customerEmail}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#64748B] text-[11px]">
                      Tel:{" "}
                      <span className="font-medium text-[#111827]">
                        {selectedOrder.customerPhone}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#F1F5F9] pt-2 sm:pt-0 sm:pl-3.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                      Entrega y Pago
                    </span>
                    <div>
                      <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                        <span className="truncate">
                          {selectedOrder.address}
                        </span>
                      </p>
                      <div className="mt-1.5 text-[11px] text-[#64748B]">
                        <span>Método de Pago: </span>
                        <span className="font-semibold text-[#111827]">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Tienda de Producción (si aplica en CUSTOM_FROM_SCRATCH) */}
                {selectedOrder.fulfillmentType === "CUSTOM_FROM_SCRATCH" &&
                  selectedOrder.selectedStore && (
                    <StoreReliabilityCard
                      storeInfo={selectedOrder.selectedStore}
                    />
                  )}

                {/* 5. Estructura Financiera, Pagos y Saldo Pendiente */}
                <PaymentSummaryPanel order={selectedOrder} />

                {/* 7. Envíos y Guías de Despacho */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>
                        Envíos y Guías de Despacho (
                        {(selectedOrder.shipments || []).length})
                      </span>
                    </h3>
                    {selectedOrder.shipments &&
                      selectedOrder.shipments.length > 1 && (
                        <span className="text-[10.5px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-[4px]">
                          Pedido con envíos parciales / múltiples
                        </span>
                      )}
                  </div>

                  {!selectedOrder.shipments ||
                  selectedOrder.shipments.length === 0 ? (
                    <div className="p-3.5 bg-white border border-dashed border-[#CBD5E1] rounded-[4px] text-center text-xs text-[#64748B] shadow-2xs">
                      No se han generado guías de despacho para este pedido aún.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedOrder.shipments.map((shp, idx) => (
                        <div
                          key={shp.id || idx}
                          className="p-3 bg-white border border-[#E5E7EB] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#CBD5E1] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-[4px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#111827] text-xs">
                                  {selectedOrder.shipments.length > 1
                                    ? `Envío ${idx + 1}: ${shp.carrier}`
                                    : shp.carrier}
                                </span>
                                <span className="text-xs font-mono font-bold text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.2 rounded-[4px]">
                                  {shp.trackingNumber}
                                </span>
                                <StatusDot
                                  status={
                                    shp.shippingStatus === "NOT_SHIPPED"
                                      ? "No despachado"
                                      : shp.shippingStatus === "SHIPPED"
                                        ? "Guía generada"
                                        : shp.shippingStatus === "IN_TRANSIT"
                                          ? "En tránsito"
                                          : shp.shippingStatus ===
                                              "OUT_FOR_DELIVERY"
                                            ? "En ruta de entrega"
                                            : "Entregado"
                                  }
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748B] mt-1">
                                {shp.estimatedDeliveryAt && (
                                  <span>
                                    Entrega estimada: {shp.estimatedDeliveryAt}
                                  </span>
                                )}
                                {shp.deliveredAt && (
                                  <span className="font-medium text-[#111827]">
                                    Entregado:{" "}
                                    {new Date(
                                      shp.deliveredAt,
                                    ).toLocaleDateString("es-CO")}
                                  </span>
                                )}
                                <span>
                                  {shp.trackingEvents?.length || 0} evento(s) de
                                  rastreo
                                </span>
                              </div>

                              {/* Guía de Despacho Adjunta (si existe) */}
                              {shp.guideFile && (
                                <div className="mt-2 pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-xs text-[#334155]">
                                    {shp.guideFile.mimeType === "application/pdf" ? (
                                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                                    ) : (
                                      <img
                                        src={shp.guideFile.url}
                                        alt={shp.guideFile.name}
                                        className="w-5 h-5 rounded-[2px] object-cover border border-[#E2E8F0]"
                                      />
                                    )}
                                    <span className="font-medium truncate max-w-[200px]">
                                      {shp.guideFile.name}
                                    </span>
                                    {shp.guideFile.fileSizeFormatted && (
                                      <span className="text-[10.5px] text-[#64748B]">
                                        ({shp.guideFile.fileSizeFormatted})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {shp.guideFile.mimeType !== "application/pdf" ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDetailPreviewImageUrl(shp.guideFile!.url);
                                          setDetailPreviewImageTitle(
                                            `Guía de Despacho — ${shp.trackingNumber}`,
                                          );
                                        }}
                                        className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                                      >
                                        <ZoomIn className="w-3 h-3" />
                                        <span>Ver guía</span>
                                      </button>
                                    ) : (
                                      <a
                                        href={shp.guideFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] hover:bg-[#EFF6FF] transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Abrir documento</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const url = shp.trackingUrl;
                              if (url) {
                                window.open(
                                  url,
                                  "_blank",
                                  "noopener,noreferrer",
                                );
                              } else {
                                showToast(
                                  "No hay URL de rastreo disponible para esta guía.",
                                );
                              }
                            }}
                            className="h-7.5 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-3 py-1 rounded-[4px] transition-colors shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rastrear guía</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 8. Productos del Pedido */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>
                        Productos del Pedido ({selectedOrder.items.length})
                      </span>
                    </h3>
                    <span className="text-[10.5px] text-[#64748B]">
                      Selecciona un producto para ver sus detalles
                    </span>
                  </div>

                  <div className="border border-[#E5E7EB] rounded-[4px] divide-y divide-[#F1F5F9] overflow-hidden bg-white shadow-2xs">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedOrderItem(item)}
                        className="p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs bg-white hover:bg-[#F8FAFC] cursor-pointer transition-colors group"
                      >
                        {/* Imagen 44px + Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-11 h-11 rounded-[4px] object-cover border border-[#E2E8F0] group-hover:border-[#2563EB] transition-colors shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors truncate">
                                {item.productNameSnapshot || item.productName}
                              </p>
                            </div>
                            <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                              {item.variantSnapshot?.size || item.size
                                ? `Talla ${item.variantSnapshot?.size || item.size}`
                                : ""}
                              {item.variantSnapshot?.color || item.color
                                ? ` • ${item.variantSnapshot?.color || item.color}`
                                : ""}
                              {item.variantSnapshot?.fabric || item.fabric
                                ? ` • ${item.variantSnapshot?.fabric || item.fabric}`
                                : ""}
                            </p>
                            {item.designName && (
                              <p className="text-[10.5px] text-[#475569] font-medium mt-0.5 flex items-center gap-1 truncate">
                                <span>Diseño: {item.designName}</span>
                                {item.designTechnique && (
                                  <span className="text-[#64748B]">
                                    ({item.designTechnique})
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Precio / Cantidad y botón Ver ficha técnica */}
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrderItem(item);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                          >
                            <span>Ver detalles del producto</span>
                            <Eye className="w-3.5 h-3.5 shrink-0  items-center " />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vista inline de la ficha técnica dentro del modal */}
                  {selectedOrderItem && (
                    <div className="mt-3">
                      <OrderItemDetailModal
                        inline
                        item={selectedOrderItem}
                        fulfillmentType={selectedOrder?.fulfillmentType}
                        orderId={selectedOrder?.id}
                        onClose={() => setSelectedOrderItem(null)}
                        onBack={() => setSelectedOrderItem(null)}
                      />
                    </div>
                  )}
                </div>

                {/* 9. Incidencias y Devoluciones (si aplican) */}
                {(selectedOrder.issueStatus !== "NONE" ||
                  selectedOrder.returnStatus !== "NONE") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs">
                    {selectedOrder.issueStatus !== "NONE" && (
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">
                          Incidencia Operativa
                        </span>
                        <StatusDot
                          status={getDimensionLabel(
                            "issue",
                            selectedOrder.issueStatus,
                          )}
                          className="mt-1"
                        />
                        {selectedOrder.issueNotes && (
                          <p className="text-[11px] text-[#64748B] mt-1 italic bg-white p-2 rounded-[4px] border border-[#E2E8F0]">
                            "{selectedOrder.issueNotes}"
                          </p>
                        )}
                      </div>
                    )}

                    {selectedOrder.returnStatus !== "NONE" && (
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">
                          Garantía / Devolución
                        </span>
                        <StatusDot
                          status={getDimensionLabel(
                            "return",
                            selectedOrder.returnStatus,
                          )}
                          className="mt-1"
                        />
                        {selectedOrder.returnReason && (
                          <p className="text-[11px] text-[#64748B] mt-1 italic bg-white p-2 rounded-[4px] border border-[#E2E8F0]">
                            Motivo: "{selectedOrder.returnReason}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 10. Trazabilidad / Timeline Conectada a las Acciones */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Línea de Tiempo y Auditoría de Acciones
                  </h3>
                  <div className="relative max-h-48 overflow-y-auto pr-2 pl-1">
                    <div className="relative pl-6 space-y-3">
                      {/* Línea vertical centrada con precisión milimétrica sobre los puntos */}
                      <div className="absolute left-[4.25px] top-1.5 bottom-1.5 w-[1.5px] bg-[#E2E8F0]" />

                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={event.id || idx} className="relative text-xs">
                          <span
                            className={cn(
                              "absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white",
                              event.done ? "bg-[#2563EB]" : "bg-[#CBD5E1]",
                            )}
                          />

                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className={cn(
                                "font-semibold",
                                event.done
                                  ? "text-[#111827]"
                                  : "text-[#64748B]",
                              )}
                            >
                              {event.step}
                            </p>
                            <span className="text-[10.5px] text-[#64748B] shrink-0">
                              {event.date}
                            </span>
                          </div>

                          {event.performedBy && (
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              Por: {event.performedBy}
                            </p>
                          )}
                          {event.note && (
                            <p className="text-[11px] text-[#64748B] italic mt-0.5">
                              "{event.note}"
                            </p>
                          )}

                          {/* Indicador discreto de evidencia adjunta en timeline */}
                          {((event.evidenceFiles && event.evidenceFiles.length > 0) || event.shipmentGuideFile) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {event.shipmentGuideFile && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (event.shipmentGuideFile!.mimeType !== "application/pdf") {
                                      setDetailPreviewImageUrl(event.shipmentGuideFile!.url);
                                      setDetailPreviewImageTitle(`Guía de Despacho — ${event.shipmentGuideFile!.name}`);
                                    } else {
                                      window.open(event.shipmentGuideFile!.url, "_blank");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-[10.5px] text-[#334155] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2 py-0.5 rounded-[3px] border border-[#E2E8F0] transition-colors cursor-pointer"
                                  title={event.shipmentGuideFile.name}
                                >
                                  <FileText className="w-3 h-3 text-[#2563EB]" />
                                  <span className="truncate max-w-[130px]">Guía adjunta</span>
                                </button>
                              )}
                              {event.evidenceFiles?.map((file, fIdx) => (
                                <button
                                  key={file.id || fIdx}
                                  type="button"
                                  onClick={() => {
                                    if (file.mimeType !== "application/pdf") {
                                      setDetailPreviewImageUrl(file.url);
                                      setDetailPreviewImageTitle(`Evidencia — ${file.name}`);
                                    } else {
                                      window.open(file.url, "_blank");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-[10.5px] text-[#334155] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2 py-0.5 rounded-[3px] border border-[#E2E8F0] transition-colors cursor-pointer"
                                  title={file.name}
                                >
                                  {file.mimeType === "application/pdf" ? (
                                    <FileText className="w-3 h-3 text-[#2563EB]" />
                                  ) : (
                                    <Paperclip className="w-3 h-3 text-[#2563EB]" />
                                  )}
                                  <span className="truncate max-w-[130px]">{file.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del modal (fijo en la parte inferior) */}
              <div className="p-3.5 sm:p-4 border-t border-[#F1F5F9] shrink-0 bg-white flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-[#64748B]">Total del Pedido: </span>
                  <span className="font-bold text-sm text-[#111827]">
                    $ {selectedOrder.total.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrder(null);
                      setSelectedOrderItem(null);
                    }}
                    className="h-8 inline-flex items-center justify-center px-4 bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155] text-xs font-semibold rounded-[4px] transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── MODAL REUTILIZABLE DE ACCIÓN CONTEXTUAL ─────────────────── */}
      <OrderActionModal
        isOpen={isActionModalOpen}
        order={actionTargetOrder}
        action={currentAction}
        onClose={() => {
          setIsActionModalOpen(false);
          setActionTargetOrder(null);
          setCurrentAction(null);
        }}
        onConfirm={handleConfirmAction}
      />

      {/* ── PREVIEW DE IMÁGENES / EVIDENCIAS DESDE EL DETALLE (z-[120]) ─── */}
      <ImagePreviewModal
        isOpen={Boolean(detailPreviewImageUrl)}
        imageUrl={detailPreviewImageUrl}
        title={detailPreviewImageTitle}
        onClose={() => setDetailPreviewImageUrl(null)}
      />

      {/* Rastreo externo: ShipmentTrackingModal eliminado según especificaciones de diseño */}
    </div>
  );
}
