import * as React from "react";
import { Crop, X, Check, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { DesignerLayer, CropRect } from "./types";
import { cropImage } from "./imageProcessor";

interface CropModalProps {
  isOpen: boolean;
  layer?: DesignerLayer;
  onClose: () => void;
  onApplyCrop: (layerId: string, rect: CropRect, croppedDataUrl: string) => void;
}

type AspectRatioOption = "free" | "1:1" | "4:3" | "16:9";

export function CropModal({
  isOpen,
  layer,
  onClose,
  onApplyCrop,
}: CropModalProps) {
  const [ratio, setRatio] = React.useState<AspectRatioOption>("free");
  // Normalized crop region (0–100%)
  const [cropX, setCropX] = React.useState(10);
  const [cropY, setCropY] = React.useState(10);
  const [cropW, setCropW] = React.useState(80);
  const [cropH, setCropH] = React.useState(80);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const imgSrc = layer?.processedSrc ?? layer?.src ?? layer?.preview ?? "";

  // Adjust crop region when ratio changes
  React.useEffect(() => {
    if (ratio === "1:1") {
      const size = Math.min(cropW, cropH);
      setCropW(size);
      setCropH(size);
    } else if (ratio === "4:3") {
      const h = Math.round((cropW * 3) / 4);
      setCropH(Math.min(100 - cropY, Math.max(10, h)));
    } else if (ratio === "16:9") {
      const h = Math.round((cropW * 9) / 16);
      setCropH(Math.min(100 - cropY, Math.max(10, h)));
    }
  }, [ratio]);

  // Update live preview canvas
  React.useEffect(() => {
    if (!isOpen || !imgSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const natW = img.naturalWidth || 400;
      const natH = img.naturalHeight || 400;

      const pxX = (cropX / 100) * natW;
      const pxY = (cropY / 100) * natH;
      const pxW = Math.max(1, (cropW / 100) * natW);
      const pxH = Math.max(1, (cropH / 100) * natH);

      canvas.width = 240;
      canvas.height = Math.round(240 * (pxH / pxW));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, pxX, pxY, pxW, pxH, 0, 0, canvas.width, canvas.height);
    };
    img.src = imgSrc;
  }, [isOpen, imgSrc, cropX, cropY, cropW, cropH]);

  if (!isOpen || !layer) return null;

  const handleApply = async () => {
    if (!imgSrc) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = imgSrc;
      });

      const natW = img.naturalWidth || 800;
      const natH = img.naturalHeight || 800;

      const rect: CropRect = {
        x: Math.round((cropX / 100) * natW),
        y: Math.round((cropY / 100) * natH),
        width: Math.round((cropW / 100) * natW),
        height: Math.round((cropH / 100) * natH),
      };

      const croppedUrl = await cropImage(imgSrc, rect);
      onApplyCrop(layer.id, rect, croppedUrl);
      onClose();
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF] text-[#2563EB]">
              <Crop className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Recortar Imagen
              </h2>
              <p className="text-[10px] text-[#64748B]">
                Ajusta el área visible de "{layer.name}"
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

        {/* Aspect Ratio Options */}
        <div className="mb-4">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            Proporción de recorte
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                ["free", "Libre"],
                ["1:1", "1:1 (Cuadrado)"],
                ["4:3", "4:3"],
                ["16:9", "16:9"],
              ] as const
            ).map(([opt, label]) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRatio(opt)}
                className={cn(
                  "rounded border px-2 py-1.5 text-center text-xs font-medium transition-colors",
                  ratio === opt
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview & Slider controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-5">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 min-h-[160px]">
            <canvas
              ref={previewCanvasRef}
              className="max-h-[140px] max-w-full rounded shadow-sm object-contain"
            />
            <span className="mt-2 text-[10px] text-[#94A3B8]">
              Vista previa del recorte
            </span>
          </div>

          <div className="space-y-2.5">
            <label className="block text-[10px] text-[#64748B]">
              <span className="mb-1 flex justify-between">
                <span>Posición X (horizontal)</span>
                <span className="font-semibold text-[#111827]">{cropX}%</span>
              </span>
              <input
                type="range"
                min="0"
                max={Math.max(0, 100 - cropW)}
                value={cropX}
                onChange={(e) => setCropX(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
            </label>

            <label className="block text-[10px] text-[#64748B]">
              <span className="mb-1 flex justify-between">
                <span>Posición Y (vertical)</span>
                <span className="font-semibold text-[#111827]">{cropY}%</span>
              </span>
              <input
                type="range"
                min="0"
                max={Math.max(0, 100 - cropH)}
                value={cropY}
                onChange={(e) => setCropY(Number(e.target.value))}
                className="w-full accent-[#2563EB]"
              />
            </label>

            <label className="block text-[10px] text-[#64748B]">
              <span className="mb-1 flex justify-between">
                <span>Ancho del área</span>
                <span className="font-semibold text-[#111827]">{cropW}%</span>
              </span>
              <input
                type="range"
                min="10"
                max={100 - cropX}
                value={cropW}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCropW(val);
                  if (ratio === "1:1") setCropH(val);
                  else if (ratio === "4:3") setCropH(Math.round((val * 3) / 4));
                  else if (ratio === "16:9") setCropH(Math.round((val * 9) / 16));
                }}
                className="w-full accent-[#2563EB]"
              />
            </label>

            {ratio === "free" && (
              <label className="block text-[10px] text-[#64748B]">
                <span className="mb-1 flex justify-between">
                  <span>Alto del área</span>
                  <span className="font-semibold text-[#111827]">{cropH}%</span>
                </span>
                <input
                  type="range"
                  min="10"
                  max={100 - cropY}
                  value={cropH}
                  onChange={(e) => setCropH(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
              </label>
            )}
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex justify-end gap-2 border-t border-[#F1F5F9] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#E2E8F0] px-3.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Recortando...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Confirmar Recorte
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
