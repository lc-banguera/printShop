import { useState } from 'react';
import { useViewerStore } from '@/store/viewer-store';
import { Plus } from 'lucide-react';

export function BottomPanel() {
  const selectedColorIndex = useViewerStore((state) => state.selectedColorIndex);
  const garmentColors = useViewerStore((state) => state.garmentColors);
  const selectGarmentColor = useViewerStore((state) => state.selectGarmentColor);
  const updateGarmentColor = useViewerStore((state) => state.updateGarmentColor);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedMethod, setSelectedMethod] = useState('DTF');

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const methods = ['DTF', 'Sublimación', 'Vinilo', 'Bordado'];

  return (
    <div className="flex h-[80px] w-full items-center justify-between border-t border-[#e8e8f0] bg-white px-5 shadow-xs select-none shrink-0">
      {/* ── 1. Product Info (Left) ── */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e5e5ee] bg-[#f8f8fb] p-1 shadow-2xs">
          <img
            src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png"
            alt="Camiseta Oversize"
            className="h-full w-full object-contain rounded-lg"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <svg className="h-8 w-8 text-[#5e5d72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-[#171421] leading-tight">
            Camiseta Oversize Premium
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[11px] text-amber-400">★★★★★</span>
            <span className="text-[10px] font-medium text-[#8E96A6]">(128)</span>
          </div>
          <span className="text-[10px] text-[#8E96A6] mt-0.5">
            Algodón 100% · 180 GSM
          </span>
        </div>
      </div>

      {/* ── 2. Color Options ── */}
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-[#5e5d72] mb-1">
          Color de prenda
        </span>
        <div className="flex items-center gap-1.5">
          {garmentColors.map((color, index) => (
            <button
              key={`${color}-${index}`}
              type="button"
              onClick={() => selectGarmentColor(index)}
              onDoubleClick={() => updateGarmentColor(index, color)}
              className={`h-5 w-5 rounded-full transition-all cursor-pointer ${
                selectedColorIndex === index ? 'ring-2 ring-[#5046e5] ring-offset-1 scale-105' : 'ring-1 ring-black/10 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f4f4f7] text-[#5e5d72] hover:bg-[#e4e4ee] transition-all"
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* ── 3. Sizes ── */}
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-[#5e5d72] mb-1">
          Talla
        </span>
        <div className="flex items-center gap-1">
          {sizes.map((s) => {
            const isSelected = selectedSize === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(s)}
                className={`flex h-6 min-w-6 items-center justify-center rounded-lg border px-1.5 text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'border-[#5046e5] bg-[#eeebff] text-[#5046e5]'
                    : 'border-[#e4e4ee] bg-white text-[#5e5d72] hover:border-[#b0b0cc] hover:text-[#171421]'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Print Method ── */}
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-[#5e5d72] mb-1">
          Método de impresión
        </span>
        <div className="flex items-center gap-1">
          {methods.map((m) => {
            const isSelected = selectedMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMethod(m)}
                className={`flex h-6 items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'border-[#5046e5] bg-[#eeebff] text-[#5046e5]'
                    : 'border-[#e4e4ee] bg-white text-[#5e5d72] hover:border-[#b0b0cc] hover:text-[#171421]'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 5. Pricing & Cart Summary (Right) ── */}
      <div className="flex items-center gap-5 border-l border-[#eeeef5] pl-5">
        <div className="flex flex-col text-right space-y-0.5">
          <div className="flex items-center justify-end gap-2 text-[11px]">
            <span className="text-[#8E96A6]">Precio base</span>
            <span className="font-semibold text-[#171421]">$24.990</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-[11px]">
            <span className="text-[#8E96A6]">Personalización</span>
            <span className="font-semibold text-[#171421]">$8.000</span>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8E96A6]">Total</span>
          <span className="text-lg font-extrabold text-[#5046e5] leading-tight">$32.990</span>
        </div>
      </div>
    </div>
  );
}


