/// <reference lib="webworker" />

import { buildCanvasFilterString, normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
} from './image-processor-contract';
import {
  applyHalftone,
  combineSelectionMasks,
  createAlphaData,
  createConnectedColorMask,
  createSimilarColorMask,
  cleanupSemitransparency,
  createImageBuffer,
  eraseWithAlphaMask,
  extractAlpha,
  exportRaster,
  invertSelectionMask,
  removeBackgroundLocal,
} from '../../../../../engine/src/processing';
import type { AlphaData, ImageBuffer, MaskSelectionOperation } from '../../../../../engine/src/processing';
import { rasterizePathSelection } from '../../../../../engine/src/paths';

self.addEventListener('message', async (event: MessageEvent<ImageProcessingRequest>) => {
  try {
    const request = event.data;
    const bitmap = await createImageBitmap(request.source);
    const maskBitmaps: ImageBitmap[] = [];

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
      const readMask = async (maskBlob: Blob): Promise<AlphaData> => {
        const maskBitmap = await createImageBitmap(maskBlob);
        maskBitmaps.push(maskBitmap);
        if (maskBitmap.width !== width || maskBitmap.height !== height) {
          throw new RangeError('Image and selection mask dimensions must match.');
        }
        const maskCanvas = new OffscreenCanvas(width, height);
        const maskContext = maskCanvas.getContext('2d');
        if (!maskContext) throw new Error('Could not create a mask processing context.');
        maskContext.drawImage(maskBitmap, 0, 0);
        const pixels = maskContext.getImageData(0, 0, width, height);
        return extractAlpha(createImageBuffer(width, height, pixels.data));
      };
      const renderMask = (mask: AlphaData): ImageBuffer => {
        const output = createImageBuffer(width, height);
        for (let index = 0; index < mask.values.length; index += 1) {
          const offset = index * 4;
          output.data[offset] = 255;
          output.data[offset + 1] = 64;
          output.data[offset + 2] = 64;
          output.data[offset + 3] = mask.values[index];
        }
        return output;
      };

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
            processed = renderMask(mask);
            break;
          }
          case 'select-similar-colors': {
            const mask = createSimilarColorMask(sourceBuffer, {
              x: request.operation.x,
              y: request.operation.y,
              tolerance: request.operation.tolerance,
              alphaTolerance: request.operation.alphaTolerance,
            });
            processed = renderMask(mask);
            break;
          }
          case 'combine-selection-mask': {
            const base = request.operation.base ? await readMask(request.operation.base) : undefined;
            const overlay = request.operation.overlay ? await readMask(request.operation.overlay) : undefined;
            let mask: AlphaData;
            if (request.operation.mode === 'replace') {
              if (!overlay) throw new TypeError('Replace selection requires an overlay mask.');
              mask = overlay;
            } else if (request.operation.mode === 'invert') {
              if (!base) throw new TypeError('Invert selection requires a base mask.');
              mask = invertSelectionMask(base);
            } else {
              if (!base || !overlay) throw new TypeError('Mask combination requires base and overlay masks.');
              mask = combineSelectionMasks(
                base,
                overlay,
                request.operation.mode as MaskSelectionOperation,
              );
            }
            processed = renderMask(mask);
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
            processed = eraseWithAlphaMask(
              sourceBuffer,
              await readMask(request.operation.mask),
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
      maskBitmaps.forEach((maskBitmap) => maskBitmap.close());
    }
  } catch (error) {
    const response: ImageProcessingResponse = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
});
