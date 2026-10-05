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
        className="w-full max-w-[440px] bg-white rounded-[5px] border border-[#E5E7EB] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Encabezado del Modal con Logo PrintShop ───────────────── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F1F5F9] bg-[#FAFBFD]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] bg-[#2563EB] text-xs font-black text-white shadow-2xs">
              P
            </span>
            <span className="text-base font-black tracking-tight text-[#111827]">
              Print<span className="text-[#2563EB]">Shop</span>
            </span>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="h-7 w-7 rounded-[5px] flex items-center justify-center text-[#94A3B8] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* ── Vista previa del producto pendiente que se quiere agregar */}
          {pendingCartItem && (
            <div className="flex items-center gap-3 p-2.5 rounded-[5px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="h-12 w-12 rounded-[4px] bg-white border border-[#E5E7EB] p-1 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={pendingCartItem.image}
                  alt={pendingCartItem.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#2563EB]">
                  <ShoppingCart className="h-3 w-3" />
                  <span>Producto seleccionado:</span>
                </div>
                <h4 className="text-xs font-bold text-[#111827] truncate">
                  {pendingCartItem.name}
                </h4>
                <div className="text-[11px] font-bold text-[#111827] mt-0.5">
                  {formatCurrency(pendingCartItem.price)}
                </div>
              </div>
            </div>
          )}

          {/* ── Mensaje Principal de Autenticación ───────────────────── */}
          <div className="text-center space-y-1.5 pt-1">
            <h3
              id="auth-modal-title"
              className="text-base sm:text-lg font-bold text-[#111827] leading-tight"
            >
              ¡Hola!, para agregar productos al carrito debes iniciar sesión
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
              Accede a tu cuenta de PrintShop para personalizar tus productos y
              continuar con tu pedido de manera segura.
            </p>
          </div>

          {/* ── Botones de Decisión (Ingresar / Crear cuenta) ─────────── */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleGoToFullLogin}
              className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span>Ingresar</span>
            </button>

            <button
              type="button"
              onClick={handleGoToRegister}
              className="w-full h-10 px-4 rounded-[5px] text-xs sm:text-[13px] font-medium text-[#1E293B] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-colors flex items-center justify-center shadow-2xs cursor-pointer"
            >
              Crear cuenta
            </button>

            <div className="pt-2 text-center">
              <span className="text-[12px] text-[#64748B]">
                En PrintShop cuidamos tu privacidad y seguridad.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

