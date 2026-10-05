import * as React from "react";
import {
  Settings,
  Store,
  CreditCard,
  Bell,
  Shield,
  Check,
  Building2,
  Lock,
  Save,
  User,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import StatusDot from "./StatusDot";

export default function StoreSettings() {
  const [activeTab, setActiveTab] = React.useState<"general" | "pagos" | "notificaciones" | "seguridad">("general");

  // Toast
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
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
          <span>Tienda</span>
          <span>/</span>
          <span className="text-[#2563EB] font-medium">Configuración</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
          Configuración de la Cuenta
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Administra la información de tu negocio, datos de cobro, notificaciones
          y credenciales de acceso.
        </p>
      </div>

      {/* ── Tabs de Navegación ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E7EB] pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: "general", label: "Información General", icon: Store },
          { id: "pagos", label: "Cuentas y Métodos de Cobro", icon: CreditCard },
          { id: "notificaciones", label: "Notificaciones", icon: Bell },
          { id: "seguridad", label: "Seguridad y Acceso", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-[6px] transition-colors shrink-0",
                isActive
                  ? "bg-[#EFF6FF] text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#111827] hover:bg-[#F8FAFC]",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Contenido según Tab ─────────────────────────────────────── */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs p-5 sm:p-6">
        {activeTab === "general" && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h2 className="text-sm font-bold text-[#111827] border-b border-[#F1F5F9] pb-2">
              Datos Legales y Comerciales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  Nombre de la Tienda
                </label>
                <input
                  type="text"
                  defaultValue="Creative Print Store"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  NIT o Identificación Fiscal
                </label>
                <input
                  type="text"
                  defaultValue="901.482.119-4"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  Correo de Notificaciones
                </label>
                <input
                  type="email"
                  defaultValue="contacto@creativeprint.com"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  Teléfono / WhatsApp de Atención
                </label>
                <input
                  type="tel"
                  defaultValue="+57 312 456 7890"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#111827] mb-1">
                Dirección del Taller / Sede Física
              </label>
              <input
                type="text"
                defaultValue="Carrera 15 # 85-30, Piso 3, Bogotá D.C., Colombia"
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => showToast("Datos de la tienda actualizados")}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-[6px] shadow-sm transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {activeTab === "pagos" && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h2 className="text-sm font-bold text-[#111827] border-b border-[#F1F5F9] pb-2">
              Cuenta para Recepción de Pagos y Retiros
            </h2>

            <div className="p-4 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-sm">
                    Bancolombia — Cuenta de Ahorros
                  </p>
                  <p className="text-[#64748B] font-mono">•••• 4821 • Activa</p>
                </div>
              </div>
              <StatusDot status="Principal" />
            </div>

            <button
              type="button"
              onClick={() => showToast("Formulario para vincular cuenta abierto")}
              className="text-xs font-bold text-[#2563EB] hover:underline block"
            >
              + Agregar otra cuenta o billetera (Nequi / Daviplata)
            </button>
          </div>
        )}

        {activeTab === "notificaciones" && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h2 className="text-sm font-bold text-[#111827] border-b border-[#F1F5F9] pb-2">
              Preferencias de Correo y Alertas
            </h2>

            <div className="space-y-3">
              {[
                { label: "Notificarme cuando haya un pedido nuevo", defaultChecked: true },
                { label: "Alertas de bajo inventario", defaultChecked: true },
                { label: "Resumen semanal de ventas y métricas", defaultChecked: true },
                { label: "Nuevas plantillas y recursos de diseño", defaultChecked: false },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="w-4 h-4 accent-[#2563EB] rounded"
                  />
                  <span className="font-medium text-[#111827]">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === "seguridad" && (
          <div className="space-y-4 max-w-2xl text-xs">
            <h2 className="text-sm font-bold text-[#111827] border-b border-[#F1F5F9] pb-2">
              Seguridad de la Cuenta
            </h2>

            <div className="space-y-3 max-w-md">
              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111827] mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px]"
                />
              </div>

              <button
                type="button"
                onClick={() => showToast("Contraseña actualizada con éxito")}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-[6px] shadow-sm transition-all mt-2"
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
