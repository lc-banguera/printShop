import * as React from "react";
import { cn } from "@/shared/utils/cn";

export function getStatusDotColor(status: string): string {
  const s = status.toLowerCase().trim();

  // Verde: Pagado, Completado, Activo, Publicado, Entregado, Frecuente
  if (
    s.includes("paga") ||
    s.includes("complet") ||
    s.includes("activ") ||
    s.includes("publicad") ||
    s.includes("entregad") ||
    s.includes("frecuent") ||
    s.includes("principal")
  ) {
    return "bg-[#10B981]";
  }

  // Amarillo / Naranja: Pendiente, En espera, En revisión, Pendiente despacho, Programado
  if (
    s.includes("pendient") ||
    s.includes("espera") ||
    s.includes("revis") ||
    s.includes("programad")
  ) {
    return "bg-[#F59E0B]";
  }

  // Azul: Enviado, En producción, En tránsito, En ruta / reparto
  if (
    s.includes("enviad") ||
    s.includes("producc") ||
    s.includes("tránsit") ||
    s.includes("transit") ||
    s.includes("ruta") ||
    s.includes("reparto")
  ) {
    return "bg-[#2563EB]";
  }

  // Rojo: Cancelado, Error, Agotado, Incidencia, Reembolsado
  if (
    s.includes("cancel") ||
    s.includes("error") ||
    s.includes("agotad") ||
    s.includes("incidenc") ||
    s.includes("reembols")
  ) {
    return "bg-[#EF4444]";
  }

  // Gris: Borrador, Inactivo, Finalizado, Pausado
  return "bg-[#94A3B8]";
}

export interface StatusDotProps {
  status: string;
  className?: string;
  textClassName?: string;
}

export function StatusDot({
  status,
  className,
  textClassName,
}: StatusDotProps) {
  const dotColor = getStatusDotColor(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-[#334155] font-normal leading-normal whitespace-nowrap",
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
      <span className={cn("text-[#334155]", textClassName)}>{status}</span>
    </span>
  );
}

export default StatusDot;
