import * as React from "react";

export const ProductsHeader: React.FC = () => {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      {/* Título en texto negro limpio, sin gradientes */}
      <h2 className="text-2xl font-bold tracking-normal text-foreground sm:text-3xl">
        Productos más populares
      </h2>

      {/* Enlace azul a la derecha */}
      <a
        href="#"
        className="rounded-control text-sm font-semibold text-primary transition-colors hover:text-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      >
        Ver todos los productos
      </a>
    </div>
  );
};
