export type PrintUnit = 'mm' | 'cm' | 'in';

export interface ImageDimensionsPx {
  widthPx: number;
  heightPx: number;
}

export interface RasterDimensionRequest {
  widthPx?: number;
  heightPx?: number;
  preserveAspectRatio?: boolean;
}

export interface ImageDpi {
  dpiX: number;
  dpiY: number;
}

export interface PrintDimensions {
  width: number;
  height: number;
  unit: PrintUnit;
}

function assertDimensions(dimensions: ImageDimensionsPx): void {
  if (
    !Number.isSafeInteger(dimensions.widthPx) ||
    dimensions.widthPx <= 0 ||
    !Number.isSafeInteger(dimensions.heightPx) ||
    dimensions.heightPx <= 0
  ) {
    throw new RangeError('Raster dimensions must be positive safe integers.');
  }
  if (!Number.isSafeInteger(dimensions.widthPx * dimensions.heightPx * 4)) {
    throw new RangeError('Raster dimensions exceed the safe RGBA buffer size.');
  }
}

function assertDpi(dpi: ImageDpi): void {
  if (![dpi.dpiX, dpi.dpiY].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('DPI values must be positive finite numbers.');
  }
}

function assertPrintUnit(unit: string): asserts unit is PrintUnit {
  if (unit !== 'mm' && unit !== 'cm' && unit !== 'in') {
    throw new TypeError(`Unsupported print unit: ${unit}`);
  }
}

function toCentimeters(value: number, unit: PrintUnit): number {
  switch (unit) {
    case 'mm':
      return value / 10;
    case 'cm':
      return value;
    case 'in':
      return value * 2.54;
  }
}

function fromCentimeters(value: number, unit: PrintUnit): number {
  switch (unit) {
    case 'mm':
      return value * 10;
    case 'cm':
      return value;
    case 'in':
      return value / 2.54;
  }
}

export function calculateRasterDimensions(
  source: ImageDimensionsPx,
  request: RasterDimensionRequest,
): ImageDimensionsPx {
  assertDimensions(source);
  const hasWidth = request.widthPx !== undefined;
  const hasHeight = request.heightPx !== undefined;
  const requestedWidth = request.widthPx ?? source.widthPx;
  const requestedHeight = request.heightPx ?? source.heightPx;
  if (
    !Number.isSafeInteger(requestedWidth) ||
    requestedWidth <= 0 ||
    !Number.isSafeInteger(requestedHeight) ||
    requestedHeight <= 0
  ) {
    throw new RangeError('Requested raster dimensions must be positive safe integers.');
  }

  if (!request.preserveAspectRatio) {
    return { widthPx: requestedWidth, heightPx: requestedHeight };
  }
  if (!hasWidth && !hasHeight) return source;
  const scale = hasWidth && hasHeight
    ? Math.min(requestedWidth / source.widthPx, requestedHeight / source.heightPx)
    : hasWidth
      ? requestedWidth / source.widthPx
      : requestedHeight / source.heightPx;
  return {
    widthPx: Math.max(1, Math.round(source.widthPx * scale)),
    heightPx: Math.max(1, Math.round(source.heightPx * scale)),
  };
}

export function pixelsToPrintDimensions(
  raster: ImageDimensionsPx,
  dpi: ImageDpi,
  unit: PrintUnit = 'cm',
): PrintDimensions {
  assertDimensions(raster);
  assertDpi(dpi);
  assertPrintUnit(unit);
  const widthCm = (raster.widthPx / dpi.dpiX) * 2.54;
  const heightCm = (raster.heightPx / dpi.dpiY) * 2.54;
  return {
    width: fromCentimeters(widthCm, unit),
    height: fromCentimeters(heightCm, unit),
    unit,
  };
}

export function printDimensionsToPixels(
  printSize: PrintDimensions,
  dpi: ImageDpi,
): ImageDimensionsPx {
  assertPrintUnit(printSize.unit);
  assertDpi(dpi);
  if (![printSize.width, printSize.height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Print dimensions must be positive finite values.');
  }
  const widthInches = toCentimeters(printSize.width, printSize.unit) / 2.54;
  const heightInches = toCentimeters(printSize.height, printSize.unit) / 2.54;
  return {
    widthPx: Math.max(1, Math.round(widthInches * dpi.dpiX)),
    heightPx: Math.max(1, Math.round(heightInches * dpi.dpiY)),
  };
}

export function calculateEffectiveResolution(
  raster: ImageDimensionsPx,
  printSize: PrintDimensions,
): ImageDpi {
  assertDimensions(raster);
  assertPrintUnit(printSize.unit);
  if (![printSize.width, printSize.height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Print dimensions must be positive finite values.');
  }
  const widthInches = toCentimeters(printSize.width, printSize.unit) / 2.54;
  const heightInches = toCentimeters(printSize.height, printSize.unit) / 2.54;
  return {
    dpiX: raster.widthPx / widthInches,
    dpiY: raster.heightPx / heightInches,
  };
}
