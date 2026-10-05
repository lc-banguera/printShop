import * as React from 'react';
import { Link } from 'react-router-dom';
import heroVisual from '@/resources/landing_principal/images/image_hero.png';

export const HeroDemo: React.FC = () => {
  return (
    <div className="relative flex w-full items-center justify-center lg:justify-end">
      <Link
        to="/designer/new?product=camisetas"
        className="group relative block w-full max-w-[650px] transition-transform duration-300 hover:scale-[1.01]"
        aria-label="Personalizar camiseta en el diseñador 3D"
      >
        <img
          src={heroVisual}
          alt="Diseñador 3D PrintShop mostrando camiseta personalizable con selectores de producto, color y diseños"
          className="h-auto w-full select-none object-contain"
          loading="eager"
          decoding="async"
        />
      </Link>
    </div>
  );
};


