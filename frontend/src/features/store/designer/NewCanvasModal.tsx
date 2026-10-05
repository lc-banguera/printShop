/**
 * NewCanvasModal.tsx
 * Modal para crear un nuevo lienzo/documento desde cero en el PrintShop Designer.
 * Soporta: dimensiones (px/cm/mm/in), DPI real, fondo, presets de producto.
 *
 * Arquitectura preparada para:
 *  - Conectar productos con su área de diseño
 *  - Múltiples artboards en el futuro
 */
import * as React from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CanvasUnit = "px" | "cm" | "mm" | "in";
export type CanvasBackground = "transparent" | "white" | "color";

export interface NewCanvasConfig {
  name: string;
  widthPx: number;
  heightPx: number;
  dpi: number;
  background: CanvasBackground;
  backgroundColor: string;
}

interface NewCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (config: NewCanvasConfig) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Presets — prepared for future product-based area integration
// ─────────────────────────────────────────────────────────────────────────────

interface Preset {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  dpi: number;
  note?: string;
}

const PRESETS: Preset[] = [
  { id: "custom",      label: "Personalizado",  widthMm: 0,    heightMm: 0,    dpi: 300 },
  { id: "tshirt",      label: "Camiseta",        widthMm: 300,  heightMm: 400,  dpi: 300, note: "Área frontal aprox." },
  { id: "hoodie",      label: "Sudadera",        widthMm: 280,  heightMm: 380,  dpi: 300, note: "Área frontal aprox." },
  { id: "mug",         label: "Taza",            widthMm: 210,  heightMm: 95,   dpi: 300, note: "Wrap continuo" },
  { id: "cap",         label: "Gorra",           widthMm: 70,   heightMm: 50,   dpi: 300, note: "Panel frontal" },
  { id: "poster-a3",   label: "Póster A3",       widthMm: 297,  heightMm: 420,  dpi: 150 },
  { id: "poster-a4",   label: "Póster A4",       widthMm: 210,  heightMm: 297,  dpi: 150 },
  { id: "sticker-sq",  label: "Sticker",         widthMm: 50,   heightMm: 50,   dpi: 300 },
  { id: "totebag",     label: "Bolso",           widthMm: 280,  heightMm: 320,  dpi: 300, note: "Área de impresión" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Unit conversion helpers
// ─────────────────────────────────────────────────────────────────────────────

const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;

function pxToUnit(px: number, dpi: number, unit: CanvasUnit): number {
  if (unit === "px") return px;
  const inches = px / dpi;
  if (unit === "in") return parseFloat(inches.toFixed(4));
  if (unit === "cm") return parseFloat((inches * CM_PER_INCH).toFixed(3));
  if (unit === "mm") return parseFloat((inches * MM_PER_INCH).toFixed(2));
  return px;
}

function unitToPx(value: number, dpi: number, unit: CanvasUnit): number {
  if (unit === "px") return Math.round(value);
  if (unit === "in") return Math.round(value * dpi);
  if (unit === "cm") return Math.round((value / CM_PER_INCH) * dpi);
  if (unit === "mm") return Math.round((value / MM_PER_INCH) * dpi);
  return Math.round(value);
}

function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / MM_PER_INCH) * dpi);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function NewCanvasModal({ isOpen, onClose, onApply }: NewCanvasModalProps) {
  const [name, setName] = React.useState("Mi nuevo diseño");
  const [unit, setUnit] = React.useState<CanvasUnit>("px");
  const [dpi, setDpi] = React.useState(300);
  const [widthPx, setWidthPx] = React.useState(3000);
  const [heightPx, setHeightPx] = React.useState(3000);
  const [background, setBackground] = React.useState<CanvasBackground>("white");
  const [backgroundColor, setBackgroundColor] = React.useState("#ffffff");
  const [selectedPreset, setSelectedPreset] = React.useState("custom");
  const [keepRatio, setKeepRatio] = React.useState(false);

  // Derived display values in current unit
  const displayW = pxToUnit(widthPx, dpi, unit);
  const displayH = pxToUnit(heightPx, dpi, unit);
  const ratio = widthPx / Math.max(1, heightPx);

  const applyPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    if (preset.id === "custom") return;
    const newDpi = preset.dpi;
    setDpi(newDpi);
    setWidthPx(mmToPx(preset.widthMm, newDpi));
    setHeightPx(mmToPx(preset.heightMm, newDpi));
  };

  const handleWidthChange = (raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) return;
    const px = unitToPx(val, dpi, unit);
    setWidthPx(px);
    if (keepRatio) setHeightPx(Math.round(px / ratio));
    setSelectedPreset("custom");
  };

  const handleHeightChange = (raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val) || val <= 0) return;
    const px = unitToPx(val, dpi, unit);
    setHeightPx(px);
    if (keepRatio) setWidthPx(Math.round(px * ratio));
    setSelectedPreset("custom");
  };

  const handleDpiChange = (raw: string) => {
    const val = parseInt(raw);
    if (isNaN(val) || val < 72) return;
    // Recalc px from physical size when DPI changes (if not in px mode)
    if (unit !== "px") {
      const physW = pxToUnit(widthPx, dpi, unit);
      const physH = pxToUnit(heightPx, dpi, unit);
      setWidthPx(unitToPx(physW, val, unit));
      setHeightPx(unitToPx(physH, val, unit));
    }
    setDpi(val);
  };

  const handleUnitChange = (newUnit: CanvasUnit) => {
    setUnit(newUnit);
  };

  const handleApply = () => {
    if (widthPx < 1 || heightPx < 1) return;
    onApply({
      name: name.trim() || "Nuevo diseño",
      widthPx,
      heightPx,
      dpi,
      background,
      backgroundColor:
        background === "color" ? backgroundColor : background === "white" ? "#ffffff" : "transparent",
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedPresetObj = PRESETS.find((p) => p.id === selectedPreset);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-[8px] border border-[#E2E8F0] bg-white shadow-xl">
        {/* Header */}
        <div className="flex h-11 items-center justify-between border-b border-[#E5E7EB] px-4">
          <h2 className="text-[13px] font-bold text-[#111827]">Nuevo lienzo</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 gap-0">
          {/* Left: Presets */}
          <div className="w-36 shrink-0 border-r border-[#E5E7EB] py-2">
            <p className="px-3 pb-1.5 text-[9px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Presets
            </p>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "flex w-full flex-col px-3 py-1.5 text-left transition-colors",
                  selectedPreset === preset.id
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-[#475569] hover:bg-[#F8FAFC]"
                )}
              >
                <span className="text-[11px] font-medium">{preset.label}</span>
                {preset.id !== "custom" && (
                  <span className="text-[9px] text-[#94A3B8]">
                    {preset.widthMm}×{preset.heightMm} mm
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right: Configuration */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Design name */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[#475569]">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[4px] border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] text-[#111827] outline-none focus:border-[#2563EB]"
                placeholder="Nombre del diseño"
              />
            </div>

            {/* Dimensions + units */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] font-semibold text-[#475569]">
                  Dimensiones
                </label>
                {/* Unit selector */}
                <div className="flex gap-0.5 rounded-[4px] border border-[#E2E8F0] p-0.5">
                  {(["px", "cm", "mm", "in"] as CanvasUnit[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleUnitChange(u)}
                      className={cn(
                        "rounded-[3px] px-1.5 py-0.5 text-[9px] font-semibold transition-colors",
                        unit === u
                          ? "bg-[#2563EB] text-white"
                          : "text-[#64748B] hover:text-[#111827]"
                      )}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div>
                  <p className="mb-0.5 text-[9px] text-[#94A3B8]">Ancho</p>
                  <input
                    type="number"
                    min="1"
                    step={unit === "px" ? "1" : "0.1"}
                    value={displayW}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full rounded-[4px] border border-[#E2E8F0] px-2.5 py-1.5 text-right text-[12px] text-[#111827] outline-none focus:border-[#2563EB]"
                  />
                </div>
                <span className="pt-4 text-[10px] text-[#94A3B8]">×</span>
                <div>
                  <p className="mb-0.5 text-[9px] text-[#94A3B8]">Alto</p>
                  <input
                    type="number"
                    min="1"
                    step={unit === "px" ? "1" : "0.1"}
                    value={displayH}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full rounded-[4px] border border-[#E2E8F0] px-2.5 py-1.5 text-right text-[12px] text-[#111827] outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-[10px] text-[#64748B]">
                <input
                  type="checkbox"
                  checked={keepRatio}
                  onChange={(e) => setKeepRatio(e.target.checked)}
                  className="rounded accent-[#2563EB]"
                />
                Mantener proporción
              </label>
            </div>

            {/* DPI */}
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[#475569]">
                Resolución
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="72"
                  max="2400"
                  value={dpi}
                  onChange={(e) => handleDpiChange(e.target.value)}
                  className="w-24 rounded-[4px] border border-[#E2E8F0] px-2.5 py-1.5 text-right text-[12px] text-[#111827] outline-none focus:border-[#2563EB]"
                />
                <span className="text-[11px] text-[#64748B]">DPI</span>
                <div className="flex gap-1">
                  {[72, 150, 300].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDpiChange(String(d))}
                      className={cn(
                        "rounded-[3px] border px-1.5 py-0.5 text-[9px] font-semibold transition-colors",
                        dpi === d
                          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {unit !== "px" && (
                <p className="mt-0.5 text-[9px] text-[#94A3B8]">
                  Equivalente: {widthPx} × {heightPx} px
                </p>
              )}
            </div>

            {/* Background */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold text-[#475569]">
                Fondo
              </label>
              <div className="flex gap-2">
                {(
                  [
                    { id: "transparent", label: "Transparente" },
                    { id: "white", label: "Blanco" },
                    { id: "color", label: "Color" },
                  ] as { id: CanvasBackground; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBackground(opt.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1 rounded-[4px] border py-1.5 text-[10px] font-medium transition-colors",
                      background === opt.id
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                        : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                    )}
                  >
                    {opt.id === "transparent" && (
                      <span
                        className="inline-block h-3 w-3 rounded-[2px]"
                        style={{
                          background:
                            "repeating-conic-gradient(#CBD5E1 0% 25%, #fff 0% 50%) 0 0 / 6px 6px",
                        }}
                      />
                    )}
                    {opt.id === "white" && (
                      <span className="inline-block h-3 w-3 rounded-[2px] border border-[#E2E8F0] bg-white" />
                    )}
                    {opt.id === "color" && (
                      <span
                        className="inline-block h-3 w-3 rounded-[2px] border border-[#E2E8F0]"
                        style={{ background: backgroundColor }}
                      />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
              {background === "color" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-7 w-12 cursor-pointer rounded-[4px] border border-[#E2E8F0] p-0.5"
                  />
                  <span className="text-[10px] text-[#64748B]">{backgroundColor}</span>
                </div>
              )}
            </div>

            {/* Preset info note */}
            {selectedPresetObj && selectedPresetObj.note && (
              <p className="rounded-[4px] border border-[#E0F2FE] bg-[#F0F9FF] px-2.5 py-1.5 text-[10px] text-[#0369A1]">
                ℹ {selectedPresetObj.note}. Las medidas son editables.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
          <p className="text-[9px] text-[#94A3B8]">
            {widthPx} × {heightPx} px · {dpi} DPI
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[4px] border border-[#E2E8F0] px-3 py-1.5 text-[11px] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={widthPx < 1 || heightPx < 1}
              className="flex items-center gap-1.5 rounded-[4px] bg-[#2563EB] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" /> Crear lienzo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
