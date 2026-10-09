import React from "react";
import { X } from "lucide-react";

interface VerificationHeaderProps {
  onClose: () => void;
}

export const VerificationHeader: React.FC<VerificationHeaderProps> = ({
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between pb-5 border-b border-[var(--border-muted)]">
      {/* Brand / Logo Oficial de PrintShop */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[var(--primary)] text-sm font-black text-white shadow-2xs">
          P
        </span>
        <span className="text-[18px] font-black tracking-tight text-[var(--text-primary)]">
          Print<span className="text-[var(--primary)]">Shop</span>
        </span>
      </div>

      {/* Account indicator & Close button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar verificación"
          className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
