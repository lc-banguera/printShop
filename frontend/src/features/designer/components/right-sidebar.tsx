import { useState, useRef } from 'react';
import { Pipette, Lock, Unlock } from 'lucide-react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';
import type { CanvasState, CanvasElement } from '@/types/canvas';

export function RightSidebar() {
  const selectedElementId = useCanvasStore((state: CanvasState) => state.selectedElementId);
  const elements = useCanvasStore((state: CanvasState) => state.elements);
  const updateElement = useCanvasStore((state) => state.updateElement);

  const selectedSize = useViewerStore((state) => state.selectedSize ?? 'M');
  const setSelectedSize = useViewerStore((state) => state.setSelectedSize ?? (() => {}));
  const selectedPrintMethod = useViewerStore((state) => state.selectedPrintMethod ?? 'DTF');
  const setSelectedPrintMethod = useViewerStore((state) => state.setSelectedPrintMethod ?? (() => {}));

  const colorInputRef = useRef<HTMLInputElement>(null);
  const [aspectLocked, setAspectLocked] = useState(true);

  const selectedElement: CanvasElement | undefined = selectedElementId
    ? elements.find((el) => el.id === selectedElementId)
    : undefined;

  // Conversion: convert pixels to real-world centimeters (approx 10px = 1cm for garment scale)
  const pxToCm = (px: number) => (px / 10).toFixed(1);
  const cmToPx = (cm: number) => cm * 10;

  const widthCm = selectedElement ? pxToCm(selectedElement.width) : '18.0';
  const heightCm = selectedElement ? pxToCm(selectedElement.height) : '18.0';
  const rotationDeg = selectedElement ? Math.round(selectedElement.rotation ?? 0) : 0;
  const opacityVal = selectedElement ? Math.round((selectedElement.opacity ?? 1) * 100) : 100;

  // Dynamic colors extracted or active for selected artwork
  const elementColors = [
    selectedElement?.fill || '#1a1936',
    '#f97316',
    '#06b6d4',
    '#ec4899',
    '#eab308',
    '#ffffff',
  ];

  // EyeDropper API or fallback native color picker
  const handlePickColor = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex && selectedElement) {
          updateElement(selectedElement.id, { fill: result.sRGBHex });
        }
      } catch {
        // User cancelled picker
      }
    } else {
      colorInputRef.current?.click();
    }
  };

  const handleWidthChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || !selectedElement) return;
    const newW = cmToPx(val);
    if (aspectLocked && selectedElement.width > 0) {
      const ratio = selectedElement.height / selectedElement.width;
      updateElement(selectedElement.id, { width: newW, height: newW * ratio });
    } else {
      updateElement(selectedElement.id, { width: newW });
    }
  };

  const handleHeightChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val) || !selectedElement) return;
    const newH = cmToPx(val);
    if (aspectLocked && selectedElement.height > 0) {
      const ratio = selectedElement.width / selectedElement.height;
      updateElement(selectedElement.id, { height: newH, width: newH * ratio });
    } else {
      updateElement(selectedElement.id, { height: newH });
    }
  };

  return (
    <aside className="flex w-[290px] shrink-0 flex-col border-l border-[#e8e8f0] bg-white select-none">
      {/* Header */}
      <div className="flex border-b border-[#e8e8f0] px-4 py-3 bg-white items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#171421]">Propiedades</h3>
          <p className="text-[10px] text-[#8E96A6] mt-0.5">
            {selectedElement ? (selectedElement.name || 'Diseño seleccionado') : 'Sin diseño seleccionado'}
          </p>
        </div>
        {selectedElement && (
          <span className="rounded-[5px] bg-[#eeebff] px-2 py-0.5 text-[9px] font-semibold text-[#5046e5]">
            Activo
          </span>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3.5 space-y-4">
          {/* SECTION: TAMAÑO (CM) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Tamaño</h4>
              {selectedElement && (
                <button
                  type="button"
                  onClick={() => setAspectLocked(!aspectLocked)}
                  className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${
                    aspectLocked ? 'text-[#5046e5]' : 'text-[#8E96A6]'
                  }`}
                  title="Bloquear proporción"
                >
                  {aspectLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  <span>{aspectLocked ? 'Bloqueado' : 'Libre'}</span>
                </button>
              )}
            </div>

            {selectedElement ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex h-8 items-center justify-between rounded-[5px] border border-[#e4e4ee] bg-[#fafafc] px-2.5">
                  <span className="text-[10px] font-medium text-[#8E96A6]">Ancho</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="40"
                      value={widthCm}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-12 text-right text-[11px] font-semibold text-[#171421] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-[#8E96A6]">cm</span>
                  </div>
                </div>
                <div className="flex h-8 items-center justify-between rounded-[5px] border border-[#e4e4ee] bg-[#fafafc] px-2.5">
                  <span className="text-[10px] font-medium text-[#8E96A6]">Alto</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="50"
                      value={heightCm}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-12 text-right text-[11px] font-semibold text-[#171421] bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-[#8E96A6]">cm</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[5px] border border-dashed border-[#e4e4ee] bg-[#fafafc] p-2.5 text-center text-[11px] text-[#908fa3]">
                Sin diseños seleccionados
              </div>
            )}
          </div>

          {/* SECTION: ROTACIÓN DEL DISEÑO */}
          {selectedElement && (
            <div className="space-y-1.5 border-t border-[#eeeef5] pt-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Rotación del diseño</h4>
                <span className="text-[11px] font-semibold text-[#171421]">{rotationDeg}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotationDeg}
                onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#eeeef5] rounded-full accent-[#5046e5] cursor-pointer"
              />
            </div>
          )}

          {/* SECTION: OPACIDAD DEL DISEÑO */}
          {selectedElement && (
            <div className="space-y-1.5 border-t border-[#eeeef5] pt-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Opacidad del diseño</h4>
                <span className="text-[11px] font-semibold text-[#171421]">{opacityVal}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacityVal}
                onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) / 100 })}
                className="w-full h-1.5 bg-[#eeeef5] rounded-full accent-[#5046e5] cursor-pointer"
              />
            </div>
          )}

          {/* SECTION: COLORES DEL DISEÑO + EYEDROPPER / COLOR PICKER */}
          {selectedElement && (
            <div className="space-y-2 border-t border-[#eeeef5] pt-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Colores del diseño</h4>
                <span className="text-[10px] text-[#8E96A6]">Paleta activa</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                  {elementColors.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateElement(selectedElement.id, { fill: col })}
                      className="h-5 w-5 rounded-full ring-1 ring-black/10 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: col }}
                      title={`Color ${col}`}
                    />
                  ))}
                </div>

                {/* Eyedropper / Color Picker Tool */}
                <button
                  type="button"
                  onClick={handlePickColor}
                  className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-[#e4e4ee] bg-[#fafafc] text-[#5046e5] hover:bg-[#eeebff] transition-all cursor-pointer"
                  title="Cuentagotas / Seleccionar color exacto"
                >
                  <Pipette className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  className="sr-only"
                  onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* SECTION: CONFIGURACIÓN DEL PRODUCTO (Técnica & Talla) */}
          <div className="space-y-3 border-t border-[#eeeef5] pt-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Configuración de prenda</h4>

            {/* Talla */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#5e5d72]">Talla de la prenda</span>
              <div className="flex items-center gap-1">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`flex-1 h-7 rounded-[5px] border text-[11px] font-semibold transition-all ${
                        isSelected
                          ? 'border-[#5046e5] bg-[#eeebff] text-[#5046e5]'
                          : 'border-[#e4e4ee] bg-white text-[#5e5d72] hover:bg-[#fafafc]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Técnica de impresión */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#5e5d72]">Técnica de impresión</span>
              <div className="grid grid-cols-2 gap-1.5">
                {['DTF', 'Sublimación', 'Vinilo', 'Bordado'].map((m) => {
                  const isSelected = selectedPrintMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedPrintMethod(m)}
                      className={`h-7 rounded-[5px] border px-2 text-[10px] font-semibold transition-all text-center ${
                        isSelected
                          ? 'border-[#5046e5] bg-[#eeebff] text-[#5046e5]'
                          : 'border-[#e4e4ee] bg-white text-[#5e5d72] hover:bg-[#fafafc]'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
