import * as React from 'react';
import { Link } from 'react-router-dom';

interface ProductActionsProps {
  href: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ href }) => {
  return (
    <div className="grid grid-cols-2 gap-2 pt-2 w-full">
      {/* Personalizar: purple/pink gradient button */}
      <Link
        to="/designer/personalize"
        className="
          inline-flex items-center justify-center
          px-3 py-2 text-xs font-bold text-white
          bg-gradient-to-r from-[#5D46E8] via-[#8534E0] to-[#E50C74]
          hover:opacity-95 rounded-lg shadow-xs
          transition-all duration-200 text-center
        "
      >
        Personalizar
      </Link>

      {/* Comprar / Agregar: outline button */}
      <a
        href={href}
        className="
          inline-flex items-center justify-center
          px-3 py-2 text-xs font-semibold text-[#161823]
          bg-white hover:bg-[#F4F5FA]
          border border-[#E9EBF3] rounded-lg
          transition-all duration-200 text-center
        "
      >
        Comprar
      </a>
    </div>
  );
};
