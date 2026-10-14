import { useViewerStore } from '@/store/viewer-store';
import { GarmentColorPicker } from './garment-color-picker';

export function BottomPanel() {
  const activeProduct = useViewerStore((state) => state.activeProduct);
  const currentGarmentColor = useViewerStore((state) => state.currentGarmentColor);
  const setGarmentColorPickerOpen = useViewerStore((state) => state.setGarmentColorPickerOpen);
  const setColorPickerContext = useViewerStore((state) => state.setColorPickerContext);

  return (
    <div className="z-30 flex h-[72px] w-full shrink-0 select-none items-center justify-between border-t border-border bg-surface px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[5px] border border-border bg-surfaceMuted p-1 shadow-2xs">
          <img src={activeProduct.thumbnail} alt={activeProduct.name} className="h-full w-full rounded-[3px] object-contain" />
        </div>
        <div><h3 className="text-xs font-bold text-foreground">{activeProduct.name}</h3><span className="text-[10px] text-foregroundMuted">Algodón 100% · 180 GSM</span></div>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={() => { setColorPickerContext('garment'); setGarmentColorPickerOpen(true); }}
          aria-haspopup="dialog"
          aria-label={`Cambiar color de prenda: ${currentGarmentColor}`}
          title="Cambiar color de la prenda"
          className="h-11 w-11 cursor-pointer rounded-[5px] border border-black bg-surface shadow-2xs transition-all duration-150 ease-out hover:brightness-95 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          style={{ backgroundColor: currentGarmentColor }}
        />
      </div>

      <div className="flex items-center gap-5 border-l border-border pl-5">
        <div className="flex flex-col text-right"><span className="text-[10px] text-foregroundMuted">Precio base</span><span className="text-xs font-semibold text-foregroundMuted">$ 49.900</span></div>
        <div className="flex flex-col text-right"><span className="text-[9px] font-semibold uppercase tracking-wider text-foregroundMuted">Total estimado</span><span className="text-lg font-black leading-tight text-primary">$ 49.900</span></div>
      </div>
      <GarmentColorPicker />
    </div>
  );
}
