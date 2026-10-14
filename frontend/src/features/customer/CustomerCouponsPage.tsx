import * as React from "react";
import {
  Clock,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { customerIconButtonClass } from "./customer-ui";
import { CustomerPortalMenu } from "./customer-portal-menu";

// ── Tipos y Modelo de Datos ──────────────────────────────────────────────────
export type CouponFilter = "available" | "used" | "expired";

export interface CouponItem {
  id: string;
  code: string;
  discount: string;
  title: string;
  description: string;
  minSpend?: string;
  expiresAt: string;
  status: "available" | "used" | "expired";
  statusLabel: string;
  statusDotColor: string;
  statusTextColor: string;
}

// ── Datos de Muestra / Fixtures ──────────────────────────────────────────────
// Por defecto, Disponibles se inicia vacío para coincidir con la vista aprobada en la referencia visual (Imagen 2).
// El usuario puede canjear códigos (ej: CREATIVO15) desde el modal para ver tarjetas activas.
const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "coup-3",
    code: "BIENVENIDA10",
    discount: "10% OFF",
    title: "Descuento de bienvenida",
    description: "Aplicado en tu primer pedido de merchandising corporativo.",
    expiresAt: "10 Ene 2026",
    status: "used",
    statusLabel: "Utilizado",
    statusDotColor: "bg-slate-400",
    statusTextColor: "text-slate-500",
  },
  {
    id: "coup-4",
    code: "BLACKPRINT25",
    discount: "25% OFF",
    title: "Especial Black Friday",
    description: "Promoción de temporada en toda la línea textil.",
    expiresAt: "30 Nov 2025",
    status: "expired",
    statusLabel: "Vencido",
    statusDotColor: "bg-slate-400",
    statusTextColor: "text-slate-500",
  },
];

// ── Ilustración Fiel del Estado Vacío (Boleto % morado y chispas) ────────────
function CouponsEmptyIllustration() {
  return (
    <div className="relative mx-auto flex h-[210px] w-[340px] select-none items-center justify-center sm:h-[230px] sm:w-[380px]">
      <svg
        viewBox="0 0 380 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Sombra base */}
        <ellipse
          cx="190"
          cy="200"
          rx="140"
          ry="14"
          fill="#E2E8F0"
          fillOpacity="0.6"
        />

        {/* Chispas amarillas decorativas flotantes */}
        <path
          d="M195 90L197 84L200 90L206 92L200 94L197 100L195 94L189 92L195 90Z"
          fill="#FBBF24"
        />
        <path
          d="M260 82L262 76L265 82L271 84L265 86L262 92L260 86L254 84L260 82Z"
          fill="#F59E0B"
        />
        <path
          d="M265 100L272 90"
          stroke="#FBBF24"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M272 108L280 102"
          stroke="#FBBF24"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Boleto secundario detrás (blanco/lavanda) */}
        <g transform="rotate(-15 160 120)">
          <path
            d="M95 105C95 100 99 96 104 96H210C215 96 219 100 219 105C219 110 223 114 228 114C233 114 237 118 237 123V152C237 157 233 161 228 161C223 161 219 165 219 170H104C99 170 95 166 95 161C95 156 91 152 86 152C81 152 77 148 77 143V114C77 109 81 105 86 105C91 105 95 101 95 96"
            fill="#F1F5F9"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          {/* Línea punteada de desprendimiento */}
          <line
            x1="175"
            y1="98"
            x2="175"
            y2="168"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        </g>

        {/* Boleto principal morado 3D con % en relieve */}
        <g transform="rotate(8 210 115)">
          {/* Cuerpo del cupón */}
          <path
            d="M140 70C140 64 144 60 150 60H265C271 60 275 64 275 70C275 76 279 80 285 80C291 80 295 84 295 90V135C295 141 291 145 285 145C279 145 275 149 275 155C275 161 271 165 265 165H150C144 165 140 161 140 155C140 149 136 145 130 145C124 145 120 141 120 135V90C120 84 124 80 130 80C136 80 140 76 140 70Z"
            fill="#6366F1"
            stroke="#4F46E5"
            strokeWidth="1.5"
          />

          {/* Símbolo de porcentaje (%) grande en blanco nítido */}
          <circle
            cx="180"
            cy="98"
            r="9"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            fill="none"
          />
          <line
            x1="172"
            y1="135"
            x2="218"
            y2="85"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <circle
            cx="210"
            cy="122"
            r="9"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            fill="none"
          />

          {/* Línea punteada divisoria */}
          <line
            x1="242"
            y1="64"
            x2="242"
            y2="161"
            stroke="#818CF8"
            strokeWidth="2"
            strokeDasharray="3 3"
          />

          {/* Icono de destello en el cupón derecho */}
          <path
            d="M268 110L270 102L272 110L280 112L272 114L270 122L268 114L260 112L268 110Z"
            fill="#FFFFFF"
            fillOpacity="0.8"
          />
        </g>

        {/* Hojas / hojas flotantes sutiles en la base */}
        <path
          d="M170 175C165 160 175 150 185 148C182 162 174 172 170 175Z"
          fill="#CBD5E1"
          fillOpacity="0.7"
        />
        <path
          d="M270 172C278 160 290 158 298 162C292 172 282 178 270 172Z"
          fill="#CBD5E1"
          fillOpacity="0.7"
        />
      </svg>
    </div>
  );
}

