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
    <footer id="ayuda" className="w-full bg-surfaceMuted pt-14 pb-10 text-foreground">
      <Container variant="wide">
        <div className="grid min-w-0 grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Columna 1 - Logo y redes sociales */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <Logo />
            {/* Redes sociales */}
            <div className="mt-1 flex items-center gap-3.5 text-foregroundMuted">
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-foregroundSubtle mt-6">
              © 2025 PrintShop. Todos los derechos reservados.
            </p>
          </div>

          {/* Columna 2 - Productos */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Productos</h4>
            <ul className="flex flex-col gap-2 text-xs text-foregroundMuted">
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
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Ayuda</h4>
            <ul className="flex flex-col gap-2 text-xs text-foregroundMuted">
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
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Empresa</h4>
            <ul className="flex flex-col gap-2 text-xs text-foregroundMuted">
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
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Suscríbete a nuestro boletín
            </h4>
            <p className="text-xs text-foregroundMuted">
              Recibe novedades y ofertas exclusivas.
            </p>
            <div className="w-full flex items-center mt-1">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full h-9 px-3 text-xs bg-surface border border-borderStrong border-r-0 rounded-l-lg focus:outline-none focus:border-primary text-foreground placeholder-foregroundSubtle"
              />
              <button
                type="button"
                className="h-9 px-3.5 bg-primary hover:bg-primaryHover text-white flex items-center justify-center rounded-r-lg transition-colors"
                aria-label="Suscribirse"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
