/**
 * PrintShop Python Processing Service Client
 * Connects frontend to local FastAPI microservice (http://127.0.0.1:8765)
 * for heavy/specialized image operations:
 * - VTracer (true vector SVG tracing)
 * - Precision Lanczos and other deterministic resampling methods
 * - U2Net (neural background removal with authentic alpha channel)
 * - OpenCV Inpainting (Magic Eraser / contextual inpainting)
 * - Photo Adjustments (contrast, temperature, saturation, hue, sharpness)
 * - Physical Halftone Screening
 */

import type { ProcessedArtworkImage } from './image-processor-contract';
import type { VectorPath } from '../../../../../engine/src/paths';

const SERVICE_URL = 'http://127.0.0.1:8765';

let serviceAvailableCache: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 5000;

export async function isProcessingServiceAvailable(): Promise<boolean> {
  const now = Date.now();
  if (serviceAvailableCache !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return serviceAvailableCache;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${SERVICE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    serviceAvailableCache = res.ok;
    lastCheckTime = now;
    return res.ok;
  } catch {
    serviceAvailableCache = false;
    lastCheckTime = now;
    return false;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert Blob to base64.'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Blob read error'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function parseVectorPaths(svg: string): VectorPath[] {
  const results: VectorPath[] = [];
  const pathPattern = /<path\b[^>]*\bd="([^"]+)"[^>]*>/gi;
  let pathMatch: RegExpExecArray | null;
  let pathIndex = 0;
  while ((pathMatch = pathPattern.exec(svg)) !== null) {
    const tag = pathMatch[0];
    const fill = tag.match(/\bfill="([^"]+)"/i)?.[1] ?? '#000000';
    const commands = [...pathMatch[1].matchAll(/([MLCZ])([^MLCZ]*)/gi)];
    const anchors: Array<VectorPath['anchors'][number]> = [];
    const segments: Array<VectorPath['segments'][number]> = [];
    let current: { x: number; y: number } | null = null;
    let closed = false;
    for (const command of commands) {
      const type = command[1].toUpperCase();
      const values = [...command[2].matchAll(/-?(?:\d+\.?\d*|\.\d+)/g)].map((match) => Number(match[0]));
      if (type === 'M' || type === 'L') {
        for (let index = 0; index + 1 < values.length; index += 2) {
          const point = { x: values[index], y: values[index + 1] };
          const id = `service-vector-${pathIndex}-a-${anchors.length}`;
          if (current && anchors.length > 0) {
            segments.push({
              id: `service-vector-${pathIndex}-s-${segments.length}`,
              type: 'LINE',
              startAnchorId: anchors[anchors.length - 1].id,
              endAnchorId: id,
            });
          }
          anchors.push({ id, ...point, type: 'CORNER' });
          current = point;
        }
      } else if (type === 'C' && current && values.length >= 6 && anchors.length > 0) {
        for (let index = 0; index + 5 < values.length; index += 6) {
          const previous = anchors[anchors.length - 1];
          const end = { x: values[index + 4], y: values[index + 5] };
          const id = `service-vector-${pathIndex}-a-${anchors.length}`;
          anchors[anchors.length - 1] = {
            ...previous,
            type: 'SMOOTH',
            handleOut: { x: values[index], y: values[index + 1] },
          };
          anchors.push({
            id,
            ...end,
            type: 'SMOOTH',
            handleIn: { x: values[index + 2], y: values[index + 3] },
          });
          segments.push({
            id: `service-vector-${pathIndex}-s-${segments.length}`,
            type: 'CUBIC_BEZIER',
            startAnchorId: previous.id,
            endAnchorId: id,
          });
          current = end;
        }
      } else if (type === 'Z' && anchors.length >= 3) {
        closed = true;
      }
    }
    if (closed && anchors.length >= 3) {
      segments.push({
        id: `service-vector-${pathIndex}-s-${segments.length}`,
        type: 'LINE',
        startAnchorId: anchors[anchors.length - 1].id,
        endAnchorId: anchors[0].id,
      });
    }
    if (anchors.length >= 3 && segments.length === (closed ? anchors.length : anchors.length - 1)) {
      results.push({
        id: `service-vector-${pathIndex}`,
        closed,
        anchors,
        segments,
        fill,
      });
      pathIndex += 1;
    }
  }
  return results;
}

