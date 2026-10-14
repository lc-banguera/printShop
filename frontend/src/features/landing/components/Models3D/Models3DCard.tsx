import * as React from "react";
import { Link } from "react-router-dom";
import { Model3DItem } from "../../data/models3d.data";
import { Box, ArrowUpRight } from "lucide-react";

// Importaciones de imágenes existentes de mockup
import hoodieImg from "@/resources/mockup/hoddie.png";
import tshirtImg from "@/resources/mockup/t-shirt-mockup.png";
import bolsoImg from "@/resources/mockup/bolso.png";
import mugImg from "@/resources/mockup/tazas.png";
import posterImg from "@/resources/mockup/cuadro.png";
import capImg from "@/resources/mockup/gorra.png";

// Assets reales de models 3D fitted
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

// Map de imagen por imageName
const imageMap: Record<string, string> = {
  "oversized-hoodie-fitted.png": oversizedHoodieFittedImg,
  "oversized-sweatshirt-fitted.png": oversizedSweatshirtFittedImg,
  "puffer_jacket-fitted.png": pufferJacketFittedImg,
  "t-shirt-basic-fitted.png": tshirtBasicFittedImg,
  "t-shirt-women-fitted.png": tshirtWomenFittedImg,
  "oversized-hoodie.png": oversizedHoodieFittedImg,
  "oversized-sweatshirt.png": oversizedSweatshirtFittedImg,
  "puffer_jacket.png": pufferJacketFittedImg,
  "t-shirt-basic.png": tshirtBasicFittedImg,
  "t-shirt-women.png": tshirtWomenFittedImg,
  "hoddie.png": hoodieImg,
  "t-shirt-mockup.png": tshirtImg,
  "gorra.png": capImg,
  "shopping-bag-standard-fitted.png": shoppingBagStandardFittedImg,
  "shopping-bag-standard.png": shoppingBagStandardFittedImg,
  "bolso.png": bolsoImg,
  "tazas.png": mugImg,
  "cuadro.png": posterImg,
  "iphone-16-fitted.png": iphone16FittedImg,
  "macbook-pro-fitted.png": macbookProFittedImg,
  "pro-display-fitted.png": proDisplayFittedImg,
  "ipad-pro-fitted.png": ipadProFittedImg,
  "iphone-16.png": iphone16FittedImg,
  "macbook-pro.png": macbookProFittedImg,
  "pro-display.png": proDisplayFittedImg,
  "ipad-pro.png": ipadProFittedImg,
};

interface Models3DCardProps {
  model: Model3DItem;
}

export const Models3DCard: React.FC<Models3DCardProps> = ({ model }) => {
  const imgSrc = imageMap[model.imageName] || tshirtBasicFittedImg;

  const cardContent = (
    <>
      {/* Zona de imagen: proporción 4/5 que equilibra prendas y dispositivos */}
      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-slate-100 transition-colors duration-200 group-hover:bg-slate-200/70">
        <img
          src={imgSrc}
          alt={model.name}
          className="relative z-10 h-[88%] w-[88%] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04] drop-shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          loading="lazy"
        />
        {model.supports3D && (
          <div className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0D1014]">
              <Box className="h-3 w-3" />
              <span>3D</span>
            </span>
          </div>
        )}
      </div>

      {/* Zona inferior de información */}
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-1.5">
          <span className="line-clamp-1 text-[15px] font-bold tracking-tight text-[#0D1014]">
            {model.name}
          </span>
          {model.supports3D ? (
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          ) : (
            <span className="shrink-0 text-[10px] font-medium text-slate-500">
              Próximamente
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {model.type}
        </span>
      </div>
    </>
  );

  if (model.supports3D && model.route) {
    return (
      <Link
        to={model.route}
        className="group flex flex-col overflow-hidden rounded-[5px] border border-slate-200 bg-white transition-all duration-200 ease-out hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_18px_30px_-24px_rgba(15,23,42,0.55)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-[5px] border border-slate-200 bg-white transition-all duration-200 ease-out hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_18px_30px_-24px_rgba(15,23,42,0.55)]">
      {cardContent}
    </div>
  );
};

export default Models3DCard;
