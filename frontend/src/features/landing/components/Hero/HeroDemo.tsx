import * as React from 'react';
import { Link } from 'react-router-dom';
import heroVisual from '@/resources/landing_principal/images/image_hero.png';

export const HeroDemo: React.FC = () => {
  return (
    <div className="relative flex w-full items-center justify-center lg:justify-end">
      {/* Ambient background glow behind mockup */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-primary/10 blur-2xl transform scale-95"
      />

      <Link
        to="/designer/new?product=camisetas"
        className="group relative block w-full max-w-[680px] overflow-hidden rounded-[28px] border border-white/90 bg-white p-2 shadow-[0_24px_60px_-12px_rgba(30,27,75,0.14),0_10px_20px_-8px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_32px_76px_-12px_rgba(93,70,232,0.22)] active:scale-[0.99]"
        aria-label="Personalizar camiseta en el diseñador 3D"
      >
        <img
          src={heroVisual}
          alt="Diseñador 3D PrintShop mostrando camiseta personalizable con selectores de producto, color y diseños"
          className="h-auto w-full select-none rounded-[22px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
          loading="eager"
          decoding="async"
        />
      </Link>
    </div>
  );
};


