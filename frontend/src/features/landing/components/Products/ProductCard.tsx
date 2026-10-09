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
      className="group flex h-full select-none flex-col overflow-hidden rounded-[18px] border border-borderMuted bg-surface shadow-subtle transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-borderStrong hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* ── 1. ÁREA DE IMAGEN ───────────────────────────────────────── */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[linear-gradient(145deg,var(--surface-muted),var(--background))] p-4 sm:p-5">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      {/* ── 2. INFORMACIÓN DEL PRODUCTO ───────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col p-4 pt-3.5">
        {/* Categoría (en azul como en la referencia) */}
        {product.category && (
          <span className="mb-1 block text-[10px] font-bold uppercase text-primary sm:text-[11px]">
            {getCategoryDisplayName(product.category)}
          </span>
        )}

        {/* Nombre del Producto */}
        <h3 className="line-clamp-1 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
          {product.name}
        </h3>

        {/* Material / Descripción Secundaria */}
        <p className="mt-1 line-clamp-1 text-xs leading-5 text-foregroundMuted">
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
          <div className="mt-1 text-lg font-extrabold leading-tight text-foreground sm:text-xl">
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
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-foreground-muted uppercase sm:text-[11px]">
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
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-success">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>Envío gratis</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
