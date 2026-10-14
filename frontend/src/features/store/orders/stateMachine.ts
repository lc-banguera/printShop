import {
  StoreOrderFull,
  Shipment,
  TrackingEvent,
  OrderActionType,
  OrderActionDefinition,
  OrderTimelineEvent,
  OrderNotification,
  CustomizationAsset,
} from "./types";
import {
  ORDER_ACTION_METADATA,
  getAggregatedShippingStatus,
  getActiveShipment,
  getOrderActionAvailability,
  getBalanceDaysRemaining,
  isBalancePaymentExpired,
  ActionAvailability,
} from "./orderActions";

// Re-export domain functions & metadata
export {
  ORDER_ACTION_METADATA,
  getAggregatedShippingStatus,
  getActiveShipment,
  getOrderActionAvailability,
  getBalanceDaysRemaining,
  isBalancePaymentExpired,
};
export type { ActionAvailability };

/* ── 1. Cálculo de Acciones Válidas Disponibles ───────────────────────────── */
export function getAvailableOrderActions(
  order: StoreOrderFull,
): OrderActionDefinition[] {
  const availabilities = getOrderActionAvailability(order);
  return availabilities
    .filter(
      (a): a is { status: "AVAILABLE"; action: OrderActionDefinition } =>
        a.status === "AVAILABLE",
    )
    .map((a) => a.action);
}

/* ── 2. Verificación Central de Seguridad de Transición ──────────────────── */
export function isTransitionAllowed(
  order: StoreOrderFull,
  action: OrderActionType,
): boolean {
  const availabilities = getOrderActionAvailability(order);
  const found = availabilities.find(
    (a) => a.status !== "HIDDEN" && a.action.type === action,
  );
  return found?.status === "AVAILABLE";
}

/* ── 3. Motor de Ejecución de Transición ─────────────────────────────────── */
export interface ActionPayload {
  notes?: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  estimatedBusinessDaysMin?: number;
  estimatedBusinessDaysMax?: number;
  issueCategory?: string;
  cancelReason?: string;
  returnDecision?: "APPROVED" | "REJECTED";
  evidenceFiles?: CustomizationAsset[];
  shipmentGuideFile?: CustomizationAsset;
}

