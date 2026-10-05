import * as React from "react";
import {
  DesignerLayer,
  HandleType,
  InteractionMode,
  Point,
  Rect,
  SnapGuide,
} from "./types";
import {
  screenToCanvas,
  getLayerDimensions,
  rotatePoint,
} from "./coordinates";
import {
  findHandleAtPoint,
  findLayerAtPoint,
  getLayersIntersectingRect,
} from "./hitTest";
import { computeSnap } from "./snap";

interface UseCanvasInteractionProps {
  canvasDomRef: React.RefObject<HTMLDivElement | null>;
  layers: DesignerLayer[];
  selectedLayerIds: string[];
  activeTool: string;
  zoom: number;
  pan: Point;
  showGrid?: boolean;
  onUpdateZoom: (zoom: number) => void;
  onUpdatePan: (pan: Point) => void;
  onSelectLayer: (id: string, additive?: boolean) => void;
  onSelectMultipleLayers?: (ids: string[]) => void;
  onDeselect: () => void;
  onUpdateLayer: (id: string, changes: Partial<DesignerLayer>) => void;
  onUpdateMultipleLayers?: (
    updates: { id: string; changes: Partial<DesignerLayer> }[]
  ) => void;
}

export interface LiveTransformState {
  layerId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export function useCanvasInteraction({
  canvasDomRef,
  layers,
  selectedLayerIds,
  activeTool,
  zoom,
  pan,
  showGrid = true,
  onUpdateZoom,
  onUpdatePan,
  onSelectLayer,
  onSelectMultipleLayers,
  onDeselect,
  onUpdateLayer,
  onUpdateMultipleLayers,
}: UseCanvasInteractionProps) {
  // Modo de interacción actual
  const [mode, setMode] = React.useState<InteractionMode>("idle");
  // Transformaciones temporales en vivo durante drag/resize/rotate
  const [liveTransforms, setLiveTransforms] = React.useState<
    Map<string, LiveTransformState>
  >(new Map());
  // Rectángulo de selección por área (marquee)
  const [marqueeRect, setMarqueeRect] = React.useState<Rect | null>(null);
  // Líneas de guía activas para snapping
  const [activeGuides, setActiveGuides] = React.useState<SnapGuide[]>([]);
  // Cursor dinámico
  const [hoverCursor, setHoverCursor] = React.useState<string>("default");

  // Referencias mutables para el ciclo de eventos de puntero
  const isPointerDownRef = React.useRef(false);
  const startScreenPointRef = React.useRef<Point>({ x: 0, y: 0 });
  const startCanvasPointRef = React.useRef<Point>({ x: 0, y: 0 });
  const activeHandleRef = React.useRef<HandleType | null>(null);
  const primaryLayerIdRef = React.useRef<string | null>(null);
  const spacePressedRef = React.useRef(false);
  const isPanningRef = React.useRef(false);
  const startPanRef = React.useRef<Point>({ x: 0, y: 0 });
  const initialLayerStatesRef = React.useRef<
    Map<
      string,
      { x: number; y: number; width: number; height: number; rotation: number }
    >
  >(new Map());
  const initialAnchorRef = React.useRef<Point>({ x: 0, y: 0 });

  // Escuchar tecla Espacio para paneo y Escape para cancelación
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      if (e.code === "Space" && !e.repeat && !spacePressedRef.current) {
        spacePressedRef.current = true;
        setHoverCursor("grab");
      }

      if (e.key === "Escape") {
        // Regla 26: Escape cancela interacción temporal sin registrar en historial
        if (
          mode === "moving" ||
          mode === "resizing" ||
          mode === "rotating" ||
          mode === "marquee" ||
          mode === "panning"
        ) {
          e.preventDefault();
          setLiveTransforms(new Map());
          setMarqueeRect(null);
          setActiveGuides([]);
          setMode("idle");
          isPointerDownRef.current = false;
          isPanningRef.current = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spacePressedRef.current = false;
        if (!isPanningRef.current) {
          setHoverCursor("default");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mode]);

  // Manejo de la rueda del ratón (Zoom natural centrado en el cursor)
  const handleWheel = React.useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const dom = canvasDomRef.current;
      if (!dom) return;

      const rect = dom.getBoundingClientRect();
      const mouseScreenX = e.clientX;
      const mouseScreenY = e.clientY;

      // Dirección del zoom (deltaY negativo = acercar, positivo = alejar)
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.min(300, Math.max(25, Math.round(zoom * factor)));
      if (newZoom === zoom) return;

      // Compensar el pan para que el punto bajo el cursor se mantenga fijo
      const oldScale = zoom / 100;
      const newScale = newZoom / 100;

      const canvasCenterScreenX = rect.left + rect.width / 2;
      const canvasCenterScreenY = rect.top + rect.height / 2;

      // Desplazamiento del ratón respecto al centro del canvas
      const relX = mouseScreenX - canvasCenterScreenX;
      const relY = mouseScreenY - canvasCenterScreenY;

      const newPanX = pan.x - relX * (newScale / oldScale - 1);
      const newPanY = pan.y - relY * (newScale / oldScale - 1);

      onUpdateZoom(newZoom);
      onUpdatePan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    },
    [canvasDomRef, zoom, pan, onUpdateZoom, onUpdatePan]
  );

