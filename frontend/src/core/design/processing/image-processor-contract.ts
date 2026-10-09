import type { ArtworkFilters } from './filters';
import type {
  HalftoneOptions,
  RemoveBackgroundOptions,
  SemitransparencyCleanupOptions,
} from '../../../../../engine/src/processing';
import type { MaskSelectionOperation } from '../../../../../engine/src/processing';
import type { VectorPath } from '../../../../../engine/src/paths';

export type RasterImageOperation =
  | { kind: 'remove-background'; options: RemoveBackgroundOptions }
  | {
      kind: 'select-color-region';
      x: number;
      y: number;
      tolerance: number;
      connectivity?: 4 | 8;
      alphaTolerance?: number;
    }
  | {
      kind: 'select-similar-colors';
      x: number;
      y: number;
      tolerance: number;
      alphaTolerance?: number;
    }
  | {
      kind: 'combine-selection-mask';
      mode: 'replace' | 'add' | 'subtract' | 'intersect' | 'invert';
      base?: Blob;
      overlay?: Blob;
      operation?: MaskSelectionOperation;
    }
  | { kind: 'create-path-selection'; path: VectorPath }
  | { kind: 'erase-mask'; mask: Blob }
  | { kind: 'halftone'; options: HalftoneOptions; previewMaxDimension?: number }
  | {
      kind: 'cleanup-semitransparency';
      options: SemitransparencyCleanupOptions;
      previewMaxDimension?: number;
    }
  | { kind: 'export-png'; dpi?: number };

export type ImageProcessingRequest =
  | {
      kind: 'filters';
      source: Blob;
      filters: ArtworkFilters;
      previewMaxDimension?: number;
    }
  | {
      kind: 'raster-operation';
      source: Blob;
      operation: RasterImageOperation;
    };

export interface ProcessedArtworkImage {
  blob: Blob;
  width: number;
  height: number;
}

export type ImageProcessingResponse =
  | { ok: true; image: ProcessedArtworkImage }
  | { ok: false; error: string };
