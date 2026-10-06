import { useEffect, useRef, useState } from 'react';
import { Check, Pipette, X } from 'lucide-react';
import { useViewerStore } from '@/store/viewer-store';

const GARMENT_SWATCHES = [
  '#ffffff', '#e5e7eb', '#9ca3af', '#4b5563', '#111111', '#7f1d1d', '#dc2626', '#f97316', '#facc15', '#84cc16', '#16a34a', '#14b8a6', '#06b6d4', '#2563eb', '#4f46e5', '#7c3aed', '#c026d3', '#db2777', '#92400e', '#f5d0a9',
];
const NAMES: Record<string, string> = { '#ffffff': 'Blanco', '#111111': 'Negro', '#171421': 'Negro' };
type Mode = 'garment' | 'design';
interface Hsv { h: number; s: number; v: number }
type EyeDropperWindow = Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } };

const nameFor = (color: string) => NAMES[color.toLowerCase()] ?? 'Personalizado';
export const garmentColorName = nameFor;

function toHsv(hex: string): Hsv {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return { h: 0, s: 0, v: 0 };
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const delta = max - min;
  const h = delta === 0 ? 0 : 60 * (((max === r ? (g - b) / delta : max === g ? 2 + (b - r) / delta : 4 + (r - g) / delta) + 6) % 6);
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}
function toHex({ h, s, v }: Hsv) {
  const c = v * s; const x = c * (1 - Math.abs((h / 60) % 2 - 1)); const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return `#${[r, g, b].map((channel) => Math.round((channel + m) * 255).toString(16).padStart(2, '0')).join('')}`;
}

