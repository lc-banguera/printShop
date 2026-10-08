/**
 * ImageTools.tsx
 * Contextual image-tools panel for the PrintShop Designer.
 * Renders ONLY when an image layer is selected.
 * All tools call real imageProcessor functions and commit via onUpdateLayer.
 *
 * Architecture:
 *  - preview = temporary, NEVER touches history
 *  - onApply = commits processedSrc + 1 history entry
 *  - onCancel = discards preview, no history
 */
import * as React from "react";
import {
  ImageMinus,
  Circle,
  Contrast,
  RefreshCw,
  X,
  Check,
  SlidersHorizontal,
  Loader2,
  Crop,
  Paintbrush,
  PenTool,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import {
  processRasterImageUrl,
  type HalftoneOptions,
} from "@/core/design/processing";
import { DesignerLayer } from "./types";
import { PathEraserModal } from "./PathEraserModal";
import {
  applyGrayscale,
  applyInvert,
  applyAdjustments,
  removeBackground,
  hasTransparency,
  AdjustmentValues,
} from "./imageProcessor";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActiveTool =
  | "none"
  | "remove-bg"
  | "halftone"
  | "semitransparency"
  | "adjustments";

interface ImageToolsProps {
  layer: DesignerLayer;
  onUpdateLayer: (id: string, changes: Partial<DesignerLayer>) => void;
  onOpenCrop?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function sliderClass() {
  return "h-1.5 w-full cursor-pointer accent-[#2563EB]";
}

function labelClass() {
  return "flex justify-between text-[10px] text-[#64748B] mb-1";
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not encode the processed image preview."));
    }, { once: true });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Could not encode the processed image preview."));
    }, { once: true });
    reader.readAsDataURL(blob);
  });
}

function createThumbnailDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 56;
      canvas.height = 56;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not create the processed image thumbnail."));
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("Could not encode the processed image thumbnail."),
        );
      }
    };
    image.onerror = () =>
      reject(new Error("Could not decode the processed image thumbnail."));
    image.src = src;
  });
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#E5E7EB] pt-3 first:border-t-0 first:pt-0">
      <p className="mb-2 text-[11px] font-bold text-[#111827]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ToolBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[4px] border px-2 py-1.5 text-left text-[11px] font-medium transition-colors",
        active
          ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
          : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#93C5FD] hover:bg-[#F8FAFC]"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

