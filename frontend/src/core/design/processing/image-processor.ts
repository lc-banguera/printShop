import { normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
  ProcessedArtworkImage,
  RasterImageOperation,
} from './image-processor-contract';
import type { ArtworkFilters } from './filters';

import {
  isProcessingServiceAvailable,
  vectorizeWithService,
  enhanceWithService,
  removeBackgroundWithService,
  inpaintWithService,
  adjustWithService,
  halftoneWithService,
} from './python-service-client';

export type { ProcessedArtworkImage };

export async function processArtworkImage(
  source: Blob,
  filters: Partial<ArtworkFilters> = {},
  previewMaxDimension?: number,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  if (source.size === 0) {
    throw new Error('Cannot process an empty image asset.');
  }

  const request: ImageProcessingRequest = {
    kind: 'filters',
    source,
    filters: normalizeArtworkFilters(filters),
    ...(previewMaxDimension === undefined ? {} : { previewMaxDimension }),
  };

  return runWorkerRequest(request, signal);
}

export async function processArtworkImageUrl(
  sourceUrl: string,
  filters: Partial<ArtworkFilters> = {},
  previewMaxDimension?: number,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const response = await fetch(sourceUrl, { signal });
  if (!response.ok) {
    throw new Error(`Could not load image asset (${response.status}).`);
  }
  return processArtworkImage(
    await response.blob(),
    filters,
    previewMaxDimension,
    signal,
  );
}

export async function processRasterImage(
  source: Blob,
  operation: RasterImageOperation,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  if (source.size === 0) {
    throw new Error('Cannot process an empty image asset.');
  }

  // Check if specialized Python microservice is available for heavy operations
  const serviceReady = await isProcessingServiceAvailable();

  if (serviceReady) {
    if (operation.kind === 'vectorize' && operation.previewMaxDimension === undefined) {
      try {
        return await vectorizeWithService(source, operation.options, signal);
      } catch (err) {
        console.warn('VTracer microservice error, falling back to local worker:', err);
      }
    } else if (operation.kind === 'remove-background') {
      try {
        return await removeBackgroundWithService(
          source,
          operation.model ?? 'u2netp',
          operation.feather ?? 1,
          signal,
        );
      } catch (err) {
        console.warn('U2Net microservice error, falling back to local worker:', err);
      }
    } else if (
      operation.kind === 'upscale' &&
      operation.previewMaxDimension === undefined &&
      operation.targetMaxDimension === undefined
    ) {
      const mode = operation.mode ?? 'precision';
      try {
        const method = operation.method ?? 'bicubic';
        return await enhanceWithService(source, operation.factor, mode, method, signal);
      } catch (err) {
        if (mode === 'ai') {
          throw err;
        }
        console.warn('Super-resolution microservice error, falling back to local worker:', err);
      }
    } else if (operation.kind === 'inpaint') {
      try {
        return await inpaintWithService(source, operation.mask, operation.radius, operation.method, signal);
      } catch (err) {
        console.warn('Inpainting microservice error, falling back to local worker:', err);
      }
    } else if (operation.kind === 'adjust' && operation.previewMaxDimension === undefined) {
      try {
        return await adjustWithService(source, operation.adjustments, signal);
      } catch (err) {
        console.warn('Adjust microservice error, falling back to local worker:', err);
      }
    } else if (operation.kind === 'vectorize') {
      // Preview tracing is deliberately local and bounded; final tracing may use VTracer.
      // The service branch above remains the authoritative full-resolution path.
    } else if (operation.kind === 'halftone' && operation.previewMaxDimension === undefined) {
      try {
        return await halftoneWithService(
          source,
          {
            cellSize: operation.options.cellSize,
            angle: operation.options.angle,
            shape: operation.options.shape,
            intensity: operation.options.intensity,
            contrast: operation.options.contrast,
            invert: operation.options.invert,
          },
          signal,
        );
      } catch (err) {
        console.warn('Halftone microservice error, falling back to local worker:', err);
      }
    }
  }

  if (operation.kind === 'upscale' && operation.mode === 'ai') {
    throw new Error('La mejora IA requiere el servicio local con el modelo SESR comercial verificado.');
  }

  return runWorkerRequest({ kind: 'raster-operation', source, operation }, signal);
}

export async function processRasterImageUrl(
  sourceUrl: string,
  operation: RasterImageOperation,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const response = await fetch(sourceUrl, { signal });
  if (!response.ok) {
    throw new Error(`Could not load image asset (${response.status}).`);
  }
  return processRasterImage(await response.blob(), operation, signal);
}

async function runWorkerRequest(
  request: ImageProcessingRequest,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./image-processor.worker.ts', import.meta.url),
      { type: 'module' },
    );
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      worker.terminate();
      callback();
    };
    const abort = () =>
      finish(() => reject(new DOMException('Image processing was cancelled.', 'AbortError')));

    if (signal?.aborted) {
      abort();
      return;
    }
    signal?.addEventListener('abort', abort, { once: true });

    worker.addEventListener(
      'message',
      (event: MessageEvent<ImageProcessingResponse>) => {
        const response = event.data;
        if (!response.ok) {
          const message = response.error;
          finish(() => reject(new Error(message)));
          return;
        }
        const image = response.image;
        finish(() => resolve(image));
      },
      { once: true },
    );

    worker.addEventListener(
      'error',
      (event) => {
        event.preventDefault();
        finish(() => reject(new Error(event.message || 'The image worker failed.')));
      },
      { once: true },
    );

    worker.addEventListener(
      'messageerror',
      () => finish(() => reject(new Error('Could not read the image worker response.'))),
      { once: true },
    );

    try {
      worker.postMessage(request);
    } catch (error) {
      finish(() => reject(error));
    }
  });
}
