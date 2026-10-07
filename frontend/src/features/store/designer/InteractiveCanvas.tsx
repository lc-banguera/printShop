import * as React from "react";
import { Lock, RotateCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { DesignerLayer, FilterValues, Point } from "./types";
import { getLayerDimensions } from "./coordinates";
import { getHandlePositions } from "./hitTest";
import { useCanvasInteraction } from "./useCanvasInteraction";
import { createAffineTransform } from "../../../../../engine/src/transform/affine-transform";

const DEFAULT_FILTERS: FilterValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
};

interface InteractiveCanvasProps {
  layers: DesignerLayer[];
  selectedLayerIds: string[];
  previewUrl?: string;
  documentWidth: number;
  documentHeight: number;
  documentRotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  zoom: number;
  pan: Point;
  activeTool: string;
  showGrid: boolean;
  showSafeArea: boolean;
  showGuides: boolean;
  onUpdateZoom: (zoom: number) => void;
  onUpdatePan: (pan: Point) => void;
  onSelectLayer: (id: string, additive?: boolean) => void;
  onSelectMultipleLayers?: (ids: string[]) => void;
  onDeselect: () => void;
  onUpdateLayer: (id: string, changes: Partial<DesignerLayer>) => void;
  onUpdateMultipleLayers?: (
    updates: { id: string; changes: Partial<DesignerLayer> }[]
  ) => void;
  onUpdateText: (changes: Partial<DesignerLayer>) => void;
}

