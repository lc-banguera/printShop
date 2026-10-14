import * as React from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  StoreOrderFull,
  OrderActionDefinition,
  OrderActionType,
  CustomizationAsset,
} from "./types";
import { ActionPayload } from "./stateMachine";
import { OrderFileUpload } from "./OrderFileUpload";
import { OrderVerificationToggle } from "./OrderVerificationToggle";
import { getProductionChecks, getQualityChecks } from "./orderChecks";
import {
  formatBusinessDateRange,
  formatBusinessDaysText,
} from "./businessDays";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface OrderActionModalProps {
  isOpen: boolean;
  order: StoreOrderFull | null;
  action: OrderActionDefinition | null;
  onClose: () => void;
  onConfirm: (action: OrderActionType, payload: ActionPayload) => void;
}

export const OrderActionModal: React.FC<OrderActionModalProps> = ({
  isOpen,
  order,
  action,
  onClose,
  onConfirm,
}) => {
  // Manejo de preview de imágenes grande
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = React.useState<string | undefined>(undefined);

  // Estados comunes de formularios
  const [notes, setNotes] = React.useState("");
  const [carrier, setCarrier] = React.useState("Coordinadora");
  const [trackingNumber, setTrackingNumber] = React.useState("");

  // Días hábiles para PREPARAR_ENVIO
  const [businessDaysMin, setBusinessDaysMin] = React.useState<number>(2);
  const [businessDaysMax, setBusinessDaysMax] = React.useState<number>(4);
  const [shipmentGuideFiles, setShipmentGuideFiles] = React.useState<CustomizationAsset[]>([]);

  // Incidencias
  const [issueCategory, setIssueCategory] = React.useState(
    "Falla o indisponibilidad de stock en producto base",
  );
  const [issueEvidenceFiles, setIssueEvidenceFiles] = React.useState<CustomizationAsset[]>([]);

  // Cancelación
  const [cancelReason, setCancelReason] = React.useState("Solicitado por el cliente");
  const [cancelEvidenceFiles, setCancelEvidenceFiles] = React.useState<CustomizationAsset[]>([]);

  // Verificaciones contextuales dinámicas
  const productionChecks = React.useMemo(() => {
    return order ? getProductionChecks(order) : [];
  }, [order]);

  const qualityChecks = React.useMemo(() => {
    return order ? getQualityChecks(order) : [];
  }, [order]);

  const [prodChecksState, setProdChecksState] = React.useState<Record<string, boolean>>({});
  const [prodEvidenceFiles, setProdEvidenceFiles] = React.useState<CustomizationAsset[]>([]);

  const [qcChecksState, setQcChecksState] = React.useState<Record<string, boolean>>({});
  const [qcEvidenceFiles, setQcEvidenceFiles] = React.useState<CustomizationAsset[]>([]);

  // Garantías y Devoluciones
  const [returnDecision, setReturnDecision] = React.useState<"APPROVED" | "REJECTED">("APPROVED");

  // Validaciones inline
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Bloqueo de scroll del body mientras el modal está abierto
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Manejador de teclado para cerrar modal con Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewImageUrl) {
          setPreviewImageUrl(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, previewImageUrl, onClose]);

  // Reset del estado al abrir o cambiar orden/acción
  React.useEffect(() => {
    if (!order || !action) return;
    setNotes("");
    setErrors({});
    setIsSubmitting(false);
    setCarrier(order.carrier || order.shipments?.[0]?.carrier || "Coordinadora");

    if (order.trackingNumber || order.shipments?.[0]?.trackingNumber) {
      setTrackingNumber(order.trackingNumber || order.shipments?.[0]?.trackingNumber || "");
    } else {
      setTrackingNumber(`GUIA-${Math.floor(100000 + Math.random() * 900000)}`);
    }

    setBusinessDaysMin(2);
    setBusinessDaysMax(4);
    setShipmentGuideFiles([]);
    setIssueCategory("Falla o indisponibilidad de stock en producto base");
    setIssueEvidenceFiles([]);
    setCancelReason("Solicitado por el cliente");
    setCancelEvidenceFiles([]);
    setProdChecksState({});
    setProdEvidenceFiles([]);
    setQcChecksState({});
    setQcEvidenceFiles([]);
    setReturnDecision("APPROVED");
  }, [action?.type, order?.id, isOpen]);

  if (!isOpen || !order || !action) return null;

  // Acciones críticas donde no se permite cierre involuntario por click en el backdrop
  const isCriticalAction =
    action.type === "PREPARAR_ENVIO" ||
    action.type === "CANCELAR_PEDIDO" ||
    action.type === "MARCAR_LISTO" ||
    action.type === "INICIAR_PRODUCCION";

  // Fecha base para despacho (hoy)
  const dispatchDate = new Date();
  const estimatedDateRange = formatBusinessDateRange(
    dispatchDate,
    businessDaysMin,
    businessDaysMax,
  );

  // Validar campos según la acción
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (action.type === "PREPARAR_ENVIO") {
      if (!carrier.trim()) {
        newErrors.carrier = "Selecciona una transportadora.";
      }
      if (!trackingNumber.trim()) {
        newErrors.trackingNumber = "Ingresa el número de guía de la transportadora.";
      }
      if (businessDaysMin < 1) {
        newErrors.businessDays = "El tiempo mínimo debe ser de al menos 1 día hábil.";
      } else if (businessDaysMax < businessDaysMin) {
        newErrors.businessDays = "El tiempo máximo no puede ser menor al mínimo de días hábiles.";
      }
      if (shipmentGuideFiles.length === 0) {
        newErrors.shipmentGuide = "Adjunta la guía de despacho para continuar.";
      }
    }

    if (action.type === "REPORTAR_INCIDENCIA") {
      if (!issueCategory.trim()) {
        newErrors.issueCategory = "Selecciona una categoría de incidencia.";
      }
      if (!notes.trim()) {
        newErrors.notes = "Describe la incidencia para continuar.";
      }
    }

    if (action.type === "CANCELAR_PEDIDO") {
      if (!cancelReason.trim()) {
        newErrors.cancelReason = "Selecciona el motivo de cancelación.";
      }
    }

    if (action.type === "INICIAR_PRODUCCION") {
      const hasUncheckedRequired = productionChecks.some(
        (c) => c.required && !prodChecksState[c.id],
      );
      if (hasUncheckedRequired) {
        newErrors.prodCheck = "Debes completar la verificación previa del taller para este pedido.";
      }
    }

    if (action.type === "MARCAR_LISTO") {
      const hasUncheckedRequired = qualityChecks.some(
        (c) => c.required && !qcChecksState[c.id],
      );
      if (hasUncheckedRequired) {
        newErrors.qcCheck = "Debes completar los controles de calidad requeridos.";
      }
      if (qcEvidenceFiles.length === 0) {
        newErrors.qcEvidence = "Adjunta al menos una fotografía del producto terminado.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const formattedBusinessDays = formatBusinessDaysText(businessDaysMin, businessDaysMax);
    const estimatedDeliveryFormatted = `${formattedBusinessDays} (${estimatedDateRange})`;

    const payload: ActionPayload = {
      notes: notes.trim() || undefined,
      carrier,
      trackingNumber: trackingNumber.trim() || undefined,
      estimatedDeliveryDate: estimatedDeliveryFormatted,
      estimatedBusinessDaysMin: businessDaysMin,
      estimatedBusinessDaysMax: businessDaysMax,
      issueCategory,
      cancelReason,
      returnDecision,
    };

    if (action.type === "PREPARAR_ENVIO") {
      payload.shipmentGuideFile = shipmentGuideFiles[0];
    } else if (action.type === "REPORTAR_INCIDENCIA") {
      payload.evidenceFiles = issueEvidenceFiles.length > 0 ? issueEvidenceFiles : undefined;
    } else if (action.type === "CANCELAR_PEDIDO") {
      payload.evidenceFiles = cancelEvidenceFiles.length > 0 ? cancelEvidenceFiles : undefined;
    } else if (action.type === "INICIAR_PRODUCCION") {
      payload.evidenceFiles = prodEvidenceFiles.length > 0 ? prodEvidenceFiles : undefined;
    } else if (action.type === "MARCAR_LISTO") {
      payload.evidenceFiles = qcEvidenceFiles;
    }

    onConfirm(action.type, payload);
    onClose();
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={action.modalTitle}
      className="fixed inset-0 z-[100] overflow-y-auto"
    >
      {/* Backdrop que cubre exactamente todo el viewport visible */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isCriticalAction) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Contenedor centrado y responsivo */}
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 relative pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto bg-white rounded-[4px] max-w-lg w-full max-h-[92vh] flex flex-col shadow-xl border border-[#E2E8F0] overflow-hidden relative text-[#111827]"
        >
          {/* Header Sobrio y Neutral — Sin iconos decorativos superiores */}
          <div className="p-4 sm:p-5 border-b border-[#F1F5F9] flex items-start justify-between shrink-0 bg-white gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-[#111827] truncate">
                {action.type === "MARCAR_LISTO"
                  ? "Marcar como terminado"
                  : action.type === "REPORTAR_INCIDENCIA"
                    ? "Reportar novedad"
                    : action.type === "CANCELAR_PEDIDO"
                      ? "Cancelar pedido"
                      : action.type === "PREPARAR_ENVIO"
                        ? "Preparar envío"
                        : action.modalTitle}
              </h2>
              <p className="text-xs text-[#64748B] truncate mt-0.5">
                Pedido <span className="font-medium text-[#111827]">{order.id.startsWith("#") ? order.id : `#${order.id}`}</span> · {order.customerName}
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

          {/* Formulario con scroll interno */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {action.modalDescription && (
              <p className="text-xs text-[#64748B] leading-relaxed">
                {action.modalDescription}
              </p>
            )}

            {/* ── FORM 1: PREPARAR_ENVIO ───────────────────────────────── */}
            {action.type === "PREPARAR_ENVIO" && (
              <div className="space-y-3.5 pt-0.5">
                {/* Transportadora y Número de guía */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                      Transportadora <span className="text-[#EF4444] font-bold">*</span>
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => {
                        setCarrier(e.target.value);
                        if (errors.carrier) setErrors((prev) => ({ ...prev, carrier: "" }));
                      }}
                      className={cn(
                        "w-full text-xs p-2 bg-white border rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]",
                        errors.carrier ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]",
                      )}
                    >
                      <option value="Coordinadora">Coordinadora</option>
                      <option value="Servientrega">Servientrega</option>
                      <option value="Inter Rapidísimo">Inter Rapidísimo</option>
                      <option value="Envía">Envía</option>
                      <option value="Mensajería Local">Mensajería Local Express</option>
                    </select>
                    {errors.carrier && (
                      <p className="text-[10.5px] text-[#EF4444] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.carrier}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                      Número de guía <span className="text-[#EF4444] font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value);
                        if (errors.trackingNumber) setErrors((prev) => ({ ...prev, trackingNumber: "" }));
                      }}
                      placeholder="Ej. CR-9948201"
                      className={cn(
                        "w-full text-xs p-2 bg-white border rounded-[4px] focus:outline-none focus:border-[#2563EB] font-mono text-[#111827]",
                        errors.trackingNumber ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]",
                      )}
                    />
                    {errors.trackingNumber && (
                      <p className="text-[10.5px] text-[#EF4444] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tiempo estimado de entrega compacto y neutral */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#475569]">
                      Tiempo estimado de entrega
                    </label>
                    <span className="text-[10px] text-[#64748B]">
                      Lunes a viernes
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={businessDaysMin}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1;
                          setBusinessDaysMin(val);
                          if (val > businessDaysMax) setBusinessDaysMax(val);
                          if (errors.businessDays) setErrors((prev) => ({ ...prev, businessDays: "" }));
                        }}
                        className="w-12 p-1.5 text-center text-xs bg-white border border-[#CBD5E1] rounded-[4px] font-medium text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                      <span className="text-[#64748B]">a</span>
                      <input
                        type="number"
                        min={businessDaysMin}
                        max={30}
                        value={businessDaysMax}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || businessDaysMin;
                          setBusinessDaysMax(val);
                          if (errors.businessDays) setErrors((prev) => ({ ...prev, businessDays: "" }));
                        }}
                        className="w-12 p-1.5 text-center text-xs bg-white border border-[#CBD5E1] rounded-[4px] font-medium text-[#111827] focus:outline-none focus:border-[#2563EB]"
                      />
                      <span className="text-[#475569] font-medium">días hábiles</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#475569] pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-[#64748B]">Calculado según días hábiles:</span>
                    <span className="font-medium text-[#111827]">{estimatedDateRange}</span>
                  </div>

                  {errors.businessDays && (
                    <p className="text-[10.5px] text-[#EF4444] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.businessDays}
                    </p>
                  )}
                </div>

                {/* Subir Guía de Transportadora (Obligatorio) */}
                <OrderFileUpload
                  label="Guía de transportadora"
                  helpText="Adjunta la guía generada por la transportadora en PDF o imagen (JPG, PNG, WebP)."
                  required={true}
                  multiple={false}
                  files={shipmentGuideFiles}
                  onChange={(files) => {
                    setShipmentGuideFiles(files);
                    if (files.length > 0 && errors.shipmentGuide) {
                      setErrors((prev) => ({ ...prev, shipmentGuide: "" }));
                    }
                  }}
                  errorMessage={errors.shipmentGuide}
                  onPreviewImage={(url, title) => {
                    setPreviewImageUrl(url);
                    setPreviewImageTitle(title || "Guía de despacho");
                  }}
                />

                {/* Notas de despacho */}
                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Notas de despacho (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones u observaciones de recolección..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                  />
                </div>
              </div>
            )}

            {/* ── FORM 2: INICIAR_PRODUCCION ───────────────────────────── */}
            {action.type === "INICIAR_PRODUCCION" && (
              <div className="space-y-3.5 pt-0.5">
                {/* Referencia visual compacta de artículos y diseños */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#475569] block">
                      Productos del pedido
                    </label>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {order.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-2.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px]"
                        >
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-8 h-8 object-cover rounded-[3px] border border-[#E2E8F0] shrink-0"
                          />
                          <div className="min-w-0 flex-1 text-xs">
                            <p className="font-medium text-[#111827] truncate">
                              {item.productName}
                            </p>
                            <p className="text-[10.5px] text-[#64748B] truncate">
                              {item.variant} {item.designName ? `· ${item.designName}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verificación previa en producción con switches contextuales */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#475569] block">
                      Verificación previa en producción <span className="text-[#EF4444] font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      {productionChecks.filter((c) => prodChecksState[c.id]).length} / {productionChecks.length} verificados
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {productionChecks.map((check) => (
                      <OrderVerificationToggle
                        key={check.id}
                        label={check.label}
                        description={check.description}
                        checked={Boolean(prodChecksState[check.id])}
                        onChange={(checked) => {
                          setProdChecksState((prev) => ({ ...prev, [check.id]: checked }));
                          if (errors.prodCheck) setErrors((prev) => ({ ...prev, prodCheck: "" }));
                        }}
                      />
                    ))}
                  </div>

                  {errors.prodCheck && (
                    <p className="text-[10.5px] text-[#EF4444] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.prodCheck}</span>
                    </p>
                  )}
                </div>

                {/* Archivo complementario (Opcional) */}
                <OrderFileUpload
                  label="Archivo complementario de taller (Opcional)"
                  helpText="Adjunta ficha técnica, instrucciones o documento interno si aplica (PDF, JPG, PNG)."
                  required={false}
                  multiple={false}
                  files={prodEvidenceFiles}
                  onChange={setProdEvidenceFiles}
                  onPreviewImage={(url, title) => {
                    setPreviewImageUrl(url);
                    setPreviewImageTitle(title || "Ficha complementaria");
                  }}
                />

                {/* Notas para producción */}
                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Notas de producción (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instrucciones u observaciones operativas para la producción..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                  />
                </div>
              </div>
            )}

            {/* ── FORM 3: MARCAR_LISTO ─────────────────────────────────── */}
            {action.type === "MARCAR_LISTO" && (
              <div className="space-y-3.5 pt-0.5">
                {/* Control de calidad contextual con switches */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#475569] block">
                      Control de calidad <span className="text-[#EF4444] font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-[#64748B] font-medium">
                      {qualityChecks.filter((c) => qcChecksState[c.id]).length} / {qualityChecks.length} verificados
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {qualityChecks.map((check) => (
                      <OrderVerificationToggle
                        key={check.id}
                        label={check.label}
                        description={check.description}
                        checked={Boolean(qcChecksState[check.id])}
                        onChange={(checked) => {
                          setQcChecksState((prev) => ({ ...prev, [check.id]: checked }));
                          if (errors.qcCheck) setErrors((prev) => ({ ...prev, qcCheck: "" }));
                        }}
                      />
                    ))}
                  </div>

                  {errors.qcCheck && (
                    <p className="text-[10.5px] text-[#EF4444] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.qcCheck}</span>
                    </p>
                  )}
                </div>

                {/* Evidencia Fotográfica OBLIGATORIA */}
                <OrderFileUpload
                  label="Evidencia del producto terminado"
                  helpText="Agrega al menos una fotografía del producto terminado."
                  required={true}
                  multiple={true}
                  imagesOnly={true}
                  maxFiles={6}
                  files={qcEvidenceFiles}
                  onChange={(files) => {
                    setQcEvidenceFiles(files);
                    if (files.length > 0 && errors.qcEvidence) {
                      setErrors((prev) => ({ ...prev, qcEvidence: "" }));
                    }
                  }}
                  errorMessage={errors.qcEvidence}
                  onPreviewImage={(url, title) => {
                    setPreviewImageUrl(url);
                    setPreviewImageTitle(title || "Evidencia del producto terminado");
                  }}
                />

                {/* Observaciones de QC */}
                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Observaciones de control de calidad (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detalles u observaciones sobre el control de calidad final..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                  />
                </div>
              </div>
            )}

            {/* ── FORM 4: REPORTAR_INCIDENCIA ──────────────────────────── */}
            {action.type === "REPORTAR_INCIDENCIA" && (
              <div className="space-y-3.5 pt-0.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Categoría de novedad <span className="text-[#EF4444] font-bold">*</span>
                  </label>
                  <select
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                  >
                    <option value="Inconsistencia en diseño o especificaciones gráficas">
                      Inconsistencia en diseño o especificaciones gráficas
                    </option>
                    <option value="Falla o indisponibilidad de insumos / producto base">
                      Falla o indisponibilidad de insumos / producto base
                    </option>
                    <option value="Inconveniente técnico en maquinaria o proceso">
                      Inconveniente técnico en maquinaria o proceso
                    </option>
                    <option value="Discrepancia en control de calidad final">
                      Discrepancia en control de calidad final
                    </option>
                    <option value="Dirección incompleta o sin cobertura de entrega">
                      Dirección incompleta o sin cobertura de entrega
                    </option>
                    <option value="Destinatario ausente en entrega">
                      Destinatario ausente en entrega
                    </option>
                    <option value="Demora o retraso en transportadora">
                      Demora o retraso en transportadora
                    </option>
                    <option value="Solicitud de modificación por parte del cliente">
                      Solicitud de modificación por parte del cliente
                    </option>
                    <option value="Inconsistencia en documentación o guía de despacho">
                      Inconsistencia en documentación o guía de despacho
                    </option>
                    <option value="Otra novedad operativa">
                      Otra novedad operativa
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Detalle de la incidencia <span className="text-[#EF4444] font-bold">*</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (errors.notes) setErrors((prev) => ({ ...prev, notes: "" }));
                    }}
                    placeholder="Describe qué ocurrió y qué debe revisarse..."
                    rows={3}
                    className={cn(
                      "w-full text-xs p-2.5 bg-white border rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]",
                      errors.notes ? "border-[#EF4444] bg-[#FEF2F2]" : "border-[#E2E8F0]",
                    )}
                  />
                  {errors.notes && (
                    <p className="text-[10.5px] text-[#EF4444] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.notes}</span>
                    </p>
                  )}
                </div>

                {/* Evidencia de la Novedad (Opcional) */}
                <OrderFileUpload
                  label="Evidencia de la novedad (Opcional)"
                  helpText="Adjunta fotografías o documentos que respalden la novedad."
                  required={false}
                  multiple={true}
                  maxFiles={4}
                  files={issueEvidenceFiles}
                  onChange={setIssueEvidenceFiles}
                  onPreviewImage={(url, title) => {
                    setPreviewImageUrl(url);
                    setPreviewImageTitle(title || "Evidencia de novedad");
                  }}
                />
              </div>
            )}

            {/* ── FORM 5: CANCELAR_PEDIDO ──────────────────────────────── */}
            {action.type === "CANCELAR_PEDIDO" && (
              <div className="space-y-3.5 pt-0.5">
                {/* Advertencia compacta y limpia según identidad PrintShop */}
                <div className="p-2.5  border rounded-[4px] text-xs">
                  <div className="flex items-center gap-1.5 text-[#DC2626] font-semibold text-xs mb-0.5">
                    <span>Atención</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed">
                    Esta acción no se puede deshacer. El pedido será cancelado y se aplicarán las consecuencias financieras correspondientes.
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Motivo de cancelación <span className="text-[#EF4444] font-bold">*</span>
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                  >
                    <option value="Solicitado por el cliente">Solicitado por el cliente</option>
                    <option value="Indisponibilidad definitiva de producto o insumo">
                      Indisponibilidad definitiva de producto o insumo
                    </option>
                    <option value="Imposibilidad técnica para la fabricación">
                      Imposibilidad técnica para la fabricación
                    </option>
                    <option value="Sospecha de fraude o no pago">Sospecha de fraude o no pago</option>
                    <option value="Dirección sin cobertura de entrega">
                      Dirección sin cobertura de entrega
                    </option>
                    <option value="Otro motivo operativo">Otro motivo operativo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1">
                    Notas de anulación (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Detalles para registro interno de auditoría..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                  />
                </div>

                {/* Evidencia de cancelación (Opcional) */}
                <OrderFileUpload
                  label="Documento o evidencia de cancelación (Opcional)"
                  helpText="Adjunta comprobante o soporte de la anulación si está disponible."
                  required={false}
                  multiple={false}
                  files={cancelEvidenceFiles}
                  onChange={setCancelEvidenceFiles}
                  onPreviewImage={(url, title) => {
                    setPreviewImageUrl(url);
                    setPreviewImageTitle(title || "Evidencia de cancelación");
                  }}
                />
              </div>
            )}

            {/* ── ACCIONES OPERATIVAS COMPLEMENTARIAS EXISTENTES ───────── */}
            {(action.type === "DESPACHAR_TRANSPORTADORA" || action.type === "REGISTRAR_EN_TRANSITO") && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs">
                  <p className="font-semibold text-[#111827] mb-0.5">Confirmar recolección / salida en tránsito</p>
                  <p className="text-[11px] text-[#64748B]">
                    Transportadora: <span className="font-semibold text-[#111827]">{order.carrier || order.shipments?.[0]?.carrier || "Coordinadora"}</span>
                    {(order.trackingNumber || order.shipments?.[0]?.trackingNumber) && ` • Guía: ${order.trackingNumber || order.shipments?.[0]?.trackingNumber}`}
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones de recolección / salida en tránsito (Opcional)..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "REGISTRAR_EN_ENTREGA" && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs">
                  <p className="font-semibold text-[#111827] mb-0.5">Paso a ruta de reparto final</p>
                  <p className="text-[11px] text-[#64748B]">
                    El paquete está a bordo del vehículo de reparto para entrega en el domicilio del cliente hoy.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Vehículo / Repartidor asignado (Opcional)..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "CONFIRMAR_ENTREGA" && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs">
                  <p className="font-semibold text-[#111827] mb-0.5">Cierre de Entrega</p>
                  <p className="text-[11px] text-[#64748B]">
                    Al confirmar la entrega, el pedido pasará a estado completado en el sistema.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas de entrega o persona que recibió (Opcional)..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "RESOLVER_INCIDENCIA" && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs">
                  <span className="text-[10px] font-bold uppercase text-[#64748B] block mb-0.5">
                    Novedad Previa
                  </span>
                  <p className="text-[#334155] font-medium">{order.issueNotes || "Incidencia registrada"}</p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalla cómo se resolvió la novedad..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "GESTIONAR_DEVOLUCION" && (
              <div className="space-y-3 pt-0.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#475569] block mb-1.5">
                    Dictamen de Garantía
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      className={cn(
                        "p-2.5 rounded-[4px] border text-center cursor-pointer transition-colors font-medium",
                        returnDecision === "APPROVED"
                          ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                          : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]",
                      )}
                    >
                      <input
                        type="radio"
                        name="returnDecision"
                        value="APPROVED"
                        checked={returnDecision === "APPROVED"}
                        onChange={() => setReturnDecision("APPROVED")}
                        className="sr-only"
                      />
                      Aprobar Garantía
                    </label>

                    <label
                      className={cn(
                        "p-2.5 rounded-[4px] border text-center cursor-pointer transition-colors font-medium",
                        returnDecision === "REJECTED"
                          ? "border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C]"
                          : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]",
                      )}
                    >
                      <input
                        type="radio"
                        name="returnDecision"
                        value="REJECTED"
                        checked={returnDecision === "REJECTED"}
                        onChange={() => setReturnDecision("REJECTED")}
                        className="sr-only"
                      />
                      Desestimar Solicitud
                    </label>
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explicación técnica para el cliente..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "PAGAR_ANTICIPO" && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs text-[#334155] space-y-1">
                  <p className="font-semibold text-[#111827]">Acreditación de Anticipo Pactado</p>
                  <p className="text-[11px] text-[#64748B]">
                    Monto a registrar: <span className="font-mono font-bold text-[#111827]">$ {order.paymentPlan?.depositAmount.toLocaleString("es-CO")}</span> ({order.paymentPlan?.depositPercentage}% del total)
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Número de comprobante bancario o pasarela..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "PAGAR_SALDO" && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs text-[#334155] space-y-1">
                  <p className="font-semibold text-[#111827]">Liquidación de Saldo Restante</p>
                  <p className="text-[11px] text-[#64748B]">
                    Saldo pendiente a liquidar: <span className="font-mono font-bold text-[#111827]">$ {order.paymentPlan?.balanceAmount.toLocaleString("es-CO")}</span>
                  </p>
                  <p className="text-[10.5px] text-[#64748B]">
                    Al registrar este pago, el pedido quedará 100% saldado y se habilitará el despacho con la transportadora.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Comprobante de transferencia, pasarela o recibo..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {action.type === "GENERAR_RECORDATORIO_SALDO" && (
              <div className="space-y-3 pt-0.5">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] text-xs text-[#334155] space-y-1">
                  <p className="font-semibold text-[#111827]">Emisión de Recordatorio Informativo</p>
                  <p className="text-[11px] text-[#64748B]">
                    Destinatario: <span className="font-semibold text-[#111827]">{order.customerEmail}</span> ({order.customerPhone})
                  </p>
                  <p className="text-[10.5px] text-[#64748B]">
                    Se notificará al cliente el saldo pendiente y el plazo restante de los 7 días.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mensaje personalizado adicional (Opcional)..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-[#E2E8F0] rounded-[4px] focus:outline-none focus:border-[#2563EB] text-[#111827]"
                />
              </div>
            )}

            {/* Footer de Acciones del Formulario */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1F5F9] shrink-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="h-8 text-xs font-semibold text-[#475569] bg-white border border-[#CBD5E1] hover:bg-[#F8FAFC] px-3.5 rounded-[4px] transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  (action.type === "INICIAR_PRODUCCION" &&
                    productionChecks.some((c) => c.required && !prodChecksState[c.id])) ||
                  (action.type === "MARCAR_LISTO" &&
                    (qualityChecks.some((c) => c.required && !qcChecksState[c.id]) || qcEvidenceFiles.length === 0)) ||
                  (action.type === "PREPARAR_ENVIO" && (!trackingNumber.trim() || shipmentGuideFiles.length === 0))
                }
                className={cn(
                  "h-8 text-xs font-semibold px-4 rounded-[4px] shadow-2xs transition-colors flex items-center gap-1.5",
                  action.isDestructive
                    ? "bg-[#EF4444] text-white hover:bg-[#DC2626]"
                    : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]",
                  (isSubmitting ||
                    (action.type === "INICIAR_PRODUCCION" &&
                      productionChecks.some((c) => c.required && !prodChecksState[c.id])) ||
                    (action.type === "MARCAR_LISTO" &&
                      (qualityChecks.some((c) => c.required && !qcChecksState[c.id]) || qcEvidenceFiles.length === 0)) ||
                    (action.type === "PREPARAR_ENVIO" && (!trackingNumber.trim() || shipmentGuideFiles.length === 0))) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                <span>
                  {action.type === "MARCAR_LISTO"
                    ? "Marcar como terminado"
                    : action.type === "CANCELAR_PEDIDO"
                      ? "Cancelar pedido"
                      : action.type === "REPORTAR_INCIDENCIA"
                        ? "Reportar novedad"
                        : action.label}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Previsualización de Imagen Grande (z-[120]) */}
      <ImagePreviewModal
        isOpen={Boolean(previewImageUrl)}
        imageUrl={previewImageUrl}
        title={previewImageTitle}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default OrderActionModal;
