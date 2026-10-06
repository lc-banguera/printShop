import { useCallback, useEffect, useRef, useState } from 'react';
import { useViewerStore } from '@/store/viewer-store';
import { ChevronDown, Pipette, Plus, X } from 'lucide-react';

const COLOR_NAMES: Record<string, string> = { '#ffffff': 'Blanco', '#111111': 'Negro', '#171421': 'Negro' };
type EyeDropperWindow = Window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } };
interface MagnifierState { x: number; y: number; hex: string; pixels: ImageData }

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function PixelMagnifier({ sample }: { sample: MagnifierState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const cell = 10;
    canvas.width = 150;
    canvas.height = 150;
    for (let row = 0; row < 15; row += 1) for (let column = 0; column < 15; column += 1) {
      const pixel = (row * 15 + column) * 4;
      context.fillStyle = `rgb(${sample.pixels.data[pixel]}, ${sample.pixels.data[pixel + 1]}, ${sample.pixels.data[pixel + 2]})`;
      context.fillRect(column * cell, row * cell, cell, cell);
    }
    context.strokeStyle = 'rgba(255,255,255,.28)';
    for (let index = 0; index <= 15; index += 1) {
      context.beginPath(); context.moveTo(index * cell, 0); context.lineTo(index * cell, 150); context.stroke();
      context.beginPath(); context.moveTo(0, index * cell); context.lineTo(150, index * cell); context.stroke();
    }
    context.strokeStyle = '#5046e5'; context.lineWidth = 2; context.strokeRect(7 * cell, 7 * cell, cell, cell);
  }, [sample]);
  return <div className="pointer-events-none fixed z-[80] h-36 w-36 overflow-hidden rounded-full border-2 border-white bg-black shadow-modal" style={{ left: sample.x + 18, top: sample.y + 18 }}>
    <canvas ref={canvasRef} className="h-full w-full" />
    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white">{sample.hex.toUpperCase()}</span>
  </div>;
}

