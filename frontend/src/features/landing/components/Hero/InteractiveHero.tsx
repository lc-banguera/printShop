import * as React from 'react';
import { Link } from 'react-router-dom';
import { PencilLine, Sparkles, Layers, Box, Eye, CheckCircle2, Sliders } from 'lucide-react';
import heroVisual from '@/resources/landing_principal/images/image_hero.png';
import tshirtImg from '@/resources/landing_principal/images/t-shirt-basic-fitted.png';
import hoodieImg from '@/resources/landing_principal/images/oversized-hoodie-fitted.png';
import capImg from '@/resources/mockup/gorra.png';
import toteImg from '@/resources/landing_principal/images/shopping-bag-standard-fitted.png';

interface InteractiveHeroProps {
  onStartDesign?: () => void;
}

const TECHNIQUES = [
  { id: 'dtf', name: 'DTF Digital', tag: 'Ultra detalle', desc: 'Colores vivos, degradados y fijación elástica de alta duración.' },
  { id: 'sublimacion', name: 'Sublimación', tag: 'Full print', desc: 'Tinta integrada en la fibra textil sin tacto superficial.' },
  { id: 'serigrafia', name: 'Serigrafía', tag: 'Producción masiva', desc: 'Tintas directas con máxima solidez y texturas densas.' },
  { id: 'pedreria', name: 'Pedrería & Relieve', tag: 'Especiales', desc: 'Aplicaciones táctiles y acabados de lujo.' },
];

const PREVIEW_PRODUCTS = [
  { id: 'tshirt', name: 'Camiseta DTF', img: tshirtImg, type: 'Algodón Peinado 180g' },
  { id: 'hoodie', name: 'Hoodie Oversize', img: hoodieImg, type: 'Frisa Pesada 350g' },
  { id: 'cap', name: 'Gorra Estructurada', img: capImg, type: 'Twill 6 Paneles' },
  { id: 'tote', name: 'Tote Bag', img: toteImg, type: 'Lona Orgánica' },
];

