import * as React from 'react';
import { Link } from 'react-router-dom';
import heroVisual from '@/resources/landing_principal/images/image_hero.png';

export const HeroDemo: React.FC = () => {
  return (
    <div className="relative flex w-full items-center justify-center lg:justify-end">
      <Link
        to="/designer/new?product=camisetas"
        className="group relative block w-full max-w-[700px] overflow-hidden rounded-[24px] border border-white/90 bg-white/70 p-1.5 shadow-[0_22px_64px_rgba(22,24,35,0.11)] backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(22,24,35,0.15)] active:scale-[0.995]"
        aria-label="Personalizar camiseta en el diseñador 3D"
      >
        <img
          src={heroVisual}
          alt="Diseñador 3D PrintShop mostrando camiseta personalizable con selectores de producto, color y diseños"
          className="h-auto w-full select-none rounded-[19px] object-contain"
          loading="eager"
          decoding="async"
        />
      </Link>
    </div>
  );
};


