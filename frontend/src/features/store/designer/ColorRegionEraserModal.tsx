import * as React from "react";
import { Check, Loader2, Pipette, X } from "lucide-react";
import {
  processRasterImage,
  processRasterImageUrl,
} from "@/core/design/processing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { DesignerLayer, Point } from "./types";

interface ColorRegionEraserModalProps {
  layer: DesignerLayer;
  onApply: (processedSrc: string) => void | Promise<void>;
  onClose: () => void;
}

type SelectionCombineMode = "replace" | "add" | "subtract" | "intersect";

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo codificar el resultado de la selección."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el resultado."));
    reader.readAsDataURL(blob);
  });
}

export function ColorRegionEraserModal({
  layer,
  onApply,
  onClose,
}: ColorRegionEraserModalProps) {
  const source = layer.processedSrc ?? layer.src ?? layer.preview;
  const imageRef = React.useRef<HTMLImageElement>(null);
  const previewUrlRef = React.useRef<string | null>(null);
  const maskBlobRef = React.useRef<Blob | null>(null);
  const baseMaskBlobRef = React.useRef<Blob | null>(null);
  const requestRef = React.useRef<AbortController | null>(null);
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [seed, setSeed] = React.useState<Point | null>(null);
  const [tolerance, setTolerance] = React.useState(32);
  const [connectivity, setConnectivity] = React.useState<4 | 8>(8);
  const [nonContiguous, setNonContiguous] = React.useState(false);
  const [combineMode, setCombineMode] = React.useState<SelectionCombineMode>("replace");
  const combineModeRef = React.useRef(combineMode);
  combineModeRef.current = combineMode;
  const [hasSelection, setHasSelection] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const replacePreview = (blob: Blob | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextUrl = blob ? URL.createObjectURL(blob) : null;
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  };

  React.useEffect(
    () => () => {
      requestRef.current?.abort();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  React.useEffect(() => {
    if (!source || !seed) {
      setIsProcessing(false);
      return;
    }

    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    setIsProcessing(true);
    setErrorMessage(null);
    void processRasterImageUrl(
      source,
      nonContiguous
        ? { kind: "select-similar-colors", x: seed.x, y: seed.y, tolerance }
        : { kind: "select-color-region", x: seed.x, y: seed.y, tolerance, connectivity },
      controller.signal,
    )
      .then(async (result) => {
        if (controller.signal.aborted) return;
        let nextMask = result.blob;
        const base = baseMaskBlobRef.current;
        const mode = combineModeRef.current;
        if (base && mode !== "replace") {
          const response = await fetch(source, { signal: controller.signal });
          if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status}).`);
          const combined = await processRasterImage(
            await response.blob(),
            { kind: "combine-selection-mask", mode, base, overlay: result.blob },
            controller.signal,
          );
          nextMask = combined.blob;
        }
        if (controller.signal.aborted) return;
        maskBlobRef.current = nextMask;
        setHasSelection(true);
        replacePreview(nextMask);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setErrorMessage(error.message);
        }
      })
      .finally(() => {
        if (requestRef.current === controller) {
          requestRef.current = null;
          setIsProcessing(false);
        }
      });

    return () => controller.abort();
  }, [connectivity, nonContiguous, seed, source, tolerance]);

  const handleImageClick = (event: React.PointerEvent<HTMLDivElement>) => {
    const image = imageRef.current;
    const bounds = image?.getBoundingClientRect();
    if (!image || !bounds || !image.naturalWidth || !image.naturalHeight) return;
    const scale = Math.min(
      bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight,
    );
    const offsetX = (bounds.width - image.naturalWidth * scale) / 2;
    const offsetY = (bounds.height - image.naturalHeight * scale) / 2;
    baseMaskBlobRef.current = maskBlobRef.current;
    setSeed({
      x: Math.max(0, Math.min(image.naturalWidth - 1, Math.floor((event.clientX - bounds.left - offsetX) / scale))),
      y: Math.max(0, Math.min(image.naturalHeight - 1, Math.floor((event.clientY - bounds.top - offsetY) / scale))),
    });
  };

  const invertSelection = async () => {
    const base = maskBlobRef.current;
    if (!source || !base || isProcessing) return;
    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch(source, { signal: controller.signal });
      if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status}).`);
      const result = await processRasterImage(
        await response.blob(),
        { kind: "combine-selection-mask", mode: "invert", base },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      maskBlobRef.current = result.blob;
      baseMaskBlobRef.current = result.blob;
      setHasSelection(true);
      setSeed(null);
      replacePreview(result.blob);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setErrorMessage(error.message);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsProcessing(false);
      }
    }
  };

  const clearSelection = () => {
    requestRef.current?.abort();
    maskBlobRef.current = null;
    baseMaskBlobRef.current = null;
    setHasSelection(false);
    setSeed(null);
    replacePreview(null);
  };

  const handleApply = async () => {
    const mask = maskBlobRef.current;
    if (!source || !mask || isProcessing) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch(source, { signal: controller.signal });
      if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status}).`);
      const erased = await processRasterImage(
        await response.blob(),
        { kind: "erase-mask", mask },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      await onApply(await toDataUrl(erased.blob));
      onClose();
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setErrorMessage(error.message);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsProcessing(false);
      }
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isProcessing) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[92vh] w-[min(96vw,960px)] max-w-none flex-col overflow-hidden p-0"
        onKeyDown={(event) => event.stopPropagation()}
        onEscapeKeyDown={(event) => {
          event.stopPropagation();
          if (isProcessing) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (isProcessing) event.preventDefault();
        }}
      >
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
          <div className="flex items-center gap-2">
            <Pipette className="h-4 w-4 text-[#2563EB]" />
            <div>
              <DialogTitle className="text-sm font-bold text-[#111827]">Selección mágica por color</DialogTitle>
              <DialogDescription className="text-xs text-[#64748B]">Construye una máscara con una semilla y aplícala como borrado raster al artwork.</DialogDescription>
            </div>
          </div>
          <button type="button" aria-label="Cerrar" disabled={isProcessing} onClick={onClose} className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-auto p-4">
          <div
            className="relative mx-auto h-[min(52vh,480px)] w-full max-w-3xl cursor-crosshair touch-none overflow-hidden bg-[#F1F5F9]"
            onPointerDown={handleImageClick}
            aria-label="Imagen para seleccionar una región por color"
          >
            {source && (
              <img
                ref={imageRef}
                src={source}
                alt={layer.name}
                draggable={false}
                onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
              />
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Vista previa de la región seleccionada"
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-contain"
              />
            )}
            {seed && imageSize.width > 0 && (
              <svg viewBox={`0 0 ${imageSize.width} ${imageSize.height}`} preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <circle cx={seed.x} cy={seed.y} r={Math.max(5, imageSize.width / 100)} fill="white" stroke="#0F172A" strokeWidth={Math.max(2, imageSize.width / 300)} />
              </svg>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-[#475569]">
              <span className="mb-1 flex justify-between"><span>Tolerancia de color</span><span>{tolerance}</span></span>
              <input type="range" min="0" max="441" step="1" value={tolerance} onChange={(event) => setTolerance(Number(event.target.value))} className="h-1.5 w-full accent-[#2563EB]" />
            </label>
            <label className="block text-xs text-[#475569]">
              <span className="mb-1 block">Conectividad</span>
              <select disabled={nonContiguous} value={connectivity} onChange={(event) => setConnectivity(Number(event.target.value) as 4 | 8)} className="h-9 w-full rounded border border-[#CBD5E1] bg-white px-2 text-xs text-[#334155] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50">
                <option value={4}>4 vecinos</option>
                <option value={8}>8 vecinos</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#475569] sm:col-span-2">
              <input type="checkbox" checked={nonContiguous} onChange={(event) => { baseMaskBlobRef.current = maskBlobRef.current; setNonContiguous(event.target.checked); }} />
              Incluir colores similares aunque estén desconectados
            </label>
            <div className="sm:col-span-2">
              <span className="mb-1 block text-xs text-[#475569]">Combinar con la máscara previa</span>
              <div role="group" aria-label="Operación de máscara" className="flex flex-wrap gap-1">
                {(["replace", "add", "subtract", "intersect"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={combineMode === mode}
                    disabled={mode !== "replace" && !hasSelection}
                    onClick={() => setCombineMode(mode)}
                    className={`rounded border px-2.5 py-1.5 text-xs disabled:opacity-40 ${combineMode === mode ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]" : "border-[#CBD5E1] text-[#475569]"}`}
                  >
                    {{ replace: "Reemplazar", add: "Añadir", subtract: "Restar", intersect: "Intersectar" }[mode]}
                  </button>
                ))}
                <button type="button" disabled={!hasSelection || isProcessing} onClick={() => void invertSelection()} className="rounded border border-[#CBD5E1] px-2.5 py-1.5 text-xs text-[#475569] disabled:opacity-40">Invertir</button>
                <button type="button" disabled={!hasSelection || isProcessing} onClick={clearSelection} className="rounded border border-[#CBD5E1] px-2.5 py-1.5 text-xs text-[#475569] disabled:opacity-40">Limpiar</button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#64748B]" role="status">
            {isProcessing ? "Procesando máscara…" : hasSelection ? "La máscara roja se eliminará del artwork al aplicar." : "Haz clic en la región de color que quieras seleccionar."}
          </p>
          {errorMessage && <p role="alert" className="mt-2 text-xs text-red-700">{errorMessage}</p>}
        </div>

        <footer className="flex justify-end gap-2 border-t border-[#E2E8F0] px-4 py-3">
          <button type="button" disabled={isProcessing} onClick={onClose} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40">Cancelar</button>
          <button type="button" disabled={!maskBlobRef.current || isProcessing} onClick={() => void handleApply()} className="inline-flex items-center gap-1 rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
            {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isProcessing ? "Procesando…" : "Aplicar borrado"}
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}