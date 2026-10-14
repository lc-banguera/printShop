import { clampByte } from './image-processing';
import { cloneImageBuffer, createImageBuffer, type ImageBuffer } from './image-buffer';

const CELL_SAMPLE_POSITIONS = [-0.375, -0.125, 0.125, 0.375] as const;

export interface HalftoneOptions {
  cellSize: number;
  angle: number;
  dotColor: string;
  bgColor: string;
  intensity: number;
  contrast: number;
  shape?: 'circle' | 'square';
  invert?: boolean;
}

function parseHexColor(color: string): [number, number, number] {
  const value = color.replace(/^#/, '');
  const normalized = value.length === 3
    ? value.split('').map((channel) => channel + channel).join('')
    : value;
  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new TypeError(`Unsupported halftone color: ${color}`);
  }
  const rgb = Number.parseInt(normalized, 16);
  return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255];
}

function luminance(color: readonly number[]): number {
  return (0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]) / 255;
}

function composite(
  output: ImageBuffer,
  x: number,
  y: number,
  color: readonly [number, number, number],
  sourceAlpha: number,
): void {
  if (x < 0 || y < 0 || x >= output.width || y >= output.height) return;
  const index = (y * output.width + x) * 4;
  const dstAlpha = output.data[index + 3];
  const outAlpha = sourceAlpha + (dstAlpha * (255 - sourceAlpha)) / 255;
  if (outAlpha === 0) return;
  for (let channel = 0; channel < 3; channel += 1) {
    output.data[index + channel] = clampByte(
      (color[channel] * sourceAlpha +
        output.data[index + channel] * dstAlpha * (255 - sourceAlpha) / 255) / outAlpha,
    );
  }
  output.data[index + 3] = clampByte(outAlpha);
}

function drawDot(
  output: ImageBuffer,
  centerX: number,
  centerY: number,
  size: number,
  shape: 'circle' | 'square',
  angle: number,
  color: readonly [number, number, number],
): void {
  const radius = shape === 'circle' ? size : size * Math.SQRT1_2;
  const left = Math.floor(centerX - radius);
  const right = Math.ceil(centerX + radius);
  const top = Math.floor(centerY - radius);
  const bottom = Math.ceil(centerY + radius);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      let covered = 0;
      for (const sampleY of [0.25, 0.75]) {
        for (const sampleX of [0.25, 0.75]) {
          const dx = x + sampleX - centerX;
          const dy = y + sampleY - centerY;
          if (shape === 'circle') {
            if (dx * dx + dy * dy <= size * size) covered += 1;
          } else {
            const localX = dx * cos + dy * sin;
            const localY = -dx * sin + dy * cos;
            if (Math.abs(localX) <= size / 2 && Math.abs(localY) <= size / 2) covered += 1;
          }
        }
      }
      if (covered > 0) composite(output, x, y, color, (covered / 4) * 255);
    }
  }
}

export function applyHalftone(source: ImageBuffer, options: HalftoneOptions): ImageBuffer {
  if (!Number.isFinite(options.angle) || !Number.isFinite(options.cellSize) ||
      !Number.isFinite(options.intensity) || !Number.isFinite(options.contrast)) {
    throw new RangeError('Halftone parameters must be finite numbers.');
  }
  if (options.shape !== undefined && options.shape !== 'circle' && options.shape !== 'square') {
    throw new TypeError(`Unsupported halftone shape: ${String(options.shape)}`);
  }

  const input = cloneImageBuffer(source);
  const width = input.width;
  const height = input.height;
  const transparent = options.bgColor === 'transparent';
  const output = createImageBuffer(width, height);
  const backgroundColor = transparent ? [0, 0, 0] as const : parseHexColor(options.bgColor);
  if (!transparent) {
    for (let index = 0; index < output.data.length; index += 4) {
      output.data[index] = backgroundColor[0];
      output.data[index + 1] = backgroundColor[1];
      output.data[index + 2] = backgroundColor[2];
      output.data[index + 3] = 255;
    }
  }

  const cellSize = Math.max(2, Math.min(60, options.cellSize || 8));
  const halfCell = cellSize / 2;
  const angle = (options.angle * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const colorDots = options.dotColor === 'original';
  const fixedDotColor: [number, number, number] = colorDots
    ? [0, 0, 0]
    : parseHexColor(options.dotColor || '#111827');
  const dotIsDark = transparent
    ? luminance(fixedDotColor) < 0.5
    : luminance(fixedDotColor) < luminance(backgroundColor);
  const contrast = Math.max(0.1, options.contrast / 100);
  const intensity = Math.max(0.1, options.intensity / 100);
  const shape = options.shape ?? 'circle';
  const centerX = width / 2;
  const centerY = height / 2;
  const halfExtent = Math.sqrt(width * width + height * height) / 2 + cellSize * 2;
  const minimum = Math.floor(-halfExtent / cellSize);
  const maximum = Math.ceil(halfExtent / cellSize);

  for (let row = minimum; row <= maximum; row += 1) {
    const v = (row + 0.5) * cellSize;
    for (let column = minimum; column <= maximum; column += 1) {
      const u = (column + 0.5) * cellSize;
      const x = centerX + u * cos - v * sin;
      const y = centerY + u * sin + v * cos;
      if (x < -halfCell || x >= width + halfCell || y < -halfCell || y >= height + halfCell) continue;

      let luminanceSum = 0;
      let alphaSum = 0;
      let redSum = 0;
      let greenSum = 0;
      let blueSum = 0;
      let sampleCount = 0;
      for (const sampleY of CELL_SAMPLE_POSITIONS) {
        for (const sampleX of CELL_SAMPLE_POSITIONS) {
          const dx = sampleX * cellSize;
          const dy = sampleY * cellSize;
          const sx = Math.round(x + dx * cos - dy * sin);
          const sy = Math.round(y + dx * sin + dy * cos);
          if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
          const index = (sy * width + sx) * 4;
          const red = input.data[index];
          const green = input.data[index + 1];
          const blue = input.data[index + 2];
          const alpha = input.data[index + 3] / 255;
          luminanceSum += ((0.299 * red + 0.587 * green + 0.114 * blue) / 255) * alpha;
          alphaSum += alpha;
          redSum += red * alpha;
          greenSum += green * alpha;
          blueSum += blue * alpha;
          sampleCount += 1;
        }
      }

      if (sampleCount === 0 || alphaSum < 0.015) continue;
      const averageAlpha = alphaSum / sampleCount;
      const averageLuminance = luminanceSum / alphaSum;
      const adjustedLuminance = Math.max(0, Math.min(1, (averageLuminance - 0.5) * contrast + 0.5));
      let coverage = dotIsDark ? 1 - adjustedLuminance : adjustedLuminance;
      if (options.invert) coverage = 1 - coverage;
      coverage = Math.max(0, Math.min(1, coverage * intensity)) * averageAlpha;
      if (coverage <= 0.005) continue;

      const dotColor: [number, number, number] = colorDots
        ? [Math.round(redSum / alphaSum), Math.round(greenSum / alphaSum), Math.round(blueSum / alphaSum)]
        : fixedDotColor;
      if (shape === 'square') {
        const size = Math.sqrt(coverage) * cellSize;
        if (size >= 0.5) drawDot(output, x, y, size, shape, angle, dotColor);
      } else {
        const radius = Math.sqrt(coverage) * halfCell * 1.35;
        if (radius >= 0.4) drawDot(output, x, y, radius, shape, angle, dotColor);
      }
    }
  }

  return output;
}
