import React, { useState, useEffect } from "react";
import { ChevronRight, ScanFace, Landmark } from "lucide-react";
import { SecurityPanel } from "./SecurityPanel";
import { VerificationHelp } from "./VerificationHelp";
import { MethodType } from "../types";

interface MethodSelectionStepProps {
  selectedMethod: MethodType | null;
  onSelectMethod: (method: MethodType) => void;
  onContactClick?: () => void;
}

export const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({
  selectedMethod: initialSelectedMethod,
  onSelectMethod,
  onContactClick,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<MethodType | null>(
    initialSelectedMethod
  );

  useEffect(() => {
    setSelectedMethod(initialSelectedMethod);
  }, [initialSelectedMethod]);

  const handleCardClick = (method: MethodType) => {
    setSelectedMethod(method);
    setTimeout(() => {
      onSelectMethod(method);
    }, 200);
  };

  return (
    <div className="w-full">
      {/* Title & Description */}
      <div className="mt-6 mb-6">
        <h2 className="text-[22px] sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Verifica tu identidad
        </h2>
        <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
          Elige el método que prefieras para completar tu verificación.
          <br className="hidden sm:inline" /> Es rápido, seguro y te permite
          activar los cobros en tu cuenta.
        </p>
      </div>

      {/* Methods List */}
      <div className="space-y-3.5">
        {/* Card 1: Documento de identidad */}
        <button
          type="button"
          onClick={() => handleCardClick("document")}
          className={`w-full text-left p-4 rounded-xl ${
            selectedMethod === "document"
              ? "border-2 border-[var(--primary)] bg-white hover:bg-[var(--accent-muted)]"
              : "border border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
          } transition-all flex items-center gap-3.5 group shadow-xs focus:outline-hidden cursor-pointer`}
        >
          <div className="w-11 h-11 rounded-lg bg-[var(--info-muted)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-[var(--primary)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="10" r="2" />
              <path d="M14 9h4" />
              <path d="M14 12h3" />
              <path d="M6 16.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-[var(--text-primary)] tracking-tight">
                Documento de identidad
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
              Toma una foto de tu documento de identidad y una selfie. La
              verificación suele completarse en pocos minutos.
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0 ml-1" />
        </button>

        {/* Card 2: Verificación facial */}
        <button
          type="button"
          onClick={() => handleCardClick("facial")}
          className={`w-full text-left p-4 rounded-xl ${
            selectedMethod === "facial"
              ? "border-2 border-[var(--primary)] bg-white hover:bg-[var(--accent-muted)]"
              : "border border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
          } transition-all flex items-center gap-3.5 group shadow-xs focus:outline-hidden cursor-pointer`}
        >
          <div className="w-11 h-11 rounded-lg bg-[var(--info-muted)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <ScanFace className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-[var(--text-primary)] tracking-tight">
                Verificación facial
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
              Realiza un escaneo facial en tiempo real. Es seguro, fácil y no
              requiere documentos adicionales.
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0 ml-1" />
        </button>

        {/* Card 3: A través de tu banco */}
        <button
          type="button"
          onClick={() => handleCardClick("bank")}
          className={`w-full text-left p-4 rounded-xl ${
            selectedMethod === "bank"
              ? "border-2 border-[var(--primary)] bg-white hover:bg-[var(--accent-muted)]"
              : "border border-[var(--border)] bg-white hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
          } transition-all flex items-center gap-3.5 group shadow-xs focus:outline-hidden cursor-pointer`}
        >
          <div className="w-11 h-11 rounded-lg bg-[var(--success-muted)] text-[var(--success)] flex items-center justify-center shrink-0">
            <Landmark className="w-6 h-6 stroke-[1.8]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-bold text-[var(--text-primary)] tracking-tight">
                A través de tu banco
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
              Verifica tu identidad usando tu cuenta bancaria. Es un proceso
              rápido y confiable.
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors shrink-0 ml-1" />
        </button>
      </div>

      {/* Security Info Card */}
      <SecurityPanel />

      {/* Help Link Footer */}
      <VerificationHelp onContactClick={onContactClick} />
    </div>
  );
};