export async function vectorizeWithService(
  source: Blob,
  options?: {
    threshold?: number;
    simplification?: number;
    colors?: number;
    mode?: string;
    colormode?: 'color' | 'binary';
  },
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const b64 = await blobToBase64(source);
  const colors = options?.colors ?? 16;

  const res = await fetch(`${SERVICE_URL}/api/process/vectorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: b64,
      colormode: options?.colormode ?? (colors > 2 ? 'color' : 'binary'),
      mode: options?.mode ?? 'spline',
      color_precision: Math.min(8, Math.max(3, Math.round(colors / 3))),
      filter_speckle: options?.simplification ? Math.max(1, Math.round(options.simplification)) : 4,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en vectorización con VTracer');
  }

  const data = await res.json();
  const svgBlob = new Blob([data.svg], { type: 'image/svg+xml' });

  return {
    blob: svgBlob,
    width: data.width,
    height: data.height,
    svgString: data.svg,
    vectorPaths: parseVectorPaths(data.svg),
  };
}

export async function enhanceWithService(
  source: Blob,
  factor: number,
  mode: 'precision' | 'ai' = 'precision',
  method: string = 'lanczos',
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const b64 = await blobToBase64(source);

  const res = await fetch(`${SERVICE_URL}/api/process/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: b64,
      mode,
      factor,
      method,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en escalado / mejora');
  }

  const data = await res.json();
  const blob = dataUrlToBlob(data.image);

  return {
    blob,
    width: data.width,
    height: data.height,
  };
}

export async function removeBackgroundWithService(
  source: Blob,
  model: string = 'u2netp',
  feather: number = 1,
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const b64 = await blobToBase64(source);

  const res = await fetch(`${SERVICE_URL}/api/process/remove-bg`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: b64,
      model,
      feather,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en eliminación de fondo con U2Net');
  }

  const data = await res.json();
  const blob = dataUrlToBlob(data.image);

  return {
    blob,
    width: data.width,
    height: data.height,
  };
}

export async function inpaintWithService(
  source: Blob,
  mask: Blob,
  radius: number = 5,
  method: 'telea' | 'ns' = 'telea',
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const imageB64 = await blobToBase64(source);
  const maskB64 = await blobToBase64(mask);

  const res = await fetch(`${SERVICE_URL}/api/process/inpaint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageB64,
      mask: maskB64,
      radius,
      method,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en borrado contextual / inpainting');
  }

  const data = await res.json();
  const blob = dataUrlToBlob(data.image);

  return {
    blob,
    width: data.width,
    height: data.height,
  };
}

export async function adjustWithService(
  source: Blob,
  adjustments: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
    hue?: number;
    sharpen?: number;
  },
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const imageB64 = await blobToBase64(source);

  const res = await fetch(`${SERVICE_URL}/api/process/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageB64,
      brightness: adjustments.brightness ?? 0,
      contrast: adjustments.contrast ?? 0,
      saturation: adjustments.saturation ?? 0,
      temperature: adjustments.temperature ?? 0,
      hue: adjustments.hue ?? 0,
      sharpen: adjustments.sharpen ?? 0,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en ajustes de imagen');
  }

  const data = await res.json();
  const blob = dataUrlToBlob(data.image);

  return {
    blob,
    width: data.width,
    height: data.height,
  };
}

export async function halftoneWithService(
  source: Blob,
  options: {
    cellSize?: number;
    angle?: number;
    shape?: string;
    colorMode?: string;
    dpi?: number;
        intensity?: number;
        contrast?: number;
        invert?: boolean;
  },
  signal?: AbortSignal,
): Promise<ProcessedArtworkImage> {
  const imageB64 = await blobToBase64(source);

  const res = await fetch(`${SERVICE_URL}/api/process/halftone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageB64,
      cell_size: options.cellSize ?? 8,
      angle: options.angle ?? 45,
      shape: options.shape ?? 'circle',
      color_mode: options.colorMode ?? 'cmyk',
      dpi: options.dpi ?? 300,
      intensity: options.intensity ?? 100,
      contrast: options.contrast ?? 100,
      invert: options.invert ?? false,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error en semitonos');
  }

  const data = await res.json();
  const blob = dataUrlToBlob(data.image);

  return {
    blob,
    width: data.width,
    height: data.height,
  };
}

export interface PdfExportElement {
  type: 'image' | 'svg';
  x_cm: number;
  y_cm: number;
  width_cm: number;
  height_cm: number;
  /** base64 data-URI for raster layers */
  image?: string;
  /** Raw SVG string for vector layers */
  svg_string?: string;
}

export async function exportPdfWithService(params: {
  widthCm: number;
  heightCm: number;
  dpi: number;
  backgroundColor: string | null;
  elements: PdfExportElement[];
  signal?: AbortSignal;
}): Promise<Blob> {
  const res = await fetch(`${SERVICE_URL}/api/process/export-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      width_cm: params.widthCm,
      height_cm: params.heightCm,
      dpi: params.dpi,
      background_color: params.backgroundColor ?? '#ffffff',
      elements: params.elements,
    }),
    signal: params.signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Error al generar el PDF');
  }

  const data = await res.json();
  return dataUrlToBlob(data.pdf);
}
