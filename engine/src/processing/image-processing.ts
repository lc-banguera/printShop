import type { JsonValue } from '../types/document';

export interface ImageAsset {
  id: string;
  uri: string;
  mediaType: string;
  width: number;
  height: number;
  sizeBytes?: number;
  checksum?: string;
  metadata?: Record<string, JsonValue>;
}

export interface DerivedAsset extends ImageAsset {
  sourceAssetIds: readonly string[];
  operationId: string;
  providerId: string;
}

export type ImageProcessingOperationKind =
  | 'extract-alpha'
  | 'apply-effects'
  | 'create-mask'
  | 'remove-background'
  | 'analyze-color-regions'
  | 'recolor'
  | 'upscale'
  | 'halftone'
  | 'cleanup-semitransparency'
  | 'export'
  | 'preflight';

export interface ImageProcessingOperation {
  id: string;
  kind: ImageProcessingOperationKind;
  inputAssetIds: readonly string[];
  parameters: JsonValue;
}

export interface ImageEffect {
  id: string;
  kind: string;
  enabled: boolean;
  parameters: JsonValue;
}

export interface EffectStack {
  effects: readonly ImageEffect[];
  mode?: 'additive' | 'replace';
}

export interface AlphaData {
  width: number;
  height: number;
  values: Uint8Array;
}

export interface Mask {
  id: string;
  sourceAssetId: string;
  alpha: AlphaData;
  name?: string;
  enabled?: boolean;
  opacity?: number;
}

export interface ColorRegion {
  id: string;
  color: string;
  pixelCount: number;
  mask: Mask;
}

export interface ImageProcessingRequest<
  TKind extends ImageProcessingOperationKind = ImageProcessingOperationKind,
> {
  operation: Extract<ImageProcessingOperation, { kind: TKind }>;
  inputs: readonly (ImageAsset | DerivedAsset)[];
  effectStack?: EffectStack;
}

export interface ProcessingWarning {
  code: string;
  message: string;
}

export type ProcessingResult =
  | {
      status: 'succeeded';
      operationId: string;
      derivedAssets: readonly DerivedAsset[];
      alphaData?: AlphaData;
      masks?: readonly Mask[];
      colorRegions?: readonly ColorRegion[];
      warnings: readonly ProcessingWarning[];
    }
  | {
      status: 'failed';
      operationId: string;
      error: {
        code: string;
        message: string;
      };
    };

export interface ProcessingProvider<
  TKind extends ImageProcessingOperationKind = ImageProcessingOperationKind,
> {
  id: string;
  supportedOperations: readonly TKind[];
  process(request: ImageProcessingRequest<TKind>): Promise<ProcessingResult>;
}

export interface BackgroundRemovalProvider extends ProcessingProvider<'remove-background'> {}

export interface UpscalingProvider extends ProcessingProvider<'upscale'> {}

export type MaskCompositionMode = 'multiply' | 'screen' | 'min' | 'max' | 'overwrite';

export function clampByte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

export function normalizeAlphaData(alpha: AlphaData): AlphaData {
  return createAlphaData(alpha.width, alpha.height, alpha.values);
}

export function createAlphaData(width: number, height: number, values: Uint8Array): AlphaData {
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) {
    throw new RangeError('Alpha dimensions must be positive safe integers.');
  }

  const expectedLength = width * height;
  if (!values || !Number.isSafeInteger(values.length) || values.length !== expectedLength) {
    throw new RangeError('Alpha data length must equal width multiplied by height.');
  }

  return { width, height, values: new Uint8Array(values) };
}

export function cloneAlphaData(alpha: AlphaData): AlphaData {
  return createAlphaData(alpha.width, alpha.height, alpha.values);
}

export function createMask(id: string, sourceAssetId: string, alpha: AlphaData): Mask {
  return {
    id,
    sourceAssetId,
    alpha: cloneAlphaData(alpha),
    enabled: true,
    opacity: 1,
  };
}

export function applyMaskToAlpha(
  alpha: AlphaData,
  mask: AlphaData,
  composition: MaskCompositionMode = 'multiply',
): AlphaData {
  const baseAlpha = normalizeAlphaData(alpha);
  const overlay = normalizeAlphaData(mask);

  if (baseAlpha.width !== overlay.width || baseAlpha.height !== overlay.height) {
    throw new RangeError('Mask and alpha dimensions must match.');
  }

  const output = new Uint8Array(baseAlpha.values.length);

  for (let index = 0; index < output.length; index += 1) {
    const a = baseAlpha.values[index];
    const b = overlay.values[index];

    switch (composition) {
      case 'screen':
        output[index] = clampByte(255 - ((255 - a) * (255 - b)) / 255);
        break;
      case 'min':
        output[index] = clampByte(Math.min(a, b));
        break;
      case 'max':
        output[index] = clampByte(Math.max(a, b));
        break;
      case 'overwrite':
        output[index] = clampByte(b);
        break;
      case 'multiply':
      default:
        output[index] = clampByte((a * b) / 255);
        break;
    }
  }

  return { width: baseAlpha.width, height: baseAlpha.height, values: output };
}

export function isMask(value: AlphaData | Mask): value is Mask {
  return 'alpha' in value;
}

export function toAlphaData(value: AlphaData | Mask): AlphaData {
  return isMask(value) ? cloneAlphaData(value.alpha) : cloneAlphaData(value);
}

export function mergeAlphaMasks(
  masks: readonly (AlphaData | Mask)[],
  composition: MaskCompositionMode = 'multiply',
): AlphaData {
  if (masks.length === 0) {
    return createAlphaData(1, 1, new Uint8Array([255]));
  }

  let current = toAlphaData(masks[0]);

  for (let index = 1; index < masks.length; index += 1) {
    const next = toAlphaData(masks[index]);
    current = applyMaskToAlpha(current, next, composition);
  }

  return current;
}

export function resolveEffectStack(stack?: EffectStack | null): readonly ImageEffect[] {
  if (!stack || !stack.effects) {
    return [];
  }

  return stack.effects.filter((effect) => effect && effect.enabled !== false);
}

export function applyEffectStack(alpha: AlphaData, stack?: EffectStack | null): AlphaData {
  const result = cloneAlphaData(alpha);
  const effects = resolveEffectStack(stack);

  for (const effect of effects) {
    const kind = String(effect.kind || '').toLowerCase();
    const params = (effect.parameters ?? {}) as Record<string, number>;

    if (kind === 'brightness') {
      const amount = Number(params.amount ?? params.brightness ?? 0);
      for (let index = 0; index < result.values.length; index += 1) {
        result.values[index] = clampByte(result.values[index] + amount);
      }
      continue;
    }

    if (kind === 'opacity') {
      const opacity = Math.min(1, Math.max(0, Number(params.opacity ?? 1)));
      for (let index = 0; index < result.values.length; index += 1) {
        result.values[index] = clampByte(result.values[index] * opacity);
      }
      continue;
    }

    if (kind === 'threshold') {
      const threshold = clampByte(Number(params.threshold ?? 128));
      for (let index = 0; index < result.values.length; index += 1) {
        result.values[index] = result.values[index] >= threshold ? 255 : 0;
      }
      continue;
    }

    if (kind === 'invert') {
      for (let index = 0; index < result.values.length; index += 1) {
        result.values[index] = clampByte(255 - result.values[index]);
      }
    }
  }

  return result;
}
