import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const SecurityPanel: React.FC = () => {
  return (
    <div className="bg-[#F8FAFC] border border-blue-100/70 rounded-xl p-3.5 flex items-start gap-3 mt-6">
      <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-semibold text-[#2563EB]">
          Tu información está protegida
        </h4>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
          Utilizamos tecnología de seguridad avanzada para proteger tus datos personales.
        </p>
      </div>
    </div>
  );
};