export function executeOrderAction(
  order: StoreOrderFull,
  action: OrderActionType,
  payload: ActionPayload = {},
  performedBy: string = "Juan Pérez (Vendedor)",
): StoreOrderFull {
  // Validación estricta centralizada antes de cualquier mutación
  if (!isTransitionAllowed(order, action)) {
    console.error(
      `[SECURITY] Transición denegada: "${action}" no es válida para el pedido ${order.id}`,
    );
    return order;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isoNow = now.toISOString();

  const updatedTimeline: OrderTimelineEvent[] = [...(order.timeline || [])];
  const updatedShipments: Shipment[] = [...(order.shipments || [])];
  const updatedNotifications: OrderNotification[] = [
    ...(order.notifications || []),
  ];
  let updatedOrder: StoreOrderFull = {
    ...order,
    shipments: updatedShipments,
    notifications: updatedNotifications,
  };

  switch (action) {
    case "INICIAR_PRODUCCION": {
      updatedOrder.productionStatus = "IN_PRODUCTION";
      if (payload.evidenceFiles && payload.evidenceFiles.length > 0) {
        updatedOrder.productionEvidenceFile = payload.evidenceFiles[0];
      }
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Producción iniciada en taller",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes || "Archivos verificados a 300 DPI para confección y estampado",
        eventCode: "PRODUCTION_STARTED",
        evidenceFiles: payload.evidenceFiles,
      });
      break;
    }

    case "MARCAR_LISTO": {
      updatedOrder.productionStatus = "READY";
      if (payload.evidenceFiles && payload.evidenceFiles.length > 0) {
        updatedOrder.qcEvidenceFiles = payload.evidenceFiles;
      }
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Producción marcada como terminada y QC aprobado",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes || "Control de calidad completado con evidencia fotográfica",
        eventCode: "PRODUCTION_READY",
        evidenceFiles: payload.evidenceFiles,
      });

      // Si existe saldo pendiente:
      // 1. productionStatus = READY
      // 2. paymentStatus = PARTIAL
      // 3. balanceDeadlineAt = now + 7 días (plazo establecido por PrintShop)
      // 4. el estado visible pasa a "Pago pendiente"
      // 5. Registrar recordatorio de pago automático
      const balance = updatedOrder.paymentPlan?.balanceAmount ?? 0;
      if (balance > 0) {
        const balanceDueAt = isoNow;
        const balanceDeadlineAt = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString();

        if (updatedOrder.paymentPlan) {
          updatedOrder.paymentPlan = {
            ...updatedOrder.paymentPlan,
            balanceDueAt,
            balanceDeadlineAt,
            balancePaymentStatus: "BALANCE_PENDING",
          };
        }
        updatedOrder.balancePaymentStatus = "BALANCE_PENDING";
        if (updatedOrder.paymentStatus !== "PAID") {
          updatedOrder.paymentStatus = "PARTIAL";
        }

        updatedTimeline.push({
          id: `evt-${Date.now()}-bal`,
          orderId: order.id,
          step: "Pedido pasa a Pago pendiente por saldo restante",
          date: dateStr,
          done: true,
          performedBy: "Sistema PrintShop",
          eventCode: "BALANCE_PAYMENT_STARTED",
          note: `Plazo de pago establecido por PrintShop: 7 días ($ ${balance.toLocaleString(
            "es-CO",
          )} pendientes)`,
        });

        // Registrar evento de recordatorio automático generado por el sistema
        updatedTimeline.push({
          id: `evt-${Date.now()}-auto-rem`,
          orderId: order.id,
          step: "Recordatorio de pago automático registrado por el sistema",
          date: dateStr,
          done: true,
          performedBy: "Sistema PrintShop",
          eventCode: "BALANCE_PAYMENT_REMINDER",
          note: "Recordatorio automático de pago programado al ingresar en Pago pendiente",
        });

        updatedNotifications.push({
          id: `notif-${Date.now()}`,
          orderId: order.id,
          recipient: order.customerEmail,
          channel: "EMAIL",
          type: "BALANCE_PAYMENT_STARTED",
          scheduledAt: isoNow,
          sentAt: isoNow,
          status: "SENT",
          messageTemplateRef: "tpl_balance_payment_started_7days",
          daysRemaining: 7,
        });
      } else {
        // Pedido 100% pagado pasa a Listo para despacho
        updatedTimeline.push({
          id: `evt-${Date.now()}-ready-ship`,
          orderId: order.id,
          step: "Pedido pasa a Listo para despacho",
          date: dateStr,
          done: true,
          performedBy: "Sistema PrintShop",
          eventCode: "ORDER_READY_FOR_DISPATCH",
          note: "Pago completado 100%. Habilitado para preparar envío.",
        });
      }
      break;
    }

    case "PAGAR_ANTICIPO": {
      if (updatedOrder.paymentPlan) {
        const dep = updatedOrder.paymentPlan.depositAmount;
        updatedOrder.paymentPlan = {
          ...updatedOrder.paymentPlan,
          amountPaid: dep,
        };
        updatedOrder.paymentStatus = "PARTIAL";

        updatedTimeline.push({
          id: `evt-${Date.now()}`,
          orderId: order.id,
          step: `Anticipo acreditado: $ ${dep.toLocaleString("es-CO")} (${updatedOrder.paymentPlan.depositPercentage}%)`,
          date: dateStr,
          done: true,
          performedBy,
          eventCode: "DEPOSIT_PAYMENT_CONFIRMED",
        });
      }
      break;
    }

    case "PAGAR_SALDO": {
      if (updatedOrder.paymentPlan) {
        const total = updatedOrder.paymentPlan.totalAmount;
        updatedOrder.paymentPlan = {
          ...updatedOrder.paymentPlan,
          amountPaid: total,
          balanceAmount: 0,
          balancePaymentStatus: "BALANCE_PAID",
        };
        updatedOrder.paymentStatus = "PAID";
        updatedOrder.balancePaymentStatus = "BALANCE_PAID";

        updatedTimeline.push({
          id: `evt-${Date.now()}`,
          orderId: order.id,
          step: "Pago del saldo acreditado",
          date: dateStr,
          done: true,
          performedBy,
          eventCode: "BALANCE_PAYMENT_COMPLETED",
          note: payload.notes || "Pago completado 100%",
        });

        if (updatedOrder.productionStatus === "READY") {
          updatedTimeline.push({
            id: `evt-${Date.now()}-ready`,
            orderId: order.id,
            step: "Pedido pasa a Listo para despacho",
            date: dateStr,
            done: true,
            performedBy: "Sistema PrintShop",
            eventCode: "ORDER_READY_FOR_DISPATCH",
            note: "Preparar envío habilitado",
          });
        }
      }
      break;
    }

    case "GENERAR_RECORDATORIO_SALDO": {
      const remaining = getBalanceDaysRemaining(updatedOrder, now);
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Recordatorio de pago automático registrado por el sistema",
        date: dateStr,
        done: true,
        performedBy: "Sistema PrintShop",
        eventCode: "BALANCE_PAYMENT_REMINDER",
        note: `Recordatorio automático: quedan ${remaining} día(s) de plazo`,
      });

      updatedNotifications.push({
        id: `notif-${Date.now()}`,
        orderId: order.id,
        recipient: order.customerEmail,
        channel: "EMAIL",
        type: "BALANCE_PAYMENT_REMINDER",
        scheduledAt: isoNow,
        sentAt: isoNow,
        status: "SENT",
        messageTemplateRef: `tpl_balance_reminder_${remaining}days`,
        daysRemaining: remaining,
      });
      break;
    }

    case "PREPARAR_ENVIO": {
      const carrier = payload.carrier || "Coordinadora";
      const trackingNumber =
        payload.trackingNumber || `GUIA-${Math.floor(100000 + Math.random() * 900000)}`;
      const estimatedDelivery = payload.estimatedDeliveryDate || "2 a 4 días hábiles";
      const newShipmentId = `shp-${Date.now()}`;

      // URL de rastreo externa de la transportadora
      let trackingUrl = "";
      if (carrier.toLowerCase().includes("coordinadora")) {
        trackingUrl = `https://www.coordinadora.com/rastreo?guia=${encodeURIComponent(trackingNumber)}`;
      } else if (carrier.toLowerCase().includes("servientrega")) {
        trackingUrl = `https://www.servientrega.com/rastreo?guia=${encodeURIComponent(trackingNumber)}`;
      } else if (carrier.toLowerCase().includes("envia") || carrier.toLowerCase().includes("envía")) {
        trackingUrl = `https://www.enviacolvanes.com/rastreo?guia=${encodeURIComponent(trackingNumber)}`;
      } else if (carrier.toLowerCase().includes("interrapidisimo") || carrier.toLowerCase().includes("inter rapidísimo")) {
        trackingUrl = `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${encodeURIComponent(trackingNumber)}`;
      } else {
        trackingUrl = `https://www.coordinadora.com/rastreo?guia=${encodeURIComponent(trackingNumber)}`;
      }

      const newTrackingEvent: TrackingEvent = {
        id: `trc-${Date.now()}`,
        shipmentId: newShipmentId,
        status: "SHIPPED",
        description: `Envío entregado a la transportadora ${carrier} con guía ${trackingNumber}.`,
        location: "Centro de Despacho PrintShop - Bogotá D.C.",
        occurredAt: isoNow,
        source: "manual",
        createdAt: isoNow,
      };

      const newShipment: Shipment = {
        id: newShipmentId,
        orderId: order.id,
        carrier,
        trackingNumber,
        trackingUrl,
        shippingStatus: "SHIPPED",
        shippedAt: isoNow,
        estimatedDeliveryAt: estimatedDelivery,
        businessDaysMin: payload.estimatedBusinessDaysMin,
        businessDaysMax: payload.estimatedBusinessDaysMax,
        guideFile: payload.shipmentGuideFile,
        trackingEvents: [newTrackingEvent],
      };

      updatedShipments.push(newShipment);
      updatedOrder.shipments = updatedShipments;
      updatedOrder.shippingStatus = "SHIPPED";
      if (payload.shipmentGuideFile) {
        updatedOrder.shipmentGuideFile = payload.shipmentGuideFile;
      }

      // Actualizar campos retrocompatibles
      updatedOrder.carrier = carrier;
      updatedOrder.trackingNumber = trackingNumber;
      updatedOrder.estimatedDeliveryDate = estimatedDelivery;

      updatedTimeline.push({
        id: `evt-${Date.now()}-carrier`,
        orderId: order.id,
        step: "Envío entregado a la transportadora",
        date: dateStr,
        done: true,
        performedBy,
        note: `Transportadora: ${carrier} — Guía: ${trackingNumber}${payload.shipmentGuideFile ? ` (${payload.shipmentGuideFile.name})` : ""}`,
        eventCode: "SHIPMENT_DISPATCHED",
        shipmentGuideFile: payload.shipmentGuideFile,
      });

      updatedTimeline.push({
        id: `evt-${Date.now()}-shipped`,
        orderId: order.id,
        step: "Pedido marcado como Enviado",
        date: dateStr,
        done: true,
        performedBy: "Sistema PrintShop",
        note: payload.notes || "Paquete despachado con transportadora",
        eventCode: "SHIPMENT_CREATED",
      });
      break;
    }

    case "DESPACHAR_TRANSPORTADORA":
    case "REGISTRAR_EN_TRANSITO": {
      const active = getActiveShipment(updatedOrder);
      if (active) {
        const trcEvent: TrackingEvent = {
          id: `trc-${Date.now()}`,
          shipmentId: active.id,
          status: "IN_TRANSIT",
          description:
            payload.notes ||
            "Recolectado por transportadora - En camino a centro de distribución",
          location: "Hub Central Bogotá D.C.",
          occurredAt: isoNow,
          source: "manual",
          createdAt: isoNow,
        };

        const targetIndex = updatedShipments.findIndex((s) => s.id === active.id);
        if (targetIndex >= 0) {
          updatedShipments[targetIndex] = {
            ...active,
            shippingStatus: "IN_TRANSIT",
            trackingEvents: [...active.trackingEvents, trcEvent],
          };
          updatedOrder.shipments = updatedShipments;
        }
      }

      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Recolectado por transportadora (En camino)",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes,
        eventCode: "SHIPMENT_DISPATCHED",
      });
      break;
    }

    case "REGISTRAR_EN_ENTREGA": {
      const active = getActiveShipment(updatedOrder);
      if (active) {
        const trcEvent: TrackingEvent = {
          id: `trc-${Date.now()}`,
          shipmentId: active.id,
          status: "OUT_FOR_DELIVERY",
          description:
            payload.notes || "En móvil de reparto hacia dirección de entrega",
          location: "Centro Operativo Local",
          occurredAt: isoNow,
          source: "manual",
          createdAt: isoNow,
        };

        const targetIndex = updatedShipments.findIndex((s) => s.id === active.id);
        if (targetIndex >= 0) {
          updatedShipments[targetIndex] = {
            ...active,
            shippingStatus: "OUT_FOR_DELIVERY",
            trackingEvents: [...active.trackingEvents, trcEvent],
          };
          updatedOrder.shipments = updatedShipments;
        }
      }

      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "En ruta de entrega hacia destino",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes,
        eventCode: "SHIPMENT_OUT_FOR_DELIVERY",
      });
      break;
    }

    case "CONFIRMAR_ENTREGA": {
      const active = getActiveShipment(updatedOrder);
      if (active) {
        const trcEvent: TrackingEvent = {
          id: `trc-${Date.now()}`,
          shipmentId: active.id,
          status: "DELIVERED",
          description: payload.notes || "Entregado a satisfacción al cliente en destino",
          location: order.address,
          occurredAt: isoNow,
          source: "manual",
          createdAt: isoNow,
        };

        const targetIndex = updatedShipments.findIndex((s) => s.id === active.id);
        if (targetIndex >= 0) {
          updatedShipments[targetIndex] = {
            ...active,
            shippingStatus: "DELIVERED",
            deliveredAt: isoNow,
            trackingEvents: [...active.trackingEvents, trcEvent],
          };
          updatedOrder.shipments = updatedShipments;
        }
      }

      // Si todos los envíos han sido entregados, completar el pedido
      const newAggregated = getAggregatedShippingStatus(updatedOrder);
      if (newAggregated === "DELIVERED") {
        updatedOrder.orderStatus = "COMPLETED";
      }

      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Entregado a satisfacción al cliente",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes || "Entrega certificada por transportadora",
        eventCode: "SHIPMENT_DELIVERED",
      });
      break;
    }

    case "REPORTAR_INCIDENCIA": {
      updatedOrder.issueStatus = "REPORTED";
      updatedOrder.issueNotes = payload.notes || payload.issueCategory;
      if (payload.evidenceFiles && payload.evidenceFiles.length > 0) {
        updatedOrder.issueEvidenceFiles = payload.evidenceFiles;
      }
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: `Novedad reportada: ${payload.issueCategory || "Operativa"}`,
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes,
        eventCode: "ISSUE_REPORTED",
        evidenceFiles: payload.evidenceFiles,
      });
      break;
    }

    case "RESOLVER_INCIDENCIA": {
      updatedOrder.issueStatus = "RESOLVED";
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Novedad resuelta — Flujo reanudado",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes || "Solución coordinada satisfactoriamente",
        eventCode: "ISSUE_RESOLVED",
      });
      break;
    }

    case "CANCELAR_PEDIDO": {
      updatedOrder.orderStatus = "CANCELLED";
      updatedOrder.cancelReason =
        payload.cancelReason || "Cancelado por el vendedor";
      if (order.paymentStatus === "PAID" || order.paymentStatus === "PARTIAL") {
        updatedOrder.paymentStatus = "REFUNDED";
      } else {
        updatedOrder.paymentStatus = "VOIDED";
      }
      updatedOrder.productionStatus = "NOT_STARTED";
      if (payload.evidenceFiles && payload.evidenceFiles.length > 0) {
        updatedOrder.cancellationEvidenceFile = payload.evidenceFiles[0];
      }
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: `Pedido cancelado: ${updatedOrder.cancelReason}`,
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes,
        eventCode: "ORDER_CANCELLED",
        evidenceFiles: payload.evidenceFiles,
      });
      break;
    }

    case "SOLICITAR_DEVOLUCION": {
      updatedOrder.returnStatus = "REQUESTED";
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Solicitud de garantía / devolución radicada",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes,
        eventCode: "RETURN_REQUESTED",
      });
      break;
    }

    case "GESTIONAR_DEVOLUCION": {
      const decision = payload.returnDecision || "APPROVED";
      updatedOrder.returnStatus = decision;
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step:
          decision === "APPROVED"
            ? "Garantía aprobada para reposición de prenda"
            : "Solicitud de garantía desestimada",
        date: dateStr,
        done: true,
        performedBy,
        note: payload.notes,
        eventCode:
          decision === "APPROVED" ? "RETURN_APPROVED" : "RETURN_REJECTED",
      });
      break;
    }

    case "REINTENTAR_PAGO": {
      updatedOrder.paymentStatus = "PENDING";
      updatedTimeline.push({
        id: `evt-${Date.now()}`,
        orderId: order.id,
        step: "Enlace de pago regenerado — Esperando cobro",
        date: dateStr,
        done: true,
        performedBy,
        eventCode: "PAYMENT_PENDING",
      });
      break;
    }

    default:
      break;
  }

  // Regla de Dominio: Derivar siempre el shippingStatus del pedido desde sus envíos (Single source of truth)
  updatedOrder.shippingStatus = getAggregatedShippingStatus(updatedOrder);

  // Mantener retrocompatibilidad con campos legibles si hay envíos
  if (updatedOrder.shipments && updatedOrder.shipments.length > 0) {
    const primary = updatedOrder.shipments[0];
    updatedOrder.carrier = primary.carrier;
    updatedOrder.trackingNumber = primary.trackingNumber;
    updatedOrder.estimatedDeliveryDate = primary.estimatedDeliveryAt;
  }

  updatedOrder.timeline = updatedTimeline;
  return updatedOrder;
}

