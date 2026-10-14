import * as React from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Package,
  Palette,
  RotateCcw,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";
import { CustomerPortalMenu } from "./customer-portal-menu";

// ── Tipos y Modelo de Datos ──────────────────────────────────────────────────
export type NotificationFilter = "all" | "pending" | "read";
export type NotificationCategory = "designs" | "orders" | "account" | "system";

export interface CustomerNotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  timestamp: string;
  isRead: boolean;
  isPending: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// ── Datos de Demostración ───────────────────────────────────────────────────
// Datos mock iniciales: 3 pendientes y 3 leídas (total 6)
const INITIAL_NOTIFICATIONS: CustomerNotificationItem[] = [
  {
    id: "notif-1",
    title: "Diseño listo para revisar",
    description:
      "Tu archivo 'Retro Wave 80s' fue procesado en 300 DPI y está listo para previsualizar en el Diseñador.",
    category: "designs",
    timestamp: "Hace 12 min",
    isRead: false,
    isPending: true,
    actionUrl: "/designerv",
    actionLabel: "Abrir Diseñador",
  },
  {
    id: "notif-2",
    title: "Pedido #ORD-2026-894 en producción",
    description:
      "El taller ha comenzado la impresión de tus sudaderas personalizadas. Tiempo estimado: 3 días hábiles.",
    category: "orders",
    timestamp: "Hace 3 horas",
    isRead: false,
    isPending: true,
    actionUrl: "/account/orders",
    actionLabel: "Ver pedido",
  },
  {
    id: "notif-3",
    title: "Archivo de impresión pendiente de confirmación",
    description:
      "El archivo para la gorra 'Summer Vibes' requiere que confirmes las medidas de corte antes de enviarlo a estampación.",
    category: "designs",
    timestamp: "Ayer, 11:40",
    isRead: false,
    isPending: true,
    actionUrl: "/account/designs",
    actionLabel: "Revisar archivo",
  },
  {
    id: "notif-4",
    title: "Pedido #ORD-2026-871 entregado",
    description:
      "Tu pedido de 15 camisetas fue entregado con éxito. Puedes calificar el acabado y la tela desde tu historial.",
    category: "orders",
    timestamp: "Hace 2 días",
    isRead: true,
    isPending: false,
    actionUrl: "/account/orders",
    actionLabel: "Ver pedido",
  },
  {
    id: "notif-5",
    title: "Nueva colección de plantillas disponible",
    description:
      "Se añadieron 12 nuevas plantillas de tote bags y gorras al catálogo del Diseñador.",
    category: "system",
    timestamp: "Hace 3 días",
    isRead: true,
    isPending: false,
    actionUrl: "/designerv",
    actionLabel: "Explorar plantillas",
  },
  {
    id: "notif-6",
    title: "Sesión iniciada en nuevo dispositivo",
    description:
      "Se detectó un inicio de sesión desde Chrome en Windows. Si fuiste tú, no necesitas realizar ninguna acción.",
    category: "account",
    timestamp: "Hace 4 días",
    isRead: true,
    isPending: false,
    actionUrl: "/account/settings",
    actionLabel: "Revisar seguridad",
  },
];

// Iconos monocromáticos neutrales según tipo
function getCategoryIcon(category: NotificationCategory) {
  switch (category) {
    case "designs":
      return Palette;
    case "orders":
      return Package;
    case "account":
      return Shield;
    case "system":
      return Sparkles;
    default:
      return Sparkles;
  }
}

