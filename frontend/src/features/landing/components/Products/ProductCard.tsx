import * as React from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { Product, getCategoryDisplayName } from "../../data/products.data";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // ── Cálculo del porcentaje de descuento ───────────────────────────
  const currentNum = parseInt(product.price.replace(/[^0-9]/g, ""), 10) || 0;
  const originalNum = product.originalPrice
    ? parseInt(product.originalPrice.replace(/[^0-9]/g, ""), 10)
    : 0;

  const discountPercent =
    originalNum > currentNum && currentNum > 0
      ? Math.round(((originalNum - currentNum) / originalNum) * 100)
      : null;

  return (
    <Link
      to={product.href || `/products/${product.id}`}
      data-card
      className="group flex h-full select-none flex-col overflow-hidden rounded-card border border-borderMuted bg-surface transition-all duration-normal hover:-translate-y-0.5 hover:border-borderStrong hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* ── 1. ÁREA DE IMAGEN ───────────────────────────────────────── */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-surfaceMuted p-3.5 sm:p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* ── 2. INFORMACIÓN DEL PRODUCTO ───────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col p-3.5 pt-3">
        {/* Categoría (en azul como en la referencia) */}
        {product.category && (
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-primary sm:text-[11px]">
            {getCategoryDisplayName(product.category)}
          </span>
        )}

        {/* Nombre del Producto */}
        <h3 className="line-clamp-1 text-xs font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-[13px] md:text-sm">
          {product.name}
        </h3>

        {/* Material / Descripción Secundaria */}
        <p className="mt-0.5 line-clamp-1 text-[11px] text-foregroundMuted sm:text-xs">
          {product.description}
        </p>

        {/* Precios y Descuento */}
        <div className="mt-2.5">
          {/* Precio Anterior (tachado) */}
          {product.originalPrice ? (
            <span className="block text-[11px] sm:text-xs text-foregroundSubtle line-through leading-none">
              {product.originalPrice}
            </span>
          ) : (
            <span className="block text-[11px] sm:text-xs text-transparent select-none leading-none">
              -
            </span>
          )}

          {/* Precio Actual */}
          <div className="text-base sm:text-lg md:text-xl font-extrabold text-foreground leading-tight mt-1">
            {product.price}
          </div>

          {/* Porcentaje de Descuento (badge verde con texto blanco) */}
          {discountPercent ? (
            <div className="mt-1">
              <span className="inline-block rounded-badge bg-success px-1.5 py-0.5 text-[10px] font-bold leading-none text-primaryForeground sm:text-[11px]">
                {discountPercent}% OFF
              </span>
            </div>
          ) : null}
        </div>

        {/* Colores disponibles (solo visuales, no interactivos) */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 sm:mt-3">
            <span className="text-[10px] sm:text-[11px] font-semibold text-foreground-muted uppercase tracking-wide">
              COLOR:
            </span>
            <div className="flex items-center gap-1">
              {product.colors.map((colorHex, idx) => (
                <span
                  key={idx}
                  aria-hidden="true"
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/15 shrink-0"
                  style={{ backgroundColor: colorHex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Envío (beneficio en verde) */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-success sm:mt-3 sm:text-xs">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>Envío gratis</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