/* ── 4. Derivación del Estado Principal de Visualización ─────────────────── */
export function getMainDisplayStatus(order: StoreOrderFull): {
  label:
    | "Pago pendiente"
    | "En producción"
    | "Terminado"
    | "Listo para despacho"
    | "Pago vencido"
    | "Enviado"
    | "Entregado"
    | "Cancelado";
  category: "Pendiente" | "En producción" | "Enviado" | "Entregado" | "Cancelado";
} {
  // 1. Cancelado
  if (order.orderStatus === "CANCELLED") {
    return { label: "Cancelado", category: "Cancelado" };
  }

  // 2. Entregado
  const aggregatedShipping = getAggregatedShippingStatus(order);
  if (aggregatedShipping === "DELIVERED" || order.orderStatus === "COMPLETED") {
    return { label: "Entregado", category: "Entregado" };
  }

  // 3. Enviado (Cualquier paquete entregado a la transportadora con guía generada)
  if (
    aggregatedShipping === "SHIPPED" ||
    aggregatedShipping === "IN_TRANSIT" ||
    aggregatedShipping === "OUT_FOR_DELIVERY" ||
    order.shippingStatus === "SHIPPED" ||
    (order.shipments &&
      order.shipments.length > 0 &&
      order.shipments.some((s) => s.shippingStatus !== "NOT_SHIPPED"))
  ) {
    return { label: "Enviado", category: "Enviado" };
  }

  // 4. Pago vencido (balanceAmount > 0 y currentDate > balanceDeadlineAt o BALANCE_EXPIRED)
  if (isBalancePaymentExpired(order)) {
    return { label: "Pago vencido", category: "Pendiente" };
  }

  // 5. Producción terminada (READY)
  if (order.productionStatus === "READY") {
    const balance = order.paymentPlan?.balanceAmount ?? 0;
    if (order.paymentStatus === "PAID" || balance === 0) {
      return { label: "Listo para despacho", category: "Pendiente" };
    }
    // Con saldo pendiente dentro del plazo de 7 días establecido por PrintShop
    return { label: "Pago pendiente", category: "Pendiente" };
  }

  // 6. En producción
  if (order.productionStatus === "IN_PRODUCTION") {
    return { label: "En producción", category: "En producción" };
  }

  // 7. Productos sin confección personalizada pagados 100%
  if (order.fulfillmentType === "READY_TO_SHIP" && order.paymentStatus === "PAID") {
    return { label: "Listo para despacho", category: "Pendiente" };
  }

  // 8. Estado inicial: Pago pendiente
  return { label: "Pago pendiente", category: "Pendiente" };
}
