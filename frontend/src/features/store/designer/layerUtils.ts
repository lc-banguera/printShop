import {
  AlignmentType,
  CanvasAnchor,
  DesignerLayer,
  DistributionType,
} from "./types";
import { getLayerDimensions } from "./coordinates";

const ANCHOR_MAP: Record<CanvasAnchor, { x: number; y: number }> = {
  NW: { x: 0, y: 0 },
  N: { x: 0.5, y: 0 },
  NE: { x: 1, y: 0 },
  W: { x: 0, y: 0.5 },
  Center: { x: 0.5, y: 0.5 },
  E: { x: 1, y: 0.5 },
  SW: { x: 0, y: 1 },
  S: { x: 0.5, y: 1 },
  SE: { x: 1, y: 1 },
};

/**
 * Calculates repositioning of layers when canvas dimensions change with an anchor.
 */
export function repositionLayersForCanvasAnchor(
  layers: DesignerLayer[],
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number,
  anchor: CanvasAnchor
): { id: string; changes: Partial<DesignerLayer> }[] {
  const norm = ANCHOR_MAP[anchor] ?? ANCHOR_MAP.Center;
  const shiftX = (norm.x - 0.5) * (newWidth - oldWidth);
  const shiftY = (norm.y - 0.5) * (newHeight - oldHeight);

  if (Math.abs(shiftX) < 0.01 && Math.abs(shiftY) < 0.01) {
    return [];
  }

  return layers
    .filter((layer) => layer.type !== "background" && !layer.locked)
    .map((layer) => ({
      id: layer.id,
      changes: {
        x: Math.round((layer.x ?? 0) + shiftX),
        y: Math.round((layer.y ?? 0) + shiftY),
      },
    }));
}

/**
 * Aligns selected layers either relative to each other or to the canvas.
 */
export function alignLayers(
  layers: DesignerLayer[],
  selectedIds: string[],
  type: AlignmentType,
  docWidth: number,
  docHeight: number
): { id: string; changes: Partial<DesignerLayer> }[] {
  if (selectedIds.length === 0) return [];

  const targets = layers.filter(
    (l) => selectedIds.includes(l.id) && !l.locked && l.type !== "background"
  );
  if (targets.length === 0) return [];

  // Single layer selected -> align to canvas center / edges
  if (targets.length === 1) {
    const layer = targets[0];
    const dims = getLayerDimensions(layer);
    const halfDocW = docWidth / 2;
    const halfDocH = docHeight / 2;
    const halfW = dims.width / 2;
    const halfH = dims.height / 2;

    let changes: Partial<DesignerLayer> = {};
    switch (type) {
      case "left":
        changes.x = Math.round(-halfDocW + halfW);
        break;
      case "center-h":
      case "center":
        changes.x = 0;
        break;
      case "right":
        changes.x = Math.round(halfDocW - halfW);
        break;
      case "top":
        changes.y = Math.round(-halfDocH + halfH);
        break;
      case "center-v":
      case "middle":
        changes.y = 0;
        break;
      case "bottom":
        changes.y = Math.round(halfDocH - halfH);
        break;
    }
    return [{ id: layer.id, changes }];
  }

  // Multiple layers selected -> align relative to the selection's bounding box
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let minTop = Infinity;
  let maxBottom = -Infinity;

  targets.forEach((layer) => {
    const dims = getLayerDimensions(layer);
    const x = layer.x ?? 0;
    const y = layer.y ?? 0;
    const left = x - dims.width / 2;
    const right = x + dims.width / 2;
    const top = y - dims.height / 2;
    const bottom = y + dims.height / 2;

    if (left < minLeft) minLeft = left;
    if (right > maxRight) maxRight = right;
    if (top < minTop) minTop = top;
    if (bottom > maxBottom) maxBottom = bottom;
  });

  const bboxCenterH = (minLeft + maxRight) / 2;
  const bboxCenterV = (minTop + maxBottom) / 2;

  return targets.map((layer) => {
    const dims = getLayerDimensions(layer);
    const halfW = dims.width / 2;
    const halfH = dims.height / 2;
    let changes: Partial<DesignerLayer> = {};

    switch (type) {
      case "left":
        changes.x = Math.round(minLeft + halfW);
        break;
      case "center-h":
      case "center":
        changes.x = Math.round(bboxCenterH);
        break;
      case "right":
        changes.x = Math.round(maxRight - halfW);
        break;
      case "top":
        changes.y = Math.round(minTop + halfH);
        break;
      case "center-v":
      case "middle":
        changes.y = Math.round(bboxCenterV);
        break;
      case "bottom":
        changes.y = Math.round(maxBottom - halfH);
        break;
    }

    return { id: layer.id, changes };
  });
}

/**
 * Distributes 3+ layers evenly along the specified axis.
 */
export function distributeLayers(
  layers: DesignerLayer[],
  selectedIds: string[],
  direction: DistributionType
): { id: string; changes: Partial<DesignerLayer> }[] {
  const targets = layers.filter(
    (l) => selectedIds.includes(l.id) && !l.locked && l.type !== "background"
  );
  if (targets.length < 3) return [];

  if (direction === "horizontal") {
    const sorted = [...targets].sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
    const firstX = sorted[0].x ?? 0;
    const lastX = sorted[sorted.length - 1].x ?? 0;
    const step = (lastX - firstX) / (sorted.length - 1);

    return sorted.map((layer, idx) => ({
      id: layer.id,
      changes: { x: Math.round(firstX + step * idx) },
    }));
  } else {
    const sorted = [...targets].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
    const firstY = sorted[0].y ?? 0;
    const lastY = sorted[sorted.length - 1].y ?? 0;
    const step = (lastY - firstY) / (sorted.length - 1);

    return sorted.map((layer, idx) => ({
      id: layer.id,
      changes: { y: Math.round(firstY + step * idx) },
    }));
  }
}
