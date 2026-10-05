import * as React from "react";
import { CreditCard, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { StoreOrderFull } from "./types";
import { getBalanceDaysRemaining, isBalancePaymentExpired } from "./orderActions";
import StatusDot from "../StatusDot";

interface PaymentSummaryPanelProps {
  order: StoreOrderFull;
}

export const PaymentSummaryPanel: React.FC<PaymentSummaryPanelProps> = ({ order }) => {
  const plan = order.paymentPlan;
  const isDepositPlan = plan?.paymentMode === "DEPOSIT_PLUS_BALANCE";

  const totalAmount = plan?.totalAmount ?? order.total;
  const amountPaid = plan?.amountPaid ?? (order.paymentStatus === "PAID" ? order.total : 0);
  const balanceAmount = plan?.balanceAmount ?? (totalAmount - amountPaid);
  const depositPercentage = plan?.depositPercentage ?? 100;
  const depositAmount = plan?.depositAmount ?? totalAmount;

  // Cálculo dinámico de días restantes a partir de balanceDeadlineAt
  const daysRemaining = getBalanceDaysRemaining(order);
  const isExpired = isBalancePaymentExpired(order);

  // Estado amigable del saldo
  const balanceStatus =
    plan?.balancePaymentStatus || order.balancePaymentStatus || "NO_BALANCE";

  const isDispatchBlockedByBalance =
    order.productionStatus === "READY" &&
    (balanceStatus === "BALANCE_PENDING" || balanceStatus === "BALANCE_EXPIRED" || isExpired);

  // Formateo de fecha límite de pago
  const formattedDeadline = React.useMemo(() => {
    if (!plan?.balanceDeadlineAt) return null;
    try {
      const d = new Date(plan.balanceDeadlineAt);
      return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return plan.balanceDeadlineAt;
    }
  }, [plan?.balanceDeadlineAt]);

  return (
    <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-[4px] shadow-2xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-[#64748B]" />
          <span>Estructura Financiera y Pagos</span>
        </h3>
        <span className="text-[11px] font-medium text-[#64748B]">
          Modalidad:{" "}
          <strong className="text-[#111827]">
            {isDepositPlan ? "Anticipo + Saldo Contra Entrega" : "Pago Completo 100%"}
          </strong>
        </span>
      </div>

      {/* Grid de Totales Financieros distribuidos horizontalmente */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-[#64748B] block font-medium">Total Pedido</span>
          <p className="text-sm font-bold text-[#111827] mt-0.5">
            $ {totalAmount.toLocaleString("es-CO")}
          </p>
        </div>

        {isDepositPlan && (
          <div>
            <span className="text-[10px] text-[#64748B] block font-medium">
              Anticipo Requerido ({depositPercentage}%)
            </span>
            <p className="text-xs font-bold text-[#111827] mt-0.5">
              $ {depositAmount.toLocaleString("es-CO")}
            </p>
          </div>
        )}

        <div>
          <span className="text-[10px] text-[#64748B] block font-medium">Acreditado / Pagado</span>
          <p className="text-xs font-bold text-[#111827] mt-0.5">
            $ {amountPaid.toLocaleString("es-CO")}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-[#64748B] block font-medium">Saldo Pendiente</span>
          <p className="text-xs font-bold text-[#111827] mt-0.5">
            $ {balanceAmount.toLocaleString("es-CO")}
          </p>
        </div>
      </div>

      {/* Fila inferior: Canal y Estado con separación visual sutil */}
      <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
        <div>
          <span>Canal de pago: </span>
          <span className="font-semibold text-[#111827]">{order.paymentMethod}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Estado del pago: </span>
          <span className="font-semibold text-[#111827]">
            {order.paymentStatus === "PAID"
              ? "Acreditado 100%"
              : order.paymentStatus === "PARTIAL"
              ? `Anticipo recibido ($ ${amountPaid.toLocaleString("es-CO")})`
              : order.paymentStatus === "PENDING"
              ? "Pendiente de acreditación"
              : "Reembolsado / Fallido"}
          </span>
        </div>
      </div>

      {/* Control de saldo (si aplica) sin tarjetas anidadas */}
      {(balanceAmount > 0 || balanceStatus !== "NO_BALANCE") && (
        <div className="pt-2.5 border-t border-[#F1F5F9] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Control de Saldo
            </span>
            <StatusDot
              status={
                balanceStatus === "BALANCE_PAID"
                  ? "Pagado"
                  : isExpired || balanceStatus === "BALANCE_EXPIRED"
                  ? "Pago vencido"
                  : "Pago pendiente"
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] block font-medium">
                Saldo a Liquidar
              </span>
              <p className="text-xs font-bold text-[#111827] mt-0.5">
                $ {balanceAmount.toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-[#64748B] block font-medium">
                Plazo de pago establecido por PrintShop
              </span>
              <p className="text-xs font-medium text-[#111827] mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                <span>
                  {balanceStatus === "BALANCE_PAID"
                    ? "Saldo liquidado dentro del plazo de PrintShop"
                    : isExpired || balanceStatus === "BALANCE_EXPIRED"
                    ? "Pago vencido"
                    : daysRemaining === 1
                    ? "1 día restante"
                    : `${daysRemaining} días restantes`}
                </span>
              </p>
            </div>
          </div>

          {/* Fecha Límite y Recordatorio Automático */}
          {formattedDeadline && (
            <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="text-[#64748B]">
                <span>Fecha límite de pago: </span>
                <strong className="text-[#111827]">{formattedDeadline}</strong>
              </div>
              <div className="flex items-center gap-1 text-[#2563EB]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                <span className="font-medium">Recordatorio de pago automático</span>
              </div>
            </div>
          )}

          {/* Bloqueo Operativo de Despacho */}
          {isDispatchBlockedByBalance && (
            <div className="mt-2 p-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-[4px] text-[11px] text-[#92400E] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Despacho Logístico Bloqueado</p>
                <p className="text-[#78350F] mt-0.5">
                  {isExpired || balanceStatus === "BALANCE_EXPIRED"
                    ? "El plazo establecido por PrintShop para completar el saldo ha vencido (Pago vencido). La prenda permanece en custodia."
                    : "El pedido tiene un saldo pendiente por pagar. La transportadora no podrá recibir el paquete hasta liquidar el 100%."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
