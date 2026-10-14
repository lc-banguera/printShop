import React from 'react';
import { ArrowRight, Mail, UserRound } from 'lucide-react';

interface PersonalDataStepProps {
  name?: string;
  email?: string;
  onContinue: () => void;
}

export const PersonalDataStep: React.FC<PersonalDataStepProps> = ({ name, email, onContinue }) => (
  <div className="w-full">
    <div className="mt-6 mb-6">
      <h2 className="text-[22px] sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        Datos personales
      </h2>
      <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
        Revisa los datos de tu cuenta antes de continuar con la configuración.
      </p>
    </div>

    <div className="space-y-3 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-muted)] p-4">
      <div className="flex items-center gap-3">
        <UserRound className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Nombre</p>
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">{name || 'No disponible'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Mail className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Correo electrónico</p>
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">{email || 'No disponible'}</p>
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={onContinue}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
    >
      Continuar
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
);