export function InteractiveCanvas({
  layers,
  selectedLayerIds,
  previewUrl,
  documentWidth,
  documentHeight,
  documentRotation,
  flipHorizontal,
  flipVertical,
  brightness,
  contrast,
  saturation,
  zoom,
  pan,
  activeTool,
  showGrid,
  showSafeArea,
  showGuides,
  onUpdateZoom,
  onUpdatePan,
  onSelectLayer,
  onSelectMultipleLayers,
  onDeselect,
  onUpdateLayer,
  onUpdateMultipleLayers,
  onUpdateText,
}: InteractiveCanvasProps) {
  const canvasBoardRef = React.useRef<HTMLDivElement>(null);
  const [editingTextId, setEditingTextId] = React.useState<string | null>(null);

  const {
    liveTransforms,
    marqueeRect,
    activeGuides,
    hoverCursor,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleWheel,
  } = useCanvasInteraction({
    canvasDomRef: canvasBoardRef,
    layers,
    selectedLayerIds,
    activeTool,
    zoom,
    pan,
    showGrid,
    onUpdateZoom,
    onUpdatePan,
    onSelectLayer,
    onSelectMultipleLayers,
    onDeselect,
    onUpdateLayer,
    onUpdateMultipleLayers,
  });

  // Base canvas size in CSS px (at 100% zoom)
  const baseSize = 480;

  // Document aspect-ratio style
  const aspectW = documentWidth || 3000;
  const aspectH = documentHeight || 3000;

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden select-none"
      onWheel={handleWheel}
      style={{ cursor: hoverCursor, touchAction: "none" }}
    >
      {/* Canvas board with Pan + Zoom transform */}
      <div
        ref={canvasBoardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100}) rotate(${documentRotation}deg)`,
          transformOrigin: "center center",
          width: `${baseSize}px`,
          height: `${Math.round(baseSize * (aspectH / aspectW))}px`,
        }}
        className="relative bg-white shadow-md transition-[transform] duration-75 ease-out select-none border border-[#E2E8F0]"
      >
        {/* ── Safe Area ─────────────────────────────────────────────────────── */}
        {showSafeArea && (
          <>
            <div className="pointer-events-none absolute inset-6 border border-dashed border-[#2563EB]/60 z-20" />
            <span className="pointer-events-none absolute left-7 top-7 bg-white/90 px-1 py-0.5 text-[9px] font-semibold text-[#2563EB] rounded-[2px] shadow-xs z-20">
              Área segura
            </span>
          </>
        )}

        {/* ── Center guides ─────────────────────────────────────────────────── */}
        {showGuides && (
          <>
            <span className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px bg-[#2563EB]/30 z-20" />
            <span className="pointer-events-none absolute top-1/2 left-0 right-0 h-px bg-[#2563EB]/30 z-20" />
          </>
        )}

        {/* ── Snapping guides ───────────────────────────────────────────────── */}
        {activeGuides.map((guide, idx) => {
          if (guide.type === "vertical") {
            const leftPercent = 50 + (guide.position / baseSize) * 100;
            return (
              <span
                key={`snap-v-${idx}`}
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-[#2563EB] z-30"
                style={{ left: `${leftPercent}%` }}
              />
            );
          } else {
            const topPercent = 50 + (guide.position / baseSize) * 100;
            return (
              <span
                key={`snap-h-${idx}`}
                className="pointer-events-none absolute left-0 right-0 h-px bg-[#2563EB] z-30"
                style={{ top: `${topPercent}%` }}
              />
            );
          }
        })}

        {/* ── Layer rendering ──────────────────────────────────────────────── */}
        <div className="absolute inset-0 overflow-hidden">
          {layers.map((layer, index) => {
            if (!layer.visible) return null;

            const live = liveTransforms.get(layer.id);
            const dims = getLayerDimensions(layer);

            const posX = live ? live.x : (layer.x ?? 0);
            const posY = live ? live.y : (layer.y ?? 0);
            const width = live ? live.width : dims.width;
            const height = live ? live.height : dims.height;
            const rotation = live ? live.rotation : (layer.rotation ?? 0);
            const layerTransform = createAffineTransform({
              rotationDegrees: rotation,
              scaleX: layer.type === "image"
                ? (flipHorizontal ? -1 : 1) * (layer.flipX ? -1 : 1)
                : 1,
              scaleY: layer.type === "image"
                ? (flipVertical ? -1 : 1) * (layer.flipY ? -1 : 1)
                : 1,
            });

            // Center-origin positioning
            const leftOffset = baseSize / 2 + posX;
            const topOffset = Math.round(baseSize * (aspectH / aspectW)) / 2 + posY;

            const layerStyle: React.CSSProperties = {
              position: "absolute",
              left: `${leftOffset}px`,
              top: `${topOffset}px`,
              width: `${width}px`,
              height: `${height}px`,
              zIndex: layers.length - index,
              opacity: (layer.opacity ?? 100) / 100,
              transform: `translate(-50%, -50%) matrix(${layerTransform.a}, ${layerTransform.b}, ${layerTransform.c}, ${layerTransform.d}, ${layerTransform.e}, ${layerTransform.f})`,
              transformOrigin: "center center",
            };

            const filters = { ...DEFAULT_FILTERS, ...layer.filters };

            // CSS filter string for non-destructive display filters
            const filterStr = [
              `brightness(${filters.brightness}%)`,
              `contrast(${filters.contrast}%)`,
              `saturate(${filters.saturation}%)`,
              `grayscale(${filters.grayscale}%)`,
              `sepia(${filters.sepia}%)`,
              `invert(${filters.invert}%)`,
              filters.blur > 0 ? `blur(${filters.blur}px)` : "",
            ]
              .filter(Boolean)
              .join(" ");

            const isEditing = editingTextId === layer.id;

            // ── Background layer ──────────────────────────────────────────
            if (layer.type === "background") {
              return (
                <div
                  key={layer.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: layers.length - index,
                    backgroundColor: layer.fill ?? "#ffffff",
                  }}
                />
              );
            }

            return (
              <div
                key={layer.id}
                style={layerStyle}
                className="pointer-events-none flex items-center justify-center"
                onDoubleClick={() => {
                  if (layer.type === "text" && !layer.locked) {
                    setEditingTextId(layer.id);
                  }
                }}
              >
                {/* ── Image layer ──────────────────────────────────────── */}
                {layer.type === "image" && (
                  <img
                    // Use processedSrc if available (modified image), else src, else preview
                    src={layer.processedSrc ?? layer.src ?? previewUrl ?? layer.preview}
                    alt={layer.name}
                    className="h-full w-full object-contain pointer-events-none"
                    style={{
                      // Bake document-level adjustments + layer CSS filters
                      filter: [
                        `brightness(${(brightness * filters.brightness) / 100}%)`,
                        `contrast(${(contrast * filters.contrast) / 100}%)`,
                        `saturate(${(saturation * filters.saturation) / 100}%)`,
                        `grayscale(${filters.grayscale}%)`,
                        `sepia(${filters.sepia}%)`,
                        `invert(${filters.invert}%)`,
                        filters.blur > 0 ? `blur(${filters.blur}px)` : "",
                      ]
                        .filter(Boolean)
                        .join(" "),
                    }}
                  />
                )}

                {/* ── Text layer ───────────────────────────────────────── */}
                {layer.type === "text" && (
                  <div className="w-full h-full flex items-center justify-center">
                    {isEditing ? (
                      <textarea
                        autoFocus
                        defaultValue={layer.content ?? layer.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          onUpdateText({ content: e.target.value });
                          onUpdateLayer(layer.id, { content: e.target.value });
                        }}
                        onBlur={() => setEditingTextId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingTextId(null);
                        }}
                        className="pointer-events-auto w-full h-full resize-none border border-[#2563EB] bg-white/95 text-center outline-none px-2 py-1 shadow-xs rounded-[2px]"
                        style={{
                          fontFamily: layer.fontFamily ?? "Arial",
                          fontSize: `${layer.fontSize ?? 48}px`,
                          color: layer.color ?? "#111827",
                          fontWeight: layer.fontWeight ?? "normal",
                          fontStyle: layer.fontStyle ?? "normal",
                          textAlign: layer.textAlign ?? "center",
                          lineHeight: layer.lineHeight ? `${layer.lineHeight}` : undefined,
                        }}
                      />
                    ) : (
                      <span
                        className="block w-full select-none whitespace-pre-wrap px-2"
                        style={{
                          fontFamily: layer.fontFamily ?? "Arial",
                          fontSize: `${layer.fontSize ?? 48}px`,
                          color: layer.color ?? "#111827",
                          fontWeight: layer.fontWeight ?? "normal",
                          fontStyle: layer.fontStyle ?? "normal",
                          textDecoration: layer.textDecoration ?? "none",
                          textAlign: layer.textAlign ?? "center",
                          lineHeight: layer.lineHeight ? `${layer.lineHeight}` : undefined,
                          letterSpacing: layer.letterSpacing ? `${layer.letterSpacing}px` : undefined,
                          filter: filterStr !== "brightness(100%) contrast(100%) saturate(100%) grayscale(0%) sepia(0%) invert(0%)" ? filterStr : undefined,
                        }}
                      >
                        {layer.content ?? layer.name}
                      </span>
                    )}
                  </div>
                )}

                {/* ── Shape layer ──────────────────────────────────────── */}
                {layer.type === "shape" && (
                  <div className="w-full h-full overflow-hidden" style={{ filter: filterStr }}>
                    {layer.shapeType === "circle" ? (
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          backgroundColor: layer.fill ?? "#2563EB",
                          border: layer.stroke
                            ? `${layer.strokeWidth ?? 2}px solid ${layer.stroke}`
                            : undefined,
                        }}
                      />
                    ) : layer.shapeType === "triangle" ? (
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                      >
                        <polygon
                          points="50,4 96,96 4,96"
                          fill={layer.fill ?? "#2563EB"}
                          stroke={layer.stroke ?? "transparent"}
                          strokeWidth={layer.strokeWidth ?? 0}
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : layer.shapeType === "line" ? (
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="w-full h-full overflow-visible"
                      >
                        <line
                          x1="2"
                          y1="50"
                          x2="98"
                          y2="50"
                          stroke={layer.stroke ?? layer.fill ?? "#2563EB"}
                          strokeWidth={layer.strokeWidth ?? 6}
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      /* Default rectangle */
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: layer.fill ?? "#2563EB",
                          border: layer.stroke
                            ? `${layer.strokeWidth ?? 2}px solid ${layer.stroke}`
                            : undefined,
                          borderRadius: `${layer.borderRadius ?? 4}px`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bounding Boxes & Handles ─────────────────────────────────────── */}
        {selectedLayerIds.map((selectedId) => {
          const layer = layers.find((l) => l.id === selectedId);
          if (!layer || !layer.visible) return null;

          const live = liveTransforms.get(layer.id);
          const dims = getLayerDimensions(layer);

          const posX = live ? live.x : (layer.x ?? 0);
          const posY = live ? live.y : (layer.y ?? 0);
          const width = live ? live.width : dims.width;
          const height = live ? live.height : dims.height;
          const rotation = live ? live.rotation : (layer.rotation ?? 0);

          const leftOffset = baseSize / 2 + posX;
          const topOffset = Math.round(baseSize * (aspectH / aspectW)) / 2 + posY;

          const isPrimary = selectedLayerIds[0] === layer.id;
          const isLocked = layer.locked;

          return (
            <div
              key={`bbox-${layer.id}`}
              className="pointer-events-none absolute z-40"
              style={{
                left: `${leftOffset}px`,
                top: `${topOffset}px`,
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                transformOrigin: "center center",
              }}
            >
              {/* Bounding box border */}
              <div
                className={cn(
                  "absolute inset-0 border transition-colors",
                  isLocked
                    ? "border-dashed border-[#94A3B8]"
                    : "border-[#2563EB] shadow-[0_0_0_1px_rgba(37,99,235,0.15)]"
                )}
              />

              {/* Lock indicator */}
              {isLocked && (
                <div className="absolute top-1 right-1 bg-white/90 p-0.5 rounded-[2px] border border-[#E2E8F0] shadow-xs">
                  <Lock className="w-3 h-3 text-[#64748B]" />
                </div>
              )}

              {/* Transformation handles (primary selection only, unlocked) */}
              {isPrimary && !isLocked && (
                <>
                  {/* Rotation handle */}
                  <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center">
                    <div className="h-4 w-4 rounded-full border border-[#2563EB] bg-white flex items-center justify-center shadow-xs">
                      <RotateCw className="w-2.5 h-2.5 text-[#2563EB]" />
                    </div>
                    <div className="w-px h-2 bg-[#2563EB]" />
                  </div>

                  {/* Corner handles */}
                  <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                  <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                  <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />

                  {/* Mid-edge handles */}
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                  <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-2.5 w-2.5 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                  <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-2.5 w-2.5 rounded-[1px] border border-[#2563EB] bg-white shadow-xs" />
                </>
              )}

              {/* Size label during resize */}
              {live && (
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-[#111827]/80 px-1.5 py-0.5 text-[9px] text-white">
                  {Math.round(width)} × {Math.round(height)}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Marquee selection box ─────────────────────────────────────────── */}
        {marqueeRect && (
          <div
            className="pointer-events-none absolute border border-[#2563EB] bg-[#2563EB]/10 z-50 rounded-[1px]"
            style={{
              left: `${baseSize / 2 + marqueeRect.x}px`,
              top: `${Math.round(baseSize * (aspectH / aspectW)) / 2 + marqueeRect.y}px`,
              width: `${marqueeRect.width}px`,
              height: `${marqueeRect.height}px`,
            }}
          />
        )}
      </div>
    </div>
  );
}
