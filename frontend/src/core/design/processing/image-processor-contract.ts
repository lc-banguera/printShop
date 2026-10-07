import type { ArtworkFilters } from './filters';
import type {
  HalftoneOptions,
  RemoveBackgroundOptions,
  SemitransparencyCleanupOptions,
} from '../../../../../engine/src/processing';

export type RasterImageOperation =
  | { kind: 'remove-background'; options: RemoveBackgroundOptions }
  | { kind: 'halftone'; options: HalftoneOptions }
  | { kind: 'cleanup-semitransparency'; options: SemitransparencyCleanupOptions }
  | { kind: 'export-png'; dpi?: number };

export type ImageProcessingRequest =
  | {
      kind: 'filters';
      source: Blob;
      filters: ArtworkFilters;
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
