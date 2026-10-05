import { Point, Rect, DesignerLayer, HandleType } from "./types";
import {
  getLayerCenter,
  getLayerDimensions,
  getLayerUnrotatedRect,
  rotatePoint,
} from "./coordinates";

/**
 * Encuentra la capa visible que se encuentra bajo las coordenadas del canvas.
 * Respeta el stacking order: las capas en índices menores están visualmente encima
 * (layers[0] tiene mayor prioridad de selección).
 */
export function findLayerAtPoint(
  layers: DesignerLayer[],
  canvasPoint: Point
): DesignerLayer | null {
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    // Capas invisibles no reciben hit testing (Regla 16)
    if (!layer.visible) continue;

    const center = getLayerCenter(layer);
    const { width, height } = getLayerDimensions(layer);
    const rotation = layer.rotation ?? 0;

    // Convertir el punto a coordenadas locales no rotadas de la capa
    const localPoint =
      rotation !== 0
        ? rotatePoint(canvasPoint, center, -rotation)
        : canvasPoint;

    const halfW = width / 2;
    const halfH = height / 2;

    if (
      localPoint.x >= center.x - halfW &&
      localPoint.x <= center.x + halfW &&
      localPoint.y >= center.y - halfH &&
      localPoint.y <= center.y + halfH
    ) {
      return layer;
    }
  }

  return null;
}

/**
 * Obtiene la posición en coordenadas del canvas de cada uno de los 8 handles + rotación.
 */
export function getHandlePositions(
  layer: DesignerLayer,
  zoom: number
): Record<HandleType, Point> {
  const center = getLayerCenter(layer);
  const { width, height } = getLayerDimensions(layer);
  const rotation = layer.rotation ?? 0;
  const halfW = width / 2;
  const halfH = height / 2;
  const rotateDistance = 24 / (zoom / 100);

  const unrotated: Record<HandleType, Point> = {
    nw: { x: center.x - halfW, y: center.y - halfH },
    n: { x: center.x, y: center.y - halfH },
    ne: { x: center.x + halfW, y: center.y - halfH },
    e: { x: center.x + halfW, y: center.y },
    se: { x: center.x + halfW, y: center.y + halfH },
    s: { x: center.x, y: center.y + halfH },
    sw: { x: center.x - halfW, y: center.y + halfH },
    w: { x: center.x - halfW, y: center.y },
    rotate: { x: center.x, y: center.y - halfH - rotateDistance },
  };

  if (rotation === 0) {
    return unrotated;
  }

  const rotated = {} as Record<HandleType, Point>;
  for (const [key, pt] of Object.entries(unrotated)) {
    rotated[key as HandleType] = rotatePoint(pt, center, rotation);
  }
  return rotated;
}

/**
 * Determina si el punto coincide con alguno de los handles de transformación de la capa activa.
 */
export function findHandleAtPoint(
  layer: DesignerLayer,
  canvasPoint: Point,
  zoom: number
): HandleType | null {
  // Capas bloqueadas no ofrecen handles de transformación interactivos (Regla 15)
  if (layer.locked) return null;

  const positions = getHandlePositions(layer, zoom);
  // Radio de tolerancia en pantalla ~8px, convertido a coordenadas de canvas
  const hitRadius = 9 / (zoom / 100);

  // Orden de comprobación: rotación primero, luego esquinas, luego laterales
  const checkOrder: HandleType[] = [
    "rotate",
    "nw",
    "ne",
    "se",
    "sw",
    "n",
    "e",
    "s",
    "w",
  ];

  for (const handle of checkOrder) {
    const pt = positions[handle];
    const dist = Math.hypot(canvasPoint.x - pt.x, canvasPoint.y - pt.y);
    if (dist <= hitRadius) {
      return handle;
    }
  }

  return null;
}

/**
 * Obtiene todas las capas visibles y desbloqueadas que intersecan con el rectángulo de marquee.
 */
export function getLayersIntersectingRect(
  layers: DesignerLayer[],
  selectionRect: Rect
): DesignerLayer[] {
  // Normalizar el rectángulo de selección (ancho y alto siempre positivos)
  const normX = Math.min(selectionRect.x, selectionRect.x + selectionRect.width);
  const normY = Math.min(selectionRect.y, selectionRect.y + selectionRect.height);
  const normW = Math.abs(selectionRect.width);
  const normH = Math.abs(selectionRect.height);

  const intersecting: DesignerLayer[] = [];

  for (const layer of layers) {
    if (!layer.visible || layer.locked || layer.type === "background") continue;

    const layerRect = getLayerUnrotatedRect(layer);

    // Intersección AABB simple
    const hasOverlap =
      normX < layerRect.x + layerRect.width &&
      normX + normW > layerRect.x &&
      normY < layerRect.y + layerRect.height &&
      normY + normH > layerRect.y;

    if (hasOverlap) {
      intersecting.push(layer);
    }
  }

  return intersecting;
}
