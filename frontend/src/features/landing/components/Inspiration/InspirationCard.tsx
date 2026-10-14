import * as React from "react";
import { InspirationTemplate } from "../../data/inspiration.data";

import animeImg from "@/resources/landing_principal/inspiration/anime.png";
import minimalistaImg from "@/resources/landing_principal/inspiration/minimalista.png";
import vintageImg from "@/resources/landing_principal/inspiration/vintage.png";
import frasesImg from "@/resources/landing_principal/inspiration/frases.png";
import deportesImg from "@/resources/landing_principal/inspiration/deportes.png";
import musicaImg from "@/resources/landing_principal/inspiration/musica.png";
import naturalezaImg from "@/resources/landing_principal/inspiration/naturaleza.png";
import retroImg from "@/resources/landing_principal/inspiration/retro.png";

const inspirationImages: Record<string, string> = {
  "anime.png": animeImg,
  "minimalista.png": minimalistaImg,
  "vintage.png": vintageImg,
  "frases.png": frasesImg,
  "deportes.png": deportesImg,
  "musica.png": musicaImg,
  "naturaleza.png": naturalezaImg,
  "retro.png": retroImg,
};

interface InspirationCardProps {
  template: InspirationTemplate;
}

export const InspirationCard: React.FC<InspirationCardProps> = ({
  template,
}) => {
  const { name, count, imageName } = template;
  const imageSrc = inspirationImages[imageName] || animeImg;

  return (
    <div
      data-card
      className="group w-[150px] shrink-0 cursor-pointer select-none transition-transform duration-150 active:scale-[0.98] sm:w-[170px] lg:w-[190px]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[5px] border border-slate-200 bg-slate-100 p-1 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-slate-400 group-hover:shadow-[0_16px_30px_-24px_rgba(15,23,42,0.5)]">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full rounded-[4px] object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      </div>

      <div className="mt-2.5 px-0.5">
        <h4 className="text-sm font-semibold tracking-[-0.01em] text-[#0D1014] transition-colors group-hover:text-slate-600 sm:text-[15px]">
          {name}
        </h4>
        <p className="mt-0.5 text-xs text-slate-500">{count} plantillas</p>
      </div>
    </div>
  );
};

export default InspirationCard;
