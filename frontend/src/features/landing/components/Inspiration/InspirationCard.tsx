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
      className="group w-[145px] shrink-0 cursor-pointer sm:w-[160px] lg:w-[176px]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-[16px] border border-border bg-surface shadow-subtle transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:border-borderStrong group-hover:shadow-card">
        <img
          src={imageSrc}
          alt={name}
          className="h-full w-full rounded-[15px] object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      <div className="mt-2">
        <h4 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary sm:text-base">
          {name}
        </h4>
        <p className="mt-1 text-xs text-foregroundMuted">{count} plantillas</p>
      </div>
    </div>
  );
};

export default InspirationCard;
