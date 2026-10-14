import { SnapGuide } from "./types";

export interface SnapResult {
  x: number;
  y: number;
  guides: SnapGuide[];
}

/**
 * Calcula el ajuste magnético (snapping) al centro del lienzo (0, 0),
 * a los bordes del canvas, y opcionalmente a la cuadrícula.
 */
export function computeSnap(
  currentX: number,
  currentY: number,
  canvasWidth: number = 480,
  canvasHeight: number = 480,
  options: {
    snapToCenter?: boolean;
    snapToEdges?: boolean;
    snapToGrid?: boolean;
    gridSize?: number;
    threshold?: number;
  } = {}
): SnapResult {
  const {
    snapToCenter = true,
    snapToEdges = true,
    snapToGrid = false,
    gridSize = 24,
    threshold = 6,
  } = options;

  let x = currentX;
  let y = currentY;
  const guides: SnapGuide[] = [];

  // Snap vertical al centro (X = 0)
  if (snapToCenter) {
    if (Math.abs(x) <= threshold) {
      x = 0;
      guides.push({ type: "vertical", position: 0 });
    }
    // Snap horizontal al centro (Y = 0)
    if (Math.abs(y) <= threshold) {
      y = 0;
      guides.push({ type: "horizontal", position: 0 });
    }
  }

  // Snap a bordes si no se ajustó al centro
  if (snapToEdges) {
    const halfW = canvasWidth / 2;
    const halfH = canvasHeight / 2;

    if (Math.abs(x - halfW) <= threshold) {
      x = halfW;
      guides.push({ type: "vertical", position: halfW });
    } else if (Math.abs(x + halfW) <= threshold) {
      x = -halfW;
      guides.push({ type: "vertical", position: -halfW });
    }

    if (Math.abs(y - halfH) <= threshold) {
      y = halfH;
      guides.push({ type: "horizontal", position: halfH });
    } else if (Math.abs(y + halfH) <= threshold) {
      y = -halfH;
      guides.push({ type: "horizontal", position: -halfH });
    }
  }

  // Snap a cuadrícula si está habilitado
  if (snapToGrid && gridSize > 0 && guides.length === 0) {
    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;
    if (Math.abs(x - gridX) <= threshold) {
      x = gridX;
    }
    if (Math.abs(y - gridY) <= threshold) {
      y = gridY;
    }
  }

  return { x, y, guides };
}
