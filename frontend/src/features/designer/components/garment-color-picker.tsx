import { useEffect, useRef, useState } from 'react';
import { Check, Pipette, X } from 'lucide-react';
import { useViewerStore } from '@/store/viewer-store';

const COLOR_NAMES: Record<string, string> = {
  '#ffffff': 'Blanco',
  '#111111': 'Negro',
  '#171421': 'Negro',
};

interface HsvColor {
  hue: number;
  saturation: number;
  value: number;
}

function hexToHsv(hex: string): HsvColor {
  const clean = hex.replace('#', '');
  const red = parseInt(clean.slice(0, 2), 16) / 255;
  const green = parseInt(clean.slice(2, 4), 16) / 255;
  const blue = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const hue = delta === 0 ? 0 : 60 * (((max === red ? (green - blue) / delta : max === green ? 2 + (blue - red) / delta : 4 + (red - green) / delta) + 6) % 6);
  return { hue, saturation: max === 0 ? 0 : delta / max, value: max };
}

function hsvToHex({ hue, saturation, value }: HsvColor) {
  const chroma = value * saturation;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const match = value - chroma;
  const [red, green, blue] = hue < 60 ? [chroma, x, 0] : hue < 120 ? [x, chroma, 0] : hue < 180 ? [0, chroma, x] : hue < 240 ? [0, x, chroma] : hue < 300 ? [x, 0, chroma] : [chroma, 0, x];
  return `#${[red, green, blue].map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function garmentColorName(color: string) {
  return COLOR_NAMES[color.toLowerCase()] ?? 'Personalizado';
}

export function GarmentColorPicker() {
  const isOpen = useViewerStore((state) => state.isGarmentColorPickerOpen);
  const setOpen = useViewerStore((state) => state.setGarmentColorPickerOpen);
  const colors = useViewerStore((state) => state.garmentColors);
  const currentColor = useViewerStore((state) => state.currentGarmentColor);
  const selectedColorIndex = useViewerStore((state) => state.selectedColorIndex);
  const setProductColor = useViewerStore((state) => state.setProductColor);
  const selectGarmentColor = useViewerStore((state) => state.selectGarmentColor);
  const dialogRef = useRef<HTMLDivElement>(null);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef({ color: currentColor, index: selectedColorIndex });
  const [draft, setDraft] = useState(currentColor);

  const preview = (color: string) => {
    setDraft(color);
    setProductColor(color);
  };

  useEffect(() => {
    if (!isOpen) return;
    initialRef.current = { color: currentColor, index: selectedColorIndex };
    setDraft(currentColor);
    dialogRef.current?.focus();
  }, [currentColor, isOpen, selectedColorIndex]);

  const closeWithCancel = () => {
    selectGarmentColor(initialRef.current.index);
    setOpen(false);
  };

  const apply = () => {
    const paletteIndex = colors.findIndex((color) => color.toLowerCase() === draft.toLowerCase());
    if (paletteIndex >= 0) selectGarmentColor(paletteIndex);
    else setProductColor(draft);
    setOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWithCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const hsv = hexToHsv(draft);
  const hueColor = hsvToHex({ hue: hsv.hue, saturation: 1, value: 1 });
  const setFromArea = (clientX: number, clientY: number) => {
    const bounds = colorAreaRef.current?.getBoundingClientRect();
    if (!bounds) return;
    preview(hsvToHex({ hue: hsv.hue, saturation: Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width)), value: Math.max(0, Math.min(1, 1 - (clientY - bounds.top) / bounds.height)) }));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWithCancel(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="garment-color-title" tabIndex={-1} className="w-full max-w-[380px] rounded-[5px] border border-border bg-surface shadow-modal outline-none">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div><h2 id="garment-color-title" className="text-sm font-semibold text-foreground">Color de prenda</h2><p className="mt-0.5 text-[11px] text-foregroundMuted">Previsualiza el color antes de aplicarlo.</p></div>
          <button type="button" onClick={closeWithCancel} className="rounded-[5px] p-1.5 text-foregroundMuted hover:bg-surfaceMuted" aria-label="Cerrar selector de color"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-4 px-5 py-4">
          <section><p className="mb-1.5 text-[11px] font-semibold text-foregroundMuted">Color actual</p><div className="flex items-center gap-3 rounded-[5px] border border-border bg-surfaceMuted px-3 py-2.5"><span className="h-6 w-6 rounded-full border border-black/15" style={{ backgroundColor: draft }} /><div><p className="text-xs font-semibold text-foreground">{garmentColorName(draft)}</p><p className="font-mono text-[11px] text-foregroundMuted">{draft.toUpperCase()}</p></div></div></section>
          <section><p className="mb-2 text-[11px] font-semibold text-foregroundMuted">Colores disponibles</p><div className="flex flex-wrap gap-2">{colors.map((color, index) => <button key={`${color}-${index}`} type="button" onClick={() => preview(color)} aria-label={`Previsualizar ${garmentColorName(color)}`} aria-pressed={draft.toLowerCase() === color.toLowerCase()} className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-105 ${draft.toLowerCase() === color.toLowerCase() ? 'border-primary ring-2 ring-primary/25' : 'border-black/15'}`} style={{ backgroundColor: color }}>{draft.toLowerCase() === color.toLowerCase() && <Check className={`h-4 w-4 ${color.toLowerCase() === '#ffffff' ? 'text-foreground' : 'text-white'}`} />}</button>)}</div></section>
          <section className="border-t border-border pt-4"><div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-semibold text-foregroundMuted">Elegir color</p><button type="button" onClick={() => document.getElementById('garment-hex')?.focus()} className="flex items-center gap-1 rounded-[5px] px-1.5 py-1 text-[11px] font-semibold text-primary hover:bg-surfaceMuted"><Pipette className="h-3.5 w-3.5" />Cuentagotas</button></div>
            <div ref={colorAreaRef} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setFromArea(event.clientX, event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromArea(event.clientX, event.clientY); }} className="relative h-32 cursor-crosshair rounded-[5px]" style={{ backgroundColor: hueColor, backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)' }}><span className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm" style={{ left: `${hsv.saturation * 100}%`, top: `${(1 - hsv.value) * 100}%` }} /></div>
            <input aria-label="Tono" type="range" min="0" max="359" value={Math.round(hsv.hue)} onChange={(event) => preview(hsvToHex({ ...hsv, hue: Number(event.target.value) }))} className="mt-3 h-2 w-full cursor-pointer accent-primary" />
            <div className="mt-3 flex items-center gap-2"><span className="h-9 w-9 shrink-0 rounded-[5px] border border-border" style={{ backgroundColor: draft }} /><label className="flex h-9 flex-1 items-center rounded-[5px] border border-border bg-surface px-2"><span className="mr-1 text-[11px] text-foregroundMuted">HEX</span><input id="garment-hex" value={draft.toUpperCase()} onChange={(event) => { const value = event.target.value; if (/^#[0-9A-Fa-f]{6}$/.test(value)) preview(value); else setDraft(value); }} onBlur={() => { if (!/^#[0-9A-Fa-f]{6}$/.test(draft)) preview(currentColor); }} maxLength={7} className="min-w-0 flex-1 bg-transparent font-mono text-xs text-foreground outline-none" /></label></div>
          </section>
        </div>
        <footer className="flex justify-end gap-2 border-t border-border px-5 py-3"><button type="button" onClick={closeWithCancel} className="h-8 rounded-[5px] border border-border px-3 text-xs font-semibold text-foreground hover:bg-surfaceMuted">Cancelar</button><button type="button" onClick={apply} className="h-8 rounded-[5px] bg-primary px-3 text-xs font-semibold text-primaryForeground hover:bg-primaryHover">Aplicar</button></footer>
      </div>
    </div>
  );
}
