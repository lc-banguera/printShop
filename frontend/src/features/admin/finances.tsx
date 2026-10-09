import React, { useState } from "react";
import {
  Landmark,
  Download,
  MoreHorizontal,
  SlidersHorizontal,
  Shield,
  History,
  CreditCard,
  Eye,
  Copy,
  Check,
  Receipt,
  Wifi,
  Filter,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown";
import { PageHeader } from "@/shared/ui/page-header";
import { TableSearchBar } from "@/shared/ui/table-search-bar";
import { TablePagination } from "@/shared/ui/table-pagination";
import type { TableAction } from "@/shared/ui/table-actions";
import { TableActions } from "@/shared/ui/table-actions";

/* ── Tipos ────────────────────────────────────────────────────── */
interface Movement {
  id: string;
  date: string;
  time: string;
  type: "Ingreso" | "Egreso";
  origin: string;
  destination: string;
  description: string;
  amount: string;
  method: string;
  status: string;
  referenceNumber: string;
  authCode: string;
  notes?: string;
}

/* ── Datos mock ───────────────────────────────────────────────── */
const mockMovements: Movement[] = [
  {
    id: "FIN-2026-000245",
    date: "16 May, 2026",
    time: "11:20 AM",
    type: "Ingreso",
    origin: "Creative Print Store",
    destination: "PrintShop Principal",
    description: "Pago por suscripción Premium (May, 2026)",
    amount: "$89.900",
    method: "Tarjeta •••• 4242",
    status: "Completado",
    referenceNumber: "REF-88492019",
    authCode: "AUTH-94821",
    notes: "Transacción aprobada automáticamente vía pasarela Stripe.",
  },
  {
    id: "FIN-2026-000244",
    date: "16 May, 2026",
    time: "09:15 AM",
    type: "Ingreso",
    origin: "Urban Style Prints",
    destination: "PrintShop Principal",
    description: "Renovación plan Profesional (May, 2026)",
    amount: "$49.900",
    method: "PSE Bancolombia",
    status: "Completado",
    referenceNumber: "REF-88492018",
    authCode: "AUTH-94820",
    notes: "Pago recibido por PSE Bancolombia exitoso.",
  },
  {
    id: "FIN-2026-000243",
    date: "15 May, 2026",
    time: "04:30 PM",
    type: "Egreso",
    origin: "PrintShop Principal",
    destination: "Amazon Web Services",
    description: "Servicio de hosting (Abr – May, 2026)",
    amount: "$580.000",
    method: "Transferencia",
    status: "Completado",
    referenceNumber: "REF-88492017",
    authCode: "AUTH-94819",
    notes: "Factura mensual AWS Cloud Services.",
  },
  {
    id: "FIN-2026-000242",
    date: "15 May, 2026",
    time: "02:10 PM",
    type: "Ingreso",
    origin: "Print House CO",
    destination: "PrintShop Principal",
    description: "Pago por suscripción Básico (May, 2026)",
    amount: "$19.900",
    method: "Nequi •••• 2345",
    status: "Completado",
    referenceNumber: "REF-88492016",
    authCode: "AUTH-94818",
    notes: "Pago digital Nequi acreditado al instante.",
  },
  {
    id: "FIN-2026-000241",
    date: "14 May, 2026",
    time: "10:05 AM",
    type: "Egreso",
    origin: "PrintShop Principal",
    destination: "Cloudflare Inc.",
    description: "Servicio de CDN y seguridad (May, 2026)",
    amount: "$180.000",
    method: "Tarjeta •••• 1111",
    status: "Completado",
    referenceNumber: "REF-88492015",
    authCode: "AUTH-94817",
    notes: "Renovación plan Enterprise CDN & WAF.",
  },
  {
    id: "FIN-2026-000240",
    date: "14 May, 2026",
    time: "08:45 AM",
    type: "Ingreso",
    origin: "Color Express",
    destination: "PrintShop Principal",
    description: "Renovación plan Profesional (May, 2026)",
    amount: "$49.900",
    method: "PSE Daviplata",
    status: "Completado",
    referenceNumber: "REF-88492014",
    authCode: "AUTH-94816",
    notes: "Pago confirmado por Daviplata.",
  },
  {
    id: "FIN-2026-000239",
    date: "13 May, 2026",
    time: "03:20 PM",
    type: "Egreso",
    origin: "PrintShop Principal",
    destination: "Microsoft 365 Enterprise",
    description: "Licencias Microsoft 365 (Abr – May, 2026)",
    amount: "$320.000",
    method: "Débito Bancario",
    status: "Completado",
    referenceNumber: "REF-88492013",
    authCode: "AUTH-94815",
    notes: "Débito automático empresarial.",
  },
  {
    id: "FIN-2026-000238",
    date: "13 May, 2026",
    time: "11:50 AM",
    type: "Ingreso",
    origin: "Art & Ink Studio",
    destination: "PrintShop Principal",
    description: "Pago por suscripción Básico (May, 2026)",
    amount: "$19.900",
    method: "Tarjeta •••• 8888",
    status: "Completado",
    referenceNumber: "REF-88492012",
    authCode: "AUTH-94814",
    notes: "Suscripción mensual inicial.",
  },
];

/* ── Acciones de la tabla (usa el componente compartido) ───────── */
const buildMovementActions = (
  m: Movement,
  onDetail: (m: Movement) => void,
  onVoucher: (m: Movement) => void,
  onCopy: (id: string) => void,
): TableAction[] => [
  { label: "Ver detalle", icon: Eye, onSelect: () => onDetail(m) },
  { label: "Ver comprobante", icon: Receipt, onSelect: () => onVoucher(m) },
  { label: "Copiar ID", icon: Copy, onSelect: () => onCopy(m.id) },
];

/* ── Componente principal ─────────────────────────────────────── */
export default function Finances() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Todos" | "Ingreso" | "Egreso">(
    "Todos",
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detailMovement, setDetailMovement] = useState<Movement | null>(null);
  const [voucherMovement, setVoucherMovement] = useState<Movement | null>(null);
  const [cardModalInfo, setCardModalInfo] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2000);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText?.(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMovements = mockMovements.filter((m) => {
    const matchSearch =
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.origin.toLowerCase().includes(search.toLowerCase()) ||
      m.destination.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "Todos" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-3.5 sm:p-4 space-y-3 bg-background min-h-full">
      {/* ── Encabezado del módulo ──────────────────────────────── */}
      <PageHeader
        title="Finanzas"
        description="Gestiona y supervisa todas las operaciones financieras de la plataforma."
        icon={Landmark}
        action={
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] px-3 py-1.5 bg-surface hover:bg-surfaceMuted transition-colors cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Download className="h-3.5 w-3.5 text-foregroundSubtle" />
            {exportNotice ? "Exportando..." : "Exportar reporte"}
          </button>
        }
      />

      {/* ── Tabla: Movimientos Financieros ────────────────────── */}
      <div className="w-full min-w-0 overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {/* Toolbar de la tabla */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-borderMuted bg-surfaceMuted p-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Movimientos Financieros
            </h2>
            <p className="mt-1 text-xs text-foregroundMuted">
              Control detallado de todos los ingresos, egresos y movimientos
              financieros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <TableSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar movimiento..."
              width="w-56"
            />
            {/* Filtro por tipo */}
            <div className="relative inline-flex items-center">
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as typeof typeFilter)
                }
                className="h-10 max-w-full appearance-none rounded-control border border-border bg-surface pl-3.5 pr-8 text-sm text-foregroundMuted shadow-subtle outline-none transition-colors duration-normal hover:border-borderStrong focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Ingreso">Solo Ingresos</option>
                <option value="Egreso">Solo Egresos</option>
              </select>
              <Filter className="pointer-events-none absolute right-2.5 h-4 w-4 text-foregroundSubtle" />
            </div>
            {/* Opciones generales */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-foregroundMuted shadow-subtle transition-colors duration-normal hover:border-borderStrong hover:bg-surfaceMuted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[170px] rounded-card border border-border bg-surface p-1.5 shadow-elevated"
              >
                <DropdownMenuItem
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground"
                >
                  <Download className="h-4 w-4 text-foregroundSubtle" />
                  <span>Exportar CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 rounded-control px-3 py-2 text-sm font-medium text-foregroundMuted hover:bg-surfaceMuted hover:text-foreground">
                  <SlidersHorizontal className="h-4 w-4 text-foregroundSubtle" />
                  <span>Personalizar columnas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabla — 7 columnas exactas */}
        <div className="min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-surfaceMuted text-foreground">
                {[
                  "ID MOVIMIENTO",
                  "FECHA",
                  "TIPO",
                  "DESCRIPCIÓN",
                  "MONTO",
                  "ESTADO",
                  "ACCIONES",
                ].map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-foregroundMuted"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderMuted">
              {filteredMovements.map((m) => (
                <tr key={m.id} className="transition-colors duration-normal hover:bg-surfaceStrong">
                  {/* ID MOVIMIENTO */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {m.id}
                  </td>

                  {/* FECHA */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 font-normal">
                    <p className="text-sm font-normal leading-tight text-foregroundMuted">{m.date}</p>
                    <p className="mt-0.5 text-xs font-normal leading-tight text-foregroundSubtle">
                      {m.time}
                    </p>
                  </td>

                  {/* TIPO — sin colores, texto plano uniforme */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {m.type}
                  </td>

                  {/* DESCRIPCIÓN */}
                  <td className="border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    <span className="line-clamp-1 font-normal">{m.description}</span>
                  </td>

                  {/* MONTO — sin colores, texto plano uniforme */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {m.amount}
                  </td>

                  {/* ESTADO — sin badge, texto plano uniforme */}
                  <td className="whitespace-nowrap border-b border-borderMuted px-4 py-3 text-sm font-normal text-foregroundMuted">
                    {m.status}
                  </td>

                  {/* ACCIONES — únicamente botón de tres puntos */}
                  <td className="px-3 py-2.5">
                    <TableActions
                      actions={buildMovementActions(
                        m,
                        setDetailMovement,
                        setVoucherMovement,
                        handleCopyId,
                      )}
                    />
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-foregroundMuted"
                  >
                    No se encontraron movimientos financieros con los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación — componente compartido del sistema */}
        <TablePagination
          totalItems={128}
          itemLabel="movimientos"
          totalPages={16}
          itemsPerPage={8}
        />
      </div>

      {/* ── Modal: Detalle completo del movimiento ─────────────── */}
      {detailMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-[5px] max-w-lg w-full p-5 sm:p-6 shadow-xl border border-border relative">
            <div className="flex items-center justify-between pb-3.5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-[5px] bg-infoMuted text-primary flex items-center justify-center">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Detalle del Movimiento
                  </h3>
                  <p className="text-[11px] text-foregroundSubtle">
                    {detailMovement.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailMovement(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-surfaceMuted text-foregroundSubtle flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-0 text-[12.5px] divide-y divide-surfaceMuted">
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Monto</span>
                <span className="font-semibold text-foreground text-[14px]">
                  {detailMovement.amount}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Tipo</span>
                <span className="text-foreground">{detailMovement.type}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Estado</span>
                <span className="text-foreground">{detailMovement.status}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Fecha y Hora</span>
                <span className="text-foreground">
                  {detailMovement.date} — {detailMovement.time}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Origen</span>
                <span className="text-foreground">{detailMovement.origin}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Destino</span>
                <span className="text-foreground">
                  {detailMovement.destination}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Descripción</span>
                <span className="text-foreground text-right max-w-[260px]">
                  {detailMovement.description}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Método de pago</span>
                <span className="text-foreground">{detailMovement.method}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">No. Referencia</span>
                <span className="text-foreground font-mono">
                  {detailMovement.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foregroundSubtle">Código Autorización</span>
                <span className="text-foreground font-mono">
                  {detailMovement.authCode}
                </span>
              </div>
              {detailMovement.notes && (
                <div className="pt-2.5">
                  <p className="text-[11px] text-foregroundSubtle font-medium mb-0.5">
                    Información adicional
                  </p>
                  <p className="text-[12px] text-foregroundMuted">
                    {detailMovement.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3.5 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyId(detailMovement.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foregroundMuted border border-border rounded-[5px] bg-surface hover:bg-surfaceMuted transition-colors cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {copiedId === detailMovement.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[var(--success)]" />
                    <span>ID Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar ID</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setDetailMovement(null)}
                className="px-4 py-1.5 text-xs font-medium text-foregroundMuted bg-surfaceMuted border border-border rounded-[5px] hover:bg-surfaceMuted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Comprobante de transacción ──────────────────── */}
      {voucherMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-[5px] max-w-md w-full p-5 sm:p-6 shadow-xl border border-border relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Comprobante de Transacción
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVoucherMovement(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-surfaceMuted text-foregroundSubtle flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4">
              <div className="border border-dashed border-borderStrong rounded-[5px] p-4 bg-surfaceMuted space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="font-bold text-xs text-foreground">
                    PrintShop SaaS Platform
                  </span>
                  <span className="text-[10.5px] text-success font-semibold bg-surfaceMuted px-2 py-0.5 rounded-[3px]">
                    VÁLIDO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foregroundSubtle">Comprobante No:</span>
                  <span className="font-mono text-foreground font-medium">
                    {voucherMovement.referenceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foregroundSubtle">ID Movimiento:</span>
                  <span className="font-mono text-foreground">
                    {voucherMovement.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foregroundSubtle">Fecha / Hora:</span>
                  <span className="text-foreground">
                    {voucherMovement.date} • {voucherMovement.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foregroundSubtle">Método:</span>
                  <span className="text-foreground">
                    {voucherMovement.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foregroundSubtle">Concepto:</span>
                  <span className="text-foreground text-right max-w-[200px]">
                    {voucherMovement.description}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-bold text-foreground">
                    Total Transacción:
                  </span>
                  <span className="font-bold text-[15px] text-foreground">
                    {voucherMovement.amount}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setVoucherMovement(null)}
                className="px-4 py-1.5 text-xs font-semibold text-primaryForeground bg-primary rounded-[5px] hover:bg-primaryHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Información de la cuenta bancaria ───────────── */}
      {cardModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-[5px] max-w-sm w-full p-5 shadow-xl border border-border relative">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {cardModalInfo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCardModalInfo(null)}
                className="h-7 w-7 rounded-[4px] hover:bg-surfaceMuted text-foregroundSubtle flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-4 text-xs text-foregroundSubtle space-y-2">
              <p>Módulo de gestión para la cuenta bancaria del sistema.</p>
              <div className="p-3 bg-surfaceMuted rounded-[5px] border border-border text-foregroundMuted space-y-1">
                <p>
                  <strong>Banco:</strong> Banco de Bogotá
                </p>
                <p>
                  <strong>Cuenta:</strong> Corriente •••• 4421
                </p>
                <p>
                  <strong>NIT:</strong> *********-*
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setCardModalInfo(null)}
                className="px-4 py-1.5 text-xs font-semibold text-primaryForeground bg-primary rounded-[5px] hover:bg-primaryHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
