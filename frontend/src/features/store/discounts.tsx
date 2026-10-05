import * as React from "react";
import {
  Tag,
  Plus,
  Search,
  Check,
  Calendar,
  Percent,
  Copy,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";

export interface DiscountCoupon {
  id: string;
  code: string;
  type: "Porcentaje" | "Monto fijo" | "Envío gratis";
  value: string;
  appliedTo: string;
  startDate: string;
  endDate: string;
  status: "Activo" | "Programado" | "Finalizado";
  usesCount: number;
}

const mockDiscounts: DiscountCoupon[] = [
  {
    id: "disc-1",
    code: "STREETWEAR20",
    type: "Porcentaje",
    value: "20% OFF",
    appliedTo: "Camisetas y Hoodies",
    startDate: "01 May, 2026",
    endDate: "31 May, 2026",
    status: "Activo",
    usesCount: 84,
  },
  {
    id: "disc-2",
    code: "BIENVENIDO10",
    type: "Porcentaje",
    value: "10% OFF",
    appliedTo: "Toda la tienda",
    startDate: "01 Ene, 2026",
    endDate: "31 Dic, 2026",
    status: "Activo",
    usesCount: 142,
  },
  {
    id: "disc-3",
    code: "ENVIOGRATISMAY",
    type: "Envío gratis",
    value: "100% Envío",
    appliedTo: "Compras superiores a $100.000",
    startDate: "10 May, 2026",
    endDate: "20 May, 2026",
    status: "Programado",
    usesCount: 0,
  },
  {
    id: "disc-4",
    code: "FLASH15K",
    type: "Monto fijo",
    value: "$ 15.000 OFF",
    appliedTo: "Tazas y Accesorios",
    startDate: "15 Abr, 2026",
    endDate: "30 Abr, 2026",
    status: "Finalizado",
    usesCount: 65,
  },
];

export default function StoreDiscounts() {
  const [discounts, setDiscounts] =
    React.useState<DiscountCoupon[]>(mockDiscounts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Form
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<DiscountCoupon["type"]>("Porcentaje");
  const [value, setValue] = React.useState("15");
  const [appliedTo, setAppliedTo] = React.useState("Toda la tienda");

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: DiscountCoupon = {
      id: `disc-${Date.now()}`,
      code: code.toUpperCase().trim(),
      type,
      value: type === "Porcentaje" ? `${value}% OFF` : `$ ${value} OFF`,
      appliedTo,
      startDate: "Hoy",
      endDate: "30 días",
      status: "Activo",
      usesCount: 0,
    };

    setDiscounts([newCoupon, ...discounts]);
    setIsModalOpen(false);
    setCode("");
    showToast(`Cupón ${newCoupon.code} activado`);
  };

  const stats = React.useMemo(() => {
    return {
      activos: discounts.filter((d) => d.status === "Activo").length,
      programados: discounts.filter((d) => d.status === "Programado").length,
      finalizados: discounts.filter((d) => d.status === "Finalizado").length,
      totalUsos: discounts.reduce((acc, d) => acc + d.usesCount, 0),
    };
  }, [discounts]);

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
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Descuentos</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Descuentos y Promociones
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Crea cupones promocionales, descuentos por porcentaje y beneficios
            de envío para impulsar tus ventas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Descuento</span>
        </button>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B}]">
            Descuentos Activos
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.activos}
          </p>
        </div>
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Programados
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.programados}
          </p>
        </div>
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">
            Finalizados
          </span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.finalizados}
          </p>
        </div>
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <span className="text-xs font-medium text-[#64748B]">Total Usos</span>
          <p className="text-2xl font-black text-[#111827] mt-1">
            {stats.totalUsos}
          </p>
        </div>
      </div>

      {/* ── Tabla de Cupones ───────────────────────────────────────── */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Beneficio</th>
              <th className="py-3 px-4">Aplica A</th>
              <th className="py-3 px-4">Usos</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {discounts.map((d) => (
              <tr key={d.id} className="hover:bg-[#F8FAFC]">
                <td className="py-3.5 px-4 font-black font-mono text-[#111827]">
                  {d.code}
                </td>
                <td className="py-3.5 px-4 text-[#64748B]">{d.type}</td>
                <td className="py-3.5 px-4 font-bold text-[#111827]">
                  {d.value}
                </td>
                <td className="py-3.5 px-4 text-[#475569]">{d.appliedTo}</td>
                <td className="py-3.5 px-4 font-bold text-[#111827]">
                  {d.usesCount}
                </td>
                <td className="py-3.5 px-4">
                  <StatusDot status={d.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => showToast(`Código ${d.code} copiado`)}
                    className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] rounded transition-colors"
                    title="Copiar código"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: CREAR CUPÓN ─────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <h2 className="text-base font-bold text-[#111827]">
                Crear Cupón de Descuento
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  Código del Cupón
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: VERANO2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] uppercase font-mono font-bold focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#111827] mb-1">
                    Tipo
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as DiscountCoupon["type"])
                    }
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
                  >
                    <option value="Porcentaje">Porcentaje (%)</option>
                    <option value="Monto fijo">Monto fijo ($)</option>
                    <option value="Envío gratis">Envío gratis</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#111827] mb-1">
                    Valor
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-[6px]"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
