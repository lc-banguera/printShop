import type { ArtworkFilters } from './filters';

export interface ImageProcessingRequest {
  source: Blob;
  filters: ArtworkFilters;
}

export interface ProcessedArtworkImage {
  blob: Blob;
  width: number;
  height: number;
}

export type ImageProcessingResponse =
  | { ok: true; image: ProcessedArtworkImage }
  | { ok: false; error: string };