function Commit({
  onApply,
  onCancel,
  disabled,
}: {
  onApply: () => void | Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const [isApplying, setIsApplying] = React.useState(false);

  const handleApply = async () => {
    if (disabled || isApplying) return;
    setIsApplying(true);
    try {
      await onApply();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex gap-1.5 pt-1">
      <button
        type="button"
        onClick={onCancel}
        disabled={isApplying}
        className="flex flex-1 items-center justify-center gap-1 rounded-[4px] border border-[#E2E8F0] py-1.5 text-[10px] font-medium text-[#64748B] hover:bg-[#F8FAFC]"
      >
        <X className="h-3 w-3" /> Cancelar
      </button>
      <button
        type="button"
        disabled={disabled || isApplying}
        onClick={() => void handleApply()}
        className="flex flex-1 items-center justify-center gap-1 rounded-[4px] bg-[#2563EB] py-1.5 text-[10px] font-bold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isApplying ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        {isApplying ? "Aplicando…" : "Aplicar"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Remove Background Tool — with mask architecture + manual brush
// ─────────────────────────────────────────────────────────────────────────────

function RemoveBgTool({
  layer,
  onApply,
  onCancel,
}: {
  layer: DesignerLayer;
  onApply: (processedSrc: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [tolerance, setTolerance] = React.useState(40);
  const [feather, setFeather] = React.useState(1);
  const [processing, setProcessing] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  // Manual brush state
  const [brushMode, setBrushMode] = React.useState<"keep" | "remove">("remove");
  const [brushSize, setBrushSize] = React.useState(20);
  const [isPainting, setIsPainting] = React.useState(false);
  // We store mask data URL separately so we can re-apply it on top of auto result
  const maskCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const autoResultRef = React.useRef<string | null>(null); // auto remove-bg result
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = React.useRef(0);
  const isMountedRef = React.useRef(false);
  const processingAbortRef = React.useRef<AbortController | null>(null);

  const src = layer.processedSrc ?? layer.src ?? layer.preview;

  // Initialize mask canvas to fully opaque when src changes
  React.useEffect(() => {
    if (!src) return;
    const img = new Image();
    // blob: and data: URLs are same-origin, no crossOrigin needed
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth || img.width;
      c.height = img.naturalHeight || img.height;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, c.width, c.height);
      maskCanvasRef.current = c;
    };
    img.src = src;
  }, [src]);

  const generatePreview = React.useCallback(async (t: number, f: number) => {
    if (!src) return;
    const currentGen = ++generationRef.current;
    processingAbortRef.current?.abort();
    await new Promise((r) => setTimeout(r, 50));
    if (!isMountedRef.current || currentGen !== generationRef.current) return;

    const controller = new AbortController();
    processingAbortRef.current = controller;
    setProcessing(true);
    try {
      const resultUrl = await removeBackground(
        src,
        { tolerance: t, feather: f },
        undefined,
        controller.signal,
      );
      if (isMountedRef.current && currentGen === generationRef.current) {
        autoResultRef.current = resultUrl;
        setPreviewSrc(resultUrl);
      }
    } catch (error) {
      const cancelled = error instanceof Error && error.name === "AbortError";
      if (!cancelled && isMountedRef.current && currentGen === generationRef.current) {
        console.error("Failed to remove the image background.", error);
        setPreviewSrc(null);
      }
    } finally {
      if (processingAbortRef.current === controller) {
        processingAbortRef.current = null;
      }
      if (isMountedRef.current && currentGen === generationRef.current) {
        setProcessing(false);
      }
    }
  }, [src]);

  // Initial preview
  React.useEffect(() => {
    isMountedRef.current = true;
    generatePreview(tolerance, feather);
    return () => {
      isMountedRef.current = false;
      processingAbortRef.current?.abort();
    };
  }, [generatePreview]); // eslint-disable-line react-hooks/exhaustive-deps

  const schedulePreview = (t: number, f: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generatePreview(t, f), 400);
  };

  const updateT = (v: number) => { setTolerance(v); schedulePreview(v, feather); };
  const updateF = (v: number) => { setFeather(v); schedulePreview(tolerance, v); };

  // Manual brush painting on previewSrc
  const getCanvasPoint = (e: React.MouseEvent<HTMLDivElement>, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width),
      y: ((e.clientY - rect.top) / rect.height),
    };
  };

  const applyBrushToMask = (relX: number, relY: number) => {
    if (!maskCanvasRef.current || !autoResultRef.current) return;
    const mc = maskCanvasRef.current;
    const ctx = mc.getContext("2d")!;
    // Brush center in mask pixel space
    const cx = relX * mc.width;
    const cy = relY * mc.height;
    const r = (brushSize / 100) * Math.min(mc.width, mc.height) * 0.5;
    ctx.globalCompositeOperation = brushMode === "remove" ? "destination-out" : "source-over";
    if (brushMode === "keep") {
      ctx.fillStyle = "white";
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    // Recompose: original auto-result alpha AND mask
    composeMaskedPreview();
  };

  const composeMaskedPreview = () => {
    if (!autoResultRef.current || !maskCanvasRef.current) return;
    const img = new Image();
    // autoResultRef always contains a data: URL (result of toDataURL) — no crossOrigin
    img.onload = () => {
      const out = document.createElement("canvas");
      out.width = img.naturalWidth || img.width;
      out.height = img.naturalHeight || img.height;
      const ctx = out.getContext("2d")!;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, out.width, out.height);
      // Draw the auto-processed image
      ctx.drawImage(img, 0, 0);
      // Apply the mask: multiply alpha by mask value
      const mc = maskCanvasRef.current!;
      const maskCtx = mc.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, out.width, out.height);
      const maskData = maskCtx.getImageData(0, 0, mc.width, mc.height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        // mask is grayscale — use red channel as mask value (0-255)
        const maskAlpha = maskData.data[i] / 255;
        imgData.data[i + 3] = Math.round(imgData.data[i + 3] * maskAlpha);
      }
      ctx.putImageData(imgData, 0, 0);
      setPreviewSrc(out.toDataURL("image/png"));
    };
    img.src = autoResultRef.current;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewSrc) return;
    setIsPainting(true);
    const pt = getCanvasPoint(e, e.currentTarget as HTMLDivElement);
    applyBrushToMask(pt.x, pt.y);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPainting || !previewSrc) return;
    const pt = getCanvasPoint(e, e.currentTarget as HTMLDivElement);
    applyBrushToMask(pt.x, pt.y);
  };
  const handleMouseUp = () => setIsPainting(false);

  const handleCancel = () => {
    generationRef.current++;
    processingAbortRef.current?.abort();
    onCancel();
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <div className={labelClass()}>
          <span>Tolerancia</span>
          <span>{tolerance}</span>
        </div>
        <input
          type="range"
          min={5}
          max={120}
          value={tolerance}
          onChange={(e) => updateT(Number(e.target.value))}
          className={sliderClass()}
        />
      </label>
      <label className="block">
        <div className={labelClass()}>
          <span>Suavizado de borde</span>
          <span>{feather} px</span>
        </div>
        <input
          type="range"
          min={0}
          max={8}
          value={feather}
          onChange={(e) => updateF(Number(e.target.value))}
          className={sliderClass()}
        />
      </label>

      {processing && (
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <Loader2 className="h-3 w-3 animate-spin text-[#2563EB]" /> Calculando...
        </div>
      )}

      {/* Preview with checkerboard background for transparency */}
      {previewSrc && !processing && (
        <div
          className={cn(
            "relative overflow-hidden rounded-[4px] border border-[#E2E8F0]",
            isPainting && "cursor-crosshair"
          )}
          style={{
            background:
              "repeating-conic-gradient(#CBD5E1 0% 25%, #F8FAFC 0% 50%) 0 0 / 10px 10px",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={previewSrc}
            alt="Preview sin fondo"
            className="h-28 w-full object-contain"
            style={{
              transform: `scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
            }}
          />
          {isPainting && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full border-2 border-white opacity-70"
                style={{
                  width: `${brushSize}%`,
                  height: `${brushSize}%`,
                  background: brushMode === "remove" ? "rgba(220,38,38,0.3)" : "rgba(37,99,235,0.3)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Manual refinement section */}
      {previewSrc && !processing && (
        <div className="space-y-2 rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] p-2">
          <p className="text-[10px] font-bold text-[#111827]">Refinar</p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setBrushMode("keep")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-[4px] border py-1 text-[10px] font-medium transition-colors",
                brushMode === "keep"
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
              )}
            >
              <Paintbrush className="h-3 w-3" /> Mantener
            </button>
            <button
              type="button"
              onClick={() => setBrushMode("remove")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-[4px] border py-1 text-[10px] font-medium transition-colors",
                brushMode === "remove"
                  ? "border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]"
                  : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
              )}
            >
              <X className="h-3 w-3" /> Eliminar
            </button>
          </div>
          <label className="block">
            <div className={labelClass()}>
              <span>Tamaño del pincel</span>
              <span>{brushSize}%</span>
            </div>
            <input
              type="range"
              min={2}
              max={60}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className={sliderClass()}
            />
          </label>
          <p className="text-[9px] text-[#94A3B8]">
            Pinta sobre la preview para refinar el resultado.
          </p>
        </div>
      )}

      <p className="text-[9px] leading-relaxed text-[#94A3B8]">
        El resultado puede requerir ajustes en imágenes con fondos complejos.
      </p>

      <Commit
        disabled={processing || !previewSrc}
        onApply={async () => {
          if (previewSrc) await onApply(previewSrc);
        }}
        onCancel={handleCancel}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Halftone Tool — Trama angle control, non-destructive, natural dimensions
// ─────────────────────────────────────────────────────────────────────────────

function HalftoneTool({
  layer,
  onApply,
  onCancel,
}: {
  layer: DesignerLayer;
  onApply: (processedSrc: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [cellSize, setCellSize] = React.useState(8);
  const [angle, setAngle] = React.useState(0);
  const [intensity, setIntensity] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [dotColor, setDotColor] = React.useState("#111827");
  const [useOriginalColor, setUseOriginalColor] = React.useState(false);
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [isTransparentBg, setIsTransparentBg] = React.useState(false);
  const [shape, setShape] = React.useState<"circle" | "square">("circle");
  const [invert, setInvert] = React.useState(false);

  const [processing, setProcessing] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = React.useRef(0);
  const workerAbortRef = React.useRef<AbortController | null>(null);

  // Always use the latest processed representation or original source
  const src = layer.processedSrc ?? layer.src ?? layer.preview;

  // Auto-detect if image has alpha transparency
  React.useEffect(() => {
    if (!src) return;
    let active = true;
    hasTransparency(src).then((hasT) => {
      if (active && hasT) {
        setIsTransparentBg(true);
      }
    });
    return () => {
      active = false;
    };
  }, [src]);

  const generatePreview = React.useCallback(
    async (
      cs: number,
      ang: number,
      dc: string,
      origCol: boolean,
      bg: string,
      trans: boolean,
      i: number,
      c: number,
      sh: "circle" | "square",
      inv: boolean
    ) => {
      if (!src) return;
      const currentGen = ++generationRef.current;
      await new Promise((r) => setTimeout(r, 40));
      if (currentGen !== generationRef.current) return;

      workerAbortRef.current?.abort();
      const controller = new AbortController();
      workerAbortRef.current = controller;
      setProcessing(true);
      try {
        const opts: HalftoneOptions = {
          cellSize: cs,
          angle: ang,
          dotColor: origCol ? "original" : dc,
          bgColor: trans ? "transparent" : bg,
          intensity: i,
          contrast: c,
          shape: sh,
          invert: inv,
        };
        const result = await processRasterImageUrl(
          src,
          { kind: "halftone", options: opts, previewMaxDimension: 500 },
          controller.signal,
        );
        const preview = await blobToDataUrl(result.blob);
        if (currentGen === generationRef.current) setPreviewSrc(preview);
      } catch (e) {
        if ((e as Error).name !== "AbortError" && currentGen === generationRef.current) {
          setPreviewSrc(null);
        }
      } finally {
        if (workerAbortRef.current === controller) workerAbortRef.current = null;
        if (currentGen === generationRef.current) setProcessing(false);
      }
    },
    [src]
  );

  // Initial preview
  React.useEffect(() => {
    generatePreview(
      cellSize,
      angle,
      dotColor,
      useOriginalColor,
      bgColor,
      isTransparentBg,
      intensity,
      contrast,
      shape,
      invert
    );
    return () => {
      generationRef.current++;
      workerAbortRef.current?.abort();
    };
  }, [generatePreview]); // eslint-disable-line react-hooks/exhaustive-deps

  const schedulePreview = (
    cs: number,
    ang: number,
    dc: string,
    origCol: boolean,
    bg: string,
    trans: boolean,
    i: number,
    c: number,
    sh: "circle" | "square",
    inv: boolean
  ) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    generationRef.current++;
    workerAbortRef.current?.abort();
    workerAbortRef.current = null;
    setProcessing(false);
    debounceRef.current = setTimeout(
      () =>
        generatePreview(
          cs,
          ang,
          dc,
          origCol,
          bg,
          trans,
          i,
          c,
          sh,
          inv
        ),
      300
    );
  };

  const update = (
    changes: Partial<{
      cs: number;
      ang: number;
      dc: string;
      origCol: boolean;
      bg: string;
      trans: boolean;
      i: number;
      c: number;
      sh: "circle" | "square";
      inv: boolean;
    }>
  ) => {
    const newCs = changes.cs ?? cellSize;
    const newAng = changes.ang ?? angle;
    const newDc = changes.dc ?? dotColor;
    const newOrigCol = changes.origCol ?? useOriginalColor;
    const newBg = changes.bg ?? bgColor;
    const newTrans = changes.trans ?? isTransparentBg;
    const newI = changes.i ?? intensity;
    const newC = changes.c ?? contrast;
    const newSh = changes.sh ?? shape;
    const newInv = changes.inv ?? invert;

    if (changes.cs !== undefined) setCellSize(newCs);
    if (changes.ang !== undefined) setAngle(newAng);
    if (changes.dc !== undefined) setDotColor(newDc);
    if (changes.origCol !== undefined) setUseOriginalColor(newOrigCol);
    if (changes.bg !== undefined) setBgColor(newBg);
    if (changes.trans !== undefined) setIsTransparentBg(newTrans);
    if (changes.i !== undefined) setIntensity(newI);
    if (changes.c !== undefined) setContrast(newC);
    if (changes.sh !== undefined) setShape(newSh);
    if (changes.inv !== undefined) setInvert(newInv);

    schedulePreview(
      newCs,
      newAng,
      newDc,
      newOrigCol,
      newBg,
      newTrans,
      newI,
      newC,
      newSh,
      newInv
    );
  };

  const handleCancel = () => {
    generationRef.current++;
    workerAbortRef.current?.abort();
    workerAbortRef.current = null;
    onCancel();
  };

  const handleApply = async () => {
    if (!src) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const currentGen = ++generationRef.current;
    workerAbortRef.current?.abort();
    const controller = new AbortController();
    workerAbortRef.current = controller;
    setProcessing(true);
    try {
      const opts: HalftoneOptions = {
        cellSize,
        angle,
        dotColor: useOriginalColor ? "original" : dotColor,
        bgColor: isTransparentBg ? "transparent" : bgColor,
        intensity,
        contrast,
        shape,
        invert,
      };
      // Full natural resolution export
      const finalResult = await processRasterImageUrl(
        src,
        { kind: "halftone", options: opts },
        controller.signal,
      );
      if (currentGen !== generationRef.current) return;
      await onApply(await blobToDataUrl(finalResult.blob));
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Failed to apply halftone:", err);
      }
    } finally {
      if (workerAbortRef.current === controller) workerAbortRef.current = null;
      if (currentGen === generationRef.current) setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Cell size */}
      <label className="block">
        <div className={labelClass()}>
          <span>Tamaño de punto</span>
          <span>{cellSize} px</span>
        </div>
        <input
          type="range"
          min={2}
          max={40}
          value={cellSize}
          onChange={(e) => update({ cs: Number(e.target.value) })}
          className={sliderClass()}
        />
      </label>

      {/* Grid Angle (Trama) */}
      <label className="block">
        <div className={labelClass()}>
          <span>Ángulo de trama</span>
          <span>{angle}° (0° = horizontal)</span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          value={angle}
          onChange={(e) => update({ ang: Number(e.target.value) })}
          className={sliderClass()}
        />
      </label>

      {/* Intensity */}
      <label className="block">
        <div className={labelClass()}>
          <span>Intensidad</span>
          <span>{intensity}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={200}
          value={intensity}
          onChange={(e) => update({ i: Number(e.target.value) })}
          className={sliderClass()}
        />
      </label>

      {/* Contrast */}
      <label className="block">
        <div className={labelClass()}>
          <span>Contraste</span>
          <span>{contrast}%</span>
        </div>
        <input
          type="range"
          min={20}
          max={200}
          value={contrast}
          onChange={(e) => update({ c: Number(e.target.value) })}
          className={sliderClass()}
        />
      </label>

      {/* Shape selector */}
      <div>
        <p className={cn(labelClass(), "mb-1.5")}>
          <span>Forma de punto</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ sh: "circle" })}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-[4px] border py-1 text-[10px] transition-colors",
              shape === "circle"
                ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
            )}
          >
            <Circle className="h-3 w-3" /> Círculo
          </button>
          <button
            type="button"
            onClick={() => update({ sh: "square" })}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-[4px] border py-1 text-[10px] transition-colors",
              shape === "square"
                ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
            )}
          >
            <span className="inline-block h-3 w-3 border border-current" /> Cuadrado
          </button>
        </div>
      </div>

      {/* Color controls */}
      <div className="flex flex-col gap-2 rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] p-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#111827]">Color de puntos</span>
          <label className="flex items-center gap-1.5 text-[10px] text-[#64748B] cursor-pointer">
            <input
              type="checkbox"
              checked={useOriginalColor}
              onChange={(e) => update({ origCol: e.target.checked })}
              className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
            />
            Color original
          </label>
        </div>

        {!useOriginalColor && (
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
              <span>Tinta:</span>
              <input
                type="color"
                value={dotColor}
                onChange={(e) => update({ dc: e.target.value })}
                className="h-6 w-8 cursor-pointer rounded border border-[#E2E8F0] p-0"
              />
            </label>
          </div>
        )}

        <div className="border-t border-[#E2E8F0] pt-2">
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#64748B]">
              <input
                type="checkbox"
                checked={isTransparentBg}
                onChange={(e) => update({ trans: e.target.checked })}
                className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
              />
              Fondo transparente
            </label>
            {!isTransparentBg && (
              <label className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
                <span>Fondo:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => update({ bg: e.target.value })}
                  className="h-6 w-8 cursor-pointer rounded border border-[#E2E8F0] p-0"
                />
              </label>
            )}
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-[#64748B]">
            <input
              type="checkbox"
              checked={invert}
              onChange={(e) => update({ inv: e.target.checked })}
              className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
            />
            Invertir luminosidad
          </label>
        </div>
      </div>

      {processing && (
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <Loader2 className="h-3 w-3 animate-spin text-[#2563EB]" /> Procesando semitono...
        </div>
      )}

      {previewSrc && (
        <div
          className="overflow-hidden rounded-[4px] border border-[#E2E8F0]"
          style={{
            background: isTransparentBg
              ? "repeating-conic-gradient(#CBD5E1 0% 25%, #F8FAFC 0% 50%) 0 0 / 10px 10px"
              : bgColor,
          }}
        >
          <img
            src={previewSrc}
            alt="Halftone preview"
            className="h-28 w-full object-contain"
            style={{
              transform: `scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
            }}
          />
        </div>
      )}

      <Commit
        disabled={processing || !previewSrc}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    </div>
  );
}

function SemitransparencyTool({
  layer,
  onApply,
  onCancel,
}: {
  layer: DesignerLayer;
  onApply: (processedSrc: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [processing, setProcessing] = React.useState(true);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const processingAbortRef = React.useRef<AbortController | null>(null);
  const src = layer.processedSrc ?? layer.src ?? layer.preview;

  React.useEffect(() => {
    if (!src) {
      setProcessing(false);
      setErrorMessage("No hay una imagen disponible para procesar.");
      return;
    }

    const controller = new AbortController();
    processingAbortRef.current = controller;
    setProcessing(true);
    setErrorMessage(null);
    void processRasterImageUrl(
      src,
      {
        kind: "cleanup-semitransparency",
        options: { strategy: "remove" },
        previewMaxDimension: 500,
      },
      controller.signal,
    )
      .then((result) => blobToDataUrl(result.blob))
      .then((preview) => {
        if (!controller.signal.aborted) setPreviewSrc(preview);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron limpiar las semitransparencias.",
        );
      })
      .finally(() => {
        if (processingAbortRef.current === controller) {
          processingAbortRef.current = null;
          setProcessing(false);
        }
      });

    return () => {
      controller.abort();
      if (processingAbortRef.current === controller) {
        processingAbortRef.current = null;
      }
    };
  }, [src]);

  const handleApply = async () => {
    if (!src || processing) return;
    const controller = new AbortController();
    processingAbortRef.current = controller;
    setProcessing(true);
    setErrorMessage(null);
    try {
      const result = await processRasterImageUrl(
        src,
        {
          kind: "cleanup-semitransparency",
          options: { strategy: "remove" },
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      await onApply(await blobToDataUrl(result.blob));
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setErrorMessage(error.message);
      }
    } finally {
      if (processingAbortRef.current === controller) {
        processingAbortRef.current = null;
        setProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] leading-relaxed text-[#64748B]">
        Elimina píxeles con alpha parcial y conserva el original para poder
        restaurarlo.
      </p>
      {processing && (
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <Loader2 className="h-3 w-3 animate-spin text-[#2563EB]" />
          Procesando…
        </div>
      )}
      {previewSrc && (
        <img
          src={previewSrc}
          alt="Preview sin semitransparencias"
          className="h-28 w-full rounded-[4px] border border-[#E2E8F0] object-contain"
        />
      )}
      {errorMessage && (
        <p role="alert" className="text-[10px] text-[#B91C1C]">
          {errorMessage}
        </p>
      )}
      <Commit
        disabled={processing || !previewSrc}
        onApply={handleApply}
        onCancel={onCancel}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Adjustments Tool (real pixel processing with preview)
// ─────────────────────────────────────────────────────────────────────────────

function AdjustmentsTool({
  layer,
  onApply,
  onCancel,
}: {
  layer: DesignerLayer;
  onApply: (
    processedSrc: string,
    adj: AdjustmentValues,
  ) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [brightness, setBrightness] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [saturation, setSaturation] = React.useState(100);
  const [processing, setProcessing] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = React.useRef(0);
  const isMountedRef = React.useRef(false);
  const processingAbortRef = React.useRef<AbortController | null>(null);

  const src = layer.processedSrc ?? layer.src ?? layer.preview;

  const generatePreview = React.useCallback(
    async (b: number, c: number, s: number) => {
      if (!src) return;
      const currentGeneration = ++generationRef.current;
      processingAbortRef.current?.abort();
      const controller = new AbortController();
      processingAbortRef.current = controller;
      setProcessing(true);
      try {
        const result = await applyAdjustments(src, {
          brightness: b,
          contrast: c,
          saturation: s,
        }, controller.signal);
        if (isMountedRef.current && currentGeneration === generationRef.current) {
          setPreviewSrc(result);
        }
      } catch (error) {
        const cancelled = error instanceof Error && error.name === "AbortError";
        if (!cancelled && isMountedRef.current && currentGeneration === generationRef.current) {
          console.error("Failed to preview image adjustments.", error);
          setPreviewSrc(null);
        }
      } finally {
        if (processingAbortRef.current === controller) {
          processingAbortRef.current = null;
        }
        if (isMountedRef.current && currentGeneration === generationRef.current) {
          setProcessing(false);
        }
      }
    },
    [src]
  );

  React.useEffect(
    () => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        processingAbortRef.current?.abort();
      };
    },
    [],
  );

  const handleCancel = () => {
    generationRef.current++;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    processingAbortRef.current?.abort();
    setPreviewSrc(null);
    onCancel();
  };

  const schedulePreview = (b: number, c: number, s: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => generatePreview(b, c, s), 400);
  };

  const mk =
    (setter: (v: number) => void, key: "b" | "c" | "s") =>
    (v: number) => {
      setter(v);
      const b2 = key === "b" ? v : brightness;
      const c2 = key === "c" ? v : contrast;
      const s2 = key === "s" ? v : saturation;
      schedulePreview(b2, c2, s2);
    };

  return (
    <div className="space-y-3">
      <label className="block">
        <div className={labelClass()}>
          <span>Brillo</span>
          <span>{brightness}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={brightness}
          onChange={(e) => mk(setBrightness, "b")(Number(e.target.value))}
          className={sliderClass()}
        />
      </label>
      <label className="block">
        <div className={labelClass()}>
          <span>Contraste</span>
          <span>{contrast}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={contrast}
          onChange={(e) => mk(setContrast, "c")(Number(e.target.value))}
          className={sliderClass()}
        />
      </label>
      <label className="block">
        <div className={labelClass()}>
          <span>Saturación</span>
          <span>{saturation}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={200}
          value={saturation}
          onChange={(e) => mk(setSaturation, "s")(Number(e.target.value))}
          className={sliderClass()}
        />
      </label>

      {processing && (
        <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <Loader2 className="h-3 w-3 animate-spin text-[#2563EB]" /> Calculando…
        </div>
      )}

      {previewSrc && !processing && (
        <img
          src={previewSrc}
          alt="Preview ajustes"
          className="h-24 w-full rounded-[4px] border border-[#E2E8F0] object-contain"
          style={{
            transform: `scaleX(${layer.flipX ? -1 : 1}) scaleY(${layer.flipY ? -1 : 1})`,
          }}
        />
      )}

      <Commit
        disabled={!previewSrc || processing}
        onApply={async () => {
          if (previewSrc) {
            await onApply(previewSrc, { brightness, contrast, saturation });
          }
        }}
        onCancel={() => {
          handleCancel();
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ImageTools panel
// ─────────────────────────────────────────────────────────────────────────────

export function ImageTools({ layer, onUpdateLayer, onOpenCrop }: ImageToolsProps) {
  const [activeTool, setActiveTool] = React.useState<ActiveTool>("none");
  const [isPathEraserOpen, setIsPathEraserOpen] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [processingError, setProcessingError] = React.useState<string | null>(
    null,
  );
  const simpleProcessingAbortRef = React.useRef<AbortController | null>(null);

  const src = layer.processedSrc ?? layer.src ?? layer.preview;
  const isLocked = layer.locked;

  React.useEffect(
    () => () => simpleProcessingAbortRef.current?.abort(),
    [],
  );

  /** Commit a processed image to the layer (creates processedSrc, updates preview thumbnail).
   *  This is the ONLY place a history entry is generated for image tools. */
  const commitProcessed = React.useCallback(
    async (processedSrc: string, opLabel: string) => {
      setProcessingError(null);
      try {
        const preview = await createThumbnailDataUrl(processedSrc);
        onUpdateLayer(layer.id, {
          processedSrc,
          lastOp: opLabel as DesignerLayer["lastOp"],
          preview,
        });
        setActiveTool("none");
      } catch (error) {
        setProcessingError(
          error instanceof Error
            ? error.message
            : "No se pudo guardar el resultado de imagen.",
        );
      }
    },
    [layer.id, onUpdateLayer]
  );

  const restore = () => {
    const orig = layer.src ?? layer.preview;
    if (orig) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const thumb = document.createElement("canvas");
        thumb.width = 56;
        thumb.height = 56;
        const tCtx = thumb.getContext("2d")!;
        tCtx.clearRect(0, 0, 56, 56);
        tCtx.drawImage(img, 0, 0, 56, 56);
        onUpdateLayer(layer.id, {
          processedSrc: null,
          lastOp: "none",
          preview: thumb.toDataURL("image/png"),
        });
      };
      img.src = orig;
    } else {
      onUpdateLayer(layer.id, { processedSrc: null, lastOp: "none" });
    }
  };

  const runSimple = async (
    fn: (signal: AbortSignal) => Promise<string>,
    opLabel: string,
  ) => {
    if (!src || isLocked) return;
    simpleProcessingAbortRef.current?.abort();
    const controller = new AbortController();
    simpleProcessingAbortRef.current = controller;
    setProcessing(true);
    try {
      const result = await fn(controller.signal);
      if (!controller.signal.aborted) await commitProcessed(result, opLabel);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        console.error(`${opLabel} failed:`, error);
      }
    } finally {
      if (simpleProcessingAbortRef.current === controller) {
        simpleProcessingAbortRef.current = null;
      }
      if (!controller.signal.aborted) setProcessing(false);
    }
  };

  if (isLocked) {
    return (
      <div className="rounded border border-[#FEF08A] bg-[#FFFBEB] p-2 text-[10px] text-[#92400E]">
        Capa bloqueada. Desbloquea para editar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick one-click operations */}
      <Section title="Operaciones">
        <ToolBtn
          icon={Contrast}
          label={processing ? "Procesando…" : "Escala de grises"}
          active={layer.lastOp === "grayscale"}
          onClick={() => runSimple((signal) => applyGrayscale(src, signal), "grayscale")}
        />
        <ToolBtn
          icon={RefreshCw}
          label={processing ? "Procesando…" : "Invertir colores"}
          active={layer.lastOp === "invert"}
          onClick={() => runSimple((signal) => applyInvert(src, signal), "invert")}
        />
        {layer.processedSrc && (
          <ToolBtn icon={RotateCcw} label="Restaurar original" onClick={restore} />
        )}
      </Section>

      {/* Tool panels */}
      <Section title="Herramientas">
        {onOpenCrop && (
          <ToolBtn icon={Crop} label="Recortar imagen…" onClick={onOpenCrop} />
        )}
        <ToolBtn
          icon={PenTool}
          label="Recorte poligonal…"
          onClick={() => setIsPathEraserOpen(true)}
        />

        <ToolBtn
          icon={ImageMinus}
          label="Eliminar fondo"
          active={activeTool === "remove-bg"}
          onClick={() =>
            setActiveTool(activeTool === "remove-bg" ? "none" : "remove-bg")
          }
        />
        {activeTool === "remove-bg" && (
          <div className="ml-1 border-l-2 border-[#2563EB]/30 pl-2">
            <RemoveBgTool
              layer={layer}
              onApply={(r) => commitProcessed(r, "remove-background")}
              onCancel={() => setActiveTool("none")}
            />
          </div>
        )}

        <ToolBtn
          icon={Circle}
          label="Semitono / Halftone"
          active={activeTool === "halftone"}
          onClick={() =>
            setActiveTool(activeTool === "halftone" ? "none" : "halftone")
          }
        />
        {activeTool === "halftone" && (
          <div className="ml-1 border-l-2 border-[#2563EB]/30 pl-2">
            <HalftoneTool
              layer={layer}
              onApply={(r) => commitProcessed(r, "halftone")}
              onCancel={() => setActiveTool("none")}
            />
          </div>
        )}

        <ToolBtn
          icon={RefreshCw}
          label="Eliminar semitransparencias"
          active={activeTool === "semitransparency"}
          onClick={() =>
            setActiveTool(
              activeTool === "semitransparency" ? "none" : "semitransparency",
            )
          }
        />
        {activeTool === "semitransparency" && (
          <div className="ml-1 border-l-2 border-[#2563EB]/30 pl-2">
            <SemitransparencyTool
              layer={layer}
              onApply={(result) =>
                commitProcessed(result, "cleanup-semitransparency")
              }
              onCancel={() => setActiveTool("none")}
            />
          </div>
        )}

        <ToolBtn
          icon={SlidersHorizontal}
          label="Ajustes"
          active={activeTool === "adjustments"}
          onClick={() =>
            setActiveTool(activeTool === "adjustments" ? "none" : "adjustments")
          }
        />
        {activeTool === "adjustments" && (
          <div className="ml-1 border-l-2 border-[#2563EB]/30 pl-2">
            <AdjustmentsTool
              layer={layer}
              onApply={(r) => commitProcessed(r, "adjustments")}
              onCancel={() => setActiveTool("none")}
            />
          </div>
        )}
      </Section>

      {processingError && (
        <p role="alert" className="text-[10px] text-[#B91C1C]">
          {processingError}
        </p>
      )}

      {isPathEraserOpen && (
        <PathEraserModal
          layer={layer}
          onApply={(result) => commitProcessed(result, "path-erase")}
          onClose={() => setIsPathEraserOpen(false)}
        />
      )}

      {layer.lastOp && layer.lastOp !== "none" && (
        <p className="text-[9px] text-[#94A3B8]">
          Op. activa:{" "}
          <strong className="text-[#2563EB]">{layer.lastOp}</strong> · Original
          conservado
        </p>
      )}
    </div>
  );
}