  // Obtener cursor según el handle de transformación
  const getHandleCursor = (handle: HandleType, rotation: number): string => {
    if (handle === "rotate") return "grab";
    // Si la rotación es significativa se podría rotar el cursor,
    // o usar los cursores diagonales estándar
    switch (handle) {
      case "nw":
      case "se":
        return "nwse-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      default:
        return "default";
    }
  };

  // POINTER DOWN
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const dom = canvasDomRef.current;
      if (!dom) return;

      // Capturar puntero para no perder eventos fuera de la ventana
      dom.setPointerCapture(e.pointerId);

      const screenPt: Point = { x: e.clientX, y: e.clientY };
      const domRect = dom.getBoundingClientRect();
      const canvasPt = screenToCanvas(screenPt, domRect, zoom, pan);

      startScreenPointRef.current = screenPt;
      startCanvasPointRef.current = canvasPt;
      isPointerDownRef.current = true;

      // Caso 1: Pan mediante tecla Espacio, Botón central (rueda) o Herramienta Mano
      if (spacePressedRef.current || e.button === 1 || activeTool === "hand") {
        isPanningRef.current = true;
        startPanRef.current = { ...pan };
        setMode("panning");
        setHoverCursor("grabbing");
        return;
      }

      // Solo procesar clic izquierdo (e.button === 0) para manipulación de objetos
      if (e.button !== 0) return;

      // Caso 2: Comprobar si se hizo clic en un handle de la capa seleccionada
      const primaryLayer = layers.find(
        (l) => selectedLayerIds.includes(l.id) && l.visible && !l.locked
      );

      let clickedHandle: HandleType | null = null;
      if (primaryLayer) {
        clickedHandle = findHandleAtPoint(primaryLayer, canvasPt, zoom);
      }

      if (clickedHandle && primaryLayer) {
        activeHandleRef.current = clickedHandle;
        primaryLayerIdRef.current = primaryLayer.id;

        // Guardar estado inicial para transformaciones
        const initMap = new Map();
        const dims = getLayerDimensions(primaryLayer);
        initMap.set(primaryLayer.id, {
          x: primaryLayer.x ?? 0,
          y: primaryLayer.y ?? 0,
          width: dims.width,
          height: dims.height,
          rotation: primaryLayer.rotation ?? 0,
        });
        initialLayerStatesRef.current = initMap;

        // Calcular punto ancla opuesto en caso de resize
        if (clickedHandle !== "rotate") {
          const center = {
            x: primaryLayer.x ?? 0,
            y: primaryLayer.y ?? 0,
          };
          const halfW = dims.width / 2;
          const halfH = dims.height / 2;
          const rot = primaryLayer.rotation ?? 0;

          let oppUnrotated: Point;
          switch (clickedHandle) {
            case "se":
              oppUnrotated = { x: center.x - halfW, y: center.y - halfH };
              break;
            case "nw":
              oppUnrotated = { x: center.x + halfW, y: center.y + halfH };
              break;
            case "sw":
              oppUnrotated = { x: center.x + halfW, y: center.y - halfH };
              break;
            case "ne":
              oppUnrotated = { x: center.x - halfW, y: center.y + halfH };
              break;
            case "e":
              oppUnrotated = { x: center.x - halfW, y: center.y };
              break;
            case "w":
              oppUnrotated = { x: center.x + halfW, y: center.y };
              break;
            case "s":
              oppUnrotated = { x: center.x, y: center.y - halfH };
              break;
            case "n":
              oppUnrotated = { x: center.x, y: center.y + halfH };
              break;
            default:
              oppUnrotated = center;
          }
          initialAnchorRef.current = rotatePoint(oppUnrotated, center, rot);
        }

        setMode("pointer_down");
        return;
      }

