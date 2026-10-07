import { normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
  ProcessedArtworkImage,
  RasterImageOperation,
} from './image-processor-contract';
import type { ArtworkFilters } from './filters';

export type { ProcessedArtworkImage };

export async function processArtworkImage(
  source: Blob,
  filters: Partial<ArtworkFilters> = {},
): Promise<ProcessedArtworkImage> {
  if (source.size === 0) {
    throw new Error('Cannot process an empty image asset.');
  }

  const request: ImageProcessingRequest = {
    kind: 'filters',
    source,
    filters: normalizeArtworkFilters(filters),
  };

  return runWorkerRequest(request);
}

export async function processRasterImage(
  source: Blob,
  operation: RasterImageOperation,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  if (source.size === 0) {
    throw new Error('Cannot process an empty image asset.');
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
