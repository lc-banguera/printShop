/* ── Definiciones Oficiales de Estados y Tipos para Pedidos en PrintShop ── */

/* ── 1. Modos de Cumplimiento / Fulfillment ──────────────────────────────── */
export type FulfillmentType =
  | "READY_TO_SHIP"
  | "CUSTOMIZE_EXISTING"
  | "CUSTOM_FROM_SCRATCH";

/* ── 2. Ciclo General y Estados Multidimensionales ───────────────────────── */
export type OrderStatus = "OPEN" | "COMPLETED" | "CANCELLED" | "ARCHIVED";

export type PaymentStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "VOIDED";

export type BalancePaymentStatus =
  | "NO_BALANCE"
  | "BALANCE_PENDING"
  | "BALANCE_PAID"
  | "BALANCE_EXPIRED";

export type ProductionStatus = "NOT_STARTED" | "IN_PRODUCTION" | "READY";

export type ShipmentStatus =
  | "NOT_SHIPPED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

/**
 * @deprecated Use ShipmentStatus instead. Kept for backward compatibility.
 */
export type ShippingStatus = ShipmentStatus;

export type ReturnStatus =
  | "NONE"
  | "REQUESTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type IssueStatus = "NONE" | "REPORTED" | "UNDER_REVIEW" | "RESOLVED";

export type OrderFilterOption =
  | "Todos"
  | "Pendientes"
  | "En producción"
  | "Enviados"
  | "Entregados"
  | "Cancelados";

/* ── 3. Modalidades y Plan de Pago (PaymentPlan) ─────────────────────────── */
export type PaymentMode = "FULL_PAYMENT" | "DEPOSIT_PLUS_BALANCE";

export interface PaymentPlan {
  paymentMode: PaymentMode;
  /** Snapshot inmutable del % de anticipo al momento de crear la orden (ej: 60) */
  depositPercentage: number;
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  balanceAmount: number;
  /** Timestamp ISO exacto cuando el producto pasó a READY e inició el plazo de 7 días */
  balanceDueAt?: string;
  /** Timestamp ISO límite (balanceDueAt + 7 días) */
  balanceDeadlineAt?: string;
  balancePaymentStatus: BalancePaymentStatus;
}

/* ── 4. Configuración del Vendedor y Tienda Seleccionada ─────────────────── */
export interface CustomOrderPolicy {
  storeId: string;
  allowsCustomFromScratch: boolean;
  defaultDepositPercentage: number;
  productionLeadTimeDays?: number;
  productionMethods?: string[];
  specialties?: string[];
  notes?: string;
}

export interface StoreReliabilitySnapshot {
  rating: number;
  completedOrdersCount: number;
  onTimeDeliveryRate: number; // 0 - 100%
  operatingSince: string;
  specialties: string[];
  productionMethods: string[];
}

export interface SelectedStoreInfo {
  storeId: string;
  sellerId: string;
  storeNameSnapshot: string;
  reliabilitySnapshot?: StoreReliabilitySnapshot;
}

/* ── 5. Notificaciones del Plazo de 7 Días ───────────────────────────────── */
export type NotificationChannel = "EMAIL" | "WHATSAPP";

export type NotificationType =
  | "BALANCE_PAYMENT_STARTED"
  | "BALANCE_PAYMENT_REMINDER"
  | "BALANCE_PAYMENT_FINAL_REMINDER"
  | "BALANCE_PAYMENT_EXPIRED";

export interface OrderNotification {
  id: string;
  orderId: string;
  recipient: string;
  channel: NotificationChannel;
  type: NotificationType;
  scheduledAt: string;
  sentAt?: string;
  status: "SCHEDULED" | "SENT" | "FAILED";
  messageTemplateRef: string;
  idempotencyKey?: string;
  daysRemaining?: number;
}

/* ── 6. Acciones Contextuales Válidas ────────────────────────────────────── */
export type OrderActionType =
  | "INICIAR_PRODUCCION"
  | "MARCAR_LISTO"
  | "PREPARAR_ENVIO"
  | "DESPACHAR_TRANSPORTADORA"
  | "REGISTRAR_EN_TRANSITO"
  | "REGISTRAR_EN_ENTREGA"
  | "CONFIRMAR_ENTREGA"
  | "REPORTAR_INCIDENCIA"
  | "RESOLVER_INCIDENCIA"
  | "CANCELAR_PEDIDO"
  | "SOLICITAR_DEVOLUCION"
  | "GESTIONAR_DEVOLUCION"
  | "REINTENTAR_PAGO"
  | "PAGAR_ANTICIPO"
  | "PAGAR_SALDO"
  | "GENERAR_RECORDATORIO_SALDO"
  | "RASTREAR_GUIA";

export interface OrderActionDefinition {
  type: OrderActionType;
  label: string;
  isPrimary?: boolean;
  isDestructive?: boolean;
  requiresModal: boolean;
  modalTitle: string;
  modalDescription: string;
}

/* ── 7. Evento Inmutable de Rastreo de Envío (TrackingEvent) ─────────────── */
export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description: string;
  location?: string;
  occurredAt: string;
  source: "mock" | "carrier_webhook" | "manual";
  externalEventId?: string;
  createdAt: string;
}

