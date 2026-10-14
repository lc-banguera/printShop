import { clampByte, type EffectStack, type ImageEffect } from './image-processing';
import { cloneImageBuffer, type ImageBuffer } from './image-buffer';

export type RasterEffectKind =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'grayscale'
  | 'invert'
  | 'opacity'
  | 'threshold';

function cloneJson<T extends import('../types/document').JsonValue>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneJson(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJson(item)]),
    ) as T;
  }
  return value;
}

export function composeEffectStacks(
  current: EffectStack | undefined,
  next: EffectStack,
): EffectStack {
  const incoming = next.effects.map((effect) => ({
    id: effect.id,
    kind: effect.kind,
    enabled: effect.enabled,
    parameters: cloneJson(effect.parameters),
  }));
  const effects = next.mode === 'replace'
    ? incoming
    : [...(current?.effects ?? []).map((effect) => ({
        id: effect.id,
        kind: effect.kind,
        enabled: effect.enabled,
        parameters: cloneJson(effect.parameters),
      })), ...incoming];
  return { effects, mode: next.mode ?? current?.mode ?? 'additive' };
}

function parameter(effect: ImageEffect, name: string, fallback: number): number {
  const parameters = effect.parameters;
  if (typeof parameters !== 'object' || parameters === null || Array.isArray(parameters)) {
    return fallback;
  }
  const value = (parameters as Record<string, unknown>)[name];
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Effect parameter "${name}" must be a finite number.`);
  }
  return value;
}

function applyEffect(data: Uint8Array | Uint8ClampedArray, effect: ImageEffect): void {
  const kind = effect.kind.toLowerCase() as RasterEffectKind;

  for (let index = 0; index < data.length; index += 4) {
    let red = data[index];
    let green = data[index + 1];
    let blue = data[index + 2];

    switch (kind) {
      case 'brightness':
        {
        const amount = parameter(effect, 'amount', 0);
        red += amount;
        green += amount;
        blue += amount;
        break;
        }
      case 'contrast': {
        const contrast = parameter(effect, 'contrast', parameter(effect, 'amount', 1));
        red = (red - 128) * contrast + 128;
        green = (green - 128) * contrast + 128;
        blue = (blue - 128) * contrast + 128;
        break;
      }
      case 'saturation': {
        const saturation = parameter(effect, 'saturation', parameter(effect, 'amount', 1));
        const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
        red = gray + saturation * (red - gray);
        green = gray + saturation * (green - gray);
        blue = gray + saturation * (blue - gray);
        break;
      }
      case 'grayscale': {
        const gray = 0.299 * red + 0.587 * green + 0.114 * blue;
        red = green = blue = gray;
        break;
      }
      case 'invert':
        red = 255 - red;
        green = 255 - green;
        blue = 255 - blue;
        break;
      case 'opacity': {
        const opacity = parameter(effect, 'opacity', 1);
        if (opacity < 0 || opacity > 1) {
          throw new RangeError('Effect opacity must be between 0 and 1.');
        }
        data[index + 3] = clampByte(data[index + 3] * opacity);
        continue;
      }
      case 'threshold': {
        const threshold = parameter(effect, 'threshold', 128);
        const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
        red = green = blue = luminance >= threshold ? 255 : 0;
        break;
      }
      default:
        throw new RangeError(`Unsupported raster effect: ${effect.kind}`);
    }

    data[index] = clampByte(red);
    data[index + 1] = clampByte(green);
    data[index + 2] = clampByte(blue);
  }
}

export function applyImageEffectStack(
  source: ImageBuffer,
  stack?: EffectStack | null,
): ImageBuffer {
  const output = cloneImageBuffer(source);
  if (!stack) return output;

  const effects = stack.effects;
  if (!Array.isArray(effects)) throw new TypeError('Effect stack must contain an effects array.');
  for (const effect of effects) {
    if (!effect || typeof effect.kind !== 'string' || !effect.kind.trim()) {
      throw new TypeError('Each effect must have a non-empty kind.');
    }
    if (effect.enabled !== false) applyEffect(output.data, effect);
  }
  return output;
}
