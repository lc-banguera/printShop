import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { categoriesData } from "../../data/categories.data";

export const Categories: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden border-b border-white/10 bg-[#0D1014] py-20 text-white sm:py-24 lg:py-28">
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Cabecera editorial */}
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-2xl">
            Explora por categoría
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Prendas de alta confección y artículos especializados listos para
            personalizar con tus diseños.
          </p>
        </div>

        {/* Galería editorial de seis categorías: la imagen lleva el peso visual */}
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-6 lg:gap-7">
          {categoriesData.map((category) => (
            <a
              key={category.id}
              href={category.href}
              className="group relative flex min-w-0 flex-col transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1014]"
            >
              {/* Superficie única de imagen, sin tarjeta anidada ni contenido decorativo */}
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[5px] border border-white/15 bg-[#F1F3F5] p-4 transition-[border-color,background-color] duration-200 group-hover:border-white/45 group-hover:bg-white sm:p-5 lg:p-6">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.035] drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)]"
                  loading="lazy"
                />
              </div>

              {/* Nombre integrado en la composición, sin etiqueta */}
              <div className="mt-3 px-0.5">
                <span className="text-sm font-semibold tracking-tight text-white transition-colors duration-150 group-hover:text-white/70 sm:text-base">
                  {category.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Categories;
