import { useState, useMemo } from 'react';
import type { DragEvent } from 'react';
import {
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Smile,
  Shapes,
  Disc,
  QrCode,
  Layers,
  Search,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/shared/ui/tooltip';
import { getDesignResources } from '../services';
import { DESIGN_DRAG_MIME_TYPE, type DesignDragPayload, type DesignResource } from '@/types/design-resource';
import { LazyGalleryImage } from './lazy-gallery-image';

const designResources = getDesignResources();

const PRESET_CATEGORIES = ['Todas', 'Minimalista', 'Vintage', 'Anime', 'Deporte'];

function createDesignDragPayload(resource: DesignResource): DesignDragPayload {
  return {
    type: 'design-resource',
    resource,
  };
}

/** Designer modules for Left Sidebar toolbar */
const DESIGNER_MODULES = [
  { id: 'plantillas', name: 'Plantillas', icon: LayoutTemplate },
  { id: 'texto', name: 'Texto', icon: Type },
  { id: 'imagenes', name: 'Imágenes', icon: ImageIcon },
  { id: 'ia', name: 'IA Generar', icon: Sparkles },
  { id: 'logos', name: 'Logos', icon: ShieldCheck },
  { id: 'stickers', name: 'Stickers', icon: Smile },
  { id: 'formas', name: 'Formas', icon: Shapes },
  { id: 'bordado', name: 'Bordado', icon: Disc },
  { id: 'qr', name: 'Código QR', icon: QrCode },
  { id: 'capas', name: 'Capas', icon: Layers },
];

export function LeftSidebar() {
  const [activeModule, setActiveModule] = useState('plantillas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todas');

  const handleDesignDragStart = (event: DragEvent<HTMLButtonElement>, resource: DesignResource) => {
    const payload = createDesignDragPayload(resource);

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(DESIGN_DRAG_MIME_TYPE, JSON.stringify(payload));
    event.dataTransfer.setData('text/plain', resource.id);
  };

  const filteredResources = useMemo(() => {
    let results = designResources;

    if (activeCategory !== 'Todas') {
      results = results.filter((r) => r.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((r) => r.name.toLowerCase().includes(query));
    }

    return results;
  }, [activeCategory, searchQuery]);

  return (
    <TooltipProvider>
      <aside className="flex h-full border-r border-[#e8e8f0] bg-surface select-none">
       {/* ── Left Toolbar (~60px) ── */}
        <div className="flex w-[60px] shrink-0 flex-col items-center border-r border-[#e8e8f0] bg-white py-3">
          <ScrollArea className="w-full flex-1">
            <nav className="flex flex-col items-center gap-1 px-2 py-1">
              {DESIGNER_MODULES.map((mod) => {
                const isActive = activeModule === mod.id;
                const ModIcon = mod.icon;

                return (
                  <Tooltip key={mod.id}>
                    <TooltipTrigger asChild>
                      {/* Entire button is clickable for accessibility, but only icon gets visual state */}
                      <button
                        type="button"
                        onClick={() => setActiveModule(mod.id)}
                        className="group flex w-full flex-col items-center gap-0.5 py-1.5 outline-none"
                      >
                        {/* Icon container — receives hover/active background */}
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-[5px] transition-colors ${
                            isActive
                              ? 'bg-[#5046e5] text-white'
                              : 'text-[#5e5d72] group-hover:bg-[#f5f4fb] group-hover:text-[#5046e5]'
                          }`}
                        >
                          <ModIcon
                            className="h-[18px] w-[18px] stroke-[1.7]"
                          />
                        </span>
                        {/* Label — independent, no background */}
                        <span
                          className={`text-[9px] leading-tight transition-colors ${
                            isActive
                              ? 'font-semibold text-[#5046e5]'
                              : 'font-medium text-[#908fa3] group-hover:text-[#5046e5]'
                          }`}
                        >
                          {mod.name.split(' ')[0]}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium">
                      {mod.name}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </ScrollArea>
        </div>

        {/* ── Resource Panel (~280px) ── */}
        <div className="flex w-[315px] shrink-0 flex-col overflow-hidden bg-[#fafafc]">
          {/* Search bar & filter button */}
          <div className="flex items-center gap-2 p-2.5 pb-1">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#908fa3]" />
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 w-full rounded-[5px] border border-[#e4e4ee] bg-white pl-8 pr-2.5 text-[11px] text-[#171421] placeholder:text-[#908fa3] shadow-2xs transition-all focus:border-[#5046e5]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5046e5]/15"
              />
            </div>
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border border-[#e4e4ee] bg-white text-[#5e5d72] shadow-2xs transition-all hover:bg-[#f5f4fb] hover:text-[#171421]"
              title="Filtrar"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Category Chips — 5px radius, compact */}
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-2 py-1">
            {PRESET_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-[5px] px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150 whitespace-nowrap ${isSelected
                    ? 'bg-[#5046e5] text-white shadow-2xs'
                    : 'bg-[#eeeef5] text-[#5e5d72] hover:bg-[#e4e4ee] hover:text-[#171421]'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Design 2-Column Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-2 gap-2 p-2.5">
              {filteredResources.map((resource) => (
                <Tooltip key={resource.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="group relative flex h-[112px] w-full flex-col items-center justify-center overflow-hidden rounded-[5px] border border-[#e5e5ee] bg-white p-1.5 shadow-2xs transition-all duration-150 hover:border-[#5046e5]/50 hover:shadow-md active:cursor-grabbing cursor-grab"
                      draggable
                      onDragStart={(event) => handleDesignDragStart(event, resource)}
                    >
                      <LazyGalleryImage
                        src={resource.image}
                        alt={resource.name}
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                        draggable={false}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    <div className="flex flex-col">
                      <span>{resource.name}</span>
                      <span className="text-xs text-text-muted">{resource.category}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="px-3 py-10 text-center text-xs font-medium text-[#908fa3]">
                No se encontraron diseños
              </div>
            )}

            {/* Bottom button */}
            <div className="p-2.5 pt-0.5">
              <button
                type="button"
                className="flex h-7 w-full items-center justify-center gap-1.5 rounded-[5px] border border-[#e2e2ec] bg-white text-[11px] font-semibold text-[#5046e5] shadow-2xs transition-all hover:border-[#5046e5]/30 hover:bg-[#f5f5fc]"
              >
                <span>Ver más plantillas</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </TooltipProvider>
  );
}
