import * as React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Categories } from './components/Categories';
import { ProductsSection } from './components/Products';
import { Inspiration } from './components/Inspiration';
import { FinalCTA } from './components/FinalCTA';
import { Models3DSection } from './components/Models3D';
import { Footer } from './components/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5FB]">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Content */}
      <main className="flex-1">
        {/* 2. Hero */}
        <Hero />

        {/* 3. Features — sección editorial: Qué puedes hacer con PrintShop */}
        <Features />

        {/* 4. Explora por categoría */}
        <Categories />

        {/* 5. Productos más populares */}
        <ProductsSection />

        {/* 6. Inspírate con nuestras plantillas */}
        <Inspiration />

        {/* 7. CTA */}
        <FinalCTA />

        {/* 8. Explora modelos 3D — SIEMPRE después del CTA, antes del Footer */}
        <Models3DSection />
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
