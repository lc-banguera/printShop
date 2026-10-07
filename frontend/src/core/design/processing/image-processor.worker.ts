/// <reference lib="webworker" />

import { buildCanvasFilterString, normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
} from './image-processor-contract';
import {
  applyHalftone,
  cleanupSemitransparency,
  createImageBuffer,
  exportRaster,
  removeBackgroundLocal,
} from '../../../../../engine/src/processing';
import type { ImageBuffer } from '../../../../../engine/src/processing';

self.addEventListener('message', async (event: MessageEvent<ImageProcessingRequest>) => {
  try {
    const request = event.data;
    const bitmap = await createImageBitmap(request.source);

    try {
      let width = bitmap.width;
      let height = bitmap.height;
      const previewMaxDimension =
        request.kind === 'filters'
          ? request.previewMaxDimension
          : request.operation.kind === 'halftone'
            ? request.operation.previewMaxDimension
            : undefined;
      if (previewMaxDimension !== undefined) {
        const maxDimension = previewMaxDimension;
        if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
          throw new RangeError('Preview dimension must be positive.');
        }
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
      }
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not create a 2D processing context in the image worker.');
      }
      let processed: ImageBuffer | undefined;
      let blob: Blob | undefined;

      if (request.kind === 'filters') {
        if (!('filter' in context)) {
          throw new Error('Canvas filters are not supported in this worker context.');
        }
        context.filter = buildCanvasFilterString(normalizeArtworkFilters(request.filters));
        context.drawImage(bitmap, 0, 0, width, height);
        blob = await canvas.convertToBlob({ type: 'image/png' });
      } else {
        context.drawImage(bitmap, 0, 0, width, height);
        const pixels = context.getImageData(0, 0, width, height);
        const sourceBuffer = createImageBuffer(width, height, pixels.data);
        switch (request.operation.kind) {
          case 'remove-background':
            processed = removeBackgroundLocal(sourceBuffer, request.operation.options).image;
            break;
          case 'halftone':
            processed = applyHalftone(sourceBuffer, request.operation.options);
            break;
          case 'cleanup-semitransparency':
            processed = cleanupSemitransparency(sourceBuffer, request.operation.options).image;
            break;
          case 'export-png': {
            const result = exportRaster(sourceBuffer, {
              format: 'png',
              dpi: request.operation.dpi,
            });
            if (result.status !== 'succeeded') {
              throw new Error(result.message);
            }
            const bytes = new Uint8Array(result.bytes.length);
            bytes.set(result.bytes);
            blob = new Blob([bytes.buffer], { type: result.mediaType });
            break;
          }
          default: {
            const exhaustive: never = request.operation;
            throw new TypeError(`Unsupported raster operation: ${String(exhaustive)}`);
          }
        }

        if (processed) {
          const outputCanvas = new OffscreenCanvas(processed.width, processed.height);
          const outputContext = outputCanvas.getContext('2d');
          if (!outputContext) {
            throw new Error('Could not create an output canvas in the image worker.');
          }
          const outputPixels = outputContext.createImageData(processed.width, processed.height);
          outputPixels.data.set(processed.data);
          outputContext.putImageData(outputPixels, 0, 0);
          blob = await outputCanvas.convertToBlob({ type: 'image/png' });
        }
      }
      if (!blob) throw new Error('The image worker produced no output.');

      const response: ImageProcessingResponse = {
        ok: true,
        image: { blob, width, height },
      };
      self.postMessage(response);
    } finally {
      bitmap.close();
    }
  } catch (error) {
    const response: ImageProcessingResponse = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
});
