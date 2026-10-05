import * as React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/Container/Container";
import ctaImage from "@/resources/landing_principal/images/img_cta.png";

export const FinalCTA: React.FC = () => {
  return (
    <section className="w-full overflow-hidden bg-[#F4F5FB] py-12 sm:py-16 lg:py-20">
      <Container variant="wide">
        {/* Superficie blanca integrada con difuminado perimetral hacia #F4F5FB */}
        <div className="relative flex w-full flex-col items-stretch overflow-hidden rounded-none border-0 bg-white shadow-none md:flex-row">
          {/* Difuminado perimetral suave de los extremos hacia #F4F5FB */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_0_24px_8px_#F4F5FB]"
          />

          {/* Izquierda: texto + botón */}
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center gap-4 p-8 sm:p-10 md:p-12 lg:p-14">
            <h2 className="text-xl font-extrabold leading-tight tracking-tight text-[#111827] sm:text-2xl lg:text-3xl">
              ¿Tienes una idea?{" "}
              <span className="text-primary">
                Nosotros la hacemos realidad.
              </span>
            </h2>
            <p className="max-w-[400px] text-sm leading-relaxed text-[#4B5563]">
              Crea productos personalizados únicos con nuestra herramienta fácil
              de usar y la más alta calidad de impresión.
            </p>
            <div>
              <Link
                to="/designer/new"
                className="inline-flex min-h-11 items-center rounded-control bg-primary px-6 py-2.5 text-sm font-semibold text-primaryForeground transition-colors hover:bg-primaryHover"
              >
                Comenzar a diseñar
              </Link>
            </div>
          </div>

          {/* Derecha: imagen */}
          <div className="relative flex h-52 w-full shrink-0 self-stretch overflow-hidden sm:h-64 md:h-auto md:w-[44%] md:max-w-[460px]">
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
