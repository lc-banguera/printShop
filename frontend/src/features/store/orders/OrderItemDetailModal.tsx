import * as React from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft, Eye } from "lucide-react";
import { OrderItemSnapshot, FulfillmentType } from "./types";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface Props {
  isOpen?: boolean;
  inline?: boolean;
  item: OrderItemSnapshot | null;
  fulfillmentType?: FulfillmentType;
  orderId?: string;
  onClose?: () => void;
  onBack?: () => void;
}

export const OrderItemDetailModal: React.FC<Props> = ({
  isOpen = false,
  inline = false,
  item,
  fulfillmentType,
  orderId,
  onClose,
  onBack,
}) => {
  const [zoomImage, setZoomImage] = React.useState<string | null>(null);

  if ((!isOpen && !inline) || !item) return null;

  const itemFulfillment =
    item.fulfillmentType || fulfillmentType || "CUSTOMIZE_EXISTING";
  const modeLabel =
    itemFulfillment === "READY_TO_SHIP"
      ? "Producto listo para despacho"
      : itemFulfillment === "CUSTOM_FROM_SCRATCH"
        ? "Personalización desde cero"
        : "Producto personalizado";

  const size = item.variantSnapshot?.size || item.size;
  const color = item.variantSnapshot?.color || item.color;
  const fabric = item.variantSnapshot?.fabric || item.fabric;
  const printZone = item.designSnapshot?.printZone || item.designPrintZone;
  const hasVariantSpecs = Boolean(size || color || fabric || printZone);

  const instructions =
    item.customizationSpec?.textInstructions ||
    item.customerRequirements?.instructions;
  const colors = item.customizationSpec?.colors;
  const hasCustomization = Boolean(
    item.designName ||
    item.designTechnique ||
    instructions ||
    (colors && colors.length > 0),
  );

  const sku = item.variantSnapshot?.sku || item.variantId;
  const subtotal = item.unitPrice * item.quantity;

  const header = (
    <div className="flex items-start justify-between border-b border-[#F1F5F9] pb-3 px-4 pt-3.5">
      <div className="space-y-1.5">
        {inline && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>Cerrar detalles del producto</span>
          </button>
        ) : null}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Ficha Técnica del Producto
          </span>
          <h3 className="mt-0.5 text-base font-bold text-[#111827]">
            {item.productNameSnapshot || item.productName}
          </h3>
        </div>
        <div className="text-xs text-[#64748B]">
          Modalidad:{" "}
          <span className="font-semibold text-[#111827]">{modeLabel}</span>
        </div>
      </div>

      {!inline && onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha técnica"
          title="Cerrar"
          className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-[4px] hover:bg-[#F8FAFC] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );

  const body = (
    <div className="p-4 space-y-3 text-xs">
      {/* BLOQUE 1 — PRODUCTO Y VALOR */}
      <div className="flex flex-col sm:flex-row gap-3.5 sm:items-center border border-[#E2E8F0] bg-[#F8FAFC] p-3 rounded-[4px]">
        <div className="w-20 h-20 bg-white rounded-[4px] overflow-hidden border border-[#E2E8F0] shrink-0">
          <img
            src={item.image}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 space-y-1 text-xs text-[#475569]">
          <p className="font-bold text-sm text-[#111827]">
            {item.productNameSnapshot || item.productName}
          </p>
          {sku && (
            <div>
              <span className="font-semibold text-[#111827]">SKU:</span> {sku}
            </div>
          )}
          {item.productId && (
            <div>
              <span className="font-semibold text-[#111827]">ID Producto:</span>{" "}
              {item.productId}
            </div>
          )}
          <div>
            <span className="font-semibold text-[#111827]">Cantidad:</span> x
            {item.quantity}
          </div>
        </div>

        <div className="sm:ml-auto text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E2E8F0]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Precio unitario
          </span>
          <p className="text-base font-bold text-[#111827] mt-0.5">
            $ {item.unitPrice.toLocaleString("es-CO")}
          </p>
          <p className="text-[11px] text-[#64748B] mt-0.5">
            Subtotal:{" "}
            <strong className="font-semibold text-[#111827]">
              $ {subtotal.toLocaleString("es-CO")}
            </strong>
          </p>
        </div>
      </div>

      {/* BLOQUE 2 — VARIANTE Y ESPECIFICACIONES */}
      {hasVariantSpecs && (
        <div className="border border-[#E2E8F0] rounded-[4px] p-3 bg-white space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Variante y Especificaciones
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-[#475569]">
            {size && (
              <div>
                <span className="text-[10px] text-[#64748B] block">Talla</span>
                <span className="font-semibold text-[#111827]">{size}</span>
              </div>
            )}
            {color && (
              <div>
                <span className="text-[10px] text-[#64748B] block">Color</span>
                <span className="font-semibold text-[#111827]">{color}</span>
              </div>
            )}
            {fabric && (
              <div>
                <span className="text-[10px] text-[#64748B] block">
                  Tela / Composición
                </span>
                <span className="font-semibold text-[#111827]">{fabric}</span>
              </div>
            )}
            {printZone && (
              <div>
                <span className="text-[10px] text-[#64748B] block">
                  Ubicación Estampado
                </span>
                <span className="font-semibold text-[#111827]">
                  {printZone}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BLOQUE 3 — PERSONALIZACIÓN Y DISEÑO */}
      {hasCustomization && (
        <div className="border border-[#E2E8F0] rounded-[4px] p-3 bg-white space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Personalización y Diseño
          </span>
          <div className="space-y-1.5 text-xs text-[#475569]">
            {item.designName && (
              <div>
                <span className="font-semibold text-[#111827]">Diseño:</span>{" "}
                {item.designName}
              </div>
            )}
            {item.designTechnique && (
              <div>
                <span className="font-semibold text-[#111827]">Técnica:</span>{" "}
                {item.designTechnique}
              </div>
            )}
            {instructions && (
              <div>
                <span className="font-semibold text-[#111827]">
                  Instrucciones:
                </span>{" "}
                {instructions}
              </div>
            )}
            {colors && colors.length > 0 && (
              <div>
                <span className="font-semibold text-[#111827]">Colores:</span>{" "}
                {colors.join(", ")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÓN VER IMAGEN */}
      <div className="flex justify-start pt-1">
        <button
          type="button"
          onClick={() => setZoomImage(item.image)}
          className="h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] hover:bg-[#DBEAFE] transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ver imagen</span>
        </button>
      </div>
    </div>
  );

  const containerClass = inline
    ? "bg-white border border-[#E2E8F0] rounded-[4px] p-0 shadow-2xs"
    : "bg-white border border-[#E2E8F0] rounded-[4px] max-w-2xl w-full p-0 shadow-2xl";

  if (inline) {
    return (
      <div className={containerClass}>
        {header}
        {body}
        <ImagePreviewModal
          isOpen={Boolean(zoomImage)}
          imageUrl={zoomImage || null}
          title={item.productName || "Imagen"}
          onClose={() => setZoomImage(null)}
        />
      </div>
    );
  }

  const modalContent = (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150"
      >
        <div className={containerClass}>
          {header}
          {body}
        </div>
      </div>
      <ImagePreviewModal
        isOpen={Boolean(zoomImage)}
        imageUrl={zoomImage || null}
        title={item.productName || "Imagen"}
        onClose={() => setZoomImage(null)}
      />
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
};
