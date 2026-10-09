import React from 'react';
import { ArrowLeft, Check, Sun, User, Smartphone, Ban } from 'lucide-react';
import { VerificationHelp } from './VerificationHelp';

interface FacialVerificationStepProps {
  onStartVerification: () => void;
  onBack: () => void;
  onContactClick?: () => void;
}

export const FacialVerificationStep: React.FC<FacialVerificationStepProps> = ({
  onStartVerification,
  onBack,
  onContactClick,
}) => {
  return (
    <div className="w-full">
      {/* Back navigation */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-4 mb-2 focus:outline-hidden"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver
      </button>

      {/* Heading & Description */}
      <div className="mb-5">
        <h2 className="text-[22px] sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Verifica tu identidad
        </h2>
        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
          Realiza un escaneo facial en tiempo real. Es rápido, seguro y no requiere documentos adicionales.
        </p>
      </div>

      {/* Large Face Scan Viewfinder Card */}
      <div className="bg-[var(--surface-muted)] border border-[var(--border-muted)] rounded-2xl p-6 sm:p-7 flex flex-col items-center justify-center">
        <div className="relative p-2">
          {/* Viewfinder Bracket Corners */}
          <div className="w-32 h-36 relative flex items-center justify-center">
            {/* Corner top-left */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--primary)] rounded-tl-sm" />
            {/* Corner top-right */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--primary)] rounded-tr-sm" />
            {/* Corner bottom-left */}
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--primary)] rounded-bl-sm" />
            {/* Corner bottom-right */}
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--primary)] rounded-br-sm" />

            {/* Avatar Illustration */}
            <svg
              className="w-24 h-28"
              viewBox="0 0 64 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Hair back */}
              <path
                d="M18 36C18 20 22 10 32 10C42 10 46 20 46 36C46 52 48 58 48 58H16C16 58 18 52 18 36Z"
                fill="#1E293B"
              />
              {/* Neck */}
              <rect x="27" y="44" width="10" height="12" rx="3" fill="#FED7AA" />
              {/* Shoulders */}
              <path
                d="M14 68C14 56 22 52 32 52C42 52 50 56 50 68V76H14V68Z"
                fill="#FDBA74"
              />
              {/* Face */}
              <path
                d="M22 30C22 23.3726 26.4772 18 32 18C37.5228 18 42 23.3726 42 30C42 37.5 37.5 45 32 45C26.5 45 22 37.5 22 30Z"
                fill="#FFEDD5"
              />
              {/* Hair front */}
              <path
                d="M20 26C24 16 30 14 33 14C38 14 42 18 44 26C42 22 38 20 33 21C28 22 24 24 20 26Z"
                fill="#0F172A"
              />
              {/* Eyes */}
              <circle cx="28" cy="30" r="1.5" fill="#0F172A" />
              <circle cx="36" cy="30" r="1.5" fill="#0F172A" />
              {/* Smile */}
              <path
                d="M29 36C30.5 38 33.5 38 35 36"
                stroke="#9A3412"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Cheeks */}
              <circle cx="25" cy="33" r="1.5" fill="#FCA5A5" opacity="0.7" />
              <circle cx="39" cy="33" r="1.5" fill="#FCA5A5" opacity="0.7" />
            </svg>

            {/* Circular Blue Verified Badge on bottom-right corner */}
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--primary)] border-2 border-white flex items-center justify-center text-white shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mt-5">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-3">
          Recomendaciones
        </h4>

        <div className="space-y-2.5">
          {/* 1. Iluminación */}
          <div className="flex items-center gap-3">
            <Sun className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Busca un lugar bien iluminado.
            </span>
          </div>

          {/* 2. Rostro visible */}
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Mantén tu rostro visible y sin obstrucciones.
            </span>
          </div>

          {/* 3. Sostén dispositivo */}
          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Sostén el dispositivo a la altura de tu cara.
            </span>
          </div>

          {/* 4. Evita accesorios */}
          <div className="flex items-center gap-3">
            <Ban className="w-4 h-4 text-[var(--danger-strong)] shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Evita usar gorro, gafas o accesorios que cubran tu rostro.
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onStartVerification}
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all shadow-sm focus:outline-hidden"
        >
          Comenzar verificación
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-xs font-semibold text-[var(--primary)] hover:underline mt-3 py-1 block focus:outline-hidden"
        >
          Volver
        </button>
      </div>

      {/* Footer */}
      <VerificationHelp onContactClick={onContactClick} />
    </div>
  );
};
