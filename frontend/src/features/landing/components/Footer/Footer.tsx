import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Custom TikTok icon
const TikTokIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer
      id="ayuda"
      className="w-full border-t border-white/10 bg-[#0B091A] pb-12 pt-16 text-white sm:pt-20"
    >
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-10 pb-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10">
          {/* Columna 1 - Logo y redes sociales */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <p className="text-xs leading-relaxed text-white/65 max-w-xs">
              Plataforma para diseñar, previsualizar en 3D y producir artículos
              personalizados con calidad profesional.
            </p>
            {/* Redes sociales con botones circulares de alto contraste */}
            <div className="mt-2 flex items-center gap-2.5 text-white/70">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="mt-4 text-xs leading-5 text-white/40">
              © 2026 PrintShop. Todos los derechos reservados.
            </p>
          </div>

          {/* Columna 2 - Productos */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Productos
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-white/70">
              <li>
                <Link
                  to="/designer/new?product=camisetas"
                  className="hover:text-white transition-colors"
                >
                  Camisetas
                </Link>
              </li>
              <li>
                <Link
                  to="/designer/new?product=hoodie"
                  className="hover:text-white transition-colors"
                >
                  Hoodies y Sudaderas
                </Link>
              </li>
              <li>
                <Link
                  to="/designer/new?product=gorras"
                  className="hover:text-white transition-colors"
                >
                  Gorras
                </Link>
              </li>
              <li>
                <Link
                  to="/designer/new?product=bolsos"
                  className="hover:text-white transition-colors"
                >
                  Bolsas
                </Link>
              </li>
              <li>
                <Link
                  to="/designer/new?product=tazas"
                  className="hover:text-white transition-colors"
                >
                  Tazas Cerámicas
                </Link>
              </li>
              <li>
                <Link
                  to="/designer/new?product=posteres"
                  className="hover:text-white transition-colors"
                >
                  Pósteres y Cuadros
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3 - Plataforma */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Plataforma
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-white/70">
              <li>
                <Link
                  to="/designer/new"
                  className="hover:text-white transition-colors"
                >
                  Diseñador 3D
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-white transition-colors"
                >
                  Catálogo de Artículos
                </Link>
              </li>
              <li>
                <a
                  href="#plantillas"
                  className="hover:text-white transition-colors"
                >
                  Biblioteca de Diseños
                </a>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-white transition-colors"
                >
                  Cuenta Gratuita
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Acceso Tiendas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4 - Ayuda */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Ayuda
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-white/70">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Envíos y Entregas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Técnicas de Estampación
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Guía de Tallas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Soporte Técnico
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 5 - Boletín de Novedades */}
          <div className="lg:col-span-3 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Novedades y Diseños
            </h4>
            <p className="text-[13px] leading-relaxed text-white/70">
              Recibe avisos de nuevos productos, técnicas y recursos gráficos.
            </p>
            <div className="mt-2 flex w-full items-center overflow-hidden rounded-2xl border border-white/15 bg-white/5 focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="h-11 w-full bg-transparent px-3.5 text-sm text-white placeholder:text-white/40 outline-none"
              />
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary text-white transition-all hover:bg-[#503cd4] active:scale-95"
                aria-label="Suscribirse al boletín"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <span className="text-[11px] text-white/40 mt-1">
              Sin spam. Cancela tu suscripción en cualquier momento.
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
