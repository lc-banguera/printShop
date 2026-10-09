import * as React from "react";
import { Container } from "@/shared/components/Container/Container";
import { Logo } from "../Header/Logo";
import { Instagram, Facebook, Youtube, ArrowRight } from "lucide-react";

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
    <footer id="ayuda" className="w-full border-t border-border bg-surfaceMuted pb-10 pt-16 text-foreground sm:pt-20">
      <Container variant="wide">
        <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-10 pb-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10">
          {/* Columna 1 - Logo y redes sociales */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <Logo />
            {/* Redes sociales */}
            <div className="mt-1 flex items-center gap-2.5 text-foregroundMuted">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foregroundMuted transition-[color,background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-borderStrong hover:text-primary active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foregroundMuted transition-[color,background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-borderStrong hover:text-primary active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foregroundMuted transition-[color,background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-borderStrong hover:text-primary active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foregroundMuted transition-[color,background-color,border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-borderStrong hover:text-primary active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="mt-6 text-xs leading-5 text-foregroundSubtle">
              © 2025 PrintShop. Todos los derechos reservados.
            </p>
          </div>

          {/* Columna 2 - Productos */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase text-foreground">Productos</h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-foregroundMuted">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Camisetas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Hoodies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Tazas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Gorras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Pósters
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Bolsos y bolsas
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3 - Ayuda */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase text-foreground">Ayuda</h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-foregroundMuted">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Envíos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4 - Empresa */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase text-foreground">Empresa</h4>
            <ul className="flex flex-col gap-2.5 text-[13px] text-foregroundMuted">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Quiénes somos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Política de privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 5 - Suscríbete a nuestro boletín */}
          <div className="lg:col-span-3 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase text-foreground">
              Suscríbete a nuestro boletín
            </h4>
            <p className="text-[13px] leading-5 text-foregroundMuted">
              Recibe novedades y ofertas exclusivas.
            </p>
            <div className="mt-1 flex w-full items-center">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="h-11 w-full rounded-l-xl border border-borderStrong border-r-0 bg-surface px-3 text-sm text-foreground placeholder-foregroundSubtle focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                className="flex h-11 items-center justify-center rounded-r-xl bg-primary px-4 text-white transition-colors hover:bg-primaryHover active:scale-[0.98]"
                aria-label="Suscribirse"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