// ── Ilustración del Estado Vacío (border-radius <= 5px, sin degradados) ───────
function NotificationsEmptyIllustration() {
  return (
    <div className="relative mx-auto flex h-[200px] w-[320px] select-none items-center justify-center sm:h-[220px] sm:w-[360px]">
      <svg
        viewBox="0 0 380 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <ellipse
          cx="190"
          cy="208"
          rx="140"
          ry="16"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />

        {/* Tarjeta flotante izquierda */}
        <g transform="rotate(-5 115 90)">
          <rect
            x="75"
            y="65"
            width="110"
            height="50"
            rx="5"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          <rect x="87" y="77" width="26" height="26" rx="4" fill="#F1F5F9" />
          <path
            d="M96 86L98 84L102 84L104 86L107 88L105 91L103 90L103 96L97 96L97 90L95 91L93 88L96 86Z"
            fill="#64748B"
          />
          <rect x="121" y="82" width="50" height="4.5" rx="2" fill="#CBD5E1" />
          <rect
            x="121"
            y="91"
            width="34"
            height="3.5"
            rx="1.5"
            fill="#E2E8F0"
          />
        </g>

        {/* Tarjeta flotante inferior */}
        <g transform="rotate(3 105 145)">
          <rect
            x="65"
            y="125"
            width="112"
            height="50"
            rx="5"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          <rect x="77" y="137" width="26" height="26" rx="4" fill="#F1F5F9" />
          <circle cx="88" cy="146" r="1.5" fill="#64748B" />
          <path
            d="M85 152L89 148L95 153"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <rect x="111" y="142" width="52" height="4.5" rx="2" fill="#CBD5E1" />
          <rect
            x="111"
            y="151"
            width="36"
            height="3.5"
            rx="1.5"
            fill="#E2E8F0"
          />
        </g>

        {/* Tarjeta flotante derecha */}
        <g transform="rotate(4 270 125)">
          <rect
            x="220"
            y="105"
            width="114"
            height="50"
            rx="5"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          <rect x="232" y="117" width="26" height="26" rx="4" fill="#F1F5F9" />
          <path
            d="M245 123L251 126.5V133.5L245 137L239 133.5V126.5L245 123Z"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M245 123V137" stroke="#64748B" strokeWidth="1.2" />
          <rect x="266" y="122" width="50" height="4.5" rx="2" fill="#CBD5E1" />
          <rect
            x="266"
            y="131"
            width="32"
            height="3.5"
            rx="1.5"
            fill="#E2E8F0"
          />
        </g>

        {/* Campana central */}
        <ellipse cx="194" cy="80" rx="6" ry="6" fill="#94A3B8" />
        <ellipse cx="194" cy="80" rx="3.5" ry="3.5" fill="#F8FAFC" />
        <path
          d="M194 82C180 82 170 96 168 122C164 126 160 134 160 142C160 148 168 152 194 152C220 152 228 148 228 142C228 134 224 126 220 122C218 96 208 82 194 82Z"
          fill="#94A3B8"
        />
        <path
          d="M194 84C183 84 175 97 173 122C170 126 166 133 166 140C166 144 172 147 194 147C216 147 222 144 222 140C222 133 218 126 215 122C213 97 205 84 194 84Z"
          fill="#CBD5E1"
        />
        <ellipse cx="194" cy="148" rx="12" ry="7" fill="#475569" />
      </svg>
    </div>
  );
}

// ── Menú Contextual de Tres Puntos ──────────────────────────────────────────
function NotificationActionsMenu({
  item,
  onMarkRead,
  onMarkPending,
  onDismiss,
  onNavigateAction,
}: {
  item: CustomerNotificationItem;
  onMarkRead: () => void;
  onMarkPending: () => void;
  onDismiss: () => void;
  onNavigateAction: (url: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn(
          customerIconButtonClass,
          "h-8 w-8 text-slate-400",
          isOpen && "bg-slate-100 text-slate-800",
        )}
        aria-label="Acciones de la notificación"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <CustomerPortalMenu
        open={isOpen}
        anchorRef={buttonRef}
        onClose={() => setIsOpen(false)}
        minWidth={200}
      >
          {/* Acción relevante del recurso */}
          {item.actionUrl && item.actionLabel && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onNavigateAction(item.actionUrl!);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{item.actionLabel}</span>
            </button>
          )}

          {/* Marcar como leída */}
          {!item.isRead && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onMarkRead();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Marcar como leída</span>
            </button>
          )}

          {/* Marcar como pendiente */}
          {!item.isPending && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onMarkPending();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Marcar como pendiente</span>
            </button>
          )}

          <div className="my-1 border-t border-slate-100" />

          {/* Descartar notificación */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDismiss();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600 shrink-0" />
            <span>Descartar</span>
          </button>
      </CustomerPortalMenu>
    </div>
  );
}

// ── Tarjeta de Notificación Individual ──────────────────────────────────────
function NotificationCard({
  item,
  onMarkRead,
  onMarkPending,
  onDismiss,
  onNavigateAction,
}: {
  item: CustomerNotificationItem;
  onMarkRead: (id: string) => void;
  onMarkPending: (id: string) => void;
  onDismiss: (id: string) => void;
  onNavigateAction: (url: string) => void;
}) {
  const IconComponent = getCategoryIcon(item.category);

  return (
    <div
      className={cn(
        "group relative flex items-start justify-between gap-3 p-4 transition-colors duration-150",
        // Superficie neutra
        item.isRead ? "bg-white" : "bg-[#FBFBFF]",
        "hover:bg-slate-50/80",
      )}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Icono monocromático gris neutro */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-500"
          style={{ borderRadius: 5 }}
          aria-hidden="true"
        >
          <IconComponent className="h-4 w-4" strokeWidth={1.8} />
        </div>

        {/* Texto y datos */}
        <div className="min-w-0 flex-1">
          {/* Título y Estado alineados */}
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3
              className={cn(
                "text-[13px] leading-snug",
                item.isRead
                  ? "font-medium text-slate-700"
                  : "font-semibold text-slate-900",
              )}
            >
              {item.title}
            </h3>

            {/* Estado semántico discreto: ● Pendiente o ● Leída */}
            {item.isPending ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"
                  aria-hidden="true"
                />
                Pendiente
              </span>
            ) : item.isRead ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0"
                  aria-hidden="true"
                />
                Leída
              </span>
            ) : null}
          </div>

          {/* Descripción */}
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
            {item.description}
          </p>

          {/* Momento / Fecha */}
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{item.timestamp}</span>
          </div>
        </div>
      </div>

      {/* Menú de Tres Puntos (Acciones exclusivas) */}
      <div className="ml-2 shrink-0 pt-0.5">
        <NotificationActionsMenu
          item={item}
          onMarkRead={() => onMarkRead(item.id)}
          onMarkPending={() => onMarkPending(item.id)}
          onDismiss={() => onDismiss(item.id)}
          onNavigateAction={onNavigateAction}
        />
      </div>
    </div>
  );
}

