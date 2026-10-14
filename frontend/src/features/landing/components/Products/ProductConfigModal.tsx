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
        className="relative w-full max-w-md sm:max-w-lg bg-surface rounded-dialog border border-border shadow-modal overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Encabezado del Modal ───────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-borderMuted bg-surface sticky top-0 z-10">
          <div>
            <span className="text-[10px] uppercase font-bold text-foregroundMuted tracking-wider">
              {getCategoryDisplayName(product.category)}
            </span>
            <h2
              id="product-config-title"
              className="text-sm sm:text-base font-bold text-foreground leading-snug"
            >
              Configura tu producto
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="h-8 w-8 rounded-full flex items-center justify-center text-foregroundMuted hover:text-foreground hover:bg-surfaceMuted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── 2. Cuerpo desplazable ─────────────────────────────────── */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Tarjeta resumen del producto */}
          <div className="flex items-center gap-3.5 p-3 rounded-control bg-surfaceMuted border border-border">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-surface rounded-control border border-border p-1 flex items-center justify-center shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs sm:text-sm font-extrabold text-primary">
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[11px] text-foregroundSubtle line-through">
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
                    <label className="text-xs font-bold text-foregroundMuted">
                      {attr.label}
                      {attr.required && (
                        <span className="text-dangerStrong ml-1">*</span>
                      )}
                    </label>
                    {currentValue && (
                      <span className="text-[11px] font-semibold text-foregroundMuted">
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
                            className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-control border text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                              isSelected
                                ? 'border-primary bg-infoMuted text-primary ring-1 ring-primary'
                                : 'border-border bg-surface text-foregroundMuted hover:border-borderStrong hover:bg-surfaceMuted'
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
                            className={`h-8 min-w-[34px] px-3 rounded-control text-xs font-bold transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 ${
                              isSelected
                                ? 'bg-primary text-primaryForeground border-primary shadow-2xs'
                                : 'bg-surfaceMuted text-foregroundMuted border-border hover:bg-infoMuted hover:text-primary hover:border-primary/30'
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
          <div className="pt-2 border-t border-borderMuted flex items-center justify-between">
            <span className="text-xs font-bold text-foregroundMuted">Cantidad</span>
            <div className="flex items-center border border-borderStrong rounded-control bg-surface overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-foregroundMuted hover:bg-surfaceMuted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                aria-label="Reducir cantidad"
              >
                −
              </button>
              <span className="w-9 h-7 flex items-center justify-center text-xs font-semibold text-foreground border-x border-borderStrong">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-foregroundMuted hover:bg-surfaceMuted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30"
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          {/* ── Mensaje de Error de Validación ───────────────────────── */}
          {errorMessage && (
            <div className="p-3 rounded-control bg-dangerMuted border border-dangerStrong/30 text-dangerStrong text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* ── 3. Footer con Acciones ────────────────────────────────── */}
        <div className="p-4 border-t border-borderMuted bg-surfaceMuted flex items-center justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-control border border-border bg-surface text-xs font-semibold text-foregroundMuted hover:bg-surfaceMuted hover:border-borderStrong transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="h-9 px-5 rounded-control bg-primary hover:bg-primaryHover active:bg-primaryActive text-xs font-semibold text-primaryForeground transition-colors cursor-pointer shadow-2xs flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
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
