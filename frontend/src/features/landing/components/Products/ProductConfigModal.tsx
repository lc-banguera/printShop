import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, AlertCircle, Check } from 'lucide-react';
import { Product, getCategoryDisplayName, getAvailabilityConfig } from '../../data/products.data';
import { getProductConfigurableAttributes } from '../../data/product-attributes';

export interface ProductConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (config: {
    color?: string;
    size?: string;
    fabricQuality?: string;
    selectedAttributes: Record<string, string>;
    quantity: number;
  }) => void;
}

export const ProductConfigModal: React.FC<ProductConfigModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  const attributes = React.useMemo(
    () => getProductConfigurableAttributes(product),
    [product]
  );

  // Inicializar estado de valores seleccionados
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>({});
  const [quantity, setQuantity] = React.useState<number>(1);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Inicializar defaults cuando se abre el modal con un nuevo producto
  React.useEffect(() => {
    if (!isOpen) return;

    const initial: Record<string, string> = {};
    attributes.forEach((attr) => {
      if (attr.defaultValue) {
        initial[attr.id] = attr.defaultValue;
      }
    });

    setSelectedValues(initial);
    setQuantity(1);
    setErrorMessage(null);
  }, [isOpen, attributes]);

  // Manejo de tecla ESC para cerrar
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectValue = (attributeId: string, valueId: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [attributeId]: valueId,
    }));
    setErrorMessage(null);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ── 6. Validación de características obligatorias ─────────────────
    for (const attr of attributes) {
      if (attr.required && !selectedValues[attr.id]) {
        if (attr.id === 'size') {
          setErrorMessage('Selecciona una talla para continuar.');
        } else {
          setErrorMessage(`Selecciona ${attr.label.toLowerCase()} para continuar.`);
        }
        return;
      }
    }

    // Extraer variantes específicas
    const color = selectedValues['color'];
    const size = selectedValues['size'];
    const fabricQuality = selectedValues['fabricQuality'];

    onConfirm({
      color,
      size,
      fabricQuality,
      selectedAttributes: selectedValues,
      quantity,
    });
  };

  const availability = getAvailabilityConfig(product.availability);

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-config-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Encabezado del Modal ───────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F1F5F9] bg-white sticky top-0 z-10">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
              {getCategoryDisplayName(product.category)}
            </span>
            <h2
              id="product-config-title"
              className="text-sm sm:text-base font-bold text-[#111827] leading-snug"
            >
              Configura tu producto
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="h-8 w-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── 2. Cuerpo desplazable ─────────────────────────────────── */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Tarjeta resumen del producto */}
          <div className="flex items-center gap-3.5 p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-[5px] border border-[#E2E8F0] p-1 flex items-center justify-center shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-[#111827] truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-[#2563EB]">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[11px] text-[#9CA3AF] line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${availability.textColor}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${availability.dotColor}`}
                  />
                  {availability.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Características dinámicas del producto ──────────────── */}
          <div className="space-y-4">
            {attributes.map((attr) => {
              const currentValue = selectedValues[attr.id];

              return (
                <div key={attr.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#374151]">
                      {attr.label}
                      {attr.required && (
                        <span className="text-[#DC2626] ml-1">*</span>
                      )}
                    </label>
                    {currentValue && (
                      <span className="text-[11px] font-semibold text-[#64748B]">
                        {attr.type === 'color'
                          ? attr.options.find((o) => o.id === currentValue)?.label || ''
                          : currentValue}
                      </span>
                    )}
                  </div>

                  {/* Renderizado según tipo: Color */}
                  {attr.type === 'color' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {attr.options.map((opt) => {
                        const isSelected = currentValue === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectValue(attr.id, opt.id)}
                            className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-[5px] border text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB] ring-1 ring-[#2563EB]'
                                : 'border-[#E5E7EB] bg-white text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border border-black/10 shrink-0 ${
                                isSelected ? 'scale-110 shadow-xs' : ''
                              }`}
                              style={{ backgroundColor: opt.colorHex || '#000' }}
                            />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Renderizado según tipo: Pills (Talla, Calidad, etc.) */}
                  {attr.type === 'pill' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {attr.options.map((opt) => {
                        const isSelected = currentValue === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectValue(attr.id, opt.id)}
                            className={`h-8 min-w-[34px] px-3 rounded-[5px] text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-2xs'
                                : 'bg-[#F8FAFC] text-[#374151] border-[#E5E7EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#BFDBFE]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Selector de Cantidad ─────────────────────────────────── */}
          <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
            <span className="text-xs font-bold text-[#374151]">Cantidad</span>
            <div className="flex items-center border border-[#CBD5E1] rounded-[4px] bg-white overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                aria-label="Reducir cantidad"
              >
                −
              </button>
              <span className="w-9 h-7 flex items-center justify-center text-xs font-semibold text-[#111827] border-x border-[#CBD5E1]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#475569] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          {/* ── Mensaje de Error de Validación ───────────────────────── */}
          {errorMessage && (
            <div className="p-3 rounded-[5px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* ── 3. Footer con Acciones ────────────────────────────────── */}
        <div className="p-4 border-t border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-[5px] border border-[#E5E7EB] bg-white text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="h-9 px-5 rounded-[5px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Agregar al carrito</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
