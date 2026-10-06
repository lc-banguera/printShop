// src/features/designer/components/right-sidebar.tsx
import { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignStartVertical,
  AlignEndVertical,
  Link,
  Plus,
} from 'lucide-react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';
import type { CanvasState } from '@/types/canvas';
import { useProductSelection } from '@/features/catalog/hooks/useProductSelection';
import type { ProductDefinition } from '@/types/product';

export function RightSidebar() {
  const selectedElementId = useCanvasStore((state: CanvasState) => state.selectedElementId);
  const elements = useCanvasStore((state: CanvasState) => state.elements);
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');

  const selectedElement = selectedElementId
    ? elements.find((el) => el.id === selectedElementId)
    : undefined;

  const displayX = selectedElement ? `${Math.round(selectedElement.x)} px` : '12.5 cm';
  const displayY = selectedElement ? `${Math.round(selectedElement.y)} px` : '8.3 cm';
  const displayW = selectedElement ? `${Math.round(selectedElement.width)} px` : '25.6 cm';
  const displayH = selectedElement ? `${Math.round(selectedElement.height)} px` : '20.4 cm';
  const displayRotation = selectedElement ? `${Math.round(selectedElement.rotation ?? 0)}°` : '0°';
  const displayOpacity = selectedElement ? `${Math.round((selectedElement.opacity ?? 1) * 100)}%` : '100%';

  // ---- Catalog hook -----------------------------------------------------------
  const { products, selectProduct } = useProductSelection();

  // Render each product as a card while preserving the original visual style.
  const renderProductCard = (product: ProductDefinition) => {
    const isSelected = activeProduct.id === product.id;
    return (
      <div
        key={product.id}
        onClick={() => selectProduct(product)}
        className={`flex items-center gap-2 rounded-[5px] border p-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-[#5046e5]/40 bg-[#eeebff]/50'
            : 'border-[#e8e8ed] bg-white hover:bg-[#fafafc]'
        }`}
      >
        <img src={product.thumbnail} alt={product.name} className="h-5 w-5 object-cover rounded-[3px]" />
        <span className="text-[11px] font-medium text-[#171421]">{product.name}</span>
      </div>
    );
  };
  // -----------------------------------------------------------------------------

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-[#e8e8f0] bg-white select-none">
      {/* Top Header Tabs — underline style, no pills */}
      <div className="flex border-b border-[#e8e8f0] px-4 pt-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('properties')}
          className={`pb-2 text-[11px] font-semibold transition-all relative ${
            activeTab === 'properties' ? 'text-[#5046e5]' : 'text-[#5e5d72] hover:text-[#171421]'
          }`}
        >
          Propiedades
          {activeTab === 'properties' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5046e5]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`pb-2 text-[11px] font-semibold transition-all relative ${
            activeTab === 'layers' ? 'text-[#5046e5]' : 'text-[#5e5d72] hover:text-[#171421]'
          }`}
        >
          Capas ({elements.length > 0 ? elements.length : 5})
          {activeTab === 'layers' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5046e5]" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3.5 space-y-3.5">
          {/* Section 1: Posición */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#8E96A6]">Posición</h4>
            {/* Alignment icons toolbar */}
            <div className="grid grid-cols-6 gap-0.5 rounded-[5px] bg-[#f4f4f7] p-0.5">
              <button type="button" className="flex h-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421] transition-all">
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421] transition-all">
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421] transition-all">
                <AlignRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421] transition-all">
                <AlignStartVertical className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421] transition-all">
                <AlignJustify className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="flex h-6 items-center justify-center rounded-[3px] text-[#5e5d72] hover:bg-white hover:text-[#171421] transition-all">
                <AlignEndVertical className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* X and Y Inputs */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="flex h-7 items-center justify-between rounded-[5px] border border-[#e4e4ee] bg-[#fdfdfd] px-2.5">
                <span className="text-[10px] font-medium text-[#8E96A6]">X</span>
                <span className="text-[11px] font-medium text-[#171421]">{displayX}</span>
              </div>
              <div className="flex h-7 items-center justify-between rounded-[5px] border border-[#e4e4ee] bg-[#fdfdfd] px-2.5">
                <span className="text-[10px] font-medium text-[#8E96A6]">Y</span>
                <span className="text-[11px] font-medium text-[#171421]">{displayY}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Tamaño */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#8E96A6]">Tamaño</h4>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 grid grid-cols-2 gap-1.5">
                <div className="flex h-7 items-center justify-between rounded-[5px] border border-[#e4e4ee] bg-[#fdfdfd] px-2.5">
                  <span className="text-[10px] font-medium text-[#8E96A6]">W</span>
                  <span className="text-[11px] font-medium text-[#171421]">{displayW}</span>
                </div>
                <div className="flex h-7 items-center justify-between rounded-[5px] border border-[#e4e4ee] bg-[#fdfdfd] px-2.5">
                  <span className="text-[10px] font-medium text-[#8E96A6]">H</span>
                  <span className="text-[11px] font-medium text-[#171421]">{displayH}</span>
                </div>
              </div>
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border border-[#e4e4ee] bg-[#f4f4f7] text-[#5e5d72] hover:bg-[#e9e9ee] transition-colors"
                title="Bloquear relación de aspecto"
              >
                <Link className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Section 3: Rotación */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#8E96A6]">Rotación</h4>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 flex items-center">
                {/* Slider track — rounded ends are fine for track */}
                <div className="h-1 w-full rounded-full bg-[#eeeef5]">
                  <div className="h-full w-0 rounded-full bg-[#5046e5]" />
                </div>
                {/* Slider thumb — circular is semantically correct */}
                <div className="absolute left-0 h-3 w-3 rounded-full border-2 border-[#5046e5] bg-white shadow-xs" />
              </div>
              <span className="w-8 text-right text-[11px] font-medium text-[#171421]">
                {displayRotation}
              </span>
            </div>
          </div>

          {/* Section 4: Opacidad */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#8E96A6]">Opacidad</h4>
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 flex items-center">
                <div className="h-1 w-full rounded-full bg-[#eeeef5]">
                  <div className="h-full w-full rounded-full bg-[#5046e5]" />
                </div>
                <div className="absolute right-0 h-3 w-3 rounded-full border-2 border-[#5046e5] bg-white shadow-xs" />
              </div>
              <span className="w-8 text-right text-[11px] font-medium text-[#171421]">
                {displayOpacity}
              </span>
            </div>
          </div>

          {/* Section 5: Colores — swatches stay circular (semantic exception) */}
          <div className="space-y-1.5 pt-0.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#8E96A6]">Colores</h4>
            <p className="text-[10px] text-[#8E96A6]">Colores del diseño</p>
            <div className="flex items-center gap-1.5">
              {/* Color swatches remain circular — semantic exception to 5px rule */}
              <div className="h-5 w-5 rounded-full bg-[#1a1936] cursor-pointer ring-1 ring-black/10" />
              <div className="h-5 w-5 rounded-full bg-[#6b46c1] cursor-pointer ring-1 ring-black/10" />
              <div className="h-5 w-5 rounded-full bg-[#ec4899] cursor-pointer ring-1 ring-black/10" />
              <div className="h-5 w-5 rounded-full bg-[#f97316] cursor-pointer ring-1 ring-black/10" />
              <div className="h-5 w-5 rounded-full bg-[#06b6d4] cursor-pointer ring-1 ring-black/10" />
              <div className="h-5 w-5 rounded-full bg-[#eab308] cursor-pointer ring-1 ring-black/10" />
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5046e5] text-white"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Section 6: Catálogo de productos */}
          <div className="space-y-1.5 pt-1.5 border-t border-[#eeeef5]">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-[#8E96A6]">Catálogo de productos</h4>
            <div className="space-y-1">
              {products.map(renderProductCard)}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
