import sharp from 'sharp';
import { BoundingBox, CropOptions, ImageMetadata } from './types';

export class ImageProcessor {
  /**
   * Loads an image and returns its metadata and a sharp instance
   */
  static async load(inputBuffer: Buffer): Promise<{ image: sharp.Sharp; metadata: ImageMetadata }> {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    
    if (!metadata.width || !metadata.height || !metadata.channels) {
      throw new Error('Could not read image metadata');
    }
    
    return {
      image,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        format: metadata.format || 'unknown',
        hasAlpha: metadata.hasAlpha || false
      }
    };
  }

  /**
   * Calculates the bounding box of the useful content area by scanning pixels.
   *
   * The detection is adaptive:
   *  - If the image has an alpha channel AND the configured background alpha is 0,
   *    it uses pure alpha-based detection (transparent pixel = background).
   *  - Otherwise it samples the four corners to infer the actual background color
   *    and falls back to RGB color-tolerance detection.
   */
  static async detectContentBoundingBox(inputBuffer: Buffer, options: CropOptions): Promise<BoundingBox> {
    const { image, metadata } = await this.load(inputBuffer);
    const { width, height, channels } = metadata;

    // Decode to raw RGBA pixels (always 4 channels for consistency)
    const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const rawChannels = 4; // ensureAlpha guarantees 4

    const { backgroundDetection } = options;
    const cfgColor = backgroundDetection.color;
    const tol = backgroundDetection.tolerance;

    // ── Adaptive background inference ──────────────────────────────────────
    // If the config requests alpha=0 detection but the image was fully opaque
    // (no meaningful transparency) we fall back to corner-sampling.
    const cornerAlphas = [
      data[3],
      data[(width - 1) * rawChannels + 3],
      data[(height - 1) * width * rawChannels + 3],
      data[((height - 1) * width + width - 1) * rawChannels + 3]
    ];
    const avgCornerAlpha = cornerAlphas.reduce((a, b) => a + b, 0) / 4;

    const useAlphaMode = cfgColor.alpha !== undefined && cfgColor.alpha === 0 && avgCornerAlpha <= tol;

    // When falling back to color mode, sample the four corners to get the real BG color
    let bgR = cfgColor.r, bgG = cfgColor.g, bgB = cfgColor.b;
    if (!useAlphaMode) {
      const corners = [
        { r: data[0], g: data[1], b: data[2] },
        { r: data[(width - 1) * rawChannels], g: data[(width - 1) * rawChannels + 1], b: data[(width - 1) * rawChannels + 2] },
        { r: data[(height - 1) * width * rawChannels], g: data[(height - 1) * width * rawChannels + 1], b: data[(height - 1) * width * rawChannels + 2] },
        { r: data[((height - 1) * width + width - 1) * rawChannels], g: data[((height - 1) * width + width - 1) * rawChannels + 1], b: data[((height - 1) * width + width - 1) * rawChannels + 2] }
      ];
      bgR = Math.round(corners.reduce((a, c) => a + c.r, 0) / 4);
      bgG = Math.round(corners.reduce((a, c) => a + c.g, 0) / 4);
      bgB = Math.round(corners.reduce((a, c) => a + c.b, 0) / 4);
    }

    // ── Pixel scanner ───────────────────────────────────────────────────────
    let minX = width, minY = height, maxX = 0, maxY = 0;

    const isBackground = (r: number, g: number, b: number, a: number): boolean => {
      if (useAlphaMode) {
        return a <= tol; // transparent pixel
      }
      // Solid-color mode: ignore very transparent pixels entirely (treat as background)
      if (a < 10) return true;
      return (
        Math.abs(r - bgR) <= tol &&
        Math.abs(g - bgG) <= tol &&
        Math.abs(b - bgB) <= tol
      );
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * rawChannels;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];

        if (!isBackground(r, g, b, a)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If the entire image is background
    if (minX > maxX || minY > maxY) {
      return { left: 0, top: 0, width, height };
    }

    return {
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    };
  }

  /**
   * Applies a safe margin to a bounding box, ensuring it doesn't exceed image dimensions.
   */
  static addMarginToBoundingBox(box: BoundingBox, margin: number, imageWidth: number, imageHeight: number): BoundingBox {
    const left = Math.max(0, box.left - margin);
    const top = Math.max(0, box.top - margin);
    
    const right = Math.min(imageWidth, box.left + box.width + margin);
    const bottom = Math.min(imageHeight, box.top + box.height + margin);
    
    return {
      left,
      top,
      width: right - left,
      height: bottom - top
    };
  }

  /**
   * Crops the image to the specified bounding box.
   */
  static async crop(inputBuffer: Buffer, box: BoundingBox): Promise<Buffer> {
    return sharp(inputBuffer)
      .extract({
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height
      })
      .toBuffer();
  }
}
