import React, { useState } from 'react';
import { Smartphone, QrCode, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface MobileVerificationCardProps {
  sessionId?: string;
  onSimulateComplete: () => void;
  onClose?: () => void;
}

export const MobileVerificationCard: React.FC<MobileVerificationCardProps> = ({
  sessionId = 'PS-VERIF-78291',
  onSimulateComplete,
  onClose,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      onSimulateComplete();
    }, 1800);
  };

  return (
    <div className="mt-6 bg-[#EFF6FF]/60 border border-[#BFDBFE] rounded-2xl p-5">
      <div className="flex items-center gap-2.5 text-[#2563EB] mb-3">
        <Smartphone className="w-5 h-5" />
        <h4 className="text-xs font-bold uppercase tracking-wider">
          Continuar desde tu celular
        </h4>
      </div>

      <p className="text-xs text-gray-600 mb-4 leading-relaxed">
        Escanea este código con la cámara de tu celular para fotografiar tu documento y realizar la selfie con tu cámara móvil en alta resolución.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-[#DBEAFE] shadow-2xs">
        {/* QR Code Graphic Mockup */}
        <div className="w-32 h-32 bg-white p-2 border border-gray-200 rounded-lg flex items-center justify-center shrink-0 shadow-2xs">
          <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
            {/* Corner Top-Left */}
            <rect x="10" y="10" width="28" height="28" rx="4" fill="#0F172A" />
            <rect x="16" y="16" width="16" height="16" rx="2" fill="white" />
            <rect x="20" y="20" width="8" height="8" rx="1" fill="#2563EB" />

            {/* Corner Top-Right */}
            <rect x="62" y="10" width="28" height="28" rx="4" fill="#0F172A" />
            <rect x="68" y="16" width="16" height="16" rx="2" fill="white" />
            <rect x="72" y="20" width="8" height="8" rx="1" fill="#2563EB" />

            {/* Corner Bottom-Left */}
            <rect x="10" y="62" width="28" height="28" rx="4" fill="#0F172A" />
            <rect x="16" y="68" width="16" height="16" rx="2" fill="white" />
            <rect x="20" y="72" width="8" height="8" rx="1" fill="#2563EB" />

            {/* Simulated Data Pattern */}
            <rect x="44" y="12" width="12" height="6" fill="#0F172A" />
            <rect x="44" y="22" width="6" height="16" fill="#0F172A" />
            <rect x="54" y="30" width="14" height="6" fill="#2563EB" />
            <rect x="12" y="44" width="20" height="6" fill="#0F172A" />
            <rect x="36" y="44" width="10" height="10" fill="#0F172A" />
            <rect x="50" y="44" width="14" height="8" fill="#0F172A" />
            <rect x="68" y="44" width="20" height="6" fill="#2563EB" />
            <rect x="44" y="60" width="8" height="12" fill="#0F172A" />
            <rect x="56" y="56" width="10" height="8" fill="#0F172A" />
            <rect x="70" y="56" width="8" height="16" fill="#0F172A" />
            <rect x="44" y="76" width="16" height="12" fill="#2563EB" />
            <rect x="64" y="78" width="12" height="10" fill="#0F172A" />
            <rect x="80" y="76" width="8" height="12" fill="#0F172A" />
          </svg>
        </div>

        {/* Instructions & Session Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-semibold mb-1.5">
            <QrCode className="w-3 h-3" />
            Sesión: {sessionId}
          </div>
          <p className="text-xs font-semibold text-gray-800">
            Apunta la cámara de tu celular
          </p>
          <p className="text-[11px] text-gray-500 mt-1 leading-snug">
            Tus fotos se sincronizarán en tiempo real con esta pantalla de PrintShop.
          </p>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={isSimulating}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-blue-800 transition-colors cursor-pointer bg-blue-50/80 hover:bg-blue-100/60 px-3 py-1.5 rounded-lg border border-[#BFDBFE]"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sincronizando con tu celular...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Simular captura y verificación en móvil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
