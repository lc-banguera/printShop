import { useState, useRef } from 'react';
import { useViewerStore } from '@/store/viewer-store';
import { ChevronDown, Plus } from 'lucide-react';

const GARMENT_COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'Blanco',
  '#111111': 'Negro',
  '#8b8b8b': 'Gris',
  '#d94a3d': 'Rojo',
  '#f08a2b': 'Naranja',
  '#f2d04b': 'Amarillo',
  '#4f9e47': 'Verde',
  '#1f9bd6': 'Celeste',
  '#3f5bd2': 'Azul',
  '#7e3fc3': 'Morado',
  '#d96aa5': 'Rosado',
  '#8c5a2b': 'Marrón',
};

export function BottomPanel() {
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const selectedColorIndex = useViewerStore((state) => state.selectedColorIndex);
  const garmentColors = useViewerStore((state) => state.garmentColors);
  const selectGarmentColor = useViewerStore((state) => state.selectGarmentColor);
  const updateGarmentColor = useViewerStore((state) => state.updateGarmentColor);
  const currentGarmentColor = useViewerStore((state) => state.currentGarmentColor);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const customColorInputRef = useRef<HTMLInputElement>(null);

  const colorName =
    GARMENT_COLOR_NAMES[currentGarmentColor.toLowerCase()] ||
    GARMENT_COLOR_NAMES[garmentColors[selectedColorIndex]?.toLowerCase()] ||
    'Personalizado';

  return (
    <div className="flex h-[72px] w-full items-center justify-between border-t border-[#e8e8f0] bg-white px-6 shadow-xs select-none shrink-0 z-30">
      {/* ── 1. Left: Product summary & details ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[5px] border border-[#e5e5ee] bg-[#fafafc] p-1 shadow-2xs">
          <img
            src={activeProduct.thumbnail}
            alt={activeProduct.name}
            className="h-full w-full object-contain rounded-[3px]"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-[#171421] leading-tight">
            {activeProduct.name}
          </h3>
          <span className="text-[10px] text-[#8E96A6] mt-0.5">
            Algodón 100% · 180 GSM · Frente personalizable
          </span>
        </div>
      </div>

      {/* ── 2. Center: Single current garment color control with popover ── */}
      <div className="relative">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-medium text-[#8E96A6] mb-1">Color de prenda</span>
          <button
            type="button"
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            className="flex items-center gap-2 rounded-[5px] border border-[#e4e4ee] bg-white px-2.5 py-1 text-xs font-semibold text-[#171421] hover:border-[#5046e5]/40 hover:bg-[#fafafc] transition-all cursor-pointer shadow-2xs"
          >
            <span
              className="h-4 w-4 rounded-full border border-black/15 shadow-2xs"
              style={{ backgroundColor: currentGarmentColor }}
            />
            <span className="text-[11px] font-medium">{colorName}</span>
            <ChevronDown className="h-3 w-3 text-[#8E96A6]" />
          </button>
        </div>

        {/* Dropdown / Popover of garment colors */}
        {colorPickerOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 rounded-[5px] border border-[#e4e4ee] bg-white p-3 shadow-lg z-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">
                Colores disponibles
              </span>
              <span className="text-[10px] font-semibold text-[#5046e5]">{colorName}</span>
            </div>

            <div className="grid grid-cols-6 gap-2 pt-1">
              {garmentColors.map((color, index) => {
                const isSelected = selectedColorIndex === index;
                const name = GARMENT_COLOR_NAMES[color.toLowerCase()] || `Color ${index + 1}`;

                return (
                  <button
                    key={`${color}-${index}`}
                    type="button"
                    onClick={() => {
                      selectGarmentColor(index);
                      setColorPickerOpen(false);
                    }}
                    className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#5046e5] ring-offset-2 scale-110'
                        : 'ring-1 ring-black/10 hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                );
              })}
            </div>

            {/* Custom color option */}
            <div className="border-t border-[#eeeef5] pt-2 flex items-center justify-between">
              <span className="text-[10px] text-[#5e5d72]">Color personalizado</span>
              <button
                type="button"
                onClick={() => customColorInputRef.current?.click()}
                className="flex items-center gap-1 rounded-[5px] border border-[#e4e4ee] px-2 py-0.5 text-[10px] font-semibold text-[#5046e5] hover:bg-[#eeebff]"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>Elegir</span>
              </button>
              <input
                ref={customColorInputRef}
                type="color"
                className="sr-only"
                value={currentGarmentColor}
                onChange={(e) => {
                  updateGarmentColor(selectedColorIndex, e.target.value);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Right: Clean pricing summary (Base price & Total) ── */}
      <div className="flex items-center gap-5 border-l border-[#eeeef5] pl-5">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-[#8E96A6]">Precio base</span>
          <span className="text-xs font-semibold text-[#5e5d72]">$ 49.900</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8E96A6]">Total estimado</span>
          <span className="text-lg font-black text-[#5046e5] leading-tight">$ 49.900</span>
        </div>
      </div>
    </div>
  );
}
