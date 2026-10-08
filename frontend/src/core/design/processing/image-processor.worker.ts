/// <reference lib="webworker" />

import { buildCanvasFilterString, normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
} from './image-processor-contract';
import {
  applyHalftone,
  createAlphaData,
  createConnectedColorMask,
  cleanupSemitransparency,
  createImageBuffer,
  eraseWithAlphaMask,
  extractAlpha,
  exportRaster,
  removeBackgroundLocal,
} from '../../../../../engine/src/processing';
import type { ImageBuffer } from '../../../../../engine/src/processing';
import { rasterizePathSelection } from '../../../../../engine/src/paths';

self.addEventListener('message', async (event: MessageEvent<ImageProcessingRequest>) => {
  try {
    const request = event.data;
    const bitmap = await createImageBitmap(request.source);
    let maskBitmap: ImageBitmap | undefined;

    try {
      let width = bitmap.width;
      let height = bitmap.height;
      const previewMaxDimension =
        request.kind === 'filters'
          ? request.previewMaxDimension
          : request.operation.kind === 'halftone' ||
              request.operation.kind === 'cleanup-semitransparency'
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
          case 'select-color-region': {
            const mask = createConnectedColorMask(sourceBuffer, {
              x: request.operation.x,
              y: request.operation.y,
              tolerance: request.operation.tolerance,
              connectivity: request.operation.connectivity ?? 8,
              alphaTolerance: request.operation.alphaTolerance,
            });
            processed = createImageBuffer(width, height);
            for (let index = 0; index < mask.values.length; index += 1) {
              const pixelOffset = index * 4;
              processed.data[pixelOffset] = 255;
              processed.data[pixelOffset + 1] = 64;
              processed.data[pixelOffset + 2] = 64;
              processed.data[pixelOffset + 3] = mask.values[index];
            }
            break;
          }
          case 'create-path-selection': {
            const keepMask = rasterizePathSelection(
              request.operation.path,
              width,
              height,
            );
            processed = createImageBuffer(width, height);
            for (let index = 0; index < keepMask.values.length; index += 1) {
              const pixelOffset = index * 4;
              processed.data[pixelOffset] = 239;
              processed.data[pixelOffset + 1] = 68;
              processed.data[pixelOffset + 2] = 68;
              processed.data[pixelOffset + 3] = 255 - keepMask.values[index];
            }
            break;
          }
          case 'erase-mask': {
            maskBitmap = await createImageBitmap(request.operation.mask);
            if (maskBitmap.width !== width || maskBitmap.height !== height) {
              throw new RangeError('Image and eraser mask dimensions must match.');
            }
            const maskCanvas = new OffscreenCanvas(width, height);
            const maskContext = maskCanvas.getContext('2d');
            if (!maskContext) {
              throw new Error('Could not create a mask processing context.');
            }
            maskContext.drawImage(maskBitmap, 0, 0);
            const maskPixels = maskContext.getImageData(0, 0, width, height);
            const maskBuffer = createImageBuffer(width, height, maskPixels.data);
            processed = eraseWithAlphaMask(
              sourceBuffer,
              createAlphaData(width, height, extractAlpha(maskBuffer).values),
            );
            break;
          }
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
      maskBitmap?.close();
    }
  } catch (error) {
    const response: ImageProcessingResponse = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
});
