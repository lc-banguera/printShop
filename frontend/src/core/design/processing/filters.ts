import type { ArtworkFilters } from '../../../../../engine/src/types/element';
export type { ArtworkFilters } from '../../../../../engine/src/types/element';

export const DEFAULT_ARTWORK_FILTERS: Readonly<ArtworkFilters> = Object.freeze({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
});

const FILTER_RANGES: Record<keyof ArtworkFilters, readonly [number, number]> = {
  brightness: [0, 200],
  contrast: [0, 200],
  saturation: [0, 200],
  grayscale: [0, 100],
  sepia: [0, 100],
  invert: [0, 100],
  blur: [0, 12],
};

const FILTER_KEYS: readonly (keyof ArtworkFilters)[] = [
  'brightness',
  'contrast',
  'saturation',
  'grayscale',
  'sepia',
  'invert',
  'blur',
];

export function normalizeArtworkFilters(
  filters: Partial<ArtworkFilters> = {},
): ArtworkFilters {
  const normalized = { ...DEFAULT_ARTWORK_FILTERS, ...filters };

  for (const key of FILTER_KEYS) {
    const value = normalized[key];
    const [minimum, maximum] = FILTER_RANGES[key];
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
      throw new RangeError(
        `Artwork filter "${key}" must be a finite number between ${minimum} and ${maximum}.`,
      );
    }
  }

  return normalized;
}

export function buildCanvasFilterString(
  filters?: Partial<ArtworkFilters>,
): string {
  const next = { ...DEFAULT_ARTWORK_FILTERS, ...filters };
  return [
    `brightness(${next.brightness}%)`,
    `contrast(${next.contrast}%)`,
    `saturate(${next.saturation}%)`,
    `grayscale(${next.grayscale}%)`,
    `sepia(${next.sepia}%)`,
    `invert(${next.invert}%)`,
    `blur(${next.blur}px)`,
  ].join(' ');
}
