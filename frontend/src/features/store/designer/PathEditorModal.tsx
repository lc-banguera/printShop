import * as React from "react";
import { Check, CornerDownLeft, Minus, PenTool, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import type {
  PathAnchor,
  PathAnchorType,
  PathPoint,
} from "../../../../../engine/src/paths";
import type { DocumentPath } from "../../../../../engine/src/types/element";

interface PathStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

interface PathEditorModalProps {
  documentWidth: number;
  documentHeight: number;
  initialPath?: DocumentPath;
  initialStyle?: Partial<PathStyle>;
  onSave: (path: DocumentPath, style: PathStyle) => void;
  onClose: () => void;
}

interface DragTarget {
  anchorId: string;
  handle: "anchor" | "handleIn" | "handleOut";
}

const PATH_SCHEMA_VERSION = "1.0.0" as const;

function createPath(anchors: readonly PathAnchor[], closed: boolean, id: string): DocumentPath {
  const segmentCount = closed ? anchors.length : Math.max(0, anchors.length - 1);
  return {
    schemaVersion: PATH_SCHEMA_VERSION,
    id,
    closed,
    anchors,
    segments: Array.from({ length: segmentCount }, (_, index) => {
      const start = anchors[index];
      const end = anchors[(index + 1) % anchors.length];
      return {
        id: `${start.id}-${end.id}`,
        type: start.handleOut || end.handleIn ? "CUBIC_BEZIER" as const : "LINE" as const,
        startAnchorId: start.id,
        endAnchorId: end.id,
      };
    }),
  };
}

function midpoint(left: PathPoint, right: PathPoint): PathPoint {
  return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
}

export function PathEditorModal({
  documentWidth,
  documentHeight,
  initialPath,
  initialStyle,
  onSave,
  onClose,
}: PathEditorModalProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const dragRef = React.useRef<DragTarget | null>(null);
  const [path, setPath] = React.useState<DocumentPath>(() => initialPath ?? createPath([], false, crypto.randomUUID()));
  const [selectedAnchorId, setSelectedAnchorId] = React.useState<string | null>(null);
  const [fill, setFill] = React.useState(initialStyle?.fill ?? "#2563EB");
  const [stroke, setStroke] = React.useState(initialStyle?.stroke ?? "#1D4ED8");
  const [strokeWidth, setStrokeWidth] = React.useState(initialStyle?.strokeWidth ?? 3);
  const closedCanChange = path.closed ? path.anchors.length >= 3 : path.anchors.length >= 3;

  const eventToDocumentPoint = (event: React.PointerEvent<SVGSVGElement>): PathPoint => {
    const bounds = svgRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    const scale = Math.min(bounds.width / documentWidth, bounds.height / documentHeight);
    const offsetX = (bounds.width - documentWidth * scale) / 2;
    const offsetY = (bounds.height - documentHeight * scale) / 2;
    return {
      x: Math.max(0, Math.min(documentWidth, (event.clientX - bounds.left - offsetX) / scale)),
      y: Math.max(0, Math.min(documentHeight, (event.clientY - bounds.top - offsetY) / scale)),
    };
  };

  const updateAnchor = (anchorId: string, updater: (anchor: PathAnchor) => PathAnchor) => {
    setPath((current) => createPath(
      current.anchors.map((anchor) => anchor.id === anchorId ? updater(anchor) : anchor),
      current.closed,
      current.id,
    ));
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const handleElement = (event.target as Element).closest<SVGElement>("[data-path-handle]");
    const anchorElement = (event.target as Element).closest<SVGElement>("[data-path-anchor]");
    if (handleElement || anchorElement) {
      const target = handleElement ?? anchorElement;
      const anchorId = target?.dataset.anchorId;
      const handle = (handleElement?.dataset.pathHandle ?? "anchor") as DragTarget["handle"];
      if (!anchorId) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedAnchorId(anchorId);
      dragRef.current = { anchorId, handle };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (path.closed) return;
    const point = eventToDocumentPoint(event);
    const anchor: PathAnchor = {
      id: crypto.randomUUID(),
      ...point,
      type: "CORNER",
    };
    setSelectedAnchorId(anchor.id);
    setPath((current) => createPath([...current.anchors, anchor], false, current.id));
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = dragRef.current;
    if (!target) return;
    const point = eventToDocumentPoint(event);
    updateAnchor(target.anchorId, (anchor) => {
      if (target.handle === "anchor") {
        const dx = point.x - anchor.x;
        const dy = point.y - anchor.y;
        return {
          ...anchor,
          x: point.x,
          y: point.y,
          ...(anchor.handleIn ? { handleIn: { x: anchor.handleIn.x + dx, y: anchor.handleIn.y + dy } } : {}),
          ...(anchor.handleOut ? { handleOut: { x: anchor.handleOut.x + dx, y: anchor.handleOut.y + dy } } : {}),
        };
      }
      const opposite = target.handle === "handleIn" ? "handleOut" : "handleIn";
      const vector = { x: point.x - anchor.x, y: point.y - anchor.y };
      const next = { ...anchor, [target.handle]: point };
      if (anchor.type === "SMOOTH") {
        next[opposite] = { x: anchor.x - vector.x, y: anchor.y - vector.y };
      }
      return next;
    });
  };

  const selectedAnchor = path.anchors.find((anchor) => anchor.id === selectedAnchorId);

  const convertSelectedAnchor = (type: PathAnchorType) => {
    if (!selectedAnchor) return;
    if (type === "CORNER") {
      updateAnchor(selectedAnchor.id, (anchor) => ({
        ...anchor,
        type,
        handleIn: undefined,
        handleOut: undefined,
      }));
      return;
    }
    const index = path.anchors.findIndex((anchor) => anchor.id === selectedAnchor.id);
    const previous = path.anchors[index - 1] ?? (path.closed ? path.anchors.at(-1) : undefined);
    const next = path.anchors[index + 1] ?? (path.closed ? path.anchors[0] : undefined);
    if (!previous && !next) return;
    const directionX = next && previous
      ? next.x - previous.x
      : next
        ? next.x - selectedAnchor.x
        : selectedAnchor.x - previous!.x;
    const directionY = next && previous
      ? next.y - previous.y
      : next
        ? next.y - selectedAnchor.y
        : selectedAnchor.y - previous!.y;
    const length = Math.hypot(directionX, directionY) / 6;
    const unit = Math.hypot(directionX, directionY) || 1;
    updateAnchor(selectedAnchor.id, (anchor) => ({
      ...anchor,
      type,
      handleIn: previous
        ? { x: anchor.x - (directionX / unit) * length, y: anchor.y - (directionY / unit) * length }
        : undefined,
      handleOut: next
        ? { x: anchor.x + (directionX / unit) * length, y: anchor.y + (directionY / unit) * length }
        : undefined,
    }));
  };

  const addAnchor = () => {
    if (path.closed || path.anchors.length < 2) return;
    const selectedIndex = path.anchors.findIndex((anchor) => anchor.id === selectedAnchorId);
    const segmentIndex = selectedIndex >= 0 && selectedIndex < path.anchors.length - 1
      ? selectedIndex
      : path.anchors.length - 2;
    const start = path.anchors[segmentIndex];
    const end = path.anchors[segmentIndex + 1];
    const anchors = [...path.anchors];
    let anchor: PathAnchor;

    if (path.segments[segmentIndex]?.type === "CUBIC_BEZIER") {
      const p0 = { x: start.x, y: start.y };
      const p1 = start.handleOut ?? p0;
      const p3 = { x: end.x, y: end.y };
      const p2 = end.handleIn ?? p3;
      const p01 = midpoint(p0, p1);
      const p12 = midpoint(p1, p2);
      const p23 = midpoint(p2, p3);
      const p012 = midpoint(p01, p12);
      const p123 = midpoint(p12, p23);
      const split = midpoint(p012, p123);
      anchors[segmentIndex] = { ...start, handleOut: p01 };
      anchors[segmentIndex + 1] = { ...end, handleIn: p23 };
      anchor = {
        id: crypto.randomUUID(),
        ...split,
        type: "SMOOTH",
        handleIn: p012,
        handleOut: p123,
      };
    } else {
      anchor = { id: crypto.randomUUID(), ...midpoint(start, end), type: "CORNER" };
    }
    anchors.splice(segmentIndex + 1, 0, anchor);
    setSelectedAnchorId(anchor.id);
    setPath((current) => createPath(anchors, false, current.id));
  };

  const removeSelectedAnchor = () => {
    if (!selectedAnchor) return;
    const anchors = path.anchors.filter((anchor) => anchor.id !== selectedAnchor.id);
    const closed = path.closed && anchors.length >= 3;
    setPath((current) => createPath(anchors, closed, current.id));
    setSelectedAnchorId(anchors.at(-1)?.id ?? null);
  };

  const toggleClosed = () => {
    if (!closedCanChange) return;
    setPath((current) => createPath([...current.anchors], !current.closed, current.id));
  };

  const pathData = path.anchors.length
    ? (() => {
        const current = createPath(path.anchors, path.closed, path.id);
        const commands = [`M ${current.anchors[0].x} ${current.anchors[0].y}`];
        current.segments.forEach((segment, index) => {
          const start = current.anchors[index];
          const end = current.anchors[(index + 1) % current.anchors.length];
          if (segment.type === "CUBIC_BEZIER") {
            const out = start.handleOut ?? start;
            const incoming = end.handleIn ?? end;
            commands.push(`C ${out.x} ${out.y} ${incoming.x} ${incoming.y} ${end.x} ${end.y}`);
          } else {
            commands.push(`L ${end.x} ${end.y}`);
          }
        });
        if (current.closed) commands.push("Z");
        return commands.join(" ");
      })()
    : "";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="flex max-h-[92vh] w-[min(96vw,1040px)] max-w-none flex-col overflow-hidden p-0"
        onKeyDown={(event) => event.stopPropagation()}
        onEscapeKeyDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-[#2563EB]" />
            <div>
              <DialogTitle className="text-sm font-bold text-[#111827]">Pluma y edición de path</DialogTitle>
              <DialogDescription className="text-xs text-[#64748B]">Dibuja en coordenadas del documento; arrastra anchors y handles. Cierra el path desde el control inferior.</DialogDescription>
            </div>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"><X className="h-4 w-4" /></button>
        </header>

        <div className="overflow-auto p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${documentWidth} ${documentHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto h-[min(56vh,560px)] w-full touch-none border border-[#CBD5E1] bg-white"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => { dragRef.current = null; }}
            onPointerCancel={() => { dragRef.current = null; }}
            aria-label="Editor de trazado vectorial"
          >
            <path d={pathData} fill={path.closed ? fill : "none"} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
            {path.anchors.map((anchor) => (
              <g key={anchor.id}>
                {anchor.handleIn && (
                  <>
                    <line x1={anchor.x} y1={anchor.y} x2={anchor.handleIn.x} y2={anchor.handleIn.y} stroke="#64748B" strokeDasharray="5 4" />
                    <circle data-path-anchor={anchor.id} data-anchor-id={anchor.id} data-path-handle="handleIn" cx={anchor.handleIn.x} cy={anchor.handleIn.y} r={Math.max(documentWidth / 180, 5)} fill="#F97316" stroke="white" strokeWidth={2} className="cursor-move" />
                  </>
                )}
                {anchor.handleOut && (
                  <>
                    <line x1={anchor.x} y1={anchor.y} x2={anchor.handleOut.x} y2={anchor.handleOut.y} stroke="#64748B" strokeDasharray="5 4" />
                    <circle data-path-anchor={anchor.id} data-anchor-id={anchor.id} data-path-handle="handleOut" cx={anchor.handleOut.x} cy={anchor.handleOut.y} r={Math.max(documentWidth / 180, 5)} fill="#F97316" stroke="white" strokeWidth={2} className="cursor-move" />
                  </>
                )}
                <circle data-path-anchor={anchor.id} data-anchor-id={anchor.id} cx={anchor.x} cy={anchor.y} r={Math.max(documentWidth / 140, 7)} fill={anchor.id === selectedAnchorId ? "#2563EB" : "white"} stroke="#0F172A" strokeWidth={Math.max(documentWidth / 500, 2)} className="cursor-move" />
              </g>
            ))}
          </svg>
          <p className="mt-2 text-xs text-[#64748B]" role="status">
            {path.closed ? `${path.anchors.length} anchors · Path cerrado` : `${path.anchors.length} anchors · Haz clic para añadir; cierra el path desde el control inferior`}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-[#475569]">Relleno<input type="color" value={fill} onChange={(event) => setFill(event.target.value)} className="mt-1 block h-9 w-full cursor-pointer rounded border border-[#CBD5E1] bg-white p-1" /></label>
            <label className="text-xs text-[#475569]">Trazo<input type="color" value={stroke} onChange={(event) => setStroke(event.target.value)} className="mt-1 block h-9 w-full cursor-pointer rounded border border-[#CBD5E1] bg-white p-1" /></label>
            <label className="text-xs text-[#475569]">Grosor<input type="number" min="0" max="100" step="0.5" value={strokeWidth} onChange={(event) => setStrokeWidth(Math.max(0, Math.min(100, Number(event.target.value) || 0)))} className="mt-1 block h-9 w-full rounded border border-[#CBD5E1] px-2" /></label>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={path.closed || path.anchors.length < 2} onClick={addAnchor} className="inline-flex items-center gap-1 rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40"><Plus className="h-3.5 w-3.5" />Agregar anchor</button>
            <button type="button" disabled={!selectedAnchor} onClick={removeSelectedAnchor} className="inline-flex items-center gap-1 rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40"><Minus className="h-3.5 w-3.5" />Eliminar anchor</button>
            <button type="button" disabled={!selectedAnchor || selectedAnchor.type === "SMOOTH"} onClick={() => convertSelectedAnchor("SMOOTH")} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40">Convertir a suave</button>
            <button type="button" disabled={!selectedAnchor || selectedAnchor.type === "CORNER"} onClick={() => convertSelectedAnchor("CORNER")} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40">Convertir a esquina</button>
            <button type="button" disabled={!closedCanChange} onClick={toggleClosed} className="inline-flex items-center gap-1 rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155] disabled:opacity-40"><CornerDownLeft className="h-3.5 w-3.5" />{path.closed ? "Abrir path" : "Cerrar path"}</button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded border border-[#CBD5E1] px-3 py-1.5 text-xs font-medium text-[#334155]">Cancelar</button>
            <button type="button" disabled={path.anchors.length < 2 || (path.closed && path.anchors.length < 3)} onClick={() => onSave(path, { fill, stroke, strokeWidth })} className="inline-flex items-center gap-1 rounded bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"><Check className="h-3.5 w-3.5" />Guardar path</button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}