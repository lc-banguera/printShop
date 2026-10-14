export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CropOptions {
  margin: number;
  backgroundDetection: {
    mode: 'color-tolerance';
    color: { r: number; g: number; b: number; alpha?: number };
    tolerance: number;
  };
}

export interface ImageMetadata {
  width: number;
  height: number;
  channels: number;
  format: string;
  hasAlpha: boolean;
}

export interface ScanResult {
  filepath: string;
  filename: string;
  extension: string;
}

export interface ProcessResult {
  success: boolean;
  filepath: string;
  outputPath?: string;
  originalSize?: { width: number; height: number };
  croppedSize?: { width: number; height: number };
  normalizedOccupancy?: number;
  error?: Error;
}

/**
 * Shared context object passed between pipeline stages.
 * AutoCropStage writes contentBox; NormalizeStage reads it.
 */
export interface PipelineContext {
  /** Tight content bounding box detected by AutoCrop (no safety margin). */
  contentBox?: BoundingBox;
  /** Safe bounding box dimensions (contentBox + crop margin). */
  safeBox?: BoundingBox;
  /** Original image dimensions before any processing. */
  originalSize?: { width: number; height: number };
  /** Safe bounding box dimensions (contentBox + crop margin). */
  croppedSize?: { width: number; height: number };
  /** Normalization output metrics. */
  normalized?: {
    scaledW: number;
    scaledH: number;
    canvasW: number;
    canvasH: number;
    occupancy: number;
  };
  [key: string]: unknown;
}

export interface PipelineStage {
  name: string;
  execute(inputBuffer: Buffer, context: PipelineContext): Promise<Buffer>;
}
