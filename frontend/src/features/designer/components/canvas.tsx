import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import Konva from 'konva';
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  AlignCenter,
  Layers,
  Hand,
  Minus,
  Plus,
  Maximize2,
  Box,
} from 'lucide-react';
import { useCanvasSize, useCanvasDrag } from '../hooks';
import { CANVAS_CONFIG } from '../services';
import { useCanvasStore } from '@/store/canvas-store';
import { useViewerStore } from '@/store/viewer-store';
import { ProductViewer } from './product-viewer';
import { CanvasOverlay } from './canvas-overlay';
import type { CanvasElement, CanvasState } from '@/types/canvas';
import type { PrintableZoneId } from '@/types/product';
import { DESIGN_DRAG_MIME_TYPE, type DesignDragPayload } from '@/types/design-resource';

const DEFAULT_DROPPED_IMAGE_SIZE = 180;

function createCanvasElementId(resourceId: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `design-${resourceId}-${crypto.randomUUID()}`;
  }
  return `design-${resourceId}-${Date.now()}`;
}

export function CanvasArea() {
  const [canvasSize, containerRef] = useCanvasSize();

  const addElement = useCanvasStore((state: CanvasState) => state.addElement);
  const selectElement = useCanvasStore((state: CanvasState) => state.selectElement);
  const toggleElementSelection = useCanvasStore((state: CanvasState) => state.toggleElementSelection);
  const duplicateElements = useCanvasStore((state: CanvasState) => state.duplicateElements);
  const removeElements = useCanvasStore((state: CanvasState) => state.removeElements);
  const undo = useCanvasStore((state: CanvasState) => state.undo);
  const redo = useCanvasStore((state: CanvasState) => state.redo);
  const alignSelectedElement = useCanvasStore((state: CanvasState) => state.alignSelectedElement);
  const groupSelectedElements = useCanvasStore((state: CanvasState) => state.groupSelectedElements);
  const ungroupSelectedElements = useCanvasStore((state: CanvasState) => state.ungroupSelectedElements);
  const selectedElementId = useCanvasStore((state: CanvasState) => state.selectedElementId);
  const selectedElementIds = useCanvasStore((state: CanvasState) => state.selectedElementIds);
  const elements = useCanvasStore((state: CanvasState) => state.elements);

  const activeProduct = useViewerStore((state) => state.activeProduct);
  const activeZoneId = useViewerStore((state) => state.activeZoneId);
  const setActiveZone = useViewerStore((state) => state.setActiveZone);
  const zoom = useViewerStore((state) => state.zoom);
  const setZoom = useViewerStore((state) => state.setZoom);
  const requestFit = useViewerStore((state) => state.requestFit);
  const garmentColors = useViewerStore((state) => state.garmentColors);
  const selectedColorIndex = useViewerStore((state) => state.selectedColorIndex);
  const selectGarmentColor = useViewerStore((state) => state.selectGarmentColor);
  const updateGarmentColor = useViewerStore((state) => state.updateGarmentColor);


  const activeZone = activeProduct.printableAreas[activeZoneId] || {
    x: 197,
    y: 180,
    width: 400,
    height: 500,
  };

  const { handleDragMove, handleDragEnd } = useCanvasDrag();

  // Stage Geometry
  const stageScale = CANVAS_CONFIG.STAGE_SCALE;
  const scaledArtboardWidth = CANVAS_CONFIG.ARTBOARD_WIDTH * stageScale;
  const scaledArtboardHeight = CANVAS_CONFIG.ARTBOARD_HEIGHT * stageScale;

  const stageX = (canvasSize.width - scaledArtboardWidth) / 2;
  const stageY = (canvasSize.height - scaledArtboardHeight) / 2;
  const [showAlignmentMenu, setShowAlignmentMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showColorPicker && colorInputRef.current) {
      colorInputRef.current.value = '#ffffff';
    }
  }, [showColorPicker]);

  // Drag & Drop handlers
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(DESIGN_DRAG_MIME_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const rawPayload = event.dataTransfer.getData(DESIGN_DRAG_MIME_TYPE);
    if (!rawPayload) return;

    event.preventDefault();

    try {
      const payload = JSON.parse(rawPayload) as DesignDragPayload;
      if (payload.type !== 'design-resource') return;

      const containerBounds = event.currentTarget.getBoundingClientRect();
      const canvasX = (event.clientX - containerBounds.left - stageX) / stageScale;
      const canvasY = (event.clientY - containerBounds.top - stageY) / stageScale;

      const halfW = DEFAULT_DROPPED_IMAGE_SIZE / 2;
      const halfH = DEFAULT_DROPPED_IMAGE_SIZE / 2;

      const clampedX = Math.round(
        Math.min(
          Math.max(canvasX - halfW, activeZone.x),
          activeZone.x + activeZone.width - DEFAULT_DROPPED_IMAGE_SIZE
        )
      );
      const clampedY = Math.round(
        Math.min(
          Math.max(canvasY - halfH, activeZone.y),
          activeZone.y + activeZone.height - DEFAULT_DROPPED_IMAGE_SIZE
        )
      );

      const imageElement: CanvasElement = {
        id: createCanvasElementId(payload.resource.id),
        type: 'image',
        layer: 'user',
        zoneId: activeZoneId,
        x: clampedX,
        y: clampedY,
        width: DEFAULT_DROPPED_IMAGE_SIZE,
        height: DEFAULT_DROPPED_IMAGE_SIZE,
        image: payload.resource.image,
        originalImageSrc: payload.resource.image,
      };

      addElement(imageElement);
    } catch {
      return;
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  const handleElementClick = (elementId: string, additive: boolean) => {
    if (additive) {
      toggleElementSelection(elementId);
    } else {
      selectElement(elementId);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    try {
      const w = (window as any);
      w.__ps_debug = w.__ps_debug || {};
      const prevZoom = useViewerStore.getState().zoom;
      w.__ps_debug.lastButtonAction = { when: Date.now(), direction, before: prevZoom };
      console.log('[PS_DEBUG] Zoom button', direction, 'before', prevZoom);
    } catch (e) { /* ignore */ }

    setZoom((prev) => {
      const next = direction === 'in' ? prev + 0.1 : prev - 0.1;
      const clamped = Math.min(2.5, Math.max(0.35, next));
      try { const w = (window as any); if (w.__ps_debug) { w.__ps_debug.lastButtonAction.after = clamped; } } catch (e) {}
      console.log('[PS_DEBUG] Zoom button result', clamped);
      return clamped;
    });
  };

  const handleColorAdd = (color: string) => {
    if (selectedColorIndex < 0 || selectedColorIndex >= garmentColors.length) return;
    updateGarmentColor(selectedColorIndex, color);
  };

  const colorPalette = useMemo(() => {
    return garmentColors.slice(0, 12).map((color, index) => ({
      id: `${color}-${index}`,
      name: color,
      color,
      index,
    }));
  }, [garmentColors]);

  const viewOptions: { id: PrintableZoneId; label: string }[] = [
    { id: 'front', label: 'Frente' },
    { id: 'back', label: 'Espalda' },
    { id: 'sleeve_left', label: 'Manga Izq.' },
    { id: 'sleeve_right', label: 'Manga Der.' },
    { id: 'label', label: 'Etiqueta' },
  ];

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex-1 h-full w-full bg-gradient-to-br from-[#dbe4fe] via-[#ebf0fe] to-[#e4e5f7] overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* ── Top Product View Selector ── */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md border border-white/80 p-1 shadow-sm text-[11px] font-semibold">
        {viewOptions.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActiveZone(v.id)}
            className={`rounded-full px-3.5 py-1 transition-all whitespace-nowrap cursor-pointer ${
              activeZoneId === v.id
                ? 'bg-[#5046e5] text-white shadow-2xs'
                : 'text-[#5e5d72] hover:text-[#171421]'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ── Floating Left Action Toolbar ── */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 p-1.5 shadow-md text-[10px] font-medium text-[#5e5d72]">
        <button type="button" onClick={undo} disabled={!elements.length} className="flex flex-col items-center gap-0.5 p-1 hover:text-[#5046e5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Undo2 className="h-3.5 w-3.5" />
          <span className="text-[9px]">Deshacer</span>
        </button>
        <button type="button" onClick={redo} disabled={!elements.length} className="flex flex-col items-center gap-0.5 p-1 hover:text-[#5046e5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Redo2 className="h-3.5 w-3.5" />
          <span className="text-[9px]">Rehacer</span>
        </button>
        <div className="h-px w-5 bg-[#e4e4ee]" />
        <button type="button" onClick={() => duplicateElements(selectedElementIds)} disabled={selectedElementIds.length === 0} className="flex flex-col items-center gap-0.5 p-1 hover:text-[#5046e5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Copy className="h-3.5 w-3.5" />
          <span className="text-[9px]">Duplicar</span>
        </button>
        <button type="button" onClick={() => removeElements(selectedElementIds)} disabled={selectedElementIds.length === 0} className="flex flex-col items-center gap-0.5 p-1 hover:text-[#5046e5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Trash2 className="h-3.5 w-3.5" />
          <span className="text-[9px]">Eliminar</span>
        </button>
        <div className="h-px w-5 bg-[#e4e4ee]" />
        <button type="button" onClick={() => setShowAlignmentMenu((prev) => !prev)} disabled={!selectedElementId} className="flex flex-col items-center gap-0.5 p-1 hover:text-[#5046e5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <AlignCenter className="h-3.5 w-3.5" />
          <span className="text-[9px]">Alinear</span>
        </button>
        <button type="button" onClick={() => selectedElementId ? groupSelectedElements() : ungroupSelectedElements()} disabled={!selectedElementId} className="flex flex-col items-center gap-0.5 p-1 hover:text-[#5046e5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Layers className="h-3.5 w-3.5" />
          <span className="text-[9px]">Agrupar</span>
        </button>
        {showAlignmentMenu && selectedElementId ? (
          <div className="absolute left-full ml-2 flex flex-col gap-1 rounded-xl border border-[#e4e4ee] bg-white p-2 shadow-lg">
            {(['left','center','right','top','middle','bottom'] as const).map((alignment) => (
              <button key={alignment} type="button" onClick={() => { alignSelectedElement(alignment); setShowAlignmentMenu(false); }} className="rounded-lg px-2 py-1 text-left text-[10px] hover:bg-[#f5f4fb]">
                {alignment === 'left' ? 'Izquierda' : alignment === 'center' ? 'Centro' : alignment === 'right' ? 'Derecha' : alignment === 'top' ? 'Arriba' : alignment === 'middle' ? 'Medio' : 'Abajo'}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Floating Right Color Swatches (Product Materials) ── */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-white/80 p-2 shadow-md">
        {colorPalette.map((colorOption) => {
          const isActive = selectedColorIndex === colorOption.index;
          return (
            <button
              key={colorOption.id}
              type="button"
              onClick={() => {
                selectGarmentColor(colorOption.index);
              }}
              className={`h-5 w-5 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'ring-2 ring-[#5046e5] ring-offset-1 scale-110 shadow-[0_0_0_2px_rgba(80,70,229,0.2)]'
                  : 'ring-1 ring-black/10 hover:scale-105'
              }`}
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.name}
            />
          );
        })}
        <button
          type="button"
          onClick={() => {
            if (selectedColorIndex < 0 || selectedColorIndex >= garmentColors.length) {
              selectGarmentColor(0);
            }
            setShowColorPicker(true);
          }}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f4f4f7] text-[#5e5d72] hover:bg-[#e4e4ee] transition-all cursor-pointer"
        >
          <Plus className="h-2.5 w-2.5" />
        </button>
        {showColorPicker ? (
          <div className="absolute right-full mr-2 rounded-xl border border-[#e4e4ee] bg-white p-2 shadow-lg">
            <input
              ref={colorInputRef}
              type="color"
              className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              value={garmentColors[selectedColorIndex] ?? '#ffffff'}
              onChange={(event) => handleColorAdd(event.target.value)}
            />
          </div>
        ) : null}
      </div>



      {/* ── Floating Bottom Zoom & 3D Bar ── */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2.5">
        <div className="flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-md border border-white/80 px-2.5 py-1 shadow-md text-[11px] font-semibold text-[#5e5d72]">
          <button type="button" className="hover:text-[#171421] cursor-pointer transition-transform hover:scale-105"><Hand className="h-3.5 w-3.5" /></button>
          <div className="h-3 w-px bg-[#e4e4ee]" />
          <button type="button" onClick={() => handleZoom('out')} className="hover:text-[#171421] cursor-pointer transition-transform hover:scale-105"><Minus className="h-3 w-3" /></button>
          <span className="min-w-7 text-center text-[#171421]">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => handleZoom('in')} className="hover:text-[#171421] cursor-pointer transition-transform hover:scale-105"><Plus className="h-3 w-3" /></button>
          <div className="h-3 w-px bg-[#e4e4ee]" />
          <button type="button" onClick={() => { try { (window as any).__ps_debug = (window as any).__ps_debug || {}; (window as any).__ps_debug.fitButtonClicked = Date.now(); console.log('[PS_DEBUG] Fit button clicked'); } catch(e) {} ; requestFit(); }} className="hover:text-[#171421] cursor-pointer transition-transform hover:scale-105"><Maximize2 className="h-3 w-3" /></button>
        </div>
      </div>

      {/* ── MODULE 1: ProductViewer (Standalone Product Visualizer) ── */}
      <ProductViewer />

      {/* ── MODULE 2: CanvasOverlay (Standalone User Elements Stage) ── */}
      <CanvasOverlay
        stageSize={canvasSize}
        stageScale={stageScale}
        stageX={stageX}
        stageY={stageY}
        onStageClick={handleStageClick}
        onElementClick={handleElementClick}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
}
