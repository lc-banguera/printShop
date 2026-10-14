import * as React from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Clock,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import StatusDot from "../StatusDot";
import { Shipment, TrackingEvent, ShipmentStatus } from "./types";

interface ShipmentTrackingModalProps {
  isOpen: boolean;
  shipment: Shipment | null;
  orderId: string;
  onClose: () => void;
}

export const ShipmentTrackingModal: React.FC<ShipmentTrackingModalProps> = ({
  isOpen,
  shipment,
  orderId,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !shipment) return null;

  const handleCopyGuide = () => {
    navigator.clipboard.writeText(shipment.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusLabel = (status: ShipmentStatus) => {
    switch (status) {
      case "NOT_SHIPPED":
        return "No despachado";
      case "SHIPPED":
        return "Guía generada / En espera";
      case "IN_TRANSIT":
        return "En tránsito nacional";
      case "OUT_FOR_DELIVERY":
        return "En ruta de entrega urbana";
      case "DELIVERED":
        return "Entregado a satisfacción";
      default:
        return status;
    }
  };

  const getSourceBadge = (source: TrackingEvent["source"]) => {
    switch (source) {
      case "carrier_webhook":
        return (
          <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Webhook Transportadora
          </span>
        );
      case "manual":
        return (
          <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
            Operador Logístico
          </span>
        );
      case "mock":
        return (
          <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Simulación Mock
          </span>
        );
      default:
        return null;
    }
  };

  const sortedEvents = [...(shipment.trackingEvents || [])].sort((a, b) => {
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] space-y-5">
        {/* Header — Sin icono superior según identidad PrintShop */}
        <div className="flex items-start justify-between border-b border-[#F1F5F9] pb-3.5 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827]">
                Rastreo de Envío
              </h2>
              <StatusDot status={getStatusLabel(shipment.shippingStatus)} />
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Pedido{" "}
              <span className="font-medium text-[#111827]">
                {orderId.startsWith("#") ? orderId : `#${orderId}`}
              </span>{" "}
              · {shipment.carrier}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#111827] hover:bg-[#F1F5F9] rounded-[4px] transition-colors shrink-0"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tarjeta de Información de la Guía */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                Número de Guía de Rastreo
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-mono font-bold text-[#111827]">
                  {shipment.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyGuide}
                  className="p-1 text-[#64748B] hover:text-[#2563EB] rounded hover:bg-[#EFF6FF] transition-colors"
                  title="Copiar guía"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {shipment.trackingUrl && (
              <a
                href={shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-white border border-[#BFDBFE] px-3 py-1.5 rounded-[6px] shadow-2xs transition-colors"
              >
                <span>Portal {shipment.carrier}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E2E8F0] text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] block font-medium">
                Transportadora
              </span>
              <p className="font-semibold text-[#111827] mt-0.5">
                {shipment.carrier}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] block font-medium">
                Fecha Estimada
              </span>
              <p className="font-semibold text-[#111827] mt-0.5">
                {shipment.estimatedDeliveryAt || "Pendiente de cálculo"}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] block font-medium">
                Estado Actual
              </span>
              <p className="font-semibold text-[#111827] mt-0.5">
                {getStatusLabel(shipment.shippingStatus)}
              </p>
            </div>
          </div>
        </div>

        {/* Historial Inmutable de Eventos de Rastreo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Historial de Eventos del Envío ({sortedEvents.length})
            </h3>
            <span className="text-[11px] text-[#64748B]">
              Actualizado en tiempo real
            </span>
          </div>

          {sortedEvents.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#CBD5E1] rounded-lg text-xs text-[#64748B]">
              No hay eventos de rastreo registrados para este paquete todavía.
            </div>
          ) : (
            <div className="relative max-h-72 overflow-y-auto pr-1 pl-3">
              {/* Vertical guide line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-[#CBD5E1]" />

              {sortedEvents.map((evt, idx) => {
                const isLatest = idx === 0;
                const isLast = idx === sortedEvents.length - 1;
                const dateObj = new Date(evt.occurredAt);
                const formattedDate = isNaN(dateObj.getTime())
                  ? evt.occurredAt
                  : dateObj.toLocaleString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                return (
                  <div
                    key={evt.id || idx}
                    className="relative pl-8 mb-4 text-xs"
                  >
                    {/* Marker */}
                    <span
                      className={cn(
                        "absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white",
                        isLatest
                          ? "bg-[#2563EB] ring-2 ring-[#BFDBFE]"
                          : evt.status === "DELIVERED"
                            ? "bg-[#10B981]"
                            : "bg-[#94A3B8]",
                      )}
                    />

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-bold",
                              isLatest ? "text-[#111827]" : "text-[#475569]",
                            )}
                          >
                            {evt.description}
                          </span>
                          {getSourceBadge(evt.source)}
                        </div>
                        <span className="text-[10.5px] text-[#64748B] shrink-0 font-mono">
                          {formattedDate}
                        </span>
                      </div>

                      {evt.location && (
                        <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                          <span>{evt.location}</span>
                        </p>
                      )}

                      {(evt as any).note && (
                        <p className="text-[11px] text-[#64748B] italic mt-1">
                          {(evt as any).note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-[6px] bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
