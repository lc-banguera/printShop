import React from 'react';
import { ArrowLeft, BookOpen, Contact } from 'lucide-react';
import { VerificationHelp } from './VerificationHelp';

interface DocumentPreparationStepProps {
  onContinue: () => void;
  onBack: () => void;
  onContactClick?: () => void;
}

export const DocumentPreparationStep: React.FC<DocumentPreparationStepProps> = ({
  onContinue,
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
          Toma una foto de tu documento de identidad y una selfie. Asegúrate de que la información sea clara y legible.
        </p>
      </div>

      {/* Dual Illustration Box */}
      <div className="bg-[var(--surface-muted)] border border-[var(--border-muted)] rounded-2xl p-4 sm:p-5 grid grid-cols-2 gap-4">
        {/* Left: Document illustration */}
        <div className="flex flex-col items-center text-center">
          <div className="w-full h-28 sm:h-32 bg-white rounded-xl border border-[var(--border-muted)] flex items-center justify-center p-3 shadow-2xs">
            {/* Realistic ID card vector mockup */}
            <div className="w-28 h-18 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-2 flex gap-2 items-center shadow-xs">
              <div className="w-7 h-9 bg-[#3B82F6] rounded flex flex-col items-center justify-center text-white shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-white/90 mb-1" />
                <div className="w-4 h-2 rounded-t-full bg-white/90" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="w-full h-1.5 bg-[#93C5FD] rounded-full" />
                <div className="w-4/5 h-1.5 bg-[#93C5FD] rounded-full" />
                <div className="w-3/5 h-1.5 bg-[#BFDBFE] rounded-full" />
              </div>
            </div>
          </div>

          <span className="text-[13px] font-bold text-[var(--text-primary)] mt-3 block">
            Foto de tu documento
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
            Debe estar completo, sin reflejos y ser legible.
          </span>
        </div>

        {/* Right: Selfie illustration with viewfinder corners */}
        <div className="flex flex-col items-center text-center">
          <div className="w-full h-28 sm:h-32 bg-white rounded-xl border border-[var(--border-muted)] flex items-center justify-center p-3 shadow-2xs relative">
            {/* Viewfinder brackets */}
            <div className="w-20 h-24 relative flex items-center justify-center">
              {/* Corner top-left */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--primary)] rounded-tl-sm" />
              {/* Corner top-right */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--primary)] rounded-tr-sm" />
              {/* Corner bottom-left */}
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--primary)] rounded-bl-sm" />
              {/* Corner bottom-right */}
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--primary)] rounded-br-sm" />

              {/* Avatar Illustration */}
              <svg className="w-16 h-20" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Hair back */}
                <path d="M18 36C18 20 22 10 32 10C42 10 46 20 46 36C46 52 48 58 48 58H16C16 58 18 52 18 36Z" fill="#1E293B" />
                {/* Neck */}
                <rect x="27" y="44" width="10" height="12" rx="3" fill="#FED7AA" />
                {/* Shoulders / Peach shirt */}
                <path d="M14 68C14 56 22 52 32 52C42 52 50 56 50 68V76H14V68Z" fill="#FDBA74" />
                {/* Face */}
                <path d="M22 30C22 23.3726 26.4772 18 32 18C37.5228 18 42 23.3726 42 30C42 37.5 37.5 45 32 45C26.5 45 22 37.5 22 30Z" fill="#FFEDD5" />
                {/* Bangs / Hair front */}
                <path d="M20 26C24 16 30 14 33 14C38 14 42 18 44 26C42 22 38 20 33 21C28 22 24 24 20 26Z" fill="#0F172A" />
                {/* Eyes */}
                <circle cx="28" cy="30" r="1.5" fill="#0F172A" />
                <circle cx="36" cy="30" r="1.5" fill="#0F172A" />
                {/* Smile */}
                <path d="M29 36C30.5 38 33.5 38 35 36" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
                {/* Cheeks */}
                <circle cx="25" cy="33" r="1.5" fill="#FCA5A5" opacity="0.7" />
                <circle cx="39" cy="33" r="1.5" fill="#FCA5A5" opacity="0.7" />
              </svg>
            </div>
          </div>

          <span className="text-[13px] font-bold text-[var(--text-primary)] mt-3 block">
            Selfie
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
            Tu rostro debe estar bien iluminado y sin obstrucciones.
          </span>
        </div>
      </div>

      {/* Accepted documents section */}
      <div className="mt-5">
        <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2.5">
          Documentos aceptados
        </h4>

        <div className="grid grid-cols-3 gap-2.5">
          {/* DNI / CI */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[var(--info-muted)] text-[var(--primary)] flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M15 8h2" />
                <path d="M15 12h2" />
              </svg>
            </div>
            <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-2">
              DNI / CI
            </span>
          </div>

          {/* Pasaporte */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[var(--info-muted)] text-[var(--primary)] flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-[var(--primary)] stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-2">
              Pasaporte
            </span>
          </div>

          {/* Carnet de conducir */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[var(--info-muted)] text-[var(--primary)] flex items-center justify-center">
              <Contact className="w-4.5 h-4.5 text-[var(--primary)] stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-[var(--text-secondary)] mt-2">
              Carnet de conducir
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all shadow-sm focus:outline-hidden"
        >
          Continuar
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