// ── Estado Vacío (Sin enlaces de actividad inferiores) ───────────────────────
function EmptyNotificationsState({
  filter,
  onResetFilter,
}: {
  filter: NotificationFilter;
  onResetFilter: () => void;
}) {
  const content = {
    all: {
      heading: "Estás al día",
      body: "Aquí aparecerán avisos sobre tus diseños, archivos y actividad de tu cuenta.",
    },
    pending: {
      heading: "Sin avisos pendientes",
      body: "No tienes notificaciones que requieran atención en este momento.",
    },
    read: {
      heading: "Sin notificaciones leídas",
      body: "Las notificaciones que marques como leídas se conservarán aquí.",
    },
  }[filter];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-200">
      <NotificationsEmptyIllustration />
      <h2 className="mt-4 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
        {content.heading}
      </h2>
      <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
        {content.body}
      </p>
    </div>
  );
}

// ── Página Principal de Notificaciones ───────────────────────────────────────
export function CustomerNotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<CustomerNotificationItem[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [filter, setFilter] = React.useState<NotificationFilter>("all");

  // Contadores dinámicos derivados de los datos
  const totalCount = items.length;
  const pendingCount = items.filter((n) => n.isPending).length;
  const readCount = items.filter((n) => n.isRead).length;

  // Filtrado estricto
  const filteredItems = React.useMemo(() => {
    switch (filter) {
      case "pending":
        return items.filter((n) => n.isPending);
      case "read":
        return items.filter((n) => n.isRead);
      case "all":
      default:
        return items;
    }
  }, [items, filter]);

  // Acciones de actualización de estado
  const handleMarkRead = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, isPending: false } : n,
      ),
    );
  }, []);

  const handleMarkPending = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isPending: true, isRead: false } : n,
      ),
    );
  }, []);

  const handleDismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleNavigateAction = React.useCallback(
    (url: string) => {
      navigate(url);
    },
    [navigate],
  );

  // Definición de los tres filtros
  const FILTER_OPTIONS: {
    key: NotificationFilter;
    label: string;
    count: number;
  }[] = [
    { key: "all", label: "Todas", count: totalCount },
    { key: "pending", label: "Pendientes", count: pendingCount },
    { key: "read", label: "Leídas", count: readCount },
  ];

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-150">
      {/* ── Encabezado Limpio (Sin icono ni botón Preferencias) ──────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
          Notificaciones
        </h1>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Novedades sobre tus diseños y actividad de cuenta.
        </p>
      </div>

      {/* ── Barra de Filtros Unificada (Mismo patrón que Mis pedidos) ──────── */}
      <div
        className="inline-flex w-fit flex-wrap gap-1.5 bg-slate-100 p-1 border border-slate-200/60"
        style={{ borderRadius: 5 }}
        role="tablist"
        aria-label="Filtros de notificaciones"
      >
        {FILTER_OPTIONS.map(({ key, label }) => {
          const isActive = filter === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setFilter(key)}
              className={cn(
                "min-h-8 px-3.5 text-xs font-semibold transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900",
              )}
              style={{ borderRadius: 5 }}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Contenedor de Lista o Estado Vacío ───────────────────────────── */}
      {filteredItems.length === 0 ? (
        <EmptyNotificationsState
          filter={filter}
          onResetFilter={() => setFilter("all")}
        />
      ) : (
        <div
          className="overflow-hidden border border-slate-200 bg-white divide-y divide-slate-100"
          style={{ borderRadius: 5 }}
          role="list"
          aria-label="Lista de notificaciones"
        >
          {filteredItems.map((item) => (
            <div key={item.id} role="listitem">
              <NotificationCard
                item={item}
                onMarkRead={handleMarkRead}
                onMarkPending={handleMarkPending}
                onDismiss={handleDismiss}
                onNavigateAction={handleNavigateAction}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerNotificationsPage;
