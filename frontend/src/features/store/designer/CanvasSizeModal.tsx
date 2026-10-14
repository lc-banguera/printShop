import * as React from "react";
import { Maximize2, X, Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { CanvasAnchor } from "./types";

interface CanvasSizeModalProps {
  isOpen: boolean;
  width: number;
  height: number;
  dpi: number;
  onClose: () => void;
  onApply: (width: number, height: number, anchor: CanvasAnchor) => void;
}

type Unit = "px" | "cm" | "in";

const ANCHOR_GRID: CanvasAnchor[][] = [
  ["NW", "N", "NE"],
  ["W", "Center", "E"],
  ["SW", "S", "SE"],
];

const ANCHOR_LABELS: Record<CanvasAnchor, string> = {
  NW: "Superior Izquierda",
  N: "Superior Centro",
  NE: "Superior Derecha",
  W: "Centro Izquierda",
  Center: "Centro",
  E: "Centro Derecha",
  SW: "Inferior Izquierda",
  S: "Inferior Centro",
  SE: "Inferior Derecha",
};

export function CanvasSizeModal({
  isOpen,
  width,
  height,
  dpi,
  onClose,
  onApply,
}: CanvasSizeModalProps) {
  const [unit, setUnit] = React.useState<Unit>("px");
  const [valW, setValW] = React.useState<number>(width);
  const [valH, setValH] = React.useState<number>(height);
  const [anchor, setAnchor] = React.useState<CanvasAnchor>("Center");

  React.useEffect(() => {
    setValW(width);
    setValH(height);
  }, [width, height]);

  if (!isOpen) return null;

  // Conversion helpers
  const toPixels = (val: number, u: Unit): number => {
    if (u === "in") return Math.round(val * dpi);
    if (u === "cm") return Math.round((val / 2.54) * dpi);
    return Math.round(val);
  };

  const fromPixels = (px: number, u: Unit): number => {
    if (u === "in") return Number((px / dpi).toFixed(2));
    if (u === "cm") return Number(((px * 2.54) / dpi).toFixed(2));
    return Math.round(px);
  };

  const handleUnitChange = (newUnit: Unit) => {
    const pxW = toPixels(valW, unit);
    const pxH = toPixels(valH, unit);
    setUnit(newUnit);
    setValW(fromPixels(pxW, newUnit));
    setValH(fromPixels(pxH, newUnit));
  };

  const handleConfirm = () => {
    const finalW = Math.max(100, toPixels(valW, unit));
    const finalH = Math.max(100, toPixels(valH, unit));
    onApply(finalW, finalH, anchor);
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
              <Maximize2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Tamaño del Lienzo
              </h2>
              <p className="text-[10px] text-[#64748B]">
                Dimensiones y anclaje del área de trabajo
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

        <div className="space-y-4">
          {/* Unit selection */}
          <div>
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              Unidades
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ["px", "Píxeles (px)"],
                  ["cm", "Centímetros (cm)"],
                  ["in", "Pulgadas (in)"],
                ] as const
              ).map(([u, label]) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitChange(u)}
                  className={cn(
                    "rounded border px-2 py-1.5 text-center text-xs font-medium transition-colors",
                    unit === u
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                      : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Width and Height Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs text-[#475569]">
              <span className="mb-1 block font-medium">Ancho</span>
              <div className="flex items-center rounded-md border border-[#E2E8F0] bg-white px-2 focus-within:border-[#2563EB]">
                <input
                  type="number"
                  min="1"
                  step={unit === "px" ? "1" : "0.1"}
                  value={valW}
                  onChange={(e) => setValW(Number(e.target.value))}
                  className="w-full py-1.5 text-right text-xs text-[#111827] outline-none"
                />
                <span className="ml-1 text-[10px] text-[#94A3B8] font-mono">
                  {unit}
                </span>
              </div>
            </label>

            <label className="block text-xs text-[#475569]">
              <span className="mb-1 block font-medium">Alto</span>
              <div className="flex items-center rounded-md border border-[#E2E8F0] bg-white px-2 focus-within:border-[#2563EB]">
                <input
                  type="number"
                  min="1"
                  step={unit === "px" ? "1" : "0.1"}
                  value={valH}
                  onChange={(e) => setValH(Number(e.target.value))}
                  className="w-full py-1.5 text-right text-xs text-[#111827] outline-none"
                />
                <span className="ml-1 text-[10px] text-[#94A3B8] font-mono">
                  {unit}
                </span>
              </div>
            </label>
          </div>

          {/* Anchor 3x3 selector */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Ancla de expansión
              </span>
              <span className="text-[10px] text-[#2563EB] font-medium">
                {ANCHOR_LABELS[anchor]}
              </span>
            </div>
            <div className="flex justify-center p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <div className="grid grid-cols-3 gap-1.5 w-32 h-32">
                {ANCHOR_GRID.map((row) =>
                  row.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      title={ANCHOR_LABELS[pos]}
                      onClick={() => setAnchor(pos)}
                      className={cn(
                        "rounded flex items-center justify-center border transition-all text-xs font-mono",
                        anchor === pos
                          ? "border-[#2563EB] bg-[#2563EB] text-white shadow-xs font-bold"
                          : "border-[#CBD5E1] bg-white text-[#64748B] hover:border-[#93C5FD] hover:bg-[#EFF6FF]"
                      )}
                    >
                      {pos === "Center" ? "•" : pos}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal actions */}
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
