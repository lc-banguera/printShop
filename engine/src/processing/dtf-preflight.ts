import { analyzeAlpha, assertImageBuffer, type ImageBuffer } from './image-buffer';

export interface DtfPreflightOptions {
  dpiX?: number;
  dpiY?: number;
  printAreaMm?: { width: number; height: number };
  maximumPrintAreaMm?: { width: number; height: number };
}

export interface PreflightIssue {
  code: string;
  message: string;
}

export interface DtfPreflightResult {
  status: 'passed' | 'warnings' | 'failed';
  errors: readonly PreflightIssue[];
  warnings: readonly PreflightIssue[];
  metrics: {
    width: number;
    height: number;
    dpiX?: number;
    dpiY?: number;
    transparentPixels: number;
    semitransparentPixels: number;
    opaquePixels: number;
    uniqueVisibleColors: number;
  };
}

const MIN_PRINT_DPI = 300;

export function runDtfPreflight(image: ImageBuffer, options: DtfPreflightOptions = {}): DtfPreflightResult {
  assertImageBuffer(image);
  const errors: PreflightIssue[] = [];
  const warnings: PreflightIssue[] = [];
  const alpha = analyzeAlpha(image);
  const visibleColors = new Set<string>();
  for (let index = 0; index < image.data.length; index += 4) {
    if (image.data[index + 3] > 0) {
      visibleColors.add(`${image.data[index]},${image.data[index + 1]},${image.data[index + 2]}`);
    }
  }

  const validateDpi = (dpi: number | undefined, axis: string) => {
    if (dpi === undefined) {
      warnings.push({ code: 'DPI_UNAVAILABLE', message: `Resolution for ${axis} is unavailable.` });
    } else if (!Number.isFinite(dpi) || dpi <= 0) {
      errors.push({ code: 'INVALID_DPI', message: `Resolution for ${axis} must be a positive number.` });
    } else if (dpi < MIN_PRINT_DPI) {
      errors.push({ code: 'LOW_DPI', message: `${axis} resolution is below the documented 300 DPI production minimum.` });
    }
  };
  validateDpi(options.dpiX, 'X');
  validateDpi(options.dpiY, 'Y');

  if (options.printAreaMm) {
    const area = options.printAreaMm;
    if (![area.width, area.height].every((value) => Number.isFinite(value) && value > 0)) {
      errors.push({ code: 'INVALID_PRINT_AREA', message: 'Print area dimensions must be positive finite millimeter values.' });
    } else if (options.maximumPrintAreaMm) {
      const maximum = options.maximumPrintAreaMm;
      if (![maximum.width, maximum.height].every((value) => Number.isFinite(value) && value > 0)) {
        errors.push({ code: 'INVALID_PRINT_LIMIT', message: 'Configured maximum print dimensions must be positive finite millimeter values.' });
      } else if (area.width > maximum.width || area.height > maximum.height) {
        errors.push({ code: 'PRINT_AREA_EXCEEDED', message: 'Requested print area exceeds the configured product limits.' });
      }
    }
  }
  if (alpha.semitransparentPixels > 0) {
    warnings.push({
      code: 'SEMITRANSPARENCY_PRESENT',
      message: `${alpha.semitransparentPixels} pixels contain partial transparency and may require review.`,
    });
  }
  if (alpha.transparentPixels === image.width * image.height) {
    errors.push({ code: 'EMPTY_ARTWORK', message: 'The image contains no visible pixels.' });
  }

  return {
    status: errors.length > 0 ? 'failed' : warnings.length > 0 ? 'warnings' : 'passed',
    errors,
    warnings,
    metrics: {
      width: image.width,
      height: image.height,
      ...(options.dpiX === undefined ? {} : { dpiX: options.dpiX }),
      ...(options.dpiY === undefined ? {} : { dpiY: options.dpiY }),
      transparentPixels: alpha.transparentPixels,
      semitransparentPixels: alpha.semitransparentPixels,
      opaquePixels: alpha.opaquePixels,
      uniqueVisibleColors: visibleColors.size,
    },
  };
}
