import * as React from "react";

export const ProductsHeader: React.FC = () => {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-[#0D1014] sm:text-2xl">
          Productos más populares
        </h2>
      </div>

      <a
        href="#"
        className="group inline-flex min-h-11 items-center rounded-[5px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#0D1014] transition-colors duration-150 hover:bg-slate-950 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        <span>Ver todos los productos</span>
      </a>
    </div>
  );
};
