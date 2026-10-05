import {
  StoreOrderFull,
  Shipment,
  ShipmentStatus,
  OrderActionType,
  OrderActionDefinition,
} from "./types";

/* ── Catálogo Oficial de Metadatos de Acciones ───────────────────────────── */
export const ORDER_ACTION_METADATA: Record<
  OrderActionType,
  Omit<OrderActionDefinition, "type">
> = {
  INICIAR_PRODUCCION: {
    label: "Iniciar producción",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Enviar Pedido a Taller de Producción",
    modalDescription:
      "Confirma que los archivos gráficos cumplen con la resolución y las prendas base están listas para confección y estampado.",
  },
  MARCAR_LISTO: {
    label: "Marcar como terminado",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Marcar Pedido como Terminado",
    modalDescription:
      "Confirma que la fabricación y personalización del producto ha finalizado en taller con control de calidad aprobado.",
  },
  PREPARAR_ENVIO: {
    label: "Preparar envío",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Generar Despacho y Asignar Guía",
    modalDescription:
      "Ingresa la empresa transportadora y el número de guía de rastreo para preparar el paquete del cliente.",
  },
  DESPACHAR_TRANSPORTADORA: {
    label: "Despachar a transportadora",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Entrega a Transportadora",
    modalDescription:
      "Confirma que el paquete fue entregado al recolector de la transportadora con su manifiesto de carga.",
  },
  REGISTRAR_EN_TRANSITO: {
    label: "Registrar en tránsito",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Confirmar Salida en Tránsito",
    modalDescription:
      "Registra que el paquete se encuentra en movimiento entre centros de distribución de la transportadora.",
  },
  REGISTRAR_EN_ENTREGA: {
    label: "En ruta de entrega",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Pasar a Ruta de Entrega",
    modalDescription:
      "Confirma que el paquete fue cargado en el vehículo de reparto urbano para entrega en el domicilio hoy.",
  },
  CONFIRMAR_ENTREGA: {
    label: "Confirmar entrega",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Confirmar Entrega a Satisfacción",
    modalDescription:
      "Registra que el paquete fue recibido con éxito por el destinatario final en su dirección de entrega.",
  },
  PAGAR_ANTICIPO: {
    label: "Registrar anticipo",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Acreditar Pago de Anticipo",
    modalDescription:
      "Registra la acreditación del porcentaje de anticipo requerido para autorizar el ingreso de la prenda a confección.",
  },
  PAGAR_SALDO: {
    label: "Pagar saldo restante",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Acreditar Liquidación de Saldo",
    modalDescription:
      "Registra el pago del saldo pendiente dentro del plazo estipulado para habilitar el despacho de las prendas terminadas.",
  },
  GENERAR_RECORDATORIO_SALDO: {
    label: "Recordatorio de pago automático",
    isPrimary: false,
    requiresModal: false,
    modalTitle: "Recordatorio de Pago Automático",
    modalDescription: "",
  },
  REPORTAR_INCIDENCIA: {
    label: "Reportar novedad",
    isDestructive: false,
    requiresModal: true,
    modalTitle: "Reportar Incidencia Operativa",
    modalDescription:
      "Registra un bloqueo en producción, dirección incompleta o problema con la transportadora para coordinar con el cliente.",
  },
  RESOLVER_INCIDENCIA: {
    label: "Resolver novedad",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Marcar Incidencia como Resuelta",
    modalDescription:
      "Confirma que la novedad reportada ha sido gestionada y el pedido puede continuar su flujo regular.",
  },
  CANCELAR_PEDIDO: {
    label: "Cancelar pedido",
    isDestructive: true,
    requiresModal: true,
    modalTitle: "Cancelar Pedido",
    modalDescription:
      "Esta acción anulará el pedido y liberará el inventario reservado. No puede deshacerse una vez confirmada.",
  },
  SOLICITAR_DEVOLUCION: {
    label: "Solicitar garantía / devolución",
    requiresModal: true,
    modalTitle: "Radicar Solicitud de Garantía",
    modalDescription:
      "Registra una solicitud de garantía o devolución por inconformidad o defecto de estampado dentro del plazo estipulado.",
  },
  GESTIONAR_DEVOLUCION: {
    label: "Gestionar devolución",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Dictamen de Devolución / Garantía",
    modalDescription:
      "Evalúa las evidencias aportadas y decide si procede la re-impresión de la prenda o la nota de crédito.",
  },
  REINTENTAR_PAGO: {
    label: "Reintentar cobro",
    isPrimary: true,
    requiresModal: true,
    modalTitle: "Reintentar Pago de Pedido",
    modalDescription:
      "Genera un nuevo enlace seguro de cobro para enviar al cliente o reintentar el procesamiento con la pasarela.",
  },
  RASTREAR_GUIA: {
    label: "Rastrear guía",
    requiresModal: false,
    modalTitle: "Seguimiento en Transportadora",
    modalDescription: "",
  },
};

