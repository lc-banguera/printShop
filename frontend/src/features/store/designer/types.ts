import * as React from "react";
import type { DocumentPath } from "../../../../../engine/src/types/element";

export type LayerKind = "image" | "text" | "shape" | "path" | "background";

export interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  sepia: number;
  invert: number;
  blur: number;
}

/** Crop rectangle in natural image pixels */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Applied image processing operation – for history labels */
export type ImageProcessOp = string;


export interface DesignerLayer {
  id: string;
  name: string;
  type: LayerKind;
  visible: boolean;
  locked: boolean;
  opacity: number;
  /** Thumbnail URL used by the Layers panel */
  preview: string;

  // ── Spatial transform ──────────────────────────────────────────────────
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;

  // ── Shape properties ──────────────────────────────────────────────────
  fill?: string;
  shapeType?: "rectangle" | "circle" | "triangle" | "line";
  path?: DocumentPath;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // ── Layer orientation & flips ──────────────────────────────────────────
  flipX?: boolean;
  flipY?: boolean;

  // ── Text properties ────────────────────────────────────────────────────
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;

  // ── Image properties ───────────────────────────────────────────────────
  /** Original file object URL (never mutated) */
  src?: string;
  /** Processed data URL after applying operations (null = use src) */
  processedSrc?: string | null;
  /** Original image natural dimensions */
  naturalWidth?: number;
  naturalHeight?: number;
  /** Crop region in natural px coordinates (null = no crop) */
  cropRect?: CropRect | null;
  /** Last operation applied – for UI labels */
  lastOp?: ImageProcessOp;

  // ── CSS/Canvas filters (applied at render time, non-destructive) ───────
  filters?: FilterValues;
}

export type CanvasAnchor =
  | "NW"
  | "N"
  | "NE"
  | "W"
  | "Center"
  | "E"
  | "SW"
  | "S"
  | "SE";

export type AlignmentType =
  | "left"
  | "center-h"
  | "center"
  | "right"
  | "top"
  | "center-v"
  | "middle"
  | "bottom";

export type DistributionType = "horizontal" | "vertical";


export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type HandleType =
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "rotate";

export type InteractionMode =
  | "idle"
  | "pointer_down"
  | "moving"
  | "resizing"
  | "rotating"
  | "marquee"
  | "panning";

export interface DragStartInfo {
  startScreenPoint: Point;
  startCanvasPoint: Point;
  initialLayers: Map<string, { x: number; y: number; width: number; height: number; rotation: number }>;
  handle?: HandleType;
  primaryLayerId?: string;
  initialBoundingBox?: Rect;
}

export interface SnapGuide {
  type: "horizontal" | "vertical";
  position: number; // In canvas coordinates where 0 is center
}
