import * as React from "react";
import { Scaling, X, Check, Lock, Unlock } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ImageSizeModalProps {
  isOpen: boolean;
  width: number;
  height: number;
  dpi: number;
  onClose: () => void;
  onApply: (width: number, height: number, dpi: number) => void;
}

export function ImageSizeModal({
  isOpen,
  width,
  height,
  dpi,
  onClose,
  onApply,
}: ImageSizeModalProps) {
  const [valW, setValW] = React.useState<number>(width);
  const [valH, setValH] = React.useState<number>(height);
  const [valDpi, setValDpi] = React.useState<number>(dpi);
  const [constrainRatio, setConstrainRatio] = React.useState<boolean>(true);

  React.useEffect(() => {
    setValW(width);
    setValH(height);
    setValDpi(dpi);
  }, [width, height, dpi]);

  const initialRatio = width > 0 && height > 0 ? width / height : 1;

  if (!isOpen) return null;

  const handleWidthChange = (newW: number) => {
    setValW(newW);
    if (constrainRatio && initialRatio > 0) {
      setValH(Math.max(1, Math.round(newW / initialRatio)));
    }
  };

  const handleHeightChange = (newH: number) => {
    setValH(newH);
    if (constrainRatio && initialRatio > 0) {
      setValW(Math.max(1, Math.round(newH * initialRatio)));
    }
  };

  const handleConfirm = () => {
    onApply(Math.max(10, valW), Math.max(10, valH), Math.max(72, valDpi));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <Scaling className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Tamaño de Imagen
              </h2>
              <p className="text-[10px] text-[#64748B]">
                Dimensiones y resolución de impresión
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-[#475569]">
              <span className="mb-1 block font-medium">Ancho (px)</span>
              <input
                type="number"
                min="10"
                value={valW}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full rounded-md border border-[#E2E8F0] bg-white px-2 py-1.5 text-right text-xs text-[#111827] outline-none focus:border-[#2563EB]"
              />
            </label>

            <label className="block text-xs text-[#475569]">
              <span className="mb-1 block font-medium">Alto (px)</span>
              <input
                type="number"
                min="10"
                value={valH}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full rounded-md border border-[#E2E8F0] bg-white px-2 py-1.5 text-right text-xs text-[#111827] outline-none focus:border-[#2563EB]"
              />
            </label>
          </div>

          <label className="block text-xs text-[#475569]">
            <span className="mb-1 block font-medium">Resolución (DPI)</span>
            <input
              type="number"
              min="72"
              max="1200"
              value={valDpi}
              onChange={(e) => setValDpi(Number(e.target.value))}
              className="w-full rounded-md border border-[#E2E8F0] bg-white px-2 py-1.5 text-right text-xs text-[#111827] outline-none focus:border-[#2563EB]"
            />
          </label>

          <button
            type="button"
            onClick={() => setConstrainRatio(!constrainRatio)}
            className="flex items-center gap-2 text-xs text-[#475569] hover:text-[#2563EB]"
          >
            {constrainRatio ? (
              <Lock className="h-3.5 w-3.5 text-[#2563EB]" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-[#94A3B8]" />
            )}
            <span className={cn(constrainRatio && "font-semibold text-[#2563EB]")}>
              Mantener proporción de aspecto
            </span>
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-[#F1F5F9] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E2E8F0] px-3.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8]"
          >
            <Check className="h-3.5 w-3.5" />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
