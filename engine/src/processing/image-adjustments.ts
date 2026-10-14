import { clampByte } from './image-processing';
import { cloneImageBuffer, type ImageBuffer } from './image-buffer';

export interface ImageAdjustmentOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  hue?: number;
  sharpen?: number;
}

function clampUnit(value: number): number {
  return Math.max(-100, Math.min(100, Number.isFinite(value) ? value : 0));
}

function rgbToHsv(red: number, green: number, blue: number): [number, number, number] {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return [hue, max === 0 ? 0 : delta / max, max];
}

function hsvToRgb(hue: number, saturation: number, value: number): [number, number, number] {
  const h = ((hue % 360) + 360) % 360;
  const c = value * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = value - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function applyImageAdjustments(
  source: ImageBuffer,
  options: ImageAdjustmentOptions = {},
): ImageBuffer {
  const output = cloneImageBuffer(source);
  const brightness = clampUnit(options.brightness ?? 0) * 2.55;
  const contrast = clampUnit(options.contrast ?? 0);
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const saturation = 1 + clampUnit(options.saturation ?? 0) / 100;
  const temperature = clampUnit(options.temperature ?? 0) / 100;
  const hue = clampUnit(options.hue ?? 0);
  const sharpen = Math.max(0, Math.min(100, options.sharpen ?? 0)) / 100;

  for (let index = 0; index < output.data.length; index += 4) {
    let red = output.data[index] + brightness;
    let green = output.data[index + 1] + brightness;
    let blue = output.data[index + 2] + brightness;
    red = (red - 128) * contrastFactor + 128;
    green = (green - 128) * contrastFactor + 128;
    blue = (blue - 128) * contrastFactor + 128;
    if (temperature >= 0) {
      red *= 1 + temperature * 0.25;
      green *= 1 + temperature * 0.1;
      blue *= 1 - temperature * 0.15;
    } else {
      const cool = -temperature;
      blue *= 1 + cool * 0.25;
      green *= 1 + cool * 0.05;
      red *= 1 - cool * 0.2;
    }
    const [currentHue, currentSaturation, currentValue] = rgbToHsv(
      clampByte(red), clampByte(green), clampByte(blue),
    );
    [red, green, blue] = hsvToRgb(currentHue + hue, Math.max(0, Math.min(1, currentSaturation * saturation)), currentValue);
    output.data[index] = clampByte(red);
    output.data[index + 1] = clampByte(green);
    output.data[index + 2] = clampByte(blue);
  }

  if (sharpen > 0 && output.width > 2 && output.height > 2) {
    const input = cloneImageBuffer(output);
    for (let y = 1; y < output.height - 1; y += 1) {
      for (let x = 1; x < output.width - 1; x += 1) {
        const index = (y * output.width + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          const neighbours = (
            input.data[index - output.width * 4 + channel] +
            input.data[index + output.width * 4 + channel] +
            input.data[index - 4 + channel] +
            input.data[index + 4 + channel]
          ) / 4;
          output.data[index + channel] = clampByte(input.data[index + channel] + (input.data[index + channel] - neighbours) * sharpen);
        }
      }
    }
  }
  return output;
}
