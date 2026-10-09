import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Header } from "@/features/landing/components/Header/Header";
import { Footer } from "@/features/landing/components/Footer/Footer";
import { Container } from "@/shared/components/Container/Container";
import { productsData } from "@/features/landing/data/products.data";
import { ProductCard } from "@/features/landing/components/Products/ProductCard";
import { useCartStore, formatCurrency, CartItem } from "./cart-store";
import { CartItemCard } from "./components/CartItemCard";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDiscountAmount,
    getShippingAmount,
    getTotal,
    getTotalItemsCount,
    couponCode,
    discountRate,
    applyCoupon,
    removeCoupon,
    isApplyingCoupon,
    couponError,
    couponSuccess,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState("");
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingAmount();
  const total = getTotal();
  const totalCount = getTotalItemsCount();

  // Productos recomendados (excluyendo los que ya están en el carrito)
  const recommendedProducts = React.useMemo(() => {
    const inCartIds = new Set(items.map((it) => it.productId));
    const filtered = productsData.filter((p) => !inCartIds.has(p.id));
    return (filtered.length >= 4 ? filtered : productsData).slice(0, 4);
  }, [items]);

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const ok = await applyCoupon(inputCoupon);
    if (ok) {
      setInputCoupon("");
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleConfirmClearCart = () => {
    clearCart();
    setIsClearingCart(false);
  };

  return (
    <div className="min-h-screen flex min-w-0 flex-col bg-background">
      {/* ── 1. Encabezado Oficial de PrintShop ────────────────────────── */}
      <Header />

      {/* ── 2. Contenido Principal ───────────────────────────────────── */}
      <main className="min-w-0 flex-1 py-8 sm:py-10">
        <Container variant="wide">
          {/* Breadcrumb / Regresar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Continuar comprando</span>
            </Link>

            {items.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearingCart(true)}
                className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--danger-strong)] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Vaciar carrito</span>
              </button>
            )}
          </div>

          {/* Título de Sección */}
          <div className="mb-7 flex items-baseline gap-3 border-b border-border pb-5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tu carrito
            </h1>
          </div>

          {/* ── 14. Experiencia de Carrito Vacío ─────────────────────── */}
          {items.length === 0 ? (
            <div className="mx-auto my-8 max-w-lg rounded-card border border-border bg-surface p-8 text-center shadow-card sm:p-12">
              <div className="h-16 w-16 rounded-full bg-[var(--border-muted)] text-[var(--text-secondary)] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Tu carrito está vacío
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-sm mx-auto">
                Agrega productos para comenzar tu compra y personalizar con tus
                diseños favoritos.
              </p>
              <div className="pt-6">
                <Link
                  to="/"
                  className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-6 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover"
                >
                  Ver productos
                </Link>
              </div>
            </div>
          ) : (
            /* ── 6. Layout de Dos Columnas en Desktop ───────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Columna Izquierda: Lista de Productos (8 cols) */}
              <div className="min-w-0 space-y-4 lg:col-span-8">
                <div className="space-y-3">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={(it) => setItemToDelete(it)}
                    />
                  ))}
                </div>

                {/* Banner de beneficios / información de compra */}
                <div className="bg-white rounded-[5px] border border-[var(--border)] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--text-secondary)] shadow-2xs mt-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 shrink-0 text-primary" />
                    <span>
                      Envío gratis a toda Colombia en órdenes superiores a
                      $150.000
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                    <span>Garantía de calidad PrintShop</span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resumen del Pedido (4 cols sticky) ──── */}
              <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:col-span-4">
                <div className="space-y-5 rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
                  <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] pb-3 border-b border-[var(--border-muted)]">
                    Resumen del pedido
                  </h2>

                  {/* Detalle de costos */}
                  <div className="space-y-2.5 text-xs sm:text-[13px]">
                    <div className="flex items-center justify-between text-[var(--text-secondary)]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    {discountRate > 0 && (
                      <div className="flex items-center justify-between text-success">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          <span>Descuento ({couponCode})</span>
                        </span>
                        <span className="font-semibold">
                          -{formatCurrency(discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[var(--text-secondary)]">
                      <span>Envío</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {shipping === 0 ? (
                          <span className="font-semibold text-success">
                            Gratis
                          </span>
                        ) : (
                          "Calculado en el checkout"
                        )}
                      </span>
                    </div>

                    {/* Total con mayor jerarquía visual */}
                    <div className="pt-3 border-t border-[var(--border)] flex items-baseline justify-between">
                      <div>
                        <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] block">
                          Total
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          IVA incluido
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* ── 11. Sección de Cupón / Descuento ──────────────── */}
                  <div className="pt-3 border-t border-[var(--border-muted)]">
                    <label
                      htmlFor="coupon-input"
                      className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
                    >
                      ¿Tienes un cupón?
                    </label>

                    {couponCode ? (
                      <div className="flex items-center justify-between p-2 rounded-[5px] bg-[var(--success-muted)] border border-[var(--border-strong)] text-xs text-[var(--success)]">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Tag className="h-3.5 w-3.5" />
                          <span>{couponCode}</span>
                          <span className="text-[11px] font-normal text-[var(--success)]">
                            ({discountRate * 100}% aplicado)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-[11px] text-[var(--danger-strong)] hover:underline cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleApplyCouponSubmit}
                        className="space-y-1.5"
                      >
                        <div className="flex gap-2">
                          <input
                            id="coupon-input"
                            type="text"
                            value={inputCoupon}
                            onChange={(e) => setInputCoupon(e.target.value)}
                            placeholder="Ej. PRINTSHOP10"
                            disabled={isApplyingCoupon}
                            className="h-10 min-w-0 flex-1 rounded-control border border-borderStrong px-3 text-xs uppercase text-foreground shadow-subtle outline-none placeholder:text-foregroundSubtle focus:border-primary focus:ring-1 focus:ring-primary"
                          />
                          <button
                            type="submit"
                            disabled={isApplyingCoupon || !inputCoupon.trim()}
                            className="h-9 px-3 rounded-[5px] border border-[var(--border)] bg-white hover:bg-[var(--surface-muted)] text-xs font-medium text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isApplyingCoupon ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Aplicar"
                            )}
                          </button>
                        </div>

                        {couponError && (
                          <p className="text-[11px] text-[var(--danger-strong)] flex items-center gap-1 pt-0.5">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            <span>{couponError}</span>
                          </p>
                        )}
                      </form>
                    )}
                  </div>

                  {/* ── 10. Botón Principal "Continuar al pago" ────────── */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/checkout")}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover active:bg-primaryActive"
                    >
                      <span>Continuar al pago</span>
                    </button>
                  </div>

                  {/* Sellos de Confianza y Pago */}
                  <div className="pt-2 space-y-2 border-t border-[var(--border-muted)] text-[11px] text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                      <span>Pago seguro procesado con Mercado Pago</span>
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)] leading-tight">
                      Aceptamos tarjetas de crédito, débito, PSE, Nequi y
                      efectivo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 18. Sección de Productos Recomendados ─────────────────── */}
          <div className="mt-14 pt-8 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                También te puede interesar
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </Container>
      </main>

      {/* ── 3. Modal de Confirmación para Eliminar ────────────────────── */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto del carrito?"
        description={
          itemToDelete ? (
            <span>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-[var(--text-primary)]">"{itemToDelete.name}"</strong>{" "}
              de tu lista de compras?
            </span>
          ) : (
            ""
          )
        }
        confirmText="Eliminar producto"
        cancelText="Conservar"
        variant="danger"
      />

      {/* ── Modal de Confirmación para Vaciar Carrito ─────────────────── */}
      <ConfirmationModal
        isOpen={isClearingCart}
        onClose={() => setIsClearingCart(false)}
        onConfirm={handleConfirmClearCart}
        title="¿Vaciar todo el carrito?"
        description="Se eliminarán todos los productos que agregaste a tu carrito. Esta acción no se puede deshacer."
        confirmText="Vaciar carrito"
        cancelText="Conservar productos"
        variant="danger"
      />

      {/* ── 4. Pie de Página Oficial ─────────────────────────────────── */}
      <Footer />
    </div>
  );
}

export default CartPage;
