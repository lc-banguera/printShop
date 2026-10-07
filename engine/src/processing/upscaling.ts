import { assertImageBuffer, type ImageBuffer } from './image-buffer';

export interface UpscalingProcessor {
  readonly providerId: string;
  upscale(source: ImageBuffer, factor: number): Promise<ImageBuffer>;
}

export type UpscalingResult =
  | { status: 'succeeded'; image: ImageBuffer; providerId: string }
  | { status: 'not-configured'; code: 'NOT_CONFIGURED'; message: string };

export async function upscaleImage(
  source: ImageBuffer,
  factor: number,
  processor?: UpscalingProcessor,
): Promise<UpscalingResult> {
  if (!Number.isFinite(factor) || factor <= 1) {
    throw new RangeError('Upscaling factor must be greater than 1.');
  }
  if (!processor) {
    return {
      status: 'not-configured',
      code: 'NOT_CONFIGURED',
      message: 'No real upscaling processor is configured.',
    };
  }
  const image = await processor.upscale(source, factor);
  assertImageBuffer(image);
  if (image.width < source.width * factor || image.height < source.height * factor) {
    throw new RangeError('Upscaling processor returned dimensions below the requested scale factor.');
  }
  if (!processor.providerId.trim()) throw new TypeError('Upscaling processor must have a provider id.');
  return { status: 'succeeded', image, providerId: processor.providerId };
}
