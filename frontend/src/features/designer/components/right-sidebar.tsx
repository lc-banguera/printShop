import { ScrollArea } from '@/shared/ui/scroll-area';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';
import type { CanvasState, CanvasElement } from '@/types/canvas';

// Fallback values for when product doesn't define its own sizes or print methods.
// These will never be used once the API populates availableSizes / availablePrintMethods
// per product/store (see ProductDefinition type documentation).
const FALLBACK_SIZES: string[] = ['S', 'M', 'L', 'XL', 'XXL'];
const FALLBACK_PRINT_METHODS: string[] = ['DTF', 'Sublimación', 'Vinilo', 'Bordado'];

export function RightSidebar() {
  const selectedElementId = useCanvasStore((state: CanvasState) => state.selectedElementId);
  const elements = useCanvasStore((state: CanvasState) => state.elements);
  const updateElement = useCanvasStore((state) => state.updateElement);

  const activeProduct = useViewerStore((state) => state.activeProduct);
  const selectedSize = useViewerStore((state) => state.selectedSize ?? 'M');
  const setSelectedSize = useViewerStore((state) => state.setSelectedSize ?? (() => {}));
  const selectedPrintMethod = useViewerStore((state) => state.selectedPrintMethod ?? '');
  const setSelectedPrintMethod = useViewerStore((state) => state.setSelectedPrintMethod ?? (() => {}));

  const aspectLocked = true;

  // Read sizes and print methods from the active product definition.
  // This is the architecture-ready pattern: when the API is connected, these will
  // come from the product/offer/store response (availableSizes, availablePrintMethods).
  const availableSizes = activeProduct.availableSizes ?? FALLBACK_SIZES;
  const availablePrintMethods = activeProduct.availablePrintMethods ?? FALLBACK_PRINT_METHODS;

  const selectedElement: CanvasElement | undefined = selectedElementId
    ? elements.find((el) => el.id === selectedElementId)
    : undefined;

  // Conversion: 10px = 1cm for garment scale
  const pxToCm = (px: number) => (px / 10).toFixed(1);
  const cmToPx = (cm: number) => cm * 10;

  const widthCm = selectedElement ? pxToCm(selectedElement.width) : '0';
  const heightCm = selectedElement ? pxToCm(selectedElement.height) : '0';
  const opacityVal = selectedElement ? Math.round((selectedElement.opacity ?? 1) * 100) : 100;
  const designPalette = selectedElement && selectedElement.type !== 'image'
    ? [...new Set([selectedElement.fill, selectedElement.stroke].filter((color): color is string => Boolean(color && /^#[0-9a-f]{6}$/i.test(color))))]
    : [];

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
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3.5 space-y-4">

          {/* ── SECTION: TAMAÑO (CM) ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Tamaño</h4>
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
                Sin diseños
              </div>
            )}
          </div>

          {/* ── SECTION: OPACIDAD DEL DISEÑO ── */}
          {selectedElement && (
            <div className="space-y-1.5 border-t border-[#eeeef5] pt-3">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Opacidad</h4>
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

          {/* Displays only explicit colors already present on the selected element. */}
          {selectedElement && (
            <div className="space-y-2 border-t border-[#eeeef5] pt-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Colores del diseño</h4>
              {designPalette.length > 0 ? (
                <div role="group" aria-label="Colores detectados del diseño" className="flex items-center gap-2">
                  {designPalette.map((color) => <span key={color} title={color} aria-label={color} className="h-5 w-5 rounded-full border border-black/15" style={{ backgroundColor: color }} />)}
                </div>
              ) : (
                <p className="text-[10px] text-[#908fa3] opacity-70">Selección de color disponible para diseños compatibles.</p>
              )}
            </div>
          )}

          {/* ── SECTION: CONFIGURACIÓN DE PRENDA ──
              Tallas disponibles y Técnicas disponibles se leen del producto activo.
              ARCHITECTURE NOTE: cuando el modelo de negocio esté conectado con la API,
              estas listas vendrán de activeProduct.availableSizes y
              activeProduct.availablePrintMethods, que serán populadas por el servidor
              según el producto y la oferta de la tienda. Ver ProductDefinition en types/product.ts. */}
          <div className="space-y-3 border-t border-[#eeeef5] pt-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8E96A6]">Configuración de prenda</h4>

            {/* Tallas disponibles */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#5e5d72]">Tallas disponibles</span>
              <div className="flex flex-wrap items-center gap-1">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`h-7 min-w-[32px] px-2 rounded-[5px] border text-[11px] font-semibold transition-all ${
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

            {/* Técnicas disponibles */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-[#5e5d72]">Técnicas disponibles</span>
              <div className="grid grid-cols-2 gap-1.5">
                {availablePrintMethods.map((m) => {
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