/* ── 8. Entidad de Envío (Shipment) ───────────────────────────────────────── */
export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  shipmentId?: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingStatus: ShipmentStatus;
  shippedAt?: string;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
  guideFile?: CustomizationAsset;
  businessDaysMin?: number;
  businessDaysMax?: number;
}

/* ── 9. Assets, Requerimientos y Personalización ─────────────────────────── */
export type CustomizationAssetType = "IMAGE" | "DESIGN" | "REFERENCE" | "DOCUMENT";

export interface CustomizationAsset {
  id: string;
  orderItemId?: string;
  type: CustomizationAssetType;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes?: number;
  fileSizeFormatted?: string;
  metadata?: Record<string, unknown>;
}

export interface DesignSnapshot {
  id?: string;
  name: string;
  previewUrl: string;
  technique?: "DTG" | "Sublimación" | "Bordado" | "Vinilo Textil" | string;
  printZone?: "Pecho Frontal" | "Espalda Completa" | "Bolsillo" | "Manga" | string;
  resolutionDpi?: number;
  dimensionsMm?: { width: number; height: number };
}

export interface CustomerRequirements {
  description: string;
  instructions: string;
  referenceImages: CustomizationAsset[];
  attachedFiles?: CustomizationAsset[];
  requestedDimensions?: string;
  requestedPlacement?: string;
  notes?: string;
}

export interface CustomizationSpec {
  designId?: string;
  designSnapshot?: DesignSnapshot;
  uploadedAssets?: CustomizationAsset[];
  assets?: CustomizationAsset[];
  textInstructions?: string;
  text?: string;
  placement?: string;
  technique?: string;
  dimensions?: { widthCm?: number; heightCm?: number; width?: number; height?: number };
  colors?: string[];
  customerNotes?: string;
  requirements?: CustomerRequirements;
}

/* ── 10. Snapshots Inmutables del Artículo Personalizado ─────────────────── */
export interface OrderItemSnapshot {
  id: string;
  productId: string;
  productNameSnapshot: string;
  productName: string; // Retrocompatibilidad
  variantId?: string;
  variantSnapshot?: {
    color: string;
    size: string;
    fabric: string;
    sku?: string;
  };
  variant: string; // Retrocompatibilidad
  color: string;
  size: string;
  fabric: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
  fulfillmentType: FulfillmentType;
  designName: string;
  designId?: string;
  designTechnique?: "DTG" | "Sublimación" | "Bordado" | "Vinilo Textil";
  designPrintZone?: "Pecho Frontal" | "Espalda Completa" | "Bolsillo";
  designSnapshot?: DesignSnapshot;
  customization?: CustomizationSpec;
  customizationSpec?: CustomizationSpec;
  customerRequirements?: CustomerRequirements;
  uploadedAssets?: CustomizationAsset[];
  itemProductionStatus?: ProductionStatus;
}

/* ── 11. Evento Inmutable de Auditoría / Timeline ────────────────────────── */
export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  step: string;
  date: string;
  done: boolean;
  performedBy?: string;
  note?: string;
  eventCode?: string;
  evidenceFiles?: CustomizationAsset[];
  shipmentGuideFile?: CustomizationAsset;
}

/* ── 12. Modelo Principal del Pedido (StoreOrderFull) ────────────────────── */
export interface StoreOrderFull {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  date: string;
  total: number;

  // Modalidad de Cumplimiento
  fulfillmentType: FulfillmentType;

  // Dimensiones del Estado Multidimensional
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  balancePaymentStatus: BalancePaymentStatus;
  productionStatus: ProductionStatus;
  /**
   * @deprecated Estado derivado de `shipments`. Usar `getAggregatedShippingStatus(order)`.
   * Shipment.shippingStatus es la única fuente de verdad.
   */
  shippingStatus: ShippingStatus;
  returnStatus: ReturnStatus;
  issueStatus: IssueStatus;

  // Plan Financiero y de Pagos
  paymentPlan: PaymentPlan;

  // Tienda seleccionada (en CUSTOM_FROM_SCRATCH)
  selectedStore?: SelectedStoreInfo;

  // Envíos oficiales de la orden (fuente de verdad logística)
  shipments: Shipment[];

  // Notificaciones programadas / enviadas
  notifications?: OrderNotification[];

  // Datos financieros y logísticos retrocompatibles
  paymentMethod: string;
  /** @deprecated Leer de `shipments[0]?.carrier` */
  carrier?: string;
  /** @deprecated Leer de `shipments[0]?.trackingNumber` */
  trackingNumber?: string;
  /** @deprecated Leer de `shipments[0]?.estimatedDeliveryAt` */
  estimatedDeliveryDate?: string;
  issueNotes?: string;
  cancelReason?: string;
  returnReason?: string;

  // Evidencias y documentación adjunta
  shipmentGuideFile?: CustomizationAsset;
  qcEvidenceFiles?: CustomizationAsset[];
  issueEvidenceFiles?: CustomizationAsset[];
  cancellationEvidenceFile?: CustomizationAsset;
  productionEvidenceFile?: CustomizationAsset;

  // Artículos y trazabilidad
  items: OrderItemSnapshot[];
  timeline: OrderTimelineEvent[];
}
