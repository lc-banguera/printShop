import * as React from "react";
import { Link } from "react-router-dom";

// Maquetas de los productos físicos reales
import tshirtImg from "@/resources/mockup/t-shirt-mockup.png";
import hoodieImg from "@/resources/mockup/hoddie.png";
import capImg from "@/resources/mockup/gorra.png";
import toteImg from "@/resources/mockup/bolso.png";
import mugImg from "@/resources/mockup/tazas.png";
import posterImg from "@/resources/mockup/cuadro.png";

// Capturas de las interfaces reales para cada producto
import heroVisual from "@/resources/landing_principal/images/image_hero.png";
import designerScreenshot from "@/resources/landing_principal/images/designer_screenshot.png";

type ProductKey =
  | "camisetas"
  | "hoodies"
  | "gorras"
  | "bolsos"
  | "tazas"
  | "posteres";

interface ProductDemo {
  id: ProductKey;
  label: string;
  name: string;
  visualImg: string;
  demoScreenshot: string;
  route: string;
  descriptionParagraph: string;
}

const PRODUCTS_DATA: Record<ProductKey, ProductDemo> = {
  camisetas: {
    id: "camisetas",
    label: "Camisetas",
    name: "Camisetas y Poleras",
    visualImg: tshirtImg,
    demoScreenshot: heroVisual,
    route: "/designer/new?product=camisetas",
    descriptionParagraph:
      "Nuestras camisetas de algodón peinado ofrecen la superficie idónea para estampados nítidos, colores intensos y acabados duraderos en pecho, espalda y mangas.",
  },
  hoodies: {
    id: "hoodies",
    label: "Hoodies",
    name: "Hoodies y Sudaderas",
    visualImg: hoodieImg,
    demoScreenshot: heroVisual,
    route: "/designer/new?product=hoodie",
    descriptionParagraph:
      "Confeccionadas en frisa pesada de tacto suave y capucha estructurada, ideales para diseños de gran formato que conservan su definición tras múltiples lavados.",
  },
  gorras: {
    id: "gorras",
    label: "Gorras",
    name: "Gorras Estructuradas",
    visualImg: capImg,
    demoScreenshot: designerScreenshot,
    route: "/designer/new?product=gorras",
    descriptionParagraph:
      "Diseñadas con sarga de algodón de alta resistencia y paneles frontales reforzados, brindan el soporte perfecto para emblemas, parches textiles y logotipos precisos.",
  },
  bolsos: {
    id: "bolsos",
    label: "Bolsas",
    name: "Bolsas",
    visualImg: toteImg,
    demoScreenshot: designerScreenshot,
    route: "/designer/new?product=bolsos",
    descriptionParagraph:
      "Lona orgánica gruesa y costuras reforzadas pensadas para el uso diario, convirtiéndose en el lienzo ideal para marcas, ilustraciones artísticas y eventos.",
  },
  tazas: {
    id: "tazas",
    label: "Tazas",
    name: "Tazas Cerámicas",
    visualImg: mugImg,
    demoScreenshot: designerScreenshot,
    route: "/designer/new?product=tazas",
    descriptionParagraph:
      "Cerámica brillante de alta densidad con recubrimiento especial para sublimación envolvente, asegurando colores vivos resistentes a microondas y lavavajillas.",
  },
  posteres: {
    id: "posteres",
    label: "Pósteres",
    name: "Pósteres y Cuadros",
    visualImg: posterImg,
    demoScreenshot: designerScreenshot,
    route: "/designer/new?product=posteres",
    descriptionParagraph:
      "Impresos en papel de calidad de galería con acabado mate antibrillo, pensados para destacar el contraste y la fidelidad tonal de obras de arte e ilustraciones.",
  },
};

export const Hero: React.FC = () => {
  const [selectedProduct, setSelectedProduct] =
    React.useState<ProductKey>("camisetas");
  const current = PRODUCTS_DATA[selectedProduct];

  return (
    <section className="relative w-full overflow-hidden bg-[#0D1014] text-white pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Titular Principal Limpio */}
        <div className="mx-auto max-w-[1000px] text-center">
          <h1 className="text-[clamp(2.5rem,5.8vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-white">
            La plataforma definitiva para crear y producir productos únicos.
          </h1>

          {/* Texto descriptivo refinado y conciso */}
          <p className="mx-auto mt-6 max-w-[720px] text-base leading-relaxed text-white/70 sm:text-lg">
            Diseña tus prendas con precisión milimétrica, visualízalas en 3D
            interactivo y prepáralas para producción profesional.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={current.route}
              className="inline-flex min-h-[50px] items-center justify-center rounded-[5px] bg-white px-8 py-3.5 text-sm font-semibold text-[#0D1014] transition-colors duration-150 hover:bg-slate-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1014]"
            >
              <span>Comenzar a diseñar</span>
            </Link>

            <Link
              to="/products"
              className="inline-flex min-h-[50px] items-center justify-center rounded-[5px] border border-white/20 bg-transparent px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:border-white/50 hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1014]"
            >
              <span>Explorar catálogo</span>
            </Link>
          </div>
        </div>

        {/* Escena Protagonista: Vitrina de Producto & Simulador 3D */}
        <div className="mt-16 overflow-hidden rounded-[5px] border border-white/15 bg-[#15191E] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.9)]">
          {/* Barra Superior: Selector de las 6 Categorías Completas */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#1A1F25] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-white">
                Personalización en Vivo
              </span>
            </div>

            {/* Selector de las 6 Categorías Único */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-[5px] border border-white/10 bg-black/20 p-1">
              {(Object.keys(PRODUCTS_DATA) as ProductKey[]).map((key) => {
                const item = PRODUCTS_DATA[key];
                const isActive = selectedProduct === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedProduct(key)}
                    className={`rounded-[5px] px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-white text-[#0D1014]"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuerpo de la Vitrina: 2 Columnas Sincronizadas */}
          <div className="grid grid-cols-1 items-center gap-8 p-4 sm:p-7 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
            {/* Lado Izquierdo: Captura o Simulación de la Herramienta para el Producto — Protagonista sin marco pesado */}
            <div className="relative flex min-w-0 items-center justify-center overflow-hidden">
              <Link
                to={current.route}
                className="group relative block w-full overflow-hidden"
                aria-label={`Abrir diseñador para ${current.name}`}
              >
                <img
                  src={current.demoScreenshot}
                  alt={`Demostración del personalizador para ${current.name}`}
                  className="h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </Link>
            </div>

            {/* Lado Derecho: Producto Físico Real + Párrafo Descriptivo Integrado en Color Blanco */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-2xl">
                  {current.name}
                </h3>
                {/* Párrafo fluido en color blanco, específico de la categoría */}
                <p className="mt-3 text-sm leading-relaxed text-white sm:text-base">
                  {current.descriptionParagraph}
                </p>
              </div>

              {/* Imagen del Producto Físico en Pedestal Sólido */}
              <div className="flex h-52 w-full items-center justify-center p-4">
                <img
                  src={current.visualImg}
                  alt={current.name}
                  className="h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* Botón de Entrada Inmediata */}
              <Link
                to={current.route}
                className="flex min-h-[48px] w-full items-center justify-center rounded-[5px] bg-white px-6 py-3 text-sm font-bold text-[#0D1014] transition-colors duration-150 hover:bg-slate-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#15191E]"
              >
                <span>Personalizar ahora</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