      // Caso 3: Hit test sobre las capas (top-to-bottom)
      const hitLayer = findLayerAtPoint(layers, canvasPt);

      if (hitLayer) {
        primaryLayerIdRef.current = hitLayer.id;
        activeHandleRef.current = null;

        const isAdditive = e.shiftKey || e.ctrlKey || e.metaKey;
        const isAlreadySelected = selectedLayerIds.includes(hitLayer.id);

        if (isAdditive) {
          onSelectLayer(hitLayer.id, true);
        } else if (!isAlreadySelected) {
          onSelectLayer(hitLayer.id, false);
        }

        // Si la capa está bloqueada, no permitir movimiento (Regla 15)
        if (!hitLayer.locked) {
          const initMap = new Map();
          // Mover todas las capas seleccionadas (o la impactada)
          const targetIds =
            !isAdditive && isAlreadySelected
              ? selectedLayerIds
              : [hitLayer.id];

          for (const id of targetIds) {
            const l = layers.find((layer) => layer.id === id);
            if (l && !l.locked) {
              const dims = getLayerDimensions(l);
              initMap.set(l.id, {
                x: l.x ?? 0,
                y: l.y ?? 0,
                width: dims.width,
                height: dims.height,
                rotation: l.rotation ?? 0,
              });
            }
          }
          initialLayerStatesRef.current = initMap;
        } else {
          initialLayerStatesRef.current = new Map();
        }

        setMode("pointer_down");
      } else {
        // Clic en zona vacía -> Iniciar posible deselección o marquee
        const isAdditive = e.shiftKey || e.ctrlKey || e.metaKey;
        if (!isAdditive) {
          onDeselect();
        }
        primaryLayerIdRef.current = null;
        activeHandleRef.current = null;
        initialLayerStatesRef.current = new Map();
        setMode("pointer_down");
      }
    },
    [
      canvasDomRef,
      layers,
      selectedLayerIds,
      activeTool,
      zoom,
      pan,
      onSelectLayer,
      onDeselect,
    ]
  );

  // POINTER MOVE
  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const dom = canvasDomRef.current;
      if (!dom) return;

      const screenPt: Point = { x: e.clientX, y: e.clientY };
      const domRect = dom.getBoundingClientRect();
      const canvasPt = screenToCanvas(screenPt, domRect, zoom, pan);

      // ── Mover el puntero mientras NO está presionado (actualizar cursor) ──
      if (!isPointerDownRef.current) {
        if (spacePressedRef.current || activeTool === "hand") {
          setHoverCursor("grab");
          return;
        }

        // Probar si el cursor está sobre un handle
        const primaryLayer = layers.find(
          (l) => selectedLayerIds.includes(l.id) && l.visible && !l.locked
        );
        if (primaryLayer) {
          const handle = findHandleAtPoint(primaryLayer, canvasPt, zoom);
          if (handle) {
            setHoverCursor(
              getHandleCursor(handle, primaryLayer.rotation ?? 0)
            );
            return;
          }
        }

        // Probar si está sobre una capa
        const hit = findLayerAtPoint(layers, canvasPt);
        if (hit) {
          if (hit.locked) {
            setHoverCursor("not-allowed");
          } else {
            setHoverCursor("move");
          }
        } else {
          setHoverCursor("default");
        }
        return;
      }

      // ── Mover el puntero MIENTRAS ESTÁ PRESIONADO ─────────────────────────
      const deltaScreenX = screenPt.x - startScreenPointRef.current.x;
      const deltaScreenY = screenPt.y - startScreenPointRef.current.y;
      const distScreen = Math.hypot(deltaScreenX, deltaScreenY);

      // CASO A: PANNING
      if (isPanningRef.current) {
        onUpdatePan({
          x: startPanRef.current.x + deltaScreenX,
          y: startPanRef.current.y + deltaScreenY,
        });
        return;
      }

      // Umbral mínimo de 4px para distinguir clic de arrastre (Regla 12)
      if (mode === "pointer_down" && distScreen < 4) {
        return;
      }

      const deltaCanvasX = deltaScreenX / (zoom / 100);
      const deltaCanvasY = deltaScreenY / (zoom / 100);

      // CASO B: RESIZE
      if (
        (mode === "pointer_down" || mode === "resizing") &&
        activeHandleRef.current &&
        activeHandleRef.current !== "rotate" &&
        primaryLayerIdRef.current
      ) {
        if (mode !== "resizing") setMode("resizing");

        const layerId = primaryLayerIdRef.current;
        const initial = initialLayerStatesRef.current.get(layerId);
        if (!initial) return;

        const anchor = initialAnchorRef.current;
        const rot = initial.rotation ?? 0;
        const handle = activeHandleRef.current;

        // Vector desde el ancla hasta el cursor actual
        const vX = canvasPt.x - anchor.x;
        const vY = canvasPt.y - anchor.y;

        // Rotar vector a coordenadas locales de la capa
        const localV = rotatePoint({ x: vX, y: vY }, { x: 0, y: 0 }, -rot);

        let sX = 1;
        let sY = 1;
        if (handle.includes("w")) sX = -1;
        if (handle.includes("n")) sY = -1;

        let newW = initial.width;
        let newH = initial.height;

        if (handle === "e" || handle === "w") {
          newW = Math.max(20, sX * localV.x);
        } else if (handle === "s" || handle === "n") {
          newH = Math.max(20, sY * localV.y);
        } else {
          // Esquinas (nw, ne, se, sw)
          let rawW = Math.max(20, sX * localV.x);
          let rawH = Math.max(20, sY * localV.y);

          // Si mantiene proporción (Shift presionado o imagen)
          if (e.shiftKey) {
            const ratio = initial.width / initial.height;
            if (rawW / ratio > rawH) {
              rawH = rawW / ratio;
            } else {
              rawW = rawH * ratio;
            }
          }
          newW = rawW;
          newH = rawH;
        }

        // Calcular nuevo centro a partir del ancla
        let localMid: Point;
        if (handle === "e") localMid = { x: newW / 2, y: 0 };
        else if (handle === "w") localMid = { x: -newW / 2, y: 0 };
        else if (handle === "s") localMid = { x: 0, y: newH / 2 };
        else if (handle === "n") localMid = { x: 0, y: -newH / 2 };
        else {
          localMid = { x: (sX * newW) / 2, y: (sY * newH) / 2 };
        }

        const rotatedMid = rotatePoint(localMid, { x: 0, y: 0 }, rot);
        const newCenter: Point = {
          x: anchor.x + rotatedMid.x,
          y: anchor.y + rotatedMid.y,
        };

        const nextTransforms = new Map<string, LiveTransformState>();
        nextTransforms.set(layerId, {
          layerId,
          x: Math.round(newCenter.x),
          y: Math.round(newCenter.y),
          width: Math.round(newW),
          height: Math.round(newH),
          rotation: rot,
        });

        setLiveTransforms(nextTransforms);
        return;
      }

      // CASO C: ROTACIÓN
      if (
        (mode === "pointer_down" || mode === "rotating") &&
        activeHandleRef.current === "rotate" &&
        primaryLayerIdRef.current
      ) {
        if (mode !== "rotating") setMode("rotating");

        const layerId = primaryLayerIdRef.current;
        const initial = initialLayerStatesRef.current.get(layerId);
        if (!initial) return;

        const center: Point = { x: initial.x, y: initial.y };
        const dx = canvasPt.x - center.x;
        const dy = canvasPt.y - center.y;

        // Ángulo respecto al centro. El handle superior está a -90 grados.
        let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        if (angleDeg < 0) angleDeg += 360;
        if (angleDeg >= 360) angleDeg -= 360;

        // Si Shift está presionado, ajustar a múltiplos de 15°
        if (e.shiftKey) {
          angleDeg = Math.round(angleDeg / 15) * 15;
        }

        const nextTransforms = new Map<string, LiveTransformState>();
        nextTransforms.set(layerId, {
          layerId,
          x: initial.x,
          y: initial.y,
          width: initial.width,
          height: initial.height,
          rotation: Math.round(angleDeg),
        });

        setLiveTransforms(nextTransforms);
        return;
      }

      // CASO D: MOVIMIENTO DE CAPAS (DRAG)
      if (
        (mode === "pointer_down" || mode === "moving") &&
        initialLayerStatesRef.current.size > 0
      ) {
        if (mode !== "moving") setMode("moving");

        const primaryId: string =
          primaryLayerIdRef.current ??
          (initialLayerStatesRef.current.keys().next().value as string | undefined) ??
          "";
        const primaryInit = initialLayerStatesRef.current.get(primaryId);

        let finalDeltaX = deltaCanvasX;
        let finalDeltaY = deltaCanvasY;

        // Snapping en la capa primaria
        if (primaryInit) {
          const rawTargetX = primaryInit.x + deltaCanvasX;
          const rawTargetY = primaryInit.y + deltaCanvasY;

          const snap = computeSnap(rawTargetX, rawTargetY, 480, 480, {
            snapToCenter: true,
            snapToEdges: true,
            snapToGrid: showGrid,
          });

          finalDeltaX = snap.x - primaryInit.x;
          finalDeltaY = snap.y - primaryInit.y;
          setActiveGuides(snap.guides);
        }

        const nextTransforms = new Map<string, LiveTransformState>();
        for (const [id, init] of initialLayerStatesRef.current.entries()) {
          nextTransforms.set(id, {
            layerId: id,
            x: Math.round(init.x + finalDeltaX),
            y: Math.round(init.y + finalDeltaY),
            width: init.width,
            height: init.height,
            rotation: init.rotation,
          });
        }

        setLiveTransforms(nextTransforms);
        return;
      }

      // CASO E: MARQUEE SELECTION (Clic y arrastre en zona vacía)
      if (
        (mode === "pointer_down" || mode === "marquee") &&
        initialLayerStatesRef.current.size === 0
      ) {
        if (mode !== "marquee") setMode("marquee");

        const startPt = startCanvasPointRef.current;
        const rect: Rect = {
          x: Math.min(startPt.x, canvasPt.x),
          y: Math.min(startPt.y, canvasPt.y),
          width: Math.abs(canvasPt.x - startPt.x),
          height: Math.abs(canvasPt.y - startPt.y),
        };
        setMarqueeRect(rect);
      }
    },
    [
      canvasDomRef,
      layers,
      selectedLayerIds,
      activeTool,
      zoom,
      pan,
      mode,
      showGrid,
      onUpdatePan,
    ]
  );

  // POINTER UP (Confirmar cambios finales y registrar 1 única entrada de historial)
  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const dom = canvasDomRef.current;
      if (dom && dom.hasPointerCapture(e.pointerId)) {
        dom.releasePointerCapture(e.pointerId);
      }

      isPointerDownRef.current = false;
      setActiveGuides([]);

      // Si estábamos haciendo pan, terminarlo limpiamente
      if (isPanningRef.current) {
        isPanningRef.current = false;
        setMode("idle");
        setHoverCursor(spacePressedRef.current ? "grab" : "default");
        return;
      }

      // Si fue selección rectangular (Marquee)
      if (mode === "marquee" && marqueeRect) {
        const intersected = getLayersIntersectingRect(layers, marqueeRect);
        if (intersected.length > 0) {
          if (onSelectMultipleLayers) {
            onSelectMultipleLayers(intersected.map((l) => l.id));
          } else {
            onSelectLayer(intersected[0].id, false);
          }
        }
        setMarqueeRect(null);
        setMode("idle");
        return;
      }

      // Si hubo transformaciones en vivo (Move, Resize, Rotate)
      if (liveTransforms.size > 0) {
        if (onUpdateMultipleLayers && liveTransforms.size > 1) {
          const updates = Array.from(liveTransforms.values()).map((t) => ({
            id: t.layerId,
            changes: {
              x: t.x,
              y: t.y,
              width: t.width,
              height: t.height,
              rotation: t.rotation,
            },
          }));
          onUpdateMultipleLayers(updates);
        } else {
          for (const t of liveTransforms.values()) {
            onUpdateLayer(t.layerId, {
              x: t.x,
              y: t.y,
              width: t.width,
              height: t.height,
              rotation: t.rotation,
            });
          }
        }
      }

      // Limpiar estados temporales
      setLiveTransforms(new Map());
      activeHandleRef.current = null;
      primaryLayerIdRef.current = null;
      initialLayerStatesRef.current = new Map();
      setMode("idle");
    },
    [
      canvasDomRef,
      mode,
      marqueeRect,
      layers,
      liveTransforms,
      onSelectMultipleLayers,
      onSelectLayer,
      onUpdateMultipleLayers,
      onUpdateLayer,
    ]
  );

  const handlePointerCancel = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      handlePointerUp(e);
    },
    [handlePointerUp]
  );

  return {
    mode,
    liveTransforms,
    marqueeRect,
    activeGuides,
    hoverCursor,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleWheel,
  };
}
