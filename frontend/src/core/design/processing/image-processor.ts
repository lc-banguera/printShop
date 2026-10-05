import { normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
  ProcessedArtworkImage,
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
    source,
    filters: normalizeArtworkFilters(filters),
  };

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./image-processor.worker.ts', import.meta.url),
      { type: 'module' },
    );

    const finish = (callback: () => void) => {
      worker.terminate();
      callback();
    };

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
