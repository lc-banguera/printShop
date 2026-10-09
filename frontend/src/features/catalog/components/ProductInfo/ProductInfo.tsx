import * as React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Package,
  ShieldCheck,
  Headphones,
  Star,
  Edit3,
  ShoppingCart,
  AlertCircle,
  Check,
} from "lucide-react";
import { Product, getCategoryDisplayName } from "@/features/landing/data/products.data";
import {
  getProductConfigurableAttributes,
  getColorName,
} from "@/features/landing/data/product-attributes";
import { useCartStore } from "@/features/cart";
import { useAuthStore } from "@/features/auth";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const [selectedColor, setSelectedColor] = React.useState<string>(
    product.colors?.[0] || "#111827"
  );
  const [qty, setQty] = React.useState<number>(1);
  const [isFavorite, setIsFavorite] = React.useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = React.useState<boolean>(false);

  // ── Características dinámicas (extensibles por producto/categoría) ──
  const nonColorAttributes = React.useMemo(() => {
    return getProductConfigurableAttributes(product).filter(
      (attr) => attr.id !== "color"
    );
  }, [product]);

  const [selectedAttributes, setSelectedAttributes] = React.useState<
    Record<string, string>
  >({});
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated, openAuthModal } = useAuthStore();

  // Sincronizar estado cuando cambia el producto
  React.useEffect(() => {
    setSelectedColor(product.colors?.[0] || "#111827");
    setQty(1);
    setIsFavorite(false);
    setValidationError(null);
    setAddedSuccess(false);

    const initial: Record<string, string> = {};
    nonColorAttributes.forEach((attr) => {
      if (attr.defaultValue) {
        initial[attr.id] = attr.defaultValue;
      }
    });
    setSelectedAttributes(initial);
  }, [product.id, product.colors, nonColorAttributes]);

  const handleSelectAttribute = (attrId: string, val: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrId]: val,
    }));
    setValidationError(null);
  };

  const handleAddToCart = () => {
    // Validación de características obligatorias
    for (const attr of nonColorAttributes) {
      if (attr.required && !selectedAttributes[attr.id]) {
        if (attr.id === "size") {
          setValidationError("Selecciona una talla para continuar.");
        } else {
          setValidationError(`Selecciona ${attr.label.toLowerCase()} para continuar.`);
        }
        return;
      }
    }

    const numericPrice =
      parseInt(product.price.replace(/[^0-9]/g, ""), 10) || 49900;

    const { size, ...restAttrs } = selectedAttributes;
    const customAttributes =
      Object.keys(restAttrs).length > 0 ? restAttrs : undefined;

    const itemToAdd = {
      productId: product.id,
      name: product.name,
      description: product.description,
      price: numericPrice,
      image: product.image,
      color: product.colors && product.colors.length > 0 ? selectedColor : undefined,
      size: size || undefined,
      customAttributes,
      category: getCategoryDisplayName(product.category),
      quantity: qty,
      inStock: product.availability !== "Agotado",
    };

    if (!isAuthenticated) {
      openAuthModal(itemToAdd);
      return;
    }

    addItem(itemToAdd);
    setValidationError(null);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  const rating = product.rating || 4.8;
  const reviewCount = product.reviews || 258;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 rounded-card border border-border bg-surface p-5 shadow-card sm:gap-5 sm:p-7 lg:p-8">
      {/* ── 1. Información del producto existente ─────────────────────── */}
      {/* Category Name */}
      <span className="text-[11px] font-semibold uppercase tracking-wide text-foregroundMuted sm:text-xs">
        {getCategoryDisplayName(product.category)}
      </span>

      {/* Product Title (15-20% smaller: text-xl lg:text-2xl) */}
      <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
        {product.name}
      </h1>

      {/* Description */}
      <p className="text-sm leading-relaxed text-foregroundMuted">
        {product.description ||
          "Producto de alta calidad con estampado premium, confeccionado con los mejores materiales para mayor comodidad y durabilidad."}
      </p>

      {/* Rating Row */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.round(rating)
                  ? "fill-[var(--warning)] text-[var(--warning)]"
                  : "text-[var(--border-strong)]"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          ({reviewCount} Reviews)
        </span>
      </div>

      {/* Price & Discount */}
      <div className="flex flex-wrap items-baseline gap-2.5 rounded-control bg-surfaceMuted px-4 py-3">
        <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {product.price}
        </span>
        {product.originalPrice && (
          <span className="text-xs sm:text-sm text-[var(--text-muted)] line-through">
            {product.originalPrice}
          </span>
        )}
        <span className="w-full text-xs font-semibold text-primary sm:w-auto">
          Descuento solo por este fin de semana
        </span>
      </div>

      {/* ── 2. Color (YA EXISTE - si el producto tiene colores) ────────── */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-borderMuted pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Elige tu color
            </span>
            {selectedColor && (
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                {getColorName(selectedColor)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {product.colors.map((color, idx) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-7 w-7 rounded-control transition-all ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "border border-borderStrong"
                  }`}
                  style={{ backgroundColor: color }}
                  title={getColorName(color, idx)}
                  aria-label={`Color ${getColorName(color, idx)}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3 a 6. Características dinámicas (Talla, Calidad, Material, etc.) ── */}
      {nonColorAttributes.map((attr) => {
        const currentValue = selectedAttributes[attr.id];
        const isMissing = attr.required && !currentValue && validationError;

        return (
          <div key={attr.id} className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {attr.label}
                {attr.required && <span className="text-[var(--danger-strong)] ml-1">*</span>}
              </span>
              {currentValue && (
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                  {currentValue}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {attr.options.map((opt) => {
                const isSelected = currentValue === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectAttribute(attr.id, opt.id)}
                    className={`h-8 min-w-[36px] px-3 rounded-[5px] text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-2xs"
                        : isMissing
                              ? "border-dangerStrong bg-surface text-foregroundMuted hover:border-dangerStrong"
                              : "border-border bg-surfaceMuted text-foregroundMuted hover:border-primary hover:bg-infoMuted hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Feedback de validación elegante (sin alert del navegador) ── */}
      {validationError && (
        <div className="p-2.5 rounded-[5px] bg-[var(--danger-muted)] border border-[var(--danger-muted)] text-[var(--danger-strong)] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── 7. Cantidad (YA EXISTE) ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-borderMuted pt-4">
        <div className="flex items-center rounded-control border border-borderStrong bg-surface">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <span className="w-8 h-7 flex items-center justify-center text-xs font-semibold text-[var(--text-primary)] border-x border-[var(--border-strong)]">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
        <span className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
          ¡Solo quedan 10 unidades, date prisa!
        </span>
      </div>

      {/* ── 8. Botones principales (YA EXISTEN) ──────────────────────── */}
      {/* [ Personalizar ✏️ ]  [ 🛒 Agregar al carrito ] */}
      <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:flex-row">
        {/* Button 1: Personalizar (Solid Blue, opens /designer) */}
        <Link
          to="/designer/personalize"
          className="flex h-11 w-full flex-1 items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover"
        >
          <span>Personalizar</span>
          <Edit3 className="w-3.5 h-3.5" />
        </Link>

        {/* Button 2: Agregar al carrito (Outline Blue) */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex h-11 w-full flex-1 items-center justify-center gap-2 rounded-control border-2 px-4 text-sm font-semibold transition-colors ${
            addedSuccess
              ? "border-success bg-success text-primaryForeground"
              : "border-primary bg-surface text-primary hover:bg-infoMuted"
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>¡Agregado al carrito!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>
      </div>

      {/* Add to Favorites Link */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
            isFavorite ? "text-[var(--danger-strong)]" : "text-[var(--text-secondary)] hover:text-[var(--primary)]"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
          <span>{isFavorite ? "En tus favoritos" : "Agregar a favoritos"}</span>
        </button>
      </div>

      {/* Service Benefits Information */}
      <div className="flex flex-col gap-3.5 border-t border-borderMuted pt-5">
        <div className="flex items-start gap-2.5">
          <Package className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Envío gratis</p>
            <p className="text-[11px] text-[var(--text-secondary)]">En pedidos superiores a $150.000</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Pagos seguros</p>
            <p className="text-[11px] text-[var(--text-secondary)]">Tus pagos 100% protegidos</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Headphones className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">Atención 24/7</p>
            <p className="text-[11px] text-[var(--text-secondary)]">Soporte dedicado para ayudarte</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