export function BottomPanel() {
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const selectedColorIndex = useViewerStore((state) => state.selectedColorIndex);
  const garmentColors = useViewerStore((state) => state.garmentColors);
  const selectGarmentColor = useViewerStore((state) => state.selectGarmentColor);
  const updateGarmentColor = useViewerStore((state) => state.updateGarmentColor);
  const currentGarmentColor = useViewerStore((state) => state.currentGarmentColor);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [isSampling, setIsSampling] = useState(false);
  const [magnifier, setMagnifier] = useState<MagnifierState | null>(null);
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const captureVideoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureStreamRef = useRef<MediaStream | null>(null);

  const stopScreenSampler = useCallback(() => {
    captureStreamRef.current?.getTracks().forEach((track) => track.stop());
    captureStreamRef.current = null;
    captureVideoRef.current?.remove();
    captureVideoRef.current = null;
    captureCanvasRef.current = null;
    setIsSampling(false); setMagnifier(null);
  }, []);
  useEffect(() => stopScreenSampler, [stopScreenSampler]);

  const readCapturedColor = useCallback((clientX: number, clientY: number) => {
    const video = captureVideoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
    const canvas = captureCanvasRef.current ?? document.createElement('canvas');
    captureCanvasRef.current = canvas; canvas.width = 15; canvas.height = 15;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    const sourceX = Math.round(clientX * (video.videoWidth / window.innerWidth));
    const sourceY = Math.round(clientY * (video.videoHeight / window.innerHeight));
    context.drawImage(video, sourceX - 7, sourceY - 7, 15, 15, 0, 0, 15, 15);
    const pixels = context.getImageData(0, 0, 15, 15);
    const middle = ((7 * 15) + 7) * 4;
    return { hex: rgbToHex(pixels.data[middle], pixels.data[middle + 1], pixels.data[middle + 2]), pixels };
  }, []);

  useEffect(() => {
    if (!isSampling) return;
    const move = (event: PointerEvent) => {
      const sample = readCapturedColor(event.clientX, event.clientY);
      if (sample) setMagnifier({ x: event.clientX, y: event.clientY, ...sample });
    };
    const apply = (event: MouseEvent) => {
      const sample = readCapturedColor(event.clientX, event.clientY);
      if (!sample) return;
      event.preventDefault(); event.stopPropagation();
      updateGarmentColor(selectedColorIndex, sample.hex); stopScreenSampler(); setColorPickerOpen(false);
    };
    window.addEventListener('pointermove', move, true); window.addEventListener('click', apply, true);
    return () => { window.removeEventListener('pointermove', move, true); window.removeEventListener('click', apply, true); };
  }, [isSampling, readCapturedColor, selectedColorIndex, stopScreenSampler, updateGarmentColor]);

  const pickGarmentColor = async () => {
    if ('EyeDropper' in window) {
      try {
        const NativeEyeDropper = (window as EyeDropperWindow).EyeDropper;
        const result = await new NativeEyeDropper!().open();
        updateGarmentColor(selectedColorIndex, result.sRGBHex); setColorPickerOpen(false);
      } catch { /* Dismissed native picker: retain existing color. */ }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const video = document.createElement('video');
      video.srcObject = stream; video.muted = true; video.playsInline = true; await video.play();
      captureStreamRef.current = stream; captureVideoRef.current = video;
      stream.getVideoTracks()[0]?.addEventListener('ended', stopScreenSampler); setIsSampling(true);
    } catch { customColorInputRef.current?.click(); }
  };

  const colorName = COLOR_NAMES[currentGarmentColor.toLowerCase()] ?? 'Personalizado';
  return <div className="flex h-[72px] w-full shrink-0 select-none items-center justify-between border-t border-border bg-surface px-6 shadow-xs z-30">
    <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-[5px] border border-border bg-surfaceMuted p-1 shadow-2xs"><img src={activeProduct.thumbnail} alt={activeProduct.name} className="h-full w-full rounded-[3px] object-contain" /></div><div><h3 className="text-xs font-bold text-foreground">{activeProduct.name}</h3><span className="text-[10px] text-foregroundMuted">Algodón 100% · 180 GSM</span></div></div>
    <div className="relative"><div className="flex flex-col items-center"><span className="mb-1 text-[10px] font-medium text-foregroundMuted">Color de prenda</span><button type="button" onClick={() => setColorPickerOpen((open) => !open)} aria-haspopup="dialog" aria-expanded={colorPickerOpen} className="flex items-center gap-2 rounded-[5px] border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 hover:bg-surfaceMuted"><span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: currentGarmentColor }} /><span className="text-[11px] font-medium">{colorName}</span><ChevronDown className="h-3 w-3 text-foregroundMuted" /></button></div>
      {colorPickerOpen && <div role="dialog" aria-label="Color de prenda" className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 space-y-3 rounded-[5px] border border-border bg-surface p-3 shadow-modal"><div className="flex items-start justify-between"><div><h4 className="text-xs font-semibold text-foreground">Color de prenda</h4><p className="mt-0.5 text-[10px] text-foregroundMuted">Actual: {colorName} · {currentGarmentColor.toUpperCase()}</p></div><button type="button" onClick={() => setColorPickerOpen(false)} className="rounded-[5px] p-1 text-foregroundMuted hover:bg-surfaceMuted" aria-label="Cerrar selector de color"><X className="h-3.5 w-3.5" /></button></div>
        <div className="grid grid-cols-2 gap-2">{garmentColors.map((color, index) => { const selected = selectedColorIndex === index; const name = COLOR_NAMES[color.toLowerCase()] ?? `Color ${index + 1}`; return <button key={`${color}-${index}`} type="button" onClick={() => { selectGarmentColor(index); setColorPickerOpen(false); }} aria-pressed={selected} className={`flex min-w-0 items-center gap-2 rounded-[5px] border px-2 py-1.5 text-left text-[11px] font-medium ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-surfaceMuted'}`}><span className="h-4 w-4 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: color }} /><span className="truncate">{name}</span></button>; })}</div>
        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3"><button type="button" onClick={() => customColorInputRef.current?.click()} className="flex h-8 items-center justify-center gap-1.5 rounded-[5px] border border-border text-[11px] font-semibold text-primary hover:bg-surfaceMuted"><Plus className="h-3.5 w-3.5" />Elegir color</button><button type="button" onClick={pickGarmentColor} className="flex h-8 items-center justify-center gap-1.5 rounded-[5px] border border-border text-[11px] font-semibold text-primary hover:bg-surfaceMuted"><Pipette className="h-3.5 w-3.5" />Cuentagotas</button><input ref={customColorInputRef} type="color" className="sr-only" value={currentGarmentColor} onChange={(event) => { updateGarmentColor(selectedColorIndex, event.target.value); setColorPickerOpen(false); }} /></div>
      </div>}
    </div>
    <div className="flex items-center gap-5 border-l border-border pl-5"><div className="flex flex-col text-right"><span className="text-[10px] text-foregroundMuted">Precio base</span><span className="text-xs font-semibold text-foregroundMuted">$ 49.900</span></div><div className="flex flex-col text-right"><span className="text-[9px] font-semibold uppercase tracking-wider text-foregroundMuted">Total estimado</span><span className="text-lg font-black leading-tight text-primary">$ 49.900</span></div></div>
    {isSampling && <div className="fixed inset-0 z-[70] cursor-crosshair" aria-live="polite"><span className="sr-only">Mueve el cursor sobre la pestaña y haz clic para seleccionar un color.</span>{magnifier && <PixelMagnifier sample={magnifier} />}<button type="button" onClick={stopScreenSampler} className="fixed right-5 top-5 rounded-[5px] bg-surface px-3 py-2 text-xs font-semibold text-foreground shadow-modal">Cancelar</button></div>}
  </div>;
}
