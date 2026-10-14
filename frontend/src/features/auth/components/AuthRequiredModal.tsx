import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart } from "lucide-react";
import { useAuthStore } from "../auth-store";
import { formatCurrency } from "@/features/cart/cart-store";

export function AuthRequiredModal() {
  const navigate = useNavigate();
  const { isAuthModalOpen, closeAuthModal, pendingCartItem } = useAuthStore();

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleGoToFullLogin = () => {
    closeAuthModal();
    navigate("/login");
  };

  const handleGoToRegister = () => {
    closeAuthModal();
    navigate("/register");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-[440px] bg-white rounded-[5px] border border-[var(--border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Encabezado del Modal con Logo PrintShop ───────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-muted)] bg-[var(--surface-muted)]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-[var(--primary)] text-xs font-black text-white shadow-2xs">
              P
            </span>
            <span className="text-base font-black tracking-tight text-[var(--text-primary)]">
              Print<span className="text-[var(--primary)]">Shop</span>
            </span>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="h-7 w-7 rounded-[5px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-strong)] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* ── Vista previa del producto pendiente que se quiere agregar */}
          {pendingCartItem && (
            <div className="flex items-center gap-3 p-2.5 rounded-[5px] bg-[var(--surface-muted)] border border-[var(--border)]">
              <div className="h-12 w-12 rounded-[4px] bg-white border border-[var(--border)] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={pendingCartItem.image}
                  alt={pendingCartItem.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--primary)]">
                  <ShoppingCart className="h-3 w-3" />
                  <span>Producto seleccionado:</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                  {pendingCartItem.name}
                </h4>
                <div className="text-[11px] font-bold text-[var(--text-primary)] mt-0.5">
                  {formatCurrency(pendingCartItem.price)}
                </div>
              </div>
            </div>
          )}

          {/* ── Mensaje Principal de Autenticación ───────────────────── */}
          <div className="text-center space-y-1.5 pt-1">
            <h3
              id="auth-modal-title"
              className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight"
            >
              ¡Hola!, para agregar productos al carrito debes iniciar sesión
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
              Accede a tu cuenta de PrintShop para personalizar tus productos y
              continuar con tu pedido de manera segura.
            </p>
          </div>

          {/* ── Botones de Decisión (Ingresar / Crear cuenta) ─────────── */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleGoToFullLogin}
              className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span>Ingresar</span>
            </button>

            <button
              type="button"
              onClick={handleGoToRegister}
              className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-medium text-[var(--text-primary)] bg-white border border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] transition-colors flex items-center justify-center shadow-2xs cursor-pointer"
            >
              Crear cuenta
            </button>

            <div className="pt-2 text-center">
              <span className="text-[12px] text-[var(--text-muted)]">
                En PrintShop cuidamos tu privacidad y seguridad.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
