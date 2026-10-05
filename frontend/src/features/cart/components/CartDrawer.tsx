import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartStore, formatCurrency, CartItem } from "../cart-store";
import { CartItemCard } from "./CartItemCard";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";

export function CartDrawer() {
  const navigate = useNavigate();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTotalItemsCount,
  } = useCartStore();

  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(104);

  // Medir la altura exacta del header para posicionar el drawer justo debajo
  useEffect(() => {
    const measureHeader = () => {
      const headerEl = document.querySelector("header");
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };

    measureHeader();
    window.addEventListener("resize", measureHeader);
    return () => window.removeEventListener("resize", measureHeader);
  }, [isDrawerOpen]);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const subtotal = getSubtotal();
  const totalCount = getTotalItemsCount();

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleGoToCart = () => {
    closeDrawer();
    navigate("/cart");
  };

  const handleGoToCheckout = () => {
    closeDrawer();
    navigate("/checkout");
  };

  return (
    <>
      {/* ── Overlay: cubre la página completa cuando el drawer está abierto ─── */}
      <div
        style={{
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
        className={`fixed left-0 right-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* ── Panel Lateral (Drawer): inicia exactamente debajo del header */}
      <aside
        style={{
          top: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
        className={`fixed right-0 z-40 w-full sm:w-[420px] max-w-[100vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out select-none border-l border-[#E5E7EB] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrito de compras"
        role="dialog"
        aria-modal="true"
      >
        {/* Header del Drawer: [X] Tu carrito (N productos) */}
        <div className="flex items-end justify-end gap-2.5 px-4 py-3 border-b border-[#E5E7EB] bg-white shrink-0">
          {/* Botón cerrar — izquierda */}
          <button
            type="button"
            onClick={closeDrawer}
            className="h-8 w-8 rounded-[5px] flex items-center justify-center text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar carrito"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido / Lista de Productos con Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="h-14 w-14 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-[#64748B] mt-1 max-w-[220px]">
                  Explora nuestro catálogo y personaliza productos únicos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  navigate("/#productos");
                }}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-[5px] transition-colors shadow-2xs cursor-pointer"
              >
                Ver productos
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                compact
                onUpdateQuantity={updateQuantity}
                onRemove={(it) => setItemToDelete(it)}
              />
            ))
          )}
        </div>

        {/* Footer con Resumen y Acciones */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFBFD] shrink-0 space-y-3">
            {/* Fila de Subtotal */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span>Subtotal</span>
                <span className="text-sm font-extrabold text-[#111827]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                Envío calculado en el checkout
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2 pt-1">
              {/* Botón Principal: Continuar al pago */}
              <button
                type="button"
                onClick={handleGoToCheckout}
                className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Continuar al pago</span>
              </button>

              {/* Botón Secundario: Ver carrito completo */}
              <button
                type="button"
                onClick={handleGoToCart}
                className="w-full h-9 px-4 rounded-[5px] text-xs font-medium text-[#1E293B] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors flex items-center justify-center shadow-2xs cursor-pointer"
              >
                Ver carrito
              </button>
            </div>

            {/* Aviso de seguridad */}
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[#64748B] pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Compra protegida y segura</span>
            </div>
          </div>
        )}
      </aside>

      {/* ── Modal de Confirmación para Eliminar Producto ────────────── */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto del carrito?"
        description={
          itemToDelete ? (
            <span>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-[#111827]">"{itemToDelete.name}"</strong>{" "}
              de tu carrito de compras?
            </span>
          ) : (
            ""
          )
        }
        confirmText="Eliminar producto"
        cancelText="Conservar"
        variant="danger"
      />
    </>
  );
}

export default CartDrawer;
