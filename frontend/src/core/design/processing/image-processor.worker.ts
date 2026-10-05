/// <reference lib="webworker" />

import { buildCanvasFilterString, normalizeArtworkFilters } from './filters';
import type {
  ImageProcessingRequest,
  ImageProcessingResponse,
} from './image-processor-contract';

self.addEventListener('message', async (event: MessageEvent<ImageProcessingRequest>) => {
  try {
    const { source, filters } = event.data;
    const normalizedFilters = normalizeArtworkFilters(filters);
    const bitmap = await createImageBitmap(source);

    try {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not create a 2D processing context in the image worker.');
      }
      if (!('filter' in context)) {
        throw new Error('Canvas filters are not supported in this worker context.');
      }

      context.filter = buildCanvasFilterString(normalizedFilters);
      context.drawImage(bitmap, 0, 0);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const response: ImageProcessingResponse = {
        ok: true,
        image: { blob, width: bitmap.width, height: bitmap.height },
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
