import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/shared/components/Container/Container';

export const CTABanner: React.FC = () => {
  const leftMockup = '/src/resources/landing_principal/cta/left_mockup.png';
  const rightMockup = '/src/resources/landing_principal/cta/right_mockup.png';
  const editorPreview = '/src/resources/landing_principal/cta/editor_preview.png';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <section className="w-full py-8 md:py-12 bg-surface">
      <Container variant="wide">
        <div className="relative w-full rounded-3xl md:rounded-[36px] overflow-hidden bg-[#5D46E8] px-6 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 min-h-[300px]">
          
          {/* Left Decorative Image Mockup */}
          <div className="hidden lg:block w-[180px] shrink-0 relative">
            <img
              src={leftMockup}
              alt="Mockup izquierdo"
              onError={handleImageError}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-full object-contain drop-shadow-xl"
            />
          </div>

          {/* Center Text and CTA Button */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start max-w-lg z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              ¿Tienes un diseño increíble?
            </h2>
            <p className="text-purple-100 text-sm md:text-base mt-2">
              Conviértelo en realidad hoy mismo.
            </p>
            <Link
              to="/designer/new"
              className="mt-6 inline-flex items-center justify-center px-6 py-3 font-bold text-primary bg-surface rounded-control shadow-card hover:bg-accentMuted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Comenzar a diseñar &rarr;
            </Link>
          </div>

          {/* Right Editor Screenshot / Mockup Preview */}
          <div className="w-full md:w-auto flex items-center justify-center gap-4 shrink-0 z-10">
            <div className="relative max-w-[280px] md:max-w-[320px]">
              <img
                src={editorPreview}
                alt="Vista previa del editor"
                onError={handleImageError}
                className="w-full object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <img
                src={rightMockup}
                alt="Mockup derecho"
                onError={handleImageError}
                className="absolute -left-10 -bottom-4 w-28 object-contain drop-shadow-xl hidden sm:block"
              />
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
