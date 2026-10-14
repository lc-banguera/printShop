import React from 'react';
import { HelpCircle } from 'lucide-react';

interface VerificationHelpProps {
  onContactClick?: () => void;
}

export const VerificationHelp: React.FC<VerificationHelpProps> = ({ onContactClick }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] pt-6 pb-2 text-center w-full">
      <HelpCircle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
      <span>¿Necesitas ayuda?</span>
      <button
        type="button"
        onClick={onContactClick}
        className="text-[var(--primary)] font-medium hover:underline focus:outline-hidden"
      >
        Contáctanos
      </button>
    </div>
  );
};
