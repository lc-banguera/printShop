export {
  buildCanvasFilterString,
  DEFAULT_ARTWORK_FILTERS,
  normalizeArtworkFilters,
  type ArtworkFilters,
} from './filters';
export {
  processArtworkImage,
  processArtworkImageUrl,
  processRasterImage,
  processRasterImageUrl,
  type ProcessedArtworkImage,
} from './image-processor';
export {
  isProcessingServiceAvailable,
  vectorizeWithService,
  enhanceWithService,
  removeBackgroundWithService,
  inpaintWithService,
  adjustWithService,
  halftoneWithService,
} from './python-service-client';
export type { RasterImageOperation } from './image-processor-contract';
export type { HalftoneOptions } from '../../../../../engine/src/processing';
