import * as React from "react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/Container/Container";
import { Palette, Box, Layers, CheckCircle2 } from "lucide-react";

// Capturas reales de la aplicación tomadas a 1440 × 900
import realDesignerZero from "@/resources/landing_principal/images/designer_screenshot.png";
import realCustom3D from "@/resources/landing_principal/images/real_tool_custom_3d.png";
import realPrepPrint from "@/resources/landing_principal/images/basic_designer.png";

interface ToolItem {
  id: string;
  icon: React.ElementType;
  tabLabel: string;
  title: string;
  description: string;
  bulletPoints: string[];
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

const TOOLS: ToolItem[] = [
  {
    id: "studio-zero",
    icon: Palette,
    tabLabel: "Diseñar desde cero",
    title: "Crea estampados personalizados con control total sobre cada capa.",
    description:
      "Agrega tipografías, ilustraciones, formas y gráficos vectoriales sobre cualquier prenda o artículo. Ajusta escala, posición y rotación con guías de alineación inteligentes.",
    bulletPoints: [
      "Importación de archivos PNG, SVG y JPG de alta resolución",
      "Gestión de capas independientes con ordenamiento z-index",
      "Selectores de color de prenda y límites de área de estampado",
    ],
    ctaLabel: "Seleccionar producto para personalizar",
    ctaHref: "/designer/new",
    image: realDesignerZero,
    imageAlt: "Captura real de la herramienta Diseñar desde cero a 1440x900",
  },
  {
    id: "view-3d",
    icon: Box,
    tabLabel: "Personalizar en 3D",
    title: "Previsualiza tu prenda en 360° antes de enviar a imprimir.",
    description:
      "Gira, haz zoom y evalúa la caída del estampado sobre modelos tridimensionales realistas. Visualiza arrugas del tejido, proporciones anatómicas y luces de estudio.",
    bulletPoints: [
      "Simulación tridimensional interactiva con rotación orbital",
      "Verificación de tamaño de impresión real sobre pecho, espalda y mangas",
      "Exportación automática de maquetas promocionales para tu tienda",
    ],
    ctaLabel: "Probar modelo 3D de camiseta",
    ctaHref: "/designer/new?product=camisetas",
    image: realCustom3D,
    imageAlt: "Captura real de la herramienta Personalizar en 3D a 1440x900",
  },
  {
    id: "prep-print",
    icon: Layers,
    tabLabel: "Preparar para impresión",
    title: "Exporta automáticamente en alta resolución y perfiles para taller.",
    description:
      "PrintShop procesa tu diseño para las especificaciones exigidas por los talleres de DTF, serigrafía y sublimación, evitando sorpresas de color o pixelación.",
    bulletPoints: [
      "Generación de máscara de blanco para prendas oscuras",
      "Validación de resolución mínima recomendada (300 DPI)",
      "Archivos organizados listos para corte e impresión directa",
    ],
    ctaLabel: "Conoce los productos listos",
    ctaHref: "/products",
    image: realPrepPrint,
    imageAlt:
      "Captura real de la herramienta Preparar para impresión a 1440x900",
  },
];

export const ToolsShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<string>(TOOLS[0].id);
  const activeTool = TOOLS.find((t) => t.id === activeTab) || TOOLS[0];

  return (
    <section className="relative w-full overflow-hidden border-b border-slate-200 bg-[#F6F7F8] py-20 sm:py-24 lg:py-28">
      <Container variant="wide" className="px-4 sm:px-6 lg:px-8">
        {/* Cabecera de Sección: Título y descripción solicitados */}
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-0.03em] text-[#0D1014] sm:text-4xl lg:text-2xl">
            De la idea al producto listo para imprimir.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Crea productos desde cero, personalízalos en 3D y prepara tus
            diseños para producción desde PrintShop.
          </p>
        </div>

        {/* Barra de Pestañas Horizontales Estilo Apple Segmented Control: Únicamente las 3 herramientas obligatorias */}
        <div className="mt-10 flex justify-start">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-[5px] border border-slate-200 bg-white p-1">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTab(tool.id)}
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-[4px] px-4 py-2.5 text-xs font-semibold transition-colors duration-150 sm:text-sm ${
                    isActive
                      ? "bg-[#0D1014] text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`}
                  />
                  <span>{tool.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Interactivo Sincronizado */}
        <div className="mt-5 overflow-hidden rounded-[5px] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-8">
            {/* Lado Texto & Detalles */}
            <div className="flex flex-col justify-center space-y-4">
              <div>
                <h3 className="text-2xl font-bold leading-tight tracking-[-0.025em] text-[#0D1014] sm:text-2xl">
                  {activeTool.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {activeTool.description}
                </p>
              </div>

              {/* Puntos destacados */}
              <ul className="space-y-3">
                {activeTool.bulletPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-800"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* Botón de Acción Sincronizado */}
              <div className="pt-2">
                <Link
                  to={activeTool.ctaHref}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-[5px] bg-[#0D1014] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  <span>{activeTool.ctaLabel}</span>
                </Link>
              </div>
            </div>

            {/* Lado Imagen / Demostración Real: Captura a proporción 1440x900 (16/10), limpia, sin padding excesivo */}
            <div className="relative overflow-hidden rounded-[5px] border border-slate-200 bg-slate-100">
              <img
                src={activeTool.image}
                alt={activeTool.imageAlt}
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ToolsShowcase;