/* ── Funciones Puras del Período de 7 Días ───────────────────────────────── */

/**
 * Calcula los días restantes para pagar el saldo a partir de balanceDeadlineAt.
 * Es una función pura que no depende de strings estáticos ni de React.
 */
export function getBalanceDaysRemaining(
  order: StoreOrderFull,
  now: Date = new Date(),
): number {
  const deadlineStr = order.paymentPlan?.balanceDeadlineAt;
  if (!deadlineStr) return 0;

  const deadline = new Date(deadlineStr).getTime();
  const current = now.getTime();
  const diffMs = deadline - current;

  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Determina si el plazo de pago del saldo ha expirado.
 */
/**
 * Determina si el plazo de pago del saldo ha expirado.
 * Comprueba balancePaymentStatus === 'BALANCE_EXPIRED' o si balanceAmount > 0 y currentDate > balanceDeadlineAt.
 */
export function isBalancePaymentExpired(
  order: StoreOrderFull,
  now: Date = new Date(),
): boolean {
  if (order.paymentPlan?.balancePaymentStatus === "BALANCE_EXPIRED") {
    return true;
  }
  const balance = order.paymentPlan?.balanceAmount ?? 0;
  const deadlineStr = order.paymentPlan?.balanceDeadlineAt;
  if (balance > 0 && deadlineStr) {
    return now.getTime() > new Date(deadlineStr).getTime();
  }
  return false;
}

/* ── Dominio: Única Fuente de Verdad para Shipping ───────────────────────── */
export function getAggregatedShippingStatus(order: StoreOrderFull): ShipmentStatus {
  const shipments = order.shipments || [];
  if (shipments.length === 0) {
    return "NOT_SHIPPED";
  }

  // Si todos los envíos están entregados
  if (shipments.every((s) => s.shippingStatus === "DELIVERED")) {
    return "DELIVERED";
  }

  // Si alguno está en ruta de entrega
  if (shipments.some((s) => s.shippingStatus === "OUT_FOR_DELIVERY")) {
    return "OUT_FOR_DELIVERY";
  }

  // Si alguno está en tránsito
  if (shipments.some((s) => s.shippingStatus === "IN_TRANSIT")) {
    return "IN_TRANSIT";
  }

  // Si alguno ha sido preparado / rotulado
  if (shipments.some((s) => s.shippingStatus === "SHIPPED")) {
    return "SHIPPED";
  }

  return "NOT_SHIPPED";
}

/**
 * Obtiene el envío activo sobre el cual operar.
 */
export function getActiveShipment(order: StoreOrderFull): Shipment | null {
  const shipments = order.shipments || [];
  if (shipments.length === 0) return null;
  const active = shipments.find((s) => s.shippingStatus !== "DELIVERED");
  return active || shipments[0] || null;
}

/* ── Disponibilidad de Acciones (AVAILABLE | DISABLED | HIDDEN) ──────────── */
export type ActionAvailability =
  | { status: "AVAILABLE"; action: OrderActionDefinition }
  | { status: "DISABLED"; action: OrderActionDefinition; reason: string }
  | { status: "HIDDEN" };

export function getOrderActionAvailability(order: StoreOrderFull): ActionAvailability[] {
  const results: ActionAvailability[] = [];
  const aggregatedShipping = getAggregatedShippingStatus(order);
  const isTerminal = order.orderStatus === "CANCELLED" || order.orderStatus === "ARCHIVED";
  const fulfillment = order.fulfillmentType || "CUSTOMIZE_EXISTING";
  const plan = order.paymentPlan;
  const isExpired = isBalancePaymentExpired(order) || plan?.balancePaymentStatus === "BALANCE_EXPIRED";
  const isDelivered = order.orderStatus === "COMPLETED" || aggregatedShipping === "DELIVERED";
  const isShipped =
    !isDelivered &&
    (aggregatedShipping === "SHIPPED" ||
      aggregatedShipping === "IN_TRANSIT" ||
      aggregatedShipping === "OUT_FOR_DELIVERY" ||
      (order.shipments && order.shipments.length > 0 && order.shipments.some((s) => s.shippingStatus !== "NOT_SHIPPED")));

  const hasTracking = Boolean(
    order.trackingNumber || (order.shipments || []).some((s) => Boolean(s.trackingNumber)),
  );

  const buildDef = (type: OrderActionType): OrderActionDefinition => ({
    type,
    ...ORDER_ACTION_METADATA[type],
  });

  // ── ESTADOS TERMINALES O RESTRICTIVOS ──────────────────────────────────────
  // Si el pedido está Cancelado, Archivado o Entregado: Solo Ver detalle (ninguna acción operativa).
  if (isTerminal || isDelivered) {
    return results;
  }

  // Si el pedido está en Pago vencido: Solo Ver detalle (ninguna acción operativa).
  if (isExpired) {
    return results;
  }

  // Si el pedido ya fue Enviado: Solo Ver detalle y Rastrear guía.
  if (isShipped) {
    if (hasTracking) {
      results.push({ status: "AVAILABLE", action: buildDef("RASTREAR_GUIA") });
    }
    return results;
  }

  // ── ESTADOS OPERATIVOS ACTIVOS ─────────────────────────────────────────────

  // 1. INICIAR_PRODUCCION
  if (order.productionStatus === "NOT_STARTED") {
    if (fulfillment === "READY_TO_SHIP") {
      // Los productos sin producción no ingresan a taller
      results.push({ status: "HIDDEN" });
    } else if (fulfillment === "CUSTOMIZE_EXISTING") {
      if (order.paymentStatus !== "PAID") {
        results.push({
          status: "DISABLED",
          action: buildDef("INICIAR_PRODUCCION"),
          reason: "Requiere pago completo confirmado antes de iniciar confección",
        });
      } else {
        results.push({ status: "AVAILABLE", action: buildDef("INICIAR_PRODUCCION") });
      }
    } else if (fulfillment === "CUSTOM_FROM_SCRATCH") {
      if (plan && plan.amountPaid < plan.depositAmount) {
        results.push({
          status: "DISABLED",
          action: buildDef("INICIAR_PRODUCCION"),
          reason: `Requiere pago del anticipo de $ ${plan.depositAmount.toLocaleString(
            "es-CO",
          )} (${plan.depositPercentage}%)`,
        });
      } else {
        results.push({ status: "AVAILABLE", action: buildDef("INICIAR_PRODUCCION") });
      }
    }
  }

  // 2. MARCAR_LISTO (Marcar como terminado)
  if (order.productionStatus === "IN_PRODUCTION") {
    results.push({ status: "AVAILABLE", action: buildDef("MARCAR_LISTO") });
  }

  // 3. PREPARAR_ENVIO
  // Solo permitido cuando: (Terminado O READY_TO_SHIP) Y Pago 100% completado (Saldo = 0)
  const isFinished = order.productionStatus === "READY" || fulfillment === "READY_TO_SHIP";
  const isFullyPaid = order.paymentStatus === "PAID" || (plan && plan.balanceAmount === 0);

  if (isFinished && isFullyPaid && !isShipped) {
    results.push({ status: "AVAILABLE", action: buildDef("PREPARAR_ENVIO") });
  }

  // 4. CANCELAR_PEDIDO
  // Permitido en producción o no iniciado, siempre que no esté enviado
  if (!isShipped && !isFinished) {
    results.push({ status: "AVAILABLE", action: buildDef("CANCELAR_PEDIDO") });
  }

  // 5. REPORTAR_INCIDENCIA / RESOLVER_INCIDENCIA
  if (order.issueStatus === "REPORTED" || order.issueStatus === "UNDER_REVIEW") {
    results.push({ status: "AVAILABLE", action: buildDef("RESOLVER_INCIDENCIA") });
  } else if (order.issueStatus === "NONE" && !isShipped) {
    results.push({ status: "AVAILABLE", action: buildDef("REPORTAR_INCIDENCIA") });
  }

  return results;
}
