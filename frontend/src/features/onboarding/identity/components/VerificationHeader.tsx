import React from "react";
import { X } from "lucide-react";

interface VerificationHeaderProps {
  onClose: () => void;
}

export const VerificationHeader: React.FC<VerificationHeaderProps> = ({
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between pb-5 border-b border-gray-100/80">
      {/* Brand / Logo Oficial de PrintShop */}
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#2563EB] text-sm font-black text-white shadow-2xs">
          P
        </span>
        <span className="text-[18px] font-black tracking-tight text-[#111827]">
          Print<span className="text-[#2563EB]">Shop</span>
        </span>
      </div>

      {/* Account indicator & Close button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar verificación"
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