/** Shared modal infrastructure. The context controls copy, palette, and apply action. */
export function ColorPickerModal() {
  const open = useViewerStore((state) => state.isGarmentColorPickerOpen);
  const setOpen = useViewerStore((state) => state.setGarmentColorPickerOpen);
  const mode = useViewerStore((state) => state.colorPickerContext) as Mode;
  const productColor = useViewerStore((state) => state.currentGarmentColor);
  const selectedColorIndex = useViewerStore((state) => state.selectedColorIndex);
  const selectGarmentColor = useViewerStore((state) => state.selectGarmentColor);
  const setProductColor = useViewerStore((state) => state.setProductColor);
  const dialogRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef({ color: productColor, index: selectedColorIndex });
  const [draft, setDraft] = useState(productColor);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [isPixelPicking, setIsPixelPicking] = useState(false);
  const [pickerMessage, setPickerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    initialRef.current = { color: productColor, index: selectedColorIndex };
    setDraft(productColor);
    setPickerMessage(null);
    dialogRef.current?.focus();
  }, [open, productColor, selectedColorIndex]);
  const preview = (color: string) => { setDraft(color); if (mode === 'garment') setProductColor(color); };
  const cancel = () => { if (mode === 'garment') selectGarmentColor(initialRef.current.index); setOpen(false); };
  const apply = () => { if (mode === 'garment') { const index = GARMENT_SWATCHES.findIndex((color) => color === draft.toLowerCase()); index >= 0 ? setProductColor(draft) : setProductColor(draft); } setOpen(false); };
  const startSpecificPick = async () => {
    const NativeEyeDropper = (window as EyeDropperWindow).EyeDropper;
    if (!NativeEyeDropper) {
      setPickerMessage('La selección por píxel no está disponible en este navegador.');
      return;
    }
    setOpen(false);
    setIsPixelPicking(true);
    try {
      const result = await new NativeEyeDropper().open();
      const color = result.sRGBHex.toLowerCase();
      setCustomColors((colors) => colors.includes(color) || GARMENT_SWATCHES.includes(color) ? colors : [...colors, color]);
      preview(color);
    } catch {
      // Dismissing the native pixel selector preserves the current candidate.
    } finally {
      setIsPixelPicking(false);
      setOpen(true);
    }
  };
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') cancel(); }; if (open) window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); });
  if (!open && !isPixelPicking) return null;

  if (isPixelPicking) {
    return <div className="fixed inset-0 z-[70] cursor-crosshair" aria-live="polite">
      <span className="sr-only">Selección específica activa. El selector nativo muestra una lupa de píxel; pulsa Escape para cancelar.</span>
    </div>;
  }

  const hsv = toHsv(draft); const hue = toHex({ h: hsv.h, s: 1, v: 1 });
  const selectArea = (x: number, y: number) => { const bounds = areaRef.current?.getBoundingClientRect(); if (!bounds) return; preview(toHex({ h: hsv.h, s: Math.max(0, Math.min(1, (x - bounds.left) / bounds.width)), v: Math.max(0, Math.min(1, 1 - (y - bounds.top) / bounds.height)) })); };
  const title = mode === 'garment' ? 'Color de prenda' : 'Colores del diseño';
  const palette = mode === 'garment' ? [...new Set([...GARMENT_SWATCHES, ...customColors, draft.toLowerCase()])] : [];

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) cancel(); }}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="color-picker-title" tabIndex={-1} className="w-full max-w-[640px] rounded-[5px] border border-border bg-surface shadow-modal outline-none">
      <header className="flex items-center justify-between border-b border-border px-5 py-3"><div><h2 id="color-picker-title" className="text-sm font-semibold text-foreground">{title}</h2><p className="mt-0.5 text-[11px] text-foregroundMuted">Previsualiza el color antes de aplicarlo.</p></div><button type="button" onClick={cancel} className="rounded-[5px] p-1.5 text-foregroundMuted hover:bg-surfaceMuted" aria-label="Cerrar selector de color"><X className="h-4 w-4" /></button></header>
      <div className="grid gap-5 px-5 py-4 sm:grid-cols-[0.9fr_1.1fr]">
        <section className="border-b border-border pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5"><p className="mb-2 text-[11px] font-semibold text-foregroundMuted">Color actual</p><div className="flex items-center gap-3 rounded-[5px] border border-border bg-surfaceMuted p-3"><span className="h-8 w-8 rounded-full border border-black/15" style={{ backgroundColor: draft }} /><div><p className="text-xs font-semibold text-foreground">{nameFor(draft)}</p><p className="font-mono text-[11px] text-foregroundMuted">{draft.toUpperCase()}</p></div></div><p className="mb-2 mt-5 text-[11px] font-semibold text-foregroundMuted">Todos los colores</p><div className="grid grid-cols-5 gap-2">{palette.map((color) => <button key={color} type="button" onClick={() => preview(color)} aria-label={`Previsualizar ${color}`} aria-pressed={draft.toLowerCase() === color} className={`flex h-7 w-7 items-center justify-center rounded-full border ${draft.toLowerCase() === color ? 'border-primary ring-2 ring-primary/25' : 'border-black/15'}`} style={{ backgroundColor: color }}>{draft.toLowerCase() === color && <Check className={`h-3.5 w-3.5 ${color === '#ffffff' || color === '#e5e7eb' || color === '#facc15' ? 'text-foreground' : 'text-white'}`} />}</button>)}</div></section>
        <section><div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-semibold text-foregroundMuted">Elegir color</p><button type="button" onClick={startSpecificPick} className="flex items-center gap-1 rounded-[5px] px-1.5 py-1 text-[11px] font-semibold text-primary hover:bg-surfaceMuted"><Pipette className="h-3.5 w-3.5" />Selección específica</button></div>{pickerMessage && <p className="mb-2 text-[11px] text-foregroundMuted">{pickerMessage}</p>}<div ref={areaRef} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); selectArea(event.clientX, event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) selectArea(event.clientX, event.clientY); }} className="relative h-32 cursor-crosshair rounded-[5px]" style={{ backgroundColor: hue, backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)' }}><span className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} /></div><input aria-label="Tono" type="range" min="0" max="359" value={Math.round(hsv.h)} onChange={(event) => preview(toHex({ ...hsv, h: Number(event.target.value) }))} className="mt-3 h-2 w-full cursor-pointer accent-primary" /><label className="mt-3 flex h-9 items-center rounded-[5px] border border-border bg-surface px-2"><span className="mr-2 text-[11px] text-foregroundMuted">HEX</span><input id="color-picker-hex" value={draft.toUpperCase()} onChange={(event) => { const value = event.target.value; if (/^#[0-9a-f]{6}$/i.test(value)) preview(value); else setDraft(value); }} onBlur={() => { if (!/^#[0-9a-f]{6}$/i.test(draft)) preview(productColor); }} maxLength={7} className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground outline-none" /></label></section>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border px-5 py-3"><button type="button" onClick={cancel} className="h-8 rounded-[5px] border border-border px-3 text-xs font-semibold text-foreground hover:bg-surfaceMuted">Cancelar</button><button type="button" onClick={apply} className="h-8 rounded-[5px] bg-primary px-3 text-xs font-semibold text-primaryForeground hover:bg-primaryHover">Aplicar</button></footer>
    </div>
  </div>;
}

export const GarmentColorPicker = ColorPickerModal;
