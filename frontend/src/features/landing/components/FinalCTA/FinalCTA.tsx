import * as React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/Container/Container";
import { CheckCircle2 } from "lucide-react";
import workshopBg from "@/resources/landing_principal/images/cta_workshop_bg.jpg";

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Contenedor Completo con Imagen de Fondo Real del Taller textil PrintShop */}
        <div className="relative flex min-h-[480px] items-center overflow-hidden rounded-[5px] border border-slate-800 bg-[#0D1014] text-white shadow-[0_28px_70px_-30px_rgba(15,23,42,0.8)]">
          {/* Imagen de fondo a lo ancho del bloque completo */}
          <img
            src={workshopBg}
            alt="Taller de personalización textil y estampado PrintShop"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Capa de contraste sólida (Strictly NO gradients) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[#0B091A]/88 backdrop-blur-[2px]"
          />

          {/* Borde interior luminoso discreto */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[5px] ring-1 ring-inset ring-white/10"
          />

          {/* Contenido integrado directamente sobre la imagen de fondo */}
          <div className="relative z-10 w-full max-w-3xl p-8 sm:p-12 lg:p-16 space-y-6">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-2xl">
              ¿Tienes una idea? Conviertela en un producto real.
            </h2>

            <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Empieza hoy en nuestro diseñador 3D gratuito. Visualiza tu prenda,
              exporta tus archivos con calidad de taller y recibe tus productos
              listos para usar o vender.
            </p>

            {/* Puntos informativos conservados exactamente */}
            <div className="space-y-2.5 pt-1 text-sm text-white/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                <span>Sin costo inicial para empezar a diseñar</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                <span>
                  Producción en DTF, serigrafía y sublimación y muchas técnicas
                  más.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                <span>Envíos seguros a todo el país</span>
              </div>
            </div>

            {/* Acción Principal Única: Color sólido distintivo (Esmeralda/Teal vibrante de alta visibilidad) */}
            <div className="pt-4 flex items-center">
              <Link
                to="/designer/new?product=camisetas"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[5px] bg-white px-8 py-3.5 text-sm font-bold text-[#0D1014] transition-colors duration-150 hover:bg-slate-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1014]"
              >
                <span>Comenzar a diseñar gratis</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FinalCTA;