// ── Diálogo Modal para Canjear Código ─────────────────────────────────────────
function RedeemCodeModal({
  isOpen,
  onClose,
  onRedeem,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => boolean;
}) {
  const [inputCode, setInputCode] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg("Por favor ingresa un código promocional.");
      return;
    }
    const success = onRedeem(inputCode.trim());
    if (success) {
      setInputCode("");
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg("Este código no es válido o ya ha sido canjeado.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-150"
        style={{ borderRadius: 5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Canjear cupón
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(customerIconButtonClass, "h-8 w-8")}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Ingresa tu código de descuento o beneficio para añadirlo a tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="coupon-input"
              className="block text-xs font-semibold text-slate-700"
            >
              Código del cupón
            </label>
            <input
              id="coupon-input"
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value.toUpperCase());
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="EJ: CREATIVO15"
              className="mt-1.5 w-full border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono font-medium tracking-wider text-slate-900 uppercase focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              style={{ borderRadius: 5 }}
              autoFocus
            />
            {errorMsg && (
              <p className="mt-1.5 text-[11px] text-red-600 font-medium">
                {errorMsg}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              style={{ borderRadius: 5 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 active:scale-[0.98]"
              style={{ borderRadius: 5 }}
            >
              Aplicar beneficio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Menú de Tres Puntos para Cada Cupón ───────────────────────────────────────
function CouponCardMenu({
  onCopy,
}: {
  coupon: CouponItem;
  onCopy: () => void;
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
        aria-label="Opciones del cupón"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <CustomerPortalMenu
        open={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
        minWidth={180}
      >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onCopy();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-slate-400" />
            <span>Copiar código</span>
          </button>
          <Link
            to="/designerv"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span>Ir al Diseñador</span>
          </Link>
      </CustomerPortalMenu>
    </div>
  );
}

// ── Página Principal de Cupones y Descuentos ─────────────────────────────────
export function CustomerCouponsPage() {
  const [coupons, setCoupons] = React.useState<CouponItem[]>(INITIAL_COUPONS);
  const [filter, setFilter] = React.useState<CouponFilter>("available");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isRedeemOpen, setIsRedeemOpen] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // Copiar código al portapapeles con feedback accesible
  const handleCopyCode = React.useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setToastMsg(`Código "${code}" copiado al portapapeles.`);
      setTimeout(() => setToastMsg(null), 2500);
    });
  }, []);

  // Canjear nuevo código
  const handleRedeem = React.useCallback(
    (code: string) => {
      const exists = coupons.some((c) => c.code === code);
      if (exists) return false;

      const newCoupon: CouponItem = {
        id: `coup-${Date.now()}`,
        code: code,
        discount: "20% OFF",
        title: "Beneficio canjeado exitosamente",
        description: "Cupón promocional habilitado para tus personalizaciones.",
        expiresAt: "31 Dic 2026",
        status: "available",
        statusLabel: "Disponible",
        statusDotColor: "bg-emerald-500",
        statusTextColor: "text-emerald-700",
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      setToastMsg(`¡Cupón "${code}" canjeado y añadido a disponibles!`);
      setTimeout(() => setToastMsg(null), 3000);
      setFilter("available");
      return true;
    },
    [coupons],
  );

  // Contadores
  const availableCount = coupons.filter((c) => c.status === "available").length;
  const usedCount = coupons.filter((c) => c.status === "used").length;
  const expiredCount = coupons.filter((c) => c.status === "expired").length;

  // Filtrado
  const displayedCoupons = React.useMemo(() => {
    let list = coupons.filter((c) => c.status === filter);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.discount.toLowerCase().includes(q),
    );
  }, [coupons, filter, searchQuery]);

  const FILTER_TABS: { key: CouponFilter; label: string; count: number }[] = [
    { key: "available", label: "Disponibles", count: availableCount },
    { key: "used", label: "Utilizados", count: usedCount },
    { key: "expired", label: "Vencidos", count: expiredCount },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-150">
      {/* ── Encabezado Principal ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Cupones y descuentos
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Consulta los beneficios disponibles para tus herramientas y recursos
            creativos.
          </p>
        </div>

        {/* Botón superior derecho: Canjear código */}
        <button
          type="button"
          onClick={() => setIsRedeemOpen(true)}
          className="inline-flex h-[42px] w-[160px] items-center justify-center self-start bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 sm:self-auto"
          style={{ borderRadius: 5 }}
        >
          <span>Canjear código</span>
        </button>
      </div>

      {/* ── Toast de Feedback ────────────────────────────────────────────── */}
      {toastMsg && (
        <div
          className="flex items-center border border-slate-300 bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-800 animate-in fade-in duration-150"
          style={{ borderRadius: 5 }}
          role="status"
        >
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Barra de Filtros y Búsqueda ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Pestañas: Disponibles | Utilizados | Vencidos */}
        <div
          className="flex flex-wrap gap-1.5 bg-slate-100 p-1 border border-slate-200/60"
          style={{ borderRadius: 5 }}
          role="tablist"
          aria-label="Filtro de beneficios"
        >
          {FILTER_TABS.map(({ key, label }) => {
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

        {/* Buscador de beneficios */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar código o beneficio..."
            className="h-[42px] w-full border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
            style={{ borderRadius: 5 }}
            aria-label="Buscar cupones por código o título"
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

      {/* ── Contenido de Cupones / Estado Vacío ───────────────────────────── */}
      {displayedCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-200">
          {/* Ilustración 3D del ticket con % */}
          <CouponsEmptyIllustration />

          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            {filter === "available"
              ? "Aún no tienes cupones disponibles"
              : filter === "used"
                ? "No tienes cupones utilizados"
                : "No tienes cupones vencidos"}
          </h2>
          <p className="mt-1.5 max-w-md text-xs text-slate-500 sm:text-sm">
            {filter === "available"
              ? "Cuando haya beneficios para tu cuenta, aparecerán aquí con sus condiciones y vigencia."
              : "Aquí quedará registrado el historial de beneficios canjeados en tus pedidos."}
          </p>
        </div>
      ) : (
        /* Cuadrícula de Cupones */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayedCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className={cn(
                "relative flex flex-col justify-between border bg-white p-5 transition-shadow duration-150 hover:shadow-xs",
                coupon.status === "available"
                  ? "border-slate-200"
                  : "border-slate-200/80 opacity-90",
              )}
              style={{ borderRadius: 5 }}
            >
              <div>
                {/* Cabecera de la tarjeta: Descuento, Estado y Menú */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      {coupon.discount}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-medium",
                        coupon.statusTextColor,
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          coupon.statusDotColor,
                        )}
                      />
                      {coupon.statusLabel}
                    </span>
                  </div>

                  <CouponCardMenu
                    coupon={coupon}
                    onCopy={() => handleCopyCode(coupon.code)}
                  />
                </div>

                {/* Título y descripción */}
                <h3 className="mt-1 text-xs font-semibold text-slate-800">
                  {coupon.title}
                </h3>
                <p className="mt-0.5 text-[12px] text-slate-500 leading-relaxed">
                  {coupon.description}
                </p>

                {coupon.minSpend && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {coupon.minSpend}
                  </p>
                )}
              </div>

              {/* Pie de tarjeta: Código y botón de copiar */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <span
                    className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono font-bold tracking-wider text-slate-800 select-all"
                    style={{ borderRadius: 4 }}
                  >
                    {coupon.code}
                  </span>
                  {coupon.status === "available" && (
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Hasta {coupon.expiresAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Canjear Código ─────────────────────────────────────────── */}
      <RedeemCodeModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onRedeem={handleRedeem}
      />
    </div>
  );
}

export default CustomerCouponsPage;
