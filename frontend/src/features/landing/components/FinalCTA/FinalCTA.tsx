import * as React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/Container/Container";
import ctaImage from "@/resources/landing_principal/images/img_cta.png";

export const FinalCTA: React.FC = () => {
  return (
    <section className="w-full overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      <Container variant="wide">
        {/* Superficie blanca integrada con difuminado perimetral hacia #F4F5FB */}
        <div className="relative flex w-full flex-col items-stretch overflow-hidden rounded-[22px] border border-borderMuted bg-white shadow-elevated md:flex-row">
          {/* Difuminado perimetral suave de los extremos hacia #F4F5FB */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.35),transparent_36%)]"
          />

          {/* Izquierda: texto + botón */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-5 p-7 sm:p-10 md:p-12 lg:p-14">
            <h2 className="max-w-[560px] text-2xl font-bold leading-[1.12] text-[var(--text-primary)] sm:text-3xl lg:text-[2.5rem]">
              ¿Tienes una idea?{" "}
              <span className="text-primary">
                Nosotros la hacemos realidad.
              </span>
            </h2>
            <p className="max-w-[420px] text-base leading-7 text-[var(--text-secondary)]">
              Crea productos personalizados únicos con nuestra herramienta fácil
              de usar y la más alta calidad de impresión.
            </p>
            <div>
              <Link
                to="/designer/new"
                className="inline-flex min-h-12 items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primaryForeground shadow-subtle transition-[background-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:bg-primaryHover hover:shadow-card active:translate-y-0 active:scale-[0.98]"
              >
                Comenzar a diseñar
              </Link>
            </div>
          </div>

          {/* Derecha: imagen */}
          <div className="relative flex h-56 w-full shrink-0 self-stretch overflow-hidden sm:h-72 md:h-auto md:w-[44%] md:max-w-[520px]">
            <img
              src={ctaImage}
              alt="PrintShop — personaliza tus productos"
              className="w-full h-full object-cover object-left"
            />
            {/* Fade suave en el borde izquierdo */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-white to-transparent md:block"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FinalCTA;
