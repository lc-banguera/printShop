import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import heroComposition from '@/resources/landing_principal/images/img_design_top_right.png';

interface HeroImageProps {
  className?: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({ className }) => {
  return (
    <div className="relative flex items-center justify-center w-full">
      <img
        src={heroComposition}
        alt="Composición de productos personalizados: camiseta, hoodie y taza"
        className={cn(
          'h-auto w-full max-w-[420px] object-contain sm:max-w-[520px] lg:max-w-[620px]',
          className
        )}
      />
    </div>
  );
};
