import * as React from "react";

export const ProductsHeader: React.FC = () => {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      {/* Título en texto negro limpio, sin gradientes */}
      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Productos más populares
      </h2>

      {/* Enlace azul a la derecha */}
      <a
        href="#"
        className="rounded-control text-xs font-semibold text-primary transition-colors hover:text-primaryHover sm:text-sm"
      >
        Ver todos los productos
      </a>
    </div>
  );
};
