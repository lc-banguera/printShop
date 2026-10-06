import { ChevronDown } from 'lucide-react';
import { useViewerStore } from '@/store/viewer-store';
import { GarmentColorPicker, garmentColorName } from './garment-color-picker';

export function BottomPanel() {
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const currentGarmentColor = useViewerStore((state) => state.currentGarmentColor);
  const setGarmentColorPickerOpen = useViewerStore((state) => state.setGarmentColorPickerOpen);

  return (
    <div className="z-30 flex h-[72px] w-full shrink-0 select-none items-center justify-between border-t border-border bg-surface px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[5px] border border-border bg-surfaceMuted p-1 shadow-2xs">
          <img src={activeProduct.thumbnail} alt={activeProduct.name} className="h-full w-full rounded-[3px] object-contain" />
        </div>
        <div><h3 className="text-xs font-bold text-foreground">{activeProduct.name}</h3><span className="text-[10px] text-foregroundMuted">Algodón 100% · 180 GSM</span></div>
      </div>

      <div className="flex flex-col items-center">
        <span className="mb-1 text-[10px] font-medium text-foregroundMuted">Color de prenda</span>
        <button type="button" onClick={() => setGarmentColorPickerOpen(true)} aria-haspopup="dialog" className="flex items-center gap-2 rounded-[5px] border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs hover:border-primary/40 hover:bg-surfaceMuted">
          <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: currentGarmentColor }} />
          <span className="text-[11px] font-medium">{garmentColorName(currentGarmentColor)}</span>
          <ChevronDown className="h-3 w-3 text-foregroundMuted" />
        </button>
      </div>

      <div className="flex items-center gap-5 border-l border-border pl-5">
        <div className="flex flex-col text-right"><span className="text-[10px] text-foregroundMuted">Precio base</span><span className="text-xs font-semibold text-foregroundMuted">$ 49.900</span></div>
        <div className="flex flex-col text-right"><span className="text-[9px] font-semibold uppercase tracking-wider text-foregroundMuted">Total estimado</span><span className="text-lg font-black leading-tight text-primary">$ 49.900</span></div>
      </div>
      <GarmentColorPicker />
    </div>
  );
}
