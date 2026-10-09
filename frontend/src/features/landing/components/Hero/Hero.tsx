import * as React from 'react';
import { HeroContent } from './HeroContent';
import { HeroDemo } from './HeroDemo';
import { HeroCapabilities } from './HeroCapabilities';
import { heroData } from '../../data/hero.data';
import { Container } from '@/shared/components/Container/Container';

export const Hero: React.FC = () => {
  return (
    <section className="w-full overflow-hidden bg-[linear-gradient(118deg,var(--surface-muted)_0%,var(--background)_56%,var(--accent-muted)_100%)] pb-10 pt-8 sm:pb-14 sm:pt-12 lg:pb-16 lg:pt-14">
      <Container variant="wide">
        <div className="grid min-w-0 grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 xl:gap-14">
          <div className="flex min-w-0 flex-col justify-center">
            <HeroContent data={heroData} />
          </div>

          <div className="flex min-w-0 items-center justify-center lg:justify-end">
            <HeroDemo />
          </div>
        </div>

        <div className="mt-10 border-t border-border/70 pt-7 sm:mt-12 sm:pt-8 lg:mt-14 lg:pt-9">
          <HeroCapabilities capabilities={heroData.capabilities} />
        </div>
      </Container>
    </section>
  );
};
