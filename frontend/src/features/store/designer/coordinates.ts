import { Point, Rect, DesignerLayer } from "./types";

/**
 * Convierte un punto en coordenadas de pantalla (clientX, clientY)
 * a coordenadas del canvas/documento donde (0, 0) es el CENTRO del lienzo.
 */
export function screenToCanvas(
  screenPoint: Point,
  canvasDomRect: DOMRect,
  zoom: number,
  pan: Point = { x: 0, y: 0 }
): Point {
  const scale = zoom / 100;
  // Centro del elemento canvas en la pantalla considerando el pan
  const canvasCenterScreenX = canvasDomRect.left + canvasDomRect.width / 2;
  const canvasCenterScreenY = canvasDomRect.top + canvasDomRect.height / 2;

  // Desplazamiento desde el centro del canvas escalado
  const deltaScreenX = screenPoint.x - canvasCenterScreenX;
  const deltaScreenY = screenPoint.y - canvasCenterScreenY;

  return {
    x: deltaScreenX / scale,
    y: deltaScreenY / scale,
  };
}

/**
 * Convierte un punto en coordenadas del canvas (donde 0,0 es el centro)
 * a coordenadas de pantalla (clientX, clientY).
 */
export function canvasToScreen(
  canvasPoint: Point,
  canvasDomRect: DOMRect,
  zoom: number
): Point {
  const scale = zoom / 100;
  const canvasCenterScreenX = canvasDomRect.left + canvasDomRect.width / 2;
  const canvasCenterScreenY = canvasDomRect.top + canvasDomRect.height / 2;

  return {
    x: canvasCenterScreenX + canvasPoint.x * scale,
    y: canvasCenterScreenY + canvasPoint.y * scale,
  };
}

/**
 * Rota un punto alrededor de un centro dado en grados.
 */
export function rotatePoint(point: Point, center: Point, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + (dx * cos - dy * sin),
    y: center.y + (dx * sin + dy * cos),
  };
}

/**
 * Obtiene el centro de una capa en coordenadas del documento (donde 0,0 es el centro del canvas).
 */
export function getLayerCenter(layer: DesignerLayer): Point {
  return {
    x: layer.x ?? 0,
    y: layer.y ?? 0,
  };
}

/**
 * Obtiene las dimensiones predeterminadas si la capa no tiene width/height definidos.
 */
export function getLayerDimensions(layer: DesignerLayer): { width: number; height: number } {
  if (layer.width && layer.height) {
    return { width: layer.width, height: layer.height };
  }
  if (layer.type === "text") {
    const fontSize = layer.fontSize ?? 48;
    const textLen = (layer.content ?? layer.name ?? "Texto").length;
    return {
      width: layer.width ?? Math.max(120, Math.min(420, textLen * fontSize * 0.6 + 40)),
      height: layer.height ?? Math.max(50, fontSize * 1.5),
    };
  }
  if (layer.type === "image") {
    return {
      width: layer.width ?? 260,
      height: layer.height ?? 260,
    };
  }
  if (layer.type === "shape") {
    return {
      width: layer.width ?? 220,
      height: layer.height ?? 220,
    };
  }
  return {
    width: layer.width ?? 480,
    height: layer.height ?? 480,
  };
}

/**
 * Obtiene el rectángulo sin rotar de la capa (en coordenadas relativas al centro del canvas).
 */
export function getLayerUnrotatedRect(layer: DesignerLayer): Rect {
  const { width, height } = getLayerDimensions(layer);
  const center = getLayerCenter(layer);
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
    width,
    height,
  };
}

/**
 * Calcula el bounding box conjunto de múltiples capas.
 */
export function getCombinedBoundingBox(layers: DesignerLayer[]): Rect | null {
  if (layers.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const layer of layers) {
    const rect = getLayerUnrotatedRect(layer);
    const rotation = layer.rotation ?? 0;
    const center = getLayerCenter(layer);

    if (rotation === 0) {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    } else {
      // 4 esquinas rotadas
      const corners: Point[] = [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height },
      ].map((pt) => rotatePoint(pt, center, rotation));

      for (const c of corners) {
        minX = Math.min(minX, c.x);
        minY = Math.min(minY, c.y);
        maxX = Math.max(maxX, c.x);
        maxY = Math.max(maxY, c.y);
      }
    }
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
