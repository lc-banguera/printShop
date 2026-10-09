import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Container } from "@/shared/components/Container/Container";
import { useCartStore, formatCurrency } from "./cart-store";
import {
  MercadoPagoOfficialLogo,
  WompiOfficialLogo,
  PSEOfficialLogo,
} from "./components/PaymentLogos";
import { initializePayment } from "./services/payment-gateway";

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    getSubtotal,
    getDiscountAmount,
    getShippingAmount,
    getTotal,
    getTotalItemsCount,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "wompi" | "pse">(
    "mercadopago",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingAmount();
  const total = getTotal();
  const totalItemsCount = getTotalItemsCount();

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const result = await initializePayment({
      gateway: paymentMethod,
      items,
      subtotal,
      discount,
      shipping,
      total,
      customer: {
        fullName: "Carlos Gómez",
        email: "carlos.gomez@ejemplo.com",
        address: "Calle 100 # 15-20, Apto 402",
        city: "Bogotá D.C.",
        phone: "300 987 6543",
      },
    });

    setIsProcessing(false);
    if (result.success) {
      setIsFinished(true);
    }
  };

  return (
    <div className="min-h-screen flex min-w-0 flex-col bg-background">
      {/* ── Header de Checkout Limpio y Minimalista ─────────────────── */}
      <header className="sticky top-0 z-30 select-none border-b border-border bg-surface py-3.5 shadow-subtle">
        <Container variant="wide" className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Volver a PrintShop"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary text-sm font-black text-primaryForeground shadow-subtle">
              P
            </span>
            <span className="text-xl font-black tracking-tight text-foreground">
              Print<span className="text-primary">Shop</span>
            </span>
          </Link>
        </Container>
      </header>

      {/* ── Contenido de Checkout ────────────────────────────────────── */}
      <main className="min-w-0 flex-1 py-8 sm:py-10">
        <Container variant="wide">
          <div className="mb-7">
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Volver al carrito</span>
            </Link>
          </div>

          {isFinished ? (
            <div className="mx-auto max-w-lg space-y-4 rounded-card border border-border bg-surface p-8 text-center shadow-card animate-in fade-in duration-200 sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-success bg-surfaceMuted text-success">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                Demostración de flujo completada
              </h1>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                La experiencia visual del checkout está lista. En la siguiente
                fase conectaremos la creación de órdenes con{" "}
                <strong className="text-[var(--text-primary)]">Supabase</strong> y el
                procesamiento de pagos con{" "}
                <strong className="text-[var(--text-primary)]">Mercado Pago</strong>.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  to="/cart"
                  className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-[var(--text-primary)] bg-white border border-[var(--border)] hover:bg-[var(--surface-muted)] rounded-[5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Regresar al carrito
                </Link>
                <Link
                  to="/"
                  className="w-full rounded-control bg-primary px-5 py-2 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
                >
                  Ir al catálogo
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-12">
              {/* Formulario de Checkout (8 cols) */}
              <div className="min-w-0 space-y-6 lg:col-span-8">
                {/* Paso 1: Datos de Entrega */}
                <div className="space-y-5 rounded-card border border-border bg-surface p-5 shadow-card sm:p-7">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primaryForeground">
                      1
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      Dirección de envío
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre y apellido"
                        defaultValue="Carlos Gómez"
                        className="h-10 w-full rounded-control border border-borderStrong px-3 text-sm text-foreground shadow-subtle outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        defaultValue="carlos.gomez@email.com"
                        className="h-10 w-full rounded-control border border-borderStrong px-3 text-sm text-foreground shadow-subtle outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                        Dirección de entrega *
                      </label>
                      <input
                        type="text"
                        placeholder="Calle, carrera, número, apartamento"
                        defaultValue="Carrera 43A # 18 Sur - 125, Apto 802"
                        className="h-10 w-full rounded-control border border-borderStrong px-3 text-sm text-foreground shadow-subtle outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        placeholder="Ciudad"
                        defaultValue="Medellín"
                        className="h-10 w-full rounded-control border border-borderStrong px-3 text-sm text-foreground shadow-subtle outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[var(--text-secondary)] font-semibold mb-1">
                        Teléfono de contacto *
                      </label>
                      <input
                        type="tel"
                        placeholder="300 123 4567"
                        defaultValue="300 987 6543"
                        className="h-10 w-full rounded-control border border-borderStrong px-3 text-sm text-foreground shadow-subtle outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Paso 2: Método de Pago (Mercado Pago) */}
                <div className="space-y-5 rounded-card border border-border bg-surface p-5 shadow-card sm:p-7">
                  <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primaryForeground">
                      2
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      Método de pago
                    </h2>
                  </div>

                  {/* Opciones de Métodos de Pago */}
                  <div className="space-y-3">
                    {/* Opción 1: Mercado Pago con Logo Oficial */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-[5px] border cursor-pointer transition-all ${
                        paymentMethod === "mercadopago"
                          ? "border-primary bg-infoMuted"
                          : "border-border hover:bg-surfaceMuted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "mercadopago"}
                        onChange={() => setPaymentMethod("mercadopago")}
                        className="mt-1.5 h-4 w-4 accent-primary text-primary focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <MercadoPagoOfficialLogo className="h-6 sm:h-7 w-auto shrink-0" />
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                                Mercado Pago
                              </span>
                              <span className="text-[11px] text-[var(--text-secondary)] block sm:inline sm:ml-2">
                                Tarjetas · PSE · Nequi · Efectivo
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-badge bg-primary px-2 py-0.5 text-[10px] font-semibold text-primaryForeground">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                          Pago con total seguridad mediante la plataforma oficial de Mercado Pago en Colombia.
                        </p>
                      </div>
                    </label>

                    {/* Opción 2: Wompi Oficial (by Bancolombia) */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-[5px] border cursor-pointer transition-all ${
                        paymentMethod === "wompi"
                          ? "border-primary bg-infoMuted"
                          : "border-border hover:bg-surfaceMuted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "wompi"}
                        onChange={() => setPaymentMethod("wompi")}
                        className="mt-1.5 h-4 w-4 accent-primary text-primary focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <WompiOfficialLogo className="h-8 w-auto shrink-0" />
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              Wompi
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block sm:inline sm:ml-2">
                              Tarjetas · Bancolombia · Nequi · PSE
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                          Paga en línea con débito a tu cuenta Bancolombia, Nequi, PSE o tarjetas de crédito.
                        </p>
                      </div>
                    </label>

                    {/* Opción 3: PSE Oficial (Pagos Seguros en Línea) */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-[5px] border cursor-pointer transition-all ${
                        paymentMethod === "pse"
                          ? "border-primary bg-infoMuted"
                          : "border-border hover:bg-surfaceMuted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "pse"}
                        onChange={() => setPaymentMethod("pse")}
                        className="mt-1.5 h-4 w-4 accent-primary text-primary focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <PSEOfficialLogo className="h-8 w-auto shrink-0" />
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                              Transferencia bancaria (PSE)
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)] block sm:inline sm:ml-2">
                              Débito desde cuenta de ahorros o corriente
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                          Pago inmediato y seguro a través de PSE ACH Colombia con cualquier banco del país.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Resumen Lateral en Checkout (4 cols) */}
              <div className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:col-span-4">
                <div className="space-y-5 rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
                  <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] pb-3 border-b border-[var(--border-muted)]">
                    Resumen del pedido ({totalItemsCount}{" "}
                    {totalItemsCount === 1 ? "artículo" : "artículos"})
                  </h2>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]"
                      >
                        <div className="h-10 w-10 rounded-[4px] bg-[var(--surface-muted)] border border-[var(--border)] p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            Cant: {item.quantity}
                            {item.itemType === "design" ? (
                              <span className="ml-1 font-semibold text-primary">
                                · Diseño
                              </span>
                            ) : (
                              <>
                                {item.color && (
                                  <span className="ml-1 inline-flex items-center gap-1">
                                    ·
                                    <span
                                      className="inline-block h-2 w-2 rounded-full border border-[var(--border-strong)]"
                                      style={{ backgroundColor: item.color }}
                                    />
                                  </span>
                                )}
                                {item.size && <span> · Talla: {item.size}</span>}
                              </>
                            )}
                          </p>
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className="pt-3 border-t border-[var(--border-muted)] space-y-2 text-xs">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Descuento</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Envío</span>
                      <span>
                        {shipping === 0 ? "Gratis" : formatCurrency(shipping)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline font-bold text-[var(--text-primary)]">
                      <span className="text-sm">Total a pagar</span>
                      <span className="text-base font-black">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* Botón Pagar */}
                  <form onSubmit={handleSimulatePayment} className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing || items.length === 0}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primaryForeground shadow-subtle transition-colors hover:bg-primaryHover active:bg-primaryActive disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Conectando con pasarela...</span>
                        </>
                      ) : (
                        <span>Completar pedido</span>
                      )}
                    </button>
                  </form>

                  <div className="flex items-center justify-center gap-1.5 text-[10.5px] text-[var(--text-secondary)] pt-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    <span>Transacción cifrada y protegida</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>

      <footer className="border-t border-border bg-surface py-4 text-center text-xs text-foregroundSubtle">
        <p>© 2026 PrintShop. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default CheckoutPage;
