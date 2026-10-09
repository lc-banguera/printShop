import * as React from "react";
import { Link } from "react-router-dom";
import { Model3DItem } from "../../data/models3d.data";

// Importaciones de imágenes existentes de mockup
import hoodieImg from "@/resources/mockup/hoddie.png";
import tshirtImg from "@/resources/mockup/t-shirt-mockup.png";
import bolsoImg from "@/resources/mockup/bolso.png";
import mugImg from "@/resources/mockup/tazas.png";
import posterImg from "@/resources/mockup/cuadro.png";
import capImg from "@/resources/mockup/gorra.png";

// Assets reales de models 3D con escala natural equilibrada (fondo transparente, 88% ocupación)
import oversizedHoodieFittedImg from "@/resources/landing_principal/images/oversized-hoodie-fitted.png";
import oversizedSweatshirtFittedImg from "@/resources/landing_principal/images/oversized-sweatshirt-fitted.png";
import pufferJacketFittedImg from "@/resources/landing_principal/images/puffer_jacket-fitted.png";
import tshirtBasicFittedImg from "@/resources/landing_principal/images/t-shirt-basic-fitted.png";
import tshirtWomenFittedImg from "@/resources/landing_principal/images/t-shirt-women-fitted.png";
import shoppingBagStandardFittedImg from "@/resources/landing_principal/images/shopping-bag-standard-fitted.png";
import iphone16FittedImg from "@/resources/landing_principal/images/iphone-16-fitted.png";
import macbookProFittedImg from "@/resources/landing_principal/images/macbook-pro-fitted.png";
import proDisplayFittedImg from "@/resources/landing_principal/images/pro-display-fitted.png";
import ipadProFittedImg from "@/resources/landing_principal/images/ipad-pro-fitted.png";

// Fallbacks de assets originales
import oversizedHoodieImg from "@/resources/landing_principal/images/oversized-hoodie.png";
import oversizedSweatshirtImg from "@/resources/landing_principal/images/oversized-sweatshirt.png";
import pufferJacketImg from "@/resources/landing_principal/images/puffer_jacket.png";
import tshirtBasicImg from "@/resources/landing_principal/images/t-shirt-basic.png";
import tshirtWomenImg from "@/resources/landing_principal/images/t-shirt-women.png";
import shoppingBagStandardImg from "@/resources/landing_principal/images/shopping-bag-standard.png";
import iphone16Img from "@/resources/landing_principal/images/iphone-16.png";
import macbookProImg from "@/resources/landing_principal/images/macbook-pro.png";
import proDisplayImg from "@/resources/landing_principal/images/pro-display.png";
import ipadProImg from "@/resources/landing_principal/images/ipad-pro.png";

// Placeholder limpio para dispositivos
const devicePlaceholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' fill='none'/%3E%3Crect x='35' y='25' width='50' height='70' rx='4' fill='%23E2E4EF'/%3E%3Crect x='40' y='32' width='40' height='55' rx='2' fill='%23CBD0E5'/%3E%3C/svg%3E`;

const screenSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'%3E%3Crect width='120' height='120' fill='none'/%3E%3Crect x='12' y='22' width='96' height='62' rx='5' fill='%23D1D5DB'/%3E%3Crect x='16' y='26' width='88' height='54' rx='3' fill='%23CBD0E5'/%3E%3Crect x='48' y='86' width='24' height='6' rx='2' fill='%23D1D5DB'/%3E%3Crect x='40' y='90' width='40' height='4' rx='2' fill='%23D1D5DB'/%3E%3C/svg%3E`;

// Map de imagen por imageName del data file
const imageMap: Record<string, string> = {
  // Ropa: assets fitted con escala protagonista
  "oversized-hoodie-fitted.png": oversizedHoodieFittedImg,
  "oversized-sweatshirt-fitted.png": oversizedSweatshirtFittedImg,
  "puffer_jacket-fitted.png": pufferJacketFittedImg,
  "t-shirt-basic-fitted.png": tshirtBasicFittedImg,
  "t-shirt-women-fitted.png": tshirtWomenFittedImg,

  // Ropa: fallbacks originales
  "oversized-hoodie.png": oversizedHoodieImg,
  "oversized-sweatshirt.png": oversizedSweatshirtImg,
  "puffer_jacket.png": pufferJacketImg,
  "t-shirt-basic.png": tshirtBasicImg,
  "t-shirt-women.png": tshirtWomenImg,
  "hoddie.png": hoodieImg,
  "t-shirt-mockup.png": tshirtImg,
  "gorra.png": capImg,

  // Objetos: assets fitted y existentes
  "shopping-bag-standard-fitted.png": shoppingBagStandardFittedImg,
  "shopping-bag-standard.png": shoppingBagStandardImg,
  "bolso.png": bolsoImg,
  "tazas.png": mugImg,
  "cuadro.png": posterImg,

  // Dispositivos: assets fitted y existentes
  "iphone-16-fitted.png": iphone16FittedImg,
  "macbook-pro-fitted.png": macbookProFittedImg,
  "pro-display-fitted.png": proDisplayFittedImg,
  "ipad-pro-fitted.png": ipadProFittedImg,
  "iphone-16.png": iphone16Img,
  "macbook-pro.png": macbookProImg,
  "pro-display.png": proDisplayImg,
  "ipad-pro.png": ipadProImg,
  "device-screen.png": screenSvg,
};

interface Models3DCardProps {
  model: Model3DItem;
}

export const Models3DCard: React.FC<Models3DCardProps> = ({ model }) => {
  const imgSrc = imageMap[model.imageName] || devicePlaceholderSvg;

  const cardContent = (
    <>
      {/* Zona de imagen superior: padding reducido para dar presencia protagónica al producto */}
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[linear-gradient(145deg,var(--surface-muted),var(--background))] p-3 transition-colors duration-200 group-hover:bg-[var(--surface-strong)] sm:p-5">
        <img
          src={imgSrc}
          alt={model.name}
          className="relative z-10 h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {/* Zona inferior de información */}
      <div className="flex flex-col gap-1 px-3.5 py-3.5 sm:px-4">
        <div className="flex items-center justify-between gap-1">
          <span className="line-clamp-1 text-sm font-semibold text-[var(--text-primary)] sm:text-[15px]">
            {model.name}
          </span>
          {model.supports3D ? (
            <span className="shrink-0 rounded-md bg-[var(--accent-muted)] px-2 py-1 text-[10px] font-semibold text-[var(--primary)]">
              3D
            </span>
          ) : (
            <span className="shrink-0 text-[10px] text-[var(--text-muted)] sm:text-xs">
              Próximamente
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {model.type}
        </span>
      </div>
    </>
  );

  // La Camiseta tiene enlace activo funcional al Diseñador 2 real
  if (model.supports3D && model.route) {
    return (
      <Link
        to={model.route}
        className="group flex flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-white shadow-subtle transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {cardContent}
      </Link>
    );
  }

  // Los demás productos permanecen visibles como "Próximamente", sin enlaces ni rutas falsas
  return (
    <div className="group flex flex-col overflow-hidden rounded-[18px] border border-[var(--border)] bg-white shadow-subtle transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-elevated">
      {cardContent}
    </div>
  );
};

export default Models3DCard;
