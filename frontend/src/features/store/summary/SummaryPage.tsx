import * as React from "react";
import { ActivationBanner } from "./components/ActivationBanner";
import { LockedFeatureCard } from "./components/LockedFeatureCard";
import { useAuthStore } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { Lock, LayoutGrid, Sparkles } from "lucide-react";

export default function SummaryPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = React.useState<"main" | "recommendations">(
    "main",
  );

  React.useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal();
    }
  }, [isAuthenticated, openAuthModal]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="mx-auto space-y-6">
        {/* Header Superior y Banner de Misiones Integrado */}
        <div className="flex flex-col gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
                Configuración de tu tienda
              </h1>

              <p className="text-[14px] text-[#64748B] mt-1">
                Monitorea el progreso de activación y desbloquea herramientas
                para escalar tus ventas.
              </p>
            </div>
          </div>

          <ActivationBanner />
        </div>

        {/* Tab Switcher y Controles de Navegación */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="inline-flex items-center p-1 bg-[#E2E8F0]/60 backdrop-blur-xs rounded-[5px] gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("main")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[5px] text-[13px] font-semibold transition-all ${
                activeTab === "main"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Resumen principal
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("recommendations")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[5px] text-[13px] font-medium transition-all ${
                activeTab === "recommendations"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#64748B]" />
              Recomendaciones
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-[16px] font-bold text-[#0F172A] px-1">
              Activación de cuenta
            </h2>

            {/* Card Principal de Identidad */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-b from-[#FAFBFD] via-[#F3F7FD] to-[#EDF4FF] border border-[#DCE8FA] rounded-xl p-5 space-y-4">
                <div className="w-[74px] h-[52px] relative flex items-center justify-start drop-shadow-sm">
                  <svg
                    width="74"
                    height="52"
                    viewBox="0 0 74 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="66"
                      height="44"
                      rx="6"
                      fill="#1D4ED8"
                    />

                    <rect
                      x="2"
                      y="3"
                      width="66"
                      height="44"
                      rx="6"
                      fill="#2563EB"
                    />

                    <rect
                      x="1"
                      y="2"
                      width="66"
                      height="44"
                      rx="6"
                      fill="url(#blueCardGrad)"
                    />

                    <rect
                      x="7"
                      y="8"
                      width="16"
                      height="18"
                      rx="3"
                      fill="#60A5FA"
                      fillOpacity="0.85"
                    />

                    <circle cx="15" cy="14" r="3.5" fill="#EFF6FF" />

                    <path
                      d="M9 24C9 21 11.5 20.5 15 20.5C18.5 20.5 21 21 21 24"
                      fill="#EFF6FF"
                    />

                    <rect
                      x="28"
                      y="10"
                      width="32"
                      height="3.5"
                      rx="1.75"
                      fill="#EFF6FF"
                    />

                    <rect
                      x="28"
                      y="17"
                      width="24"
                      height="3"
                      rx="1.5"
                      fill="#BFDBFE"
                    />

                    <rect
                      x="28"
                      y="23"
                      width="28"
                      height="3"
                      rx="1.5"
                      fill="#BFDBFE"
                    />

                    <defs>
                      <linearGradient
                        id="blueCardGrad"
                        x1="1"
                        y1="2"
                        x2="67"
                        y2="46"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#3B82F6" />
                        <stop offset="1" stopColor="#1E40AF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug">
                    Valida tu identidad para vender de manera segura
                  </h3>

                  <p className="text-[13px] text-[#64748B] leading-relaxed">
                    Completa todos los datos requeridos para verificar tu cuenta
                    y habilitar cobros.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/onboarding/identity")}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-[5px] transition-all shadow-sm active:scale-95"
                  >
                    Validar identidad
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Quiero ayuda
                  </button>
                </div>
              </div>
            </div>

            {/* Novedades */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#334155]">
                <Lock
                  className="w-4 h-4 text-[#94A3B8] shrink-0"
                  strokeWidth={2}
                />
                <span>Novedades</span>
              </div>

              <p className="text-[12.5px] text-[#64748B] mt-2 leading-relaxed">
                Completa tus primeros pasos de activación para desbloquear este
                acceso exclusivo.
              </p>
            </div>
          </div>

          {/* Right Column: Módulos del sistema */}
          <div className="lg:col-span-8 space-y-2">
            <h2 className="text-[16px] font-bold text-[#0F172A] px-1">
              Módulos del sistema
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LockedFeatureCard
                title="Pedidos"
                description="Administra y da seguimiento a los pedidos de tu tienda."
              />

              <LockedFeatureCard
                title="Productos"
                description="Gestiona tus productos, variantes y publicaciones."
              />

              <LockedFeatureCard
                title="Diseñador"
                description="Crea y edita diseños para personalizar tus productos."
              />

              <LockedFeatureCard
                title="Clientes"
                description="Consulta y administra la información de tus clientes."
              />

              <LockedFeatureCard
                title="Diseños"
                description="Organiza y gestiona los diseños de tu tienda."
              />

              <LockedFeatureCard
                title="Plantillas"
                description="Crea y administra plantillas reutilizables."
              />

              <LockedFeatureCard
                title="Descuentos"
                description="Configura promociones y descuentos para tus productos."
              />

              <LockedFeatureCard
                title="Marketing"
                description="Gestiona acciones para promocionar tu tienda."
              />

              <LockedFeatureCard
                title="Reportes"
                description="Consulta resultados y actividad de tu tienda."
              />

              <LockedFeatureCard
                title="Finanzas"
                description="Consulta movimientos e información financiera."
              />

              <LockedFeatureCard
                title="Envíos"
                description="Configura y administra los métodos de envío."
              />

              <LockedFeatureCard
                title="Tienda Online"
                description="Configura y administra tu tienda online."
              />

              <LockedFeatureCard
                title="Configuración"
                description="Administra las preferencias de tu tienda."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
