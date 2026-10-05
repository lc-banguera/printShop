import * as React from 'react';
import { HeroContent } from './HeroContent';
import { HeroDemo } from './HeroDemo';
import { HeroCapabilities } from './HeroCapabilities';
import { heroData } from '../../data/hero.data';
import { Container } from '@/shared/components/Container/Container';

export const Hero: React.FC = () => {
  return (
    <section className="w-full overflow-hidden bg-[#F4F5FB] pt-2 pb-10 sm:pt-4 sm:pb-12 lg:pt-6 lg:pb-14">
      <Container variant="wide">
        <div className="grid min-w-0 grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 xl:gap-8">
          <div className="flex min-w-0 flex-col justify-center">
            <HeroContent data={heroData} />
          </div>

          <div className="flex min-w-0 items-center justify-center lg:justify-end">
            <HeroDemo />
          </div>
        </div>

        <div className="mt-8 border-t border-[#E5E7EB]/50 pt-7 sm:mt-10 sm:pt-8 lg:mt-12 lg:pt-9">
          <HeroCapabilities capabilities={heroData.capabilities} />
        </div>
      </Container>
    </section>
  );
};
