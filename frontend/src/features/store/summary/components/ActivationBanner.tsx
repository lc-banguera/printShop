import * as React from "react";
import { ShieldCheck, Lock } from "lucide-react";

interface MissionStep {
  key: string;
  label: string;
  active: boolean;
  badge?: string;
}

const missionSteps: MissionStep[] = [
  { key: "account", label: "Cuenta activa", active: true, badge: "1/2" },
  { key: "ready", label: "Listo para vender", active: false },
  { key: "launch", label: "Despegue", active: false },
  { key: "first-sale", label: "Primera venta", active: false },
  { key: "reputation", label: "Reputación", active: false },
];

export const ActivationBanner: React.FC = () => {
  return (
    <div className="bg-[#F0F5FA] border border-[#E2EEF9] rounded-2xl p-6 lg:px-8 lg:py-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs">
      {/* Left side text */}
      <div className="max-w-[480px]">
        <h2 className="text-[17px] font-bold text-[#1E293B] leading-snug">
          ¡Es hora de completar tu primera misión como vendedor!
        </h2>
        <p className="text-[13.5px] text-[#64748B] mt-1.5 leading-relaxed">
          Para hacerlo, activa tu cuenta. Esto te permitirá publicar tus productos.
        </p>
        <button
          type="button"
          className="text-[13px] font-medium text-[#2563EB] hover:underline mt-2 inline-block cursor-pointer bg-transparent border-0 p-0 text-left"
        >
          Cómo funcionan las misiones
        </button>
      </div>

      {/* Right side steps */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap lg:flex-nowrap pt-2 lg:pt-0">
        {missionSteps.map((step) => (
          <div key={step.key} className="flex flex-col items-center text-center w-[72px] sm:w-[78px]">
            {step.active ? (
              <div className="relative flex items-center justify-center">
                <div className="w-[52px] h-[52px] rounded-full bg-white border-[2.5px] border-[#2563EB] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-[#2563EB]" strokeWidth={2.2} />
                </div>
                {step.badge && (
                  <span className="absolute -bottom-1.5 px-2 py-0.5 bg-[#2563EB] text-white text-[9.5px] font-bold rounded-full leading-none ring-2 ring-white shadow-xs">
                    {step.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-b from-[#ECEFF3] to-[#DCE1E7] border border-[#CBD3DC] flex items-center justify-center shadow-2xs">
                <Lock className="w-[18px] h-[18px] text-[#78889B]" strokeWidth={2.2} />
              </div>
            )}
            <span
              className={`text-[11.5px] mt-2.5 leading-tight ${
                step.active ? "font-medium text-[#334155]" : "text-[#64748B]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
