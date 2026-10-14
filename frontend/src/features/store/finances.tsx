import * as React from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Plus,
  Check,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";

export interface Transaction {
  id: string;
  concept: string;
  type: "Ingreso" | "Comisión" | "Retiro";
  amount: number;
  date: string;
  status: "Completado" | "En proceso";
  reference: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    concept: "Venta Pedido #ORD-9876",
    type: "Ingreso",
    amount: 89900,
    date: "Hoy, 10:42 AM",
    status: "Completado",
    reference: "MP-9941029",
  },
  {
    id: "tx-2",
    concept: "Comisión de plataforma (8%) - #ORD-9876",
    type: "Comisión",
    amount: -7192,
    date: "Hoy, 10:42 AM",
    status: "Completado",
    reference: "COM-9876",
  },
  {
    id: "tx-3",
    concept: "Venta Pedido #ORD-9875",
    type: "Ingreso",
    amount: 129000,
    date: "Hoy, 08:15 AM",
    status: "Completado",
    reference: "BAN-110294",
  },
  {
    id: "tx-4",
    concept: "Comisión de plataforma (8%) - #ORD-9875",
    type: "Comisión",
    amount: -10320,
    date: "Hoy, 08:15 AM",
    status: "Completado",
    reference: "COM-9875",
  },
  {
    id: "tx-5",
    concept: "Retiro a Cuenta Bancaria (Bancolombia)",
    type: "Retiro",
    amount: -4500000,
    date: "02 May, 2026",
    status: "Completado",
    reference: "ACH-889102",
  },
  {
    id: "tx-6",
    concept: "Venta Pedido #ORD-9873",
    type: "Ingreso",
    amount: 165000,
    date: "04 May, 2026",
    status: "Completado",
    reference: "PSE-339182",
  },
];

export default function StoreFinances() {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-xs font-semibold rounded-lg shadow-xl animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
            Balance y Finanzas
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Monitorea los ingresos de tu tienda, comisiones, pagos recibidos y
            solicita retiros a tu cuenta bancaria.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => showToast("Solicitud de retiro enviada a revisión")}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>Solicitar Retiro</span>
          </button>
        </div>
      </div>

      {/* ── Tarjetas de Saldos y Comisiones ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Saldo Disponible */}
        <div className="p-5 rounded-[8px] bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-blue-100">
              Saldo Disponible
            </span>
            <p className="text-3xl font-black mt-1">$ 6.840.000</p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
            <span>Bancolombia •••• 4821</span>
            <span className="font-semibold text-white">Listo para retirar</span>
          </div>
        </div>

        {/* Ventas Brutas */}
        <div className="p-5 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#64748B]">
              Ventas Brutas Acumuladas
            </span>
            <p className="text-2xl font-black text-[#111827] mt-1">
              $ 24.680.000
            </p>
          </div>
          <p className="text-[11px] text-[#16A34A] font-semibold mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            356 pedidos completados
          </p>
        </div>

        {/* Comisiones de Plataforma */}
        <div className="p-5 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#64748B]">
              Comisiones de Plataforma (8%)
            </span>
            <p className="text-2xl font-black text-[#64748B] mt-1">
              $ 1.974.400
            </p>
          </div>
          <p className="text-[11px] text-[#64748B] mt-3">
            Incluye costos de pasarela y soporte
          </p>
        </div>

        {/* Ganancias Netas */}
        <div className="p-5 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium text-[#64748B]">
              Ganancia Neta Vendedor
            </span>
            <p className="text-2xl font-black text-[#111827] mt-1">
              $ 22.705.600
            </p>
          </div>
          <p className="text-[11px] text-[#64748B] font-medium mt-3">
            Margen de ganancia saludable
          </p>
        </div>
      </div>

      {/* ── Historial de Movimientos ───────────────────────────────── */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Historial de Transacciones
            </h2>
            <p className="text-xs text-[#64748B]">
              Registro detallado de ingresos por ventas, retiros y deducciones.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#334155] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] px-3 py-1.5 rounded-[6px] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Descargar extracto</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Referencia</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    {tx.concept}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                    {tx.reference}
                  </td>
                  <td className="py-3.5 px-4 text-[#475569] font-medium">
                    {tx.type}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">{tx.date}</td>
                  <td className="py-3.5 px-4 font-bold font-mono text-[#111827]">
                    {tx.amount > 0 ? "+" : ""}${" "}
                    {Math.abs(tx.amount).toLocaleString("es-CO")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusDot status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
