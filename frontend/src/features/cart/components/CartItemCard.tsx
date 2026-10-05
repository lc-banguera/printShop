import React from "react";
import { Link } from "react-router-dom";
import { Trash2, AlertTriangle } from "lucide-react";
import { CartItem, formatCurrency } from "../cart-store";
import { QuantityControl } from "./QuantityControl";

interface CartItemCardProps {
  item: CartItem;
  compact?: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (item: CartItem) => void;
}

export function CartItemCard({
  item,
  compact = false,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const itemTotal = item.price * item.quantity;

  return (
    <div
      className={`relative rounded-card border border-border bg-surface shadow-subtle transition-all duration-normal hover:shadow-card ${
        compact ? "p-3" : "p-4 sm:p-5"
      } ${!item.inStock ? "bg-[#FAFAFA]" : ""}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* ── 1. Imagen del Producto ──────────────────────────────────── */}
        {/* ── 1. Imagen del Producto / Diseño ──────────────────────────────────── */}
        <Link
          to={
            item.itemType === "design"
              ? `/admin/designs/${item.itemId || item.designId || item.productId}`
              : `/products/${item.productId}`
          }
          className={`flex shrink-0 aspect-square items-center justify-center overflow-hidden rounded-control border border-border bg-surfaceMuted p-1.5 transition-colors hover:border-borderStrong ${
            compact ? "w-16 h-16 sm:w-18 sm:h-18" : "w-20 h-20 sm:w-24 sm:h-24"
          }`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-contain ${
                !item.inStock ? "opacity-60 grayscale-[40%]" : ""
              }`}
            />
          ) : (
            <span className="text-xs text-[#94A3B8]">Sin imagen</span>
          )}
        </Link>

        {/* ── 2. Detalles del Producto / Diseño ───────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <Link
                to={
                  item.itemType === "design"
                    ? `/admin/designs/${item.itemId || item.designId || item.productId}`
                    : `/products/${item.productId}`
                }
                className="text-xs sm:text-sm font-bold text-[#111827] hover:text-[#1D4ED8] transition-colors leading-snug line-clamp-2"
              >
                {item.name}
              </Link>

              {/* Botón Eliminar (Icono discreto en compact) */}
              {compact && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="shrink-0 text-[#94A3B8] hover:text-[#DC2626] transition-colors p-1 rounded-[4px] hover:bg-[#FEF2F2] cursor-pointer"
                  title="Eliminar producto"
                  aria-label={`Eliminar ${item.name} del carrito`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Metadatos según tipo: DISEÑO vs PRODUCTO FÍSICO */}
            {item.itemType === "design" ? (
              <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] text-[#64748B]">
                <span className="inline-flex items-center font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded-[3px] text-[10px]">
                  Diseño
                </span>
                {item.author && <span>· Por: {item.author}</span>}
                {item.format && <span className="text-[#94A3B8]">({item.format})</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap mt-1 text-[11px] text-[#64748B]">
                {item.color && (
                  <span className="inline-flex items-center gap-1">
                    <span>Color:</span>
                    <span
                      className="h-2.5 w-2.5 rounded-[2px] border border-[#CBD5E1] inline-block shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                  </span>
                )}
                {item.size && (
                  <>
                    <span>•</span>
                    <span>
                      Talla: <strong>{item.size}</strong>
                    </span>
                  </>
                )}
                {item.category && !item.color && !item.size && (
                  <span>{item.category}</span>
                )}
              </div>
            )}

            {/* ── Aviso Producto Físico Agotado (no aplica a diseños digitales) ── */}
            {item.itemType !== "design" && !item.inStock && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#FFFBEB] border border-[#FEF3C7] text-[11px] font-medium text-[#D97706]">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>Producto no disponible</span>
              </div>
            )}
          </div>

          {/* ── 3. Fila de Precio, Cantidad y Subtotal ──────────────────── */}
          <div
            className={`flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[#F1F5F9] flex-wrap ${
              compact ? "text-xs" : "text-xs sm:text-sm"
            }`}
          >
            {/* Controles de Cantidad */}
            <div className="flex items-center gap-2">
              <QuantityControl
                quantity={item.quantity}
                size={compact ? "sm" : "md"}
                disabled={!item.inStock}
                onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
                onDecrease={() =>
                  onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
              />

              {/* Botón Eliminar con texto en vista normal de página */}
              {!compact && (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#94A3B8] hover:text-[#DC2626] transition-colors px-2 py-1 rounded-[4px] hover:bg-[#FEF2F2] cursor-pointer ml-2"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>

            {/* Precios: Unitario y Subtotal */}
            <div className="text-right ml-auto">
              <div className="font-extrabold text-[#111827] text-xs sm:text-sm">
                {formatCurrency(itemTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemCard;
