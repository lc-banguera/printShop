import * as React from "react";
import { Check, Loader2, PenTool, RotateCcw, X } from "lucide-react";
import { processRasterImage } from "@/core/design/processing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import type { VectorPath } from "../../../../../engine/src/paths";
import type { DesignerLayer, Point } from "./types";

interface PathEraserModalProps {
  layer: DesignerLayer;
  onApply: (processedSrc: string) => void | Promise<void>;
  onClose: () => void;
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo codificar el resultado del recorte."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el resultado."));
    reader.readAsDataURL(blob);
  });
}

function toVectorPath(points: Point[]): VectorPath {
  const anchors = points.map((point, index) => ({
    id: `anchor-${index}`,
    ...point,
    type: "CORNER" as const,
  }));
  return {
    id: `advanced-path-${Date.now()}`,
    closed: true,
    anchors,
    segments: anchors.map((anchor, index) => ({
      id: `segment-${index}`,
      type: "LINE" as const,
      startAnchorId: anchor.id,
      endAnchorId: anchors[(index + 1) % anchors.length].id,
    })),
  };
}

export function PathEraserModal({ layer, onApply, onClose }: PathEraserModalProps) {
  const source = layer.processedSrc ?? layer.src ?? layer.preview;
  const imageRef = React.useRef<HTMLImageElement>(null);
  const controllerRef = React.useRef<AbortController | null>(null);
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [points, setPoints] = React.useState<Point[]>([]);
  const [isClosed, setIsClosed] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => () => controllerRef.current?.abort(), []);

  const getPoint = (clientX: number, clientY: number): Point | null => {
    const image = imageRef.current;
    const bounds = image?.getBoundingClientRect();
    if (!image || !bounds || !image.naturalWidth || !image.naturalHeight) return null;
    const scale = Math.min(
      bounds.width / image.naturalWidth,
      bounds.height / image.naturalHeight,
    );
    const drawnWidth = image.naturalWidth * scale;
    const drawnHeight = image.naturalHeight * scale;
    const offsetX = (bounds.width - drawnWidth) / 2;
    const offsetY = (bounds.height - drawnHeight) / 2;
    return {
      x: Math.max(0, Math.min(image.naturalWidth, (clientX - bounds.left - offsetX) / scale)),
      y: Math.max(0, Math.min(image.naturalHeight, (clientY - bounds.top - offsetY) / scale)),
    };
  };

  const addPoint = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isClosed || isProcessing) return;
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    const firstPoint = points[0];
    const bounds = imageRef.current?.getBoundingClientRect();
    if (firstPoint && points.length >= 3 && bounds) {
      const distance = Math.hypot(
        (point.x - firstPoint.x) * (bounds.width / imageSize.width),
        (point.y - firstPoint.y) * (bounds.height / imageSize.height),
      );
      if (distance <= 16) {
        setIsClosed(true);
        return;
      }
    }
    setPoints((current) => [...current, point]);
    setErrorMessage(null);
  };

  const handleApply = async () => {
    if (!source || !isClosed || points.length < 3 || isProcessing) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const response = await fetch(source, { signal: controller.signal });
      if (!response.ok) throw new Error(`No se pudo cargar la imagen (${response.status}).`);
      const sourceBlob = await response.blob();
      const selection = await processRasterImage(
        sourceBlob,
        { kind: "create-path-selection", path: toVectorPath(points) },
        controller.signal,
      );
      const erased = await processRasterImage(
        sourceBlob,
        { kind: "erase-mask", mask: selection.blob },
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
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsProcessing(false);
      }
    }
  };

  const svgPath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
  const outsidePath =
    isClosed && imageSize.width && imageSize.height
      ? `M0 0H${imageSize.width}V${imageSize.height}H0Z ${svgPath}Z`
      : "";

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
            <PenTool className="h-4 w-4 text-[#2563EB]" />
            <div>
              <DialogTitle className="text-sm font-bold text-[#111827]">Recorte poligonal</DialogTitle>
              <DialogDescription className="text-xs text-[#64748B]">Se conserva el interior del contorno; el exterior se vuelve transparente.</DialogDescription>
            </div>
          </div>
          <button type="button" aria-label="Cerrar" disabled={isProcessing} onClick={onClose} className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-auto p-4">
          <div
            className="relative mx-auto h-[min(58vh,520px)] w-full max-w-3xl cursor-crosshair touch-none overflow-hidden bg-[#F1F5F9]"
            onPointerDown={addPoint}
            aria-label="Imagen para trazar el contorno"
          >
            {source ? (
              <img
                ref={imageRef}
                src={source}
                alt={layer.name}
                draggable={false}
                onLoad={(event) => setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
              />
            ) : (
              <p className="p-6 text-sm text-[#64748B]">La capa no tiene una imagen para recortar.</p>
            )}
            {imageSize.width > 0 && (
              <svg
                viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                preserveAspectRatio="xMidYMid meet"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {outsidePath && <path d={outsidePath} fill="rgba(239,68,68,0.38)" fillRule="evenodd" />}
                {points.length > 0 && (
                  <>
                    <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="white" strokeWidth={Math.max(2, imageSize.width / 300)} />
                    <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#0F172A" strokeWidth={Math.max(1, imageSize.width / 600)} strokeDasharray={isClosed ? "8 5" : undefined} />
                    {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r={Math.max(3, imageSize.width / 180)} fill="white" stroke="#0F172A" strokeWidth={Math.max(1, imageSize.width / 500)} />)}
                  </>
                )}
              </svg>
            )}
          </div>
          <p className="mt-2 text-xs text-[#64748B]" role="status">
            {isClosed ? "Contorno cerrado. El área roja se eliminará al aplicar." : "Marca al menos tres puntos y vuelve al primero o usa Cerrar contorno."}
          </p>
          {errorMessage && <p role="alert" className="mt-2 text-xs text-red-700">{errorMessage}</p>}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-4 py-3">
          <div className="flex gap-2">
            <button type="button" disabled={!points.length || isProcessing} onClick={() => { setPoints((current) => current.slice(0, -1)); setIsClosed(false); }} className="inline-flex items-center gap-1 rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40">
              <RotateCcw className="h-3.5 w-3.5" /> Quitar punto
            </button>
            <button type="button" disabled={points.length < 3 || isClosed || isProcessing} onClick={() => setIsClosed(true)} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40">
              Cerrar contorno
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={isProcessing} onClick={onClose} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40">Cancelar</button>
            <button type="button" disabled={!isClosed || isProcessing} onClick={() => void handleApply()} className="inline-flex items-center gap-1 rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {isProcessing ? "Procesando…" : "Eliminar exterior"}
            </button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}