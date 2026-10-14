import * as React from 'react';
import { Link } from 'react-router-dom';

interface ProductActionsProps {
  href: string;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ href }) => {
  return (
    <div className="grid grid-cols-2 gap-2 pt-2 w-full">
      {/* Personalizar: solid purple button */}
      <Link
        to="/designer/personalize"
        className="
          inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
          px-3 py-2 text-xs font-bold text-white
          bg-primary hover:bg-[#503cd4]
          rounded-lg shadow-xs
          transition-all duration-200 text-center
        "
      >
        Personalizar
      </Link>

      {/* Comprar / Agregar: outline button */}
      <a
        href={href}
        className="
          inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
          px-3 py-2 text-xs font-semibold text-foreground
          bg-surface hover:bg-surfaceMuted
          border border-border rounded-lg
          transition-all duration-200 text-center
        "
      >
        Comprar
      </a>
    </div>
  );
};
