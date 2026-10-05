import * as React from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Eye,
  ExternalLink,
  Store,
  UploadCloud,
  Check,
  Palette,
  Image as ImageIcon,
  Edit2,
  Sliders,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import StatusDot from "./StatusDot";

export default function StoreOnline() {
  const [storeName, setStoreName] = React.useState("Creative Print Store");
  const [slogan, setSlogan] = React.useState("Moda urbana y personalización de alta calidad");
  const [subdomain, setSubdomain] = React.useState("creativeprint");
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
          <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
            <span>Tienda</span>
            <span>/</span>
            <span className="text-[#2563EB] font-medium">Tienda Online</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Mi Tienda Pública
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Configura el aspecto, dominio y vitrina comercial que verán tus
            compradores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 rounded-[6px] shadow-sm transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Tienda Pública</span>
          </a>
        </div>
      </div>

      {/* ── Vista Previa de la Tienda (Mini Mockup de Cabecera) ─────── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        {/* Banner */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#2563EB] relative p-6 flex flex-col justify-end text-white">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast("Selector de banner abierto")}
              className="flex items-center gap-1.5 text-xs font-semibold bg-black/50 hover:bg-black/70 backdrop-blur-xs text-white px-3 py-1.5 rounded-[6px] transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Cambiar Banner</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] border-2 border-white text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
              CP
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">{storeName}</h2>
              <p className="text-xs text-blue-100 max-w-md mt-0.5">{slogan}</p>
            </div>
          </div>
        </div>

        {/* URL y Estado */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[#64748B]">Enlace público:</span>
            <span className="font-mono font-bold text-[#111827]">
              https://{subdomain}.printshop.co
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(
                  `https://${subdomain}.printshop.co`,
                );
                showToast("Enlace de tu tienda copiado al portapapeles");
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Enlace</span>
            </button>
            <span className="text-[#CBD5E1]">|</span>
            <StatusDot status="Tienda Activa" />
          </div>
        </div>
      </div>

      {/* ── Opciones de Configuración Visual ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[8px] border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Store className="w-4 h-4 text-[#2563EB]" />
            <span>Datos Principales de la Tienda</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#111827] mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111827] mb-1">
                Eslogan / Descripción Breve
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#111827] mb-1">
                Subdominio PrintShop
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-l-[6px] font-mono text-xs"
                />
                <span className="bg-[#E2E8F0] text-[#64748B] px-3 py-2 border border-l-0 border-[#CBD5E1] rounded-r-[6px] font-mono text-xs">
                  .printshop.co
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast("Cambios guardados con éxito")}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-[6px] shadow-sm transition-all"
            >
              Guardar Información
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-[#E5E7EB] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#2563EB]" />
            <span>Colores e Identidad de Marca</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="block font-bold text-[#111827] mb-1">
                Color de Énfasis en Catálogo
              </span>
              <div className="flex items-center gap-2">
                {["#2563EB", "#111827", "#10B981", "#EC4899", "#F59E0B"].map(
                  (col) => (
                    <div
                      key={col}
                      style={{ backgroundColor: col }}
                      className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-xs hover:scale-110 transition-transform"
                    />
                  ),
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9]">
              <span className="block font-bold text-[#111827] mb-1">
                Productos Visibles en la Portada
              </span>
              <p className="text-[#64748B] text-[11px] mb-2">
                Tienes 48 productos activos publicados actualmente en tu catálogo
                online.
              </p>
              <Link
                to="/store/products"
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Gestionar productos visibles →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
