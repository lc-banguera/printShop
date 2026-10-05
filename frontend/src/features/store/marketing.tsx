import * as React from "react";
import {
  Megaphone,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Share2,
  Sparkles,
  Plus,
  Check,
  Calendar,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { StatusDot } from "./StatusDot";

export interface MarketingCampaign {
  id: string;
  name: string;
  channel:
    | "Instagram & TikTok"
    | "Email Marketing"
    | "Google Shopping"
    | "Promoción Web";
  reach: string;
  clicks: number;
  conversions: number;
  spend: string;
  revenue: string;
  status: "Activa" | "Pausada" | "Completada";
}

const mockCampaigns: MarketingCampaign[] = [
  {
    id: "camp-1",
    name: "Lanzamiento Colección Streetwear 2026",
    channel: "Instagram & TikTok",
    reach: "48.5K",
    clicks: 1840,
    conversions: 86,
    spend: "$ 150.000",
    revenue: "$ 4.850.000",
    status: "Activa",
  },
  {
    id: "camp-2",
    name: "Flash Sale Fin de Semana (20% OFF)",
    channel: "Email Marketing",
    reach: "2.4K",
    clicks: 620,
    conversions: 42,
    spend: "$ 0",
    revenue: "$ 2.120.000",
    status: "Activa",
  },
  {
    id: "camp-3",
    name: "Campaña Retargeting Carritos Abandonados",
    channel: "Promoción Web",
    reach: "1.2K",
    clicks: 340,
    conversions: 28,
    spend: "$ 45.000",
    revenue: "$ 1.390.000",
    status: "Activa",
  },
  {
    id: "camp-4",
    name: "Regreso a Clases Tazas & Bolsos",
    channel: "Google Shopping",
    reach: "15.2K",
    clicks: 780,
    conversions: 35,
    spend: "$ 90.000",
    revenue: "$ 1.840.000",
    status: "Completada",
  },
];

export default function StoreMarketing() {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Marketing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Marketing y Campañas
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Impulsa el tráfico hacia tu tienda, fideliza clientes y mide el
            retorno de tus promociones.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Campaña</span>
        </button>
      </div>

      {/* ── Métricas de Rendimiento General ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Alcance Total</span>
            <Eye className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-black text-[#111827] mt-2">67.3K</p>
          <span className="text-[11px] text-[#16A34A] font-semibold mt-1 inline-flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +24.5% este mes
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Clics a la Tienda</span>
            <MousePointerClick className="w-4 h-4 text-[#EC4899]" />
          </div>
          <p className="text-2xl font-black text-[#111827] mt-2">3.580</p>
          <span className="text-[11px] text-[#16A34A] font-semibold mt-1 inline-flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            +18.2% este mes
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Conversiones</span>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-2xl font-black text-[#111827] mt-2">191 ventas</p>
          <span className="text-[11px] text-[#16A34A] font-semibold mt-1 inline-flex items-center gap-0.5">
            5.3% tasa conv.
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-white border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] text-xs">
            <span>Ingresos por Pauta</span>
            <DollarSign className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <p className="text-2xl font-black text-[#111827] mt-2">$ 10.2M</p>
          <span className="text-[11px] text-[#64748B] font-medium mt-1 inline-flex items-center gap-0.5">
            ROAS 35.8x
          </span>
        </div>
      </div>

      {/* ── Tabla de Campañas ──────────────────────────────────────── */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111827]">
            Campañas Publicitarias y Promocionales
          </h2>
          <span className="text-xs text-[#64748B]">
            {mockCampaigns.length} campañas registradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-[#64748B] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Campaña</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Alcance</th>
                <th className="py-3 px-4">Clics</th>
                <th className="py-3 px-4">Ventas</th>
                <th className="py-3 px-4">Inversión</th>
                <th className="py-3 px-4">Retorno</th>
                <th className="py-3 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {mockCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#F8FAFC]">
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    {camp.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">{camp.channel}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#111827]">
                    {camp.reach}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">{camp.clicks}</td>
                  <td className="py-3.5 px-4 font-bold text-[#111827]">
                    {camp.conversions}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] font-mono">
                    {camp.spend}
                  </td>
                  <td className="py-3.5 px-4 font-black text-[#111827]">
                    {camp.revenue}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <StatusDot status={camp.status} />
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
