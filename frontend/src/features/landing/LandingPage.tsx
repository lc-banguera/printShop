import * as React from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ToolsShowcase } from "./components/Features/ToolsShowcase";
import { Categories } from "./components/Categories";
import { ProductsSection } from "./components/Products";
import { Inspiration } from "./components/Inspiration";
import { FreeTrialAndStudentPlan } from "./components/Features/FreeTrialAndStudentPlan";
import { FinalCTA } from "./components/FinalCTA";
import { Models3DSection } from "./components/Models3D";
import { Footer } from "./components/Footer";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-white font-sans antialiased text-slate-950 selection:bg-slate-950 selection:text-white">
      {/* 1. Header con Translucidez Apple */}
      <Header />

      {/* 2. Main Content */}
      <main className="flex-1">
        {/* 2. Hero: Vitrina en Fondo Oscuro de Gran Impacto y Productos Textiles */}
        <Hero />

        {/* 3. Sección Interactiva: Demostraciones Sincronizadas de Herramientas Reales */}
        <ToolsShowcase />
        {/* 4. Explora por categoría */}
        <Categories />

        {/* 5. Catálogo de Productos Populares */}
        <ProductsSection />

        {/* 6. Inspírate con nuestras plantillas */}
        <Inspiration />

        {/* 7. Cuenta Gratuita Real & Propuesta Honest para Estudiantes */}
        <FreeTrialAndStudentPlan />

        {/* 8. CTA Final */}
        <FinalCTA />

        {/* 9. Modelado 3D Interactivo */}
        <Models3DSection />
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
