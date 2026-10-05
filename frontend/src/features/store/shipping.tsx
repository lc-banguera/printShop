import * as React from "react";
import {
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Zap,
  Check,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";

export interface ShipmentItem {
  id: string;
  orderId: string;
  customerName: string;
  destination: string;
  carrier: "Coordinadora" | "Servientrega" | "Inter Rapidísimo" | "PrintShop Express";
  trackingCode: string;
  status: "Pendiente despacho" | "En tránsito" | "Entregado" | "Incidencia";
  date: string;
}

const mockShipments: ShipmentItem[] = [
  {
    id: "shp-1",
    orderId: "#ORD-9875",
    customerName: "Carlos Ramírez",
    destination: "Medellín, Antioquia",
    carrier: "Coordinadora",
    trackingCode: "COORD-88741",
    status: "En tránsito",
    date: "Hoy, 08:00 AM",
  },
  {
    id: "shp-2",
    orderId: "#ORD-9876",
    customerName: "María González",
    destination: "Bogotá D.C.",
    carrier: "PrintShop Express",
    trackingCode: "EXP-COL-99824",
    status: "Pendiente despacho",
    date: "Hoy, 10:42 AM",
  },
  {
    id: "shp-3",
    orderId: "#ORD-9873",
    customerName: "Andrés López",
    destination: "Barranquilla, Atlántico",
    carrier: "Servientrega",
    trackingCode: "SERVI-11928",
    status: "Entregado",
    date: "04 de Mayo",
  },
  {
    id: "shp-4",
    orderId: "#ORD-9860",
    customerName: "Diana Morales",
    destination: "Cali, Valle del Cauca",
    carrier: "Inter Rapidísimo",
    trackingCode: "INTER-44910",
    status: "Incidencia",
    date: "02 de Mayo",
  },
];

export default function StoreShipping() {
  const [activeTab, setActiveTab] = React.useState<"envios" | "config">("envios");
  const [freeShippingEnabled, setFreeShippingEnabled] = React.useState(true);
  const [expressEnabled, setExpressEnabled] = React.useState(true);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Envíos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Logística y Envíos
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Administra los despachos de tus pedidos, guías de transporte y
            configuración de tarifas.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-[8px]">
          <button
            type="button"
            onClick={() => setActiveTab("envios")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-colors",
              activeTab === "envios"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#64748B] hover:text-[#111827]",
            )}
          >
            Guías y Despachos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("config")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-colors",
              activeTab === "config"
                ? "bg-white text-[#111827] shadow-xs"
                : "text-[#64748B] hover:text-[#111827]",
            )}
          >
            Configuración de Tarifas
          </button>
        </div>
      </div>

      {/* ── KPIs de Envíos ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Pendientes por Despachar
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">14</p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            En taller de empaque
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">En Tránsito</span>
          <p className="text-2xl font-black text-[#111827] mt-1">28</p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Con transportadora
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">Entregados</span>
          <p className="text-2xl font-black text-[#111827] mt-1">262</p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Entregas exitosas
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">Incidencias</span>
          <p className="text-2xl font-black text-[#111827] mt-1">1</p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-block">
            Dirección no encontrada
          </span>
        </div>
      </div>

      {activeTab === "envios" ? (
        /* ── Tabla de Guías ─────────────────────────────────────────── */
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB]">
            <h2 className="text-sm font-bold text-[#111827]">
              Envíos Recientes y Seguimiento de Guías
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Pedido</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4">Transportadora</th>
                  <th className="py-3 px-4">Número de Guía</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Rastreo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {mockShipments.map((shp) => (
                  <tr key={shp.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-4 font-bold text-[#111827]">
                      {shp.orderId}
                    </td>
                    <td className="py-3.5 px-4 text-[#334155]">
                      {shp.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      <span>{shp.destination}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      {shp.carrier}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#111827]">
                      {shp.trackingCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusDot status={shp.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#111827] hover:bg-[#F1F5F9] px-2.5 py-1.5 rounded-[5px] transition-colors"
                      >
                        <span>Rastrear</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Configuración de Envíos ────────────────────────────────── */
        <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Modalidades y Métodos de Envío
            </h2>
            <p className="text-xs text-[#64748B]">
              Define si ofreces envío gratis o logística gestionada por PrintShop.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl text-xs">
            {/* PrintShop Express */}
            <div className="p-4 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF]/40 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-sm">
                    PrintShop Express (Logística Full)
                  </h3>
                  <p className="text-[#475569] mt-0.5">
                    PrintShop se encarga del empaque, estampado prioritario y
                    entrega en 24-48h hábiles en las principales ciudades.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={expressEnabled}
                onChange={(e) => setExpressEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#2563EB] rounded cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Envío Gratis */}
            <div className="p-4 rounded-xl border border-[#E5E7EB] bg-white flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#10B981] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-sm">
                    Envío Gratis Automático
                  </h3>
                  <p className="text-[#64748B] mt-0.5">
                    Ofrecer envío gratuito a tus clientes en compras superiores a
                    $120.000 COP para aumentar el ticket promedio.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#2563EB] rounded cursor-pointer shrink-0 mt-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
