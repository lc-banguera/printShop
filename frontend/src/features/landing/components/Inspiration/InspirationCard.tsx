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
      className="group w-[115px] shrink-0 cursor-pointer sm:w-[130px] lg:w-[140px]"
    >
      {/* Contenedor cuadrado sin bordes redondeados */}
      <div className="relative aspect-square w-full overflow-hidden rounded-control border border-border bg-surfaceMuted transition-colors group-hover:border-borderStrong">
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <div className="mt-2">
        <h4 className="text-xs font-bold text-foreground transition-colors group-hover:text-primary sm:text-sm">
          {name}
        </h4>
        <p className="mt-0.5 text-[11px] text-foregroundMuted">{count} plantillas</p>
      </div>
    </div>
  );
};

export default InspirationCard;
