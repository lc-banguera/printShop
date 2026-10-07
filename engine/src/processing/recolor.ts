import { cloneAlphaData, isMask, type AlphaData, type Mask } from './image-processing';
import { cloneImageBuffer, type ImageBuffer } from './image-buffer';

export interface RecolorOptions {
  sourceColor: string;
  targetColor: string;
  tolerance?: number;
  mask?: AlphaData | Mask;
}

export interface RecolorResult {
  image: ImageBuffer;
  recoloredPixels: number;
}

function parseColor(value: string): [number, number, number] {
  const raw = value.replace(/^#/, '');
  const hex = raw.length === 3 ? raw.split('').map((part) => part + part).join('') : raw;
  if (!/^[\da-f]{6}$/i.test(hex)) throw new TypeError(`Invalid RGB color: ${value}`);
  const packed = Number.parseInt(hex, 16);
  return [(packed >> 16) & 255, (packed >> 8) & 255, packed & 255];
}

function distance(
  red: number,
  green: number,
  blue: number,
  target: readonly [number, number, number],
): number {
  const dr = red - target[0];
  const dg = green - target[1];
  const db = blue - target[2];
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

export function recolorImage(source: ImageBuffer, options: RecolorOptions): RecolorResult {
  const from = parseColor(options.sourceColor);
  const to = parseColor(options.targetColor);
  const tolerance = options.tolerance ?? 0;
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 441) {
    throw new RangeError('Recolor tolerance must be between 0 and 441.');
  }
  let maskAlpha: AlphaData | undefined;
  let maskOpacity = 1;
  if (options.mask) {
    if (isMask(options.mask) && options.mask.enabled === false) {
      return { image: cloneImageBuffer(source), recoloredPixels: 0 };
    }
    if (isMask(options.mask)) {
      maskOpacity = options.mask.opacity ?? 1;
      if (!Number.isFinite(maskOpacity) || maskOpacity < 0 || maskOpacity > 1) {
        throw new RangeError('Mask opacity must be between 0 and 1.');
      }
      maskAlpha = cloneAlphaData(options.mask.alpha);
    } else {
      maskAlpha = cloneAlphaData(options.mask);
    }
    if (maskAlpha.width !== source.width || maskAlpha.height !== source.height) {
      throw new RangeError('Recolor mask dimensions must match the source image.');
    }
  }

  const image = cloneImageBuffer(source);
  let recoloredPixels = 0;
  for (let pixel = 0; pixel < source.width * source.height; pixel += 1) {
    const index = pixel * 4;
    if (image.data[index + 3] === 0 ||
        distance(image.data[index], image.data[index + 1], image.data[index + 2], from) > tolerance) {
      continue;
    }
    const maskValue = (maskAlpha?.values[pixel] ?? 255) * maskOpacity;
    if (maskValue === 0) continue;
    const opacity = maskValue / 255;
    for (let channel = 0; channel < 3; channel += 1) {
      image.data[index + channel] = Math.round(
        image.data[index + channel] * (1 - opacity) + to[channel] * opacity,
      );
    }
    recoloredPixels += 1;
  }
  return { image, recoloredPixels };
}
