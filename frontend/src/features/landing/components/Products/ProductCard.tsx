import * as React from "react";
import { Link } from "react-router-dom";
import { Truck } from "lucide-react";
import { Product, getCategoryDisplayName } from "../../data/products.data";

interface ProductCardProps {
  product: Product;
  showPromotions?: boolean;
  showShipping?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showPromotions = true, showShipping = true }) => {
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
      className="group flex h-full select-none flex-col overflow-hidden rounded-[5px] border border-slate-200 bg-white transition-all duration-200 ease-out hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_18px_30px_-24px_rgba(15,23,42,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]"
    >
      {/* 1. Pedestal Studio de Escala Amplia */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-white p-6 sm:p-7">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-106 drop-shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
          loading="lazy"
        />
        {showPromotions && discountPercent ? (
          <span className="absolute right-4 top-4 text-[11px] font-bold tracking-[0.04em] text-slate-600">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>

      {/* 2. Información del Producto de Alta Legibilidad */}
      <div className="flex min-w-0 flex-1 flex-col p-5 pt-4">
        {product.category && (
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
            {getCategoryDisplayName(product.category)}
          </span>
        )}

        <h3 className="line-clamp-1 text-base font-bold leading-snug tracking-tight text-[#0D1014] transition-colors group-hover:text-slate-600 sm:text-[17px]">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs leading-5 text-foregroundMuted">
          {product.description}
        </p>

        {/* Precios */}
        <div className="mt-3.5 flex items-baseline gap-2">
          <div className="text-xl font-bold tracking-tight text-[#0D1014]">
            {product.price}
          </div>
          {showPromotions && product.originalPrice && (
            <span className="text-xs text-foregroundSubtle line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Variantes de Color */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-foregroundMuted uppercase">
              Colores:
            </span>
            <div className="flex items-center gap-1">
              {product.colors.map((colorHex, idx) => (
                <span
                  key={idx}
                  aria-hidden="true"
                  className="w-3 h-3 rounded-full border border-black/15 shrink-0 shadow-2xs"
                  style={{ backgroundColor: colorHex }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Envío */}
        {showShipping ? (
          <div className="mt-4 flex items-center gap-1.5 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-600">
            <Truck className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
            <span>Envío gratis en compras seleccionadas</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
};

export default ProductCard;