export const InteractiveHero: React.FC<InteractiveHeroProps> = () => {
  const [activeTechnique, setActiveTechnique] = React.useState('dtf');
  const [selectedProduct, setSelectedProduct] = React.useState('tshirt');
  const [garmentColor, setGarmentColor] = React.useState('#111827');

  const selectedProdObj = PREVIEW_PRODUCTS.find(p => p.id === selectedProduct) || PREVIEW_PRODUCTS[0];

  return (
    <div className="relative w-full">
      {/* Marco de Escena Principal */}
      <div className="relative overflow-hidden rounded-[32px] border border-black/[0.08] bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)]">
        
        {/* Barra superior de control del estudio — Estilo Apple Pro Tools */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-[#FAFBFD] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0F172A]">
              Estudio Creativo PrintShop
            </span>
            <span className="hidden sm:inline rounded-md bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-foregroundMuted">
              Pre-impresión en vivo
            </span>
          </div>

          {/* Selector de Técnica Textil */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-full bg-black/[0.04] p-1">
            {TECHNIQUES.map((tech) => {
              const isActive = activeTechnique === tech.id;
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setActiveTechnique(tech.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-primary shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                      : 'text-foregroundMuted hover:text-foreground'
                  }`}
                >
                  {tech.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Central Principal: Mockup y Diseñador 3D */}
        <div className="relative grid min-h-[440px] grid-cols-1 items-center gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:gap-8 xl:min-h-[480px]">
          
          {/* Lado izquierdo: Captura del Canvas 3D con Hotspots */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-black/[0.06] bg-[#F4F6FB] p-4 sm:p-6">
            <Link
              to="/designer/new?product=camisetas"
              className="group relative block w-full overflow-hidden rounded-xl"
              aria-label="Abrir diseñador 3D con camiseta"
            >
              <img
                src={heroVisual}
                alt="Diseñador 3D de PrintShop con camiseta, selectores de color y biblioteca de arte"
                className="h-auto w-full rounded-xl object-contain shadow-xs transition-transform duration-300 group-hover:scale-[1.01]"
              />

              {/* Botón flotante para interactuar en pantalla completa */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] shadow-md backdrop-blur-md transition-all group-hover:bg-primary group-hover:text-white">
                <Box className="h-3.5 w-3.5" />
                <span>Explorar en 3D</span>
              </div>
            </Link>

            {/* Ficha técnica de la técnica seleccionada */}
            <div className="mt-4 flex w-full items-center justify-between border-t border-black/[0.06] pt-3 text-xs">
              <span className="font-semibold text-foreground">
                Técnica activa: <strong className="font-bold text-primary">{TECHNIQUES.find(t => t.id === activeTechnique)?.name}</strong>
              </span>
              <span className="text-foregroundMuted">
                {TECHNIQUES.find(t => t.id === activeTechnique)?.desc}
              </span>
            </div>
          </div>

          {/* Lado derecho: Selector de Producto & Muestrario de Materiales */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-foregroundMuted">
                  1. Elige tu soporte
                </span>
                <span className="text-xs font-semibold text-primary">
                  {selectedProdObj.type}
                </span>
              </div>

              {/* Grid de productos reales */}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {PREVIEW_PRODUCTS.map((prod) => {
                  const isSelected = selectedProduct === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setSelectedProduct(prod.id)}
                      className={`group flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-150 ${
                        isSelected
                          ? 'border-primary bg-primary/[0.04] shadow-[0_2px_8px_rgba(93,70,232,0.12)]'
                          : 'border-black/[0.06] bg-[#FAFBFD] hover:border-black/15 hover:bg-white'
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-2xs">
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {prod.name}
                        </p>
                        <p className="truncate text-[10px] text-foregroundMuted">
                          Listo para estampar
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Selector de Color de Prenda */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-foregroundMuted">
                2. Color de prenda
              </span>
              <div className="mt-2.5 flex items-center gap-2">
                {[
                  { name: 'Negro Profundo', hex: '#111827' },
                  { name: 'Blanco Puro', hex: '#FFFFFF' },
                  { name: 'Gris Melange', hex: '#64748B' },
                  { name: 'Azul Marino', hex: '#1E293B' },
                  { name: 'Rojo Carmesí', hex: '#991B1B' },
                  { name: 'Verde Botella', hex: '#166534' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setGarmentColor(c.hex)}
                    className={`h-7 w-7 rounded-full border transition-all duration-150 ${
                      garmentColor === c.hex
                        ? 'scale-115 border-primary ring-2 ring-primary/40'
                        : 'border-black/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* 3. Acción directa hacia el Diseñador */}
            <div className="border-t border-black/[0.06] pt-4">
              <Link
                to={`/designer/new?product=${selectedProduct}`}
                className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:bg-black active:translate-y-0 active:scale-[0.98]"
              >
                <PencilLine className="h-4 w-4" />
                <span>Personalizar este producto ahora</span>
              </Link>
              <p className="mt-2 text-center text-[11px] text-foregroundMuted">
                Exportación de vectores y archivos de corte listos para producción
              </p>
            </div>

          </div>
        </div>

        {/* Franja de Métricas Técnicas Reales (Sólido, limpio, sin degradados) */}
        <div className="grid grid-cols-2 divide-x divide-black/[0.06] border-t border-black/[0.06] bg-[#FAFBFD] sm:grid-cols-4">
          <div className="p-3.5 text-center sm:p-4">
            <span className="block text-base font-bold text-[#0F172A] sm:text-lg">
              300 DPI
            </span>
            <span className="text-[11px] font-medium text-foregroundMuted">
              Resolución de Impresión
            </span>
          </div>
          <div className="p-3.5 text-center sm:p-4">
            <span className="block text-base font-bold text-[#0F172A] sm:text-lg">
              Sin Mínimos
            </span>
            <span className="text-[11px] font-medium text-foregroundMuted">
              Desde 1 sola prenda
            </span>
          </div>
          <div className="p-3.5 text-center sm:p-4">
            <span className="block text-base font-bold text-[#0F172A] sm:text-lg">
              Vista 360°
            </span>
            <span className="text-[11px] font-medium text-foregroundMuted">
              Simulación de Prenda
            </span>
          </div>
          <div className="p-3.5 text-center sm:p-4">
            <span className="block text-base font-bold text-[#0F172A] sm:text-lg">
              CMYK + Blanco
            </span>
            <span className="text-[11px] font-medium text-foregroundMuted">
              Fidelidad Cromática
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
