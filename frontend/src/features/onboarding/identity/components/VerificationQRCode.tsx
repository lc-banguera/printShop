import React from "react";
import { Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { VerificationHelp } from "./VerificationHelp";

interface VerificationQRCodeProps {
  verificationUrl: string;
  onCancel: () => void;
  onContactClick?: () => void;
}

export const VerificationQRCode: React.FC<VerificationQRCodeProps> = ({
  verificationUrl,
  onCancel,
  onContactClick,
}) => {
  return (
    <div className="w-full">
      {/* Título & Subtítulo */}
      <div className="text-center mt-6 mb-6">
        <h2 className="text-[22px] sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Continúa desde tu celular
        </h2>
        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-sm mx-auto">
          Escanea este código QR para continuar con la verificación.
        </p>
      </div>

      {/* Contenedor Central del Código QR */}
      <div className="bg-[var(--surface-muted)] border border-[var(--border-muted)] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
        {/* Marco Blanco del QR Real */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--border)] shadow-xs flex flex-col items-center">
          <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center bg-white">
            <QRCodeSVG
              value={verificationUrl}
              size={200}
              level="H"
              includeMargin={false}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Texto explicativo inferior */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
          <Smartphone className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <p className="text-xs font-semibold">
            Abre la cámara de tu celular y escanea el código.
          </p>
        </div>
      </div>

      {/* Botón Cancelar */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="w-[70%] mx-auto bg-dangerStrong hover:brightness-95 active:brightness-90 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dangerStrong/30 focus-visible:ring-offset-2 cursor-pointer flex items-center justify-center text-center"
        >
          Cancelar
        </button>
      </div>

      {/* Footer centrado */}
      <VerificationHelp onContactClick={onContactClick} />
    </div>
  );
};
