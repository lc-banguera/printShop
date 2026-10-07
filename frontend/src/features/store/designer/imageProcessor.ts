/**
 * imageProcessor.ts
 * Canvas utilities and adapters used by PrintShop Designer.
 * Shared raster operations run through the portable design core Worker.
 *
 * Design goals:
 *  - Keep original image untouched (original → process → processedSrc)
 *  - All operations are reversible (caller holds src)
 *  - Preserve the existing data URL contract used by processedSrc
 */
import { processRasterImageUrl } from "@/core/design/processing";
import type { CropRect } from "./types";

/** Progress callback (0-1) */
export type ProgressCallback = (p: number) => void;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Load an image URL into an HTMLImageElement.
 * For blob: and data: URLs (local files, processed images) crossOrigin is NOT set
 * to avoid canvas tainting. For remote http/https URLs crossOrigin=anonymous is used.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for remote URLs — blob: and data: are always same-origin
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Create a canvas pre-painted with an image at its natural resolution.
 * IMPORTANT: The canvas always starts with identity transform (no inherited state).
 * maxSize: if provided, downscales proportionally so the longest edge ≤ maxSize.
 */
function imageToCanvas(
  img: HTMLImageElement,
  maxSize?: number
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  let { naturalWidth: w, naturalHeight: h } = img;
  // Fallback for edge cases where naturalWidth is 0 (e.g. SVG without intrinsic size)
  if (!w || !h) { w = img.width || 1; h = img.height || 1; }
  if (maxSize && (w > maxSize || h > maxSize)) {
    const scale = maxSize / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // Explicitly reset all transforms - guarantees no inherited canvas state
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return [canvas, ctx];
}

/** Encode canvas as PNG data URL. */
function toPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not encode the processed image."));
    }, { once: true });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Could not encode the processed image."));
    }, { once: true });
    reader.readAsDataURL(blob);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Real Crop Operation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Real crop operation: extracts a sub-rectangle in natural pixels
 * and returns the cropped image as a high-fidelity PNG data URL.
 */
export async function cropImage(
  src: string,
  rect: CropRect
): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  const cw = Math.max(1, Math.round(rect.width));
  const ch = Math.max(1, Math.round(rect.height));
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    cw,
    ch
  );
  return toPngDataUrl(canvas);
}

// ─────────────────────────────────────────────────────────────────────────────
// Grayscale
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert the image to true grayscale (luminance-weighted).
 * Result: same image with R=G=B=luminance, alpha preserved.
 */
export async function applyGrayscale(src: string): Promise<string> {
  const img = await loadImage(src);
  const [canvas, ctx] = imageToCanvas(img);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = lum;
  }
  ctx.putImageData(imageData, 0, 0);
  return toPngDataUrl(canvas);
}

// ─────────────────────────────────────────────────────────────────────────────
// Invert
// ─────────────────────────────────────────────────────────────────────────────

export async function applyInvert(src: string): Promise<string> {
  const img = await loadImage(src);
  const [canvas, ctx] = imageToCanvas(img);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i];
    d[i + 1] = 255 - d[i + 1];
    d[i + 2] = 255 - d[i + 2];
    // alpha unchanged
  }
  ctx.putImageData(imageData, 0, 0);
  return toPngDataUrl(canvas);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pixel-level adjustments (brightness, contrast, saturation)
// ─────────────────────────────────────────────────────────────────────────────

export interface AdjustmentValues {
  brightness: number; // 0–200, 100 = no change
  contrast: number;   // 0–200, 100 = no change
  saturation: number; // 0–200, 100 = no change
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}

/**
 * Apply brightness/contrast/saturation destructively to pixel data.
 * Uses standard photographic formulae.
 */
export async function applyAdjustments(
  src: string,
  adj: AdjustmentValues
): Promise<string> {
  const img = await loadImage(src);
  const [canvas, ctx] = imageToCanvas(img);
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;

  const bFactor = adj.brightness / 100;
  const cFactor = adj.contrast / 100;
  const sFactor = adj.saturation / 100;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    // Brightness (linear)
    r *= bFactor;
    g *= bFactor;
    b *= bFactor;

    // Contrast (around 128)
    r = (r - 128) * cFactor + 128;
    g = (g - 128) * cFactor + 128;
    b = (b - 128) * cFactor + 128;

    // Saturation (convert to HSL-like operation via gray)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + sFactor * (r - gray);
    g = gray + sFactor * (g - gray);
    b = gray + sFactor * (b - gray);

    d[i] = clamp(r);
    d[i + 1] = clamp(g);
    d[i + 2] = clamp(b);
  }

  ctx.putImageData(imageData, 0, 0);
  return toPngDataUrl(canvas);
}

// ─────────────────────────────────────────────────────────────────────────────
// Halftone
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Halftone
// ─────────────────────────────────────────────────────────────────────────────

export interface HalftoneOptions {
  /** Cell size in pixels (2–60) */
  cellSize: number;
  /** Angle of the halftone grid in degrees (0 = normal horizontal screen) */
  angle: number;
  /** Foreground color (CSS hex or "original") */
  dotColor: string;
  /** Background color (CSS hex) or "transparent" */
  bgColor: string;
  /** Intensity/Darkness response (10-200, default 100) */
  intensity: number;
  /** Contrast around midtone (20-200, default 100) */
  contrast: number;
  /** Dot shape (circle or square) */
  shape?: "circle" | "square";
  /** Optional invert */
  invert?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean,
    16
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Check if an image contains transparent pixels */
export async function hasTransparency(src: string): Promise<boolean> {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    // Sample a downscaled version for speed
    const sampleW = Math.min(120, img.naturalWidth || 120);
    const sampleH = Math.min(120, img.naturalHeight || 120);
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Mathematically correct Halftone engine:
 * - Strictly preserves image dimensions, aspect ratio, orientation and transparency.
 * - Rotates ONLY the screen grid (trama), NEVER the image itself.
 * - 0° = normal horizontal/vertical dot lattice.
 * - Preserves natural PNG alpha transparency (never bakes in white or black unless requested).
 * - Perceived linear tonal response (dot area scales with tone).
 * - Never inverts luminosity accidentally (dark areas get dark dots, light areas get light dots).
 */
export async function applyHalftone(
  src: string,
  opts: HalftoneOptions,
  onProgress?: ProgressCallback,
  maxDimension?: number
): Promise<string> {
  const img = await loadImage(src);
  // Strictly preserve natural dimensions unless an explicit maxDimension is requested (e.g. for preview)
  const [srcCanvas, srcCtx] = imageToCanvas(img, maxDimension);
  const { width, height } = srcCanvas;

  // Output canvas with identical dimensions
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const outCtx = out.getContext("2d")!;

  const isTransparent = opts.bgColor === "transparent";

  // Fill or clear background
  if (isTransparent) {
    outCtx.clearRect(0, 0, width, height);
  } else {
    outCtx.fillStyle = opts.bgColor;
    outCtx.fillRect(0, 0, width, height);
  }

  const imageData = srcCtx.getImageData(0, 0, width, height);
  const d = imageData.data;

  const cellSize = Math.max(2, Math.min(60, opts.cellSize || 8));
  const halfCell = cellSize / 2;
  const angleDeg = opts.angle ?? 0;
  const angleRad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const isColorDot = opts.dotColor === "original";
  const [fr, fg, fb] = isColorDot ? [0, 0, 0] : hexToRgb(opts.dotColor || "#111827");
  if (!isColorDot) {
    outCtx.fillStyle = `rgb(${fr},${fg},${fb})`;
  }

  // Determine dot-on-background polarity:
  // Rule: dark areas → more coverage of the "dominant" color, light areas → less
  // If dotColor is darker than bgColor → dots appear on light areas (normal halftone)
  // If dotColor is lighter than bgColor → dots appear on dark areas (inverted halftone)
  // For "transparent" bg: dots always appear where image is dark (conventional halftone)
  let isDarkOnLight = true; // default: black dots on white/light bg
  if (!isColorDot) {
    const dotLum = (0.299 * fr + 0.587 * fg + 0.114 * fb) / 255;
    if (isTransparent) {
      // On transparent: use standard convention — dark dot on light image areas
      isDarkOnLight = dotLum < 0.5; // dark dot color → appears on light zones
    } else {
      const [br, bg2, bb] = hexToRgb(opts.bgColor);
      const bgLum = (0.299 * br + 0.587 * bg2 + 0.114 * bb) / 255;
      isDarkOnLight = dotLum < bgLum; // dot is darker than bg → appears on light areas
    }
  }

  const isInverted = Boolean(opts.invert);
  const cFactor = Math.max(0.1, (opts.contrast ?? 100) / 100);
  const iFactor = Math.max(0.1, (opts.intensity ?? 100) / 100);
  const isSquare = opts.shape === "square";

  // Image center - origin for the rotated grid
  const cx = width / 2;
  const cy = height / 2;

  // Diagonal half-extent to cover the entire canvas regardless of angle
  const diag = Math.sqrt(width * width + height * height);
  const halfExtent = diag / 2 + cellSize * 2;
  const kMin = Math.floor(-halfExtent / cellSize);
  const kMax = Math.ceil(halfExtent / cellSize);
  const totalRows = kMax - kMin + 1;

  // Sample offsets within cell for smooth area luminance
  const sOff = Math.max(1, Math.round(halfCell * 0.45));
  const sampleOffsets = [
    [0, 0],
    [-sOff, 0],
    [sOff, 0],
    [0, -sOff],
    [0, sOff],
    [-sOff, -sOff],
    [sOff, -sOff],
    [-sOff, sOff],
    [sOff, sOff],
  ];

  for (let j = kMin; j <= kMax; j++) {
    const v = (j + 0.5) * cellSize;
    for (let i = kMin; i <= kMax; i++) {
      const u = (i + 0.5) * cellSize;

      // Coordinate on image and canvas (pure screen-space alignment)
      // Dot at (x, y) samples the image at (x, y) and is drawn at (x, y)
      // This strictly rotates the TRAMA without ever rotating or flipping the image!
      const x = cx + u * cosA - v * sinA;
      const y = cy + u * sinA + v * cosA;

      // Skip points outside canvas bounds
      if (
        x < -halfCell ||
        x >= width + halfCell ||
        y < -halfCell ||
        y >= height + halfCell
      ) {
        continue;
      }

      let lumSum = 0;
      let alphaSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;

      for (let s = 0; s < 9; s++) {
        const [dx, dy] = sampleOffsets[s];
        // Rotate sample offsets so sampling aligns with cell lattice
        const sx = Math.round(Math.max(0, Math.min(width - 1, x + dx * cosA - dy * sinA)));
        const sy = Math.round(Math.max(0, Math.min(height - 1, y + dx * sinA + dy * cosA)));

        const idx = (sy * width + sx) * 4;
        const sr = d[idx];
        const sg = d[idx + 1];
        const sb = d[idx + 2];
        const sa = d[idx + 3] / 255;

        const lum = (0.299 * sr + 0.587 * sg + 0.114 * sb) / 255;
        lumSum += lum;
        alphaSum += sa;
        rSum += sr;
        gSum += sg;
        bSum += sb;
      }

      const avgAlpha = alphaSum / 9;
      // Skip transparent areas to preserve clean alpha
      if (avgAlpha < 0.015) continue;

      const avgLum = lumSum / 9;

      // Contrast response centered around midtone 0.5
      let lum = (avgLum - 0.5) * cFactor + 0.5;
      lum = Math.max(0, Math.min(1, lum));

      // Determine coverage based on polarity
      let coverage = isDarkOnLight ? 1 - lum : lum;
      if (isInverted) {
        coverage = 1 - coverage;
      }

      // Apply intensity scaling and modulate by local alpha
      coverage = Math.max(0, Math.min(1, coverage * iFactor)) * avgAlpha;
      if (coverage <= 0.005) continue;

      if (isColorDot) {
        outCtx.fillStyle = `rgb(${Math.round(rSum / 9)},${Math.round(gSum / 9)},${Math.round(bSum / 9)})`;
      }

      if (isSquare) {
        // Area of square = size^2 = coverage * cellSize^2 -> size = sqrt(coverage) * cellSize
        const size = Math.sqrt(coverage) * cellSize;
        if (size >= 0.5) {
          outCtx.save();
          outCtx.translate(x, y);
          outCtx.rotate(angleRad);
          outCtx.fillRect(-size / 2, -size / 2, size, size);
          outCtx.restore();
        }
      } else {
        // Area of circle = pi * r^2. Max radius to cover cell corners is halfCell * sqrt(2)
        const maxRadius = halfCell * 1.35;
        const radius = Math.sqrt(coverage) * maxRadius;
        if (radius >= 0.4) {
          outCtx.beginPath();
          outCtx.arc(x, y, radius, 0, Math.PI * 2);
          outCtx.fill();
        }
      }
    }

    if (onProgress && totalRows > 0) {
      onProgress(Math.min(0.99, (j - kMin + 1) / totalRows));
    }
  }

  onProgress?.(1);
  return toPngDataUrl(out);
}

// ─────────────────────────────────────────────────────────────────────────────
// Background removal — portable engine adapter
// ─────────────────────────────────────────────────────────────────────────────

export interface RemoveBgOptions {
  /**
   * Tolerance (0–255): how different a pixel must be from the
   * background sample to be considered foreground.
   */
  tolerance: number;
  /**
   * Sample edge pixels to compute the background color automatically,
   * or provide an explicit sampleColor.
   */
  sampleColor?: [number, number, number];
  /** Feather radius (in px) for edge smoothing */
  feather: number;
  /** Shift edge (-N to +N). Positive expands foreground, Negative contracts foreground */
  shift?: number;
}

/** Runs the engine's local flood-fill remover through the shared Worker. */
export async function removeBackgroundLocal(
  src: string,
  opts: RemoveBgOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<string> {
  onProgress?.(0);
  const result = await processRasterImageUrl(
    src,
    { kind: "remove-background", options: opts },
    signal,
  );
  const dataUrl = await blobToDataUrl(result.blob);
  onProgress?.(1);
  return dataUrl;
}

/** Main entry point for local background removal. */
export async function removeBackground(
  src: string,
  opts: RemoveBgOptions,
  onProgress?: ProgressCallback,
  signal?: AbortSignal,
): Promise<string> {
  return removeBackgroundLocal(src, opts, onProgress, signal);
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas Composite Export
// ─────────────────────────────────────────────────────────────────────────────

export interface ExportLayer {
  src: string;   // data URL or object URL
  x: number;    // center x in canvas doc coords
  y: number;    // center y
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number;  // 0–100
  visible: boolean;
  type: string;
  // text-specific
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  // shape-specific
  shapeType?: "rectangle" | "circle" | "triangle" | "line";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
  flipX?: boolean;
  flipY?: boolean;
  // CSS filters to bake into export
  filters?: {
    brightness: number;
    contrast: number;
    saturation: number;
    grayscale: number;
    sepia: number;
    invert: number;
    blur: number;
  };
}

export interface ExportOptions {
  docWidth: number; // canvas document width in internal px
  docHeight: number;
  /** Scale factor: 1 = 480px base, 2 = 960px, etc. */
  scale: number;
  format: "png" | "jpeg";
  quality: number; // 0–1 for jpeg
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotation?: number;
}

/**
 * Composite-export: flatten all visible layers to a single canvas and
 * return a data URL. Respects order (layers[0] rendered last = on top).
 */
export async function exportComposite(
  layers: ExportLayer[],
  opts: ExportOptions
): Promise<string> {
  const BASE = 480;
  const aspectW = opts.docWidth || BASE;
  const aspectH = opts.docHeight || BASE;
  const outW = Math.round(BASE * opts.scale);
  const outH = Math.round((BASE * (aspectH / aspectW)) * opts.scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;

  ctx.save();
  // Document-level transformations (rotation + flips)
  if (opts.rotation || opts.flipHorizontal || opts.flipVertical) {
    ctx.translate(outW / 2, outH / 2);
    if (opts.rotation) ctx.rotate((opts.rotation * Math.PI) / 180);
    if (opts.flipHorizontal || opts.flipVertical) {
      ctx.scale(opts.flipHorizontal ? -1 : 1, opts.flipVertical ? -1 : 1);
    }
    ctx.translate(-outW / 2, -outH / 2);
  }

  // Draw from bottom to top (reverse order since layers[0] is topmost)
  const orderedLayers = [...layers].reverse();

  for (const layer of orderedLayers) {
    if (!layer.visible) continue;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity / 100));

    // Translate to layer center
    const cx = outW / 2 + (layer.x / BASE) * outW;
    const cy = outH / 2 + (layer.y / BASE) * outW;
    ctx.translate(cx, cy);

    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
    if (layer.flipX || layer.flipY) {
      ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
    }

    const lw = (layer.width / BASE) * outW;
    const lh = (layer.height / BASE) * outW;

    if (layer.type === "image" && layer.src) {
      try {
        const img = await loadImage(layer.src);
        if ("filter" in ctx && layer.filters) {
          const f = layer.filters;
          ctx.filter = [
            `brightness(${f.brightness}%)`,
            `contrast(${f.contrast}%)`,
            `saturate(${f.saturation}%)`,
            `grayscale(${f.grayscale}%)`,
            `sepia(${f.sepia}%)`,
            `invert(${f.invert}%)`,
            f.blur > 0 ? `blur(${f.blur}px)` : "",
          ]
            .filter(Boolean)
            .join(" ");
        }

        // Strictly preserve aspect ratio (object-contain) to prevent deformation
        const imgAspect = (img.naturalWidth || lw) / (img.naturalHeight || lh);
        const boxAspect = lw / lh;
        let drawW = lw;
        let drawH = lh;
        if (imgAspect > boxAspect) {
          drawH = lw / imgAspect;
        } else {
          drawW = lh * imgAspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        if ("filter" in ctx) ctx.filter = "none";
      } catch {
        // Image load failed – skip
      }
    } else if (layer.type === "text") {
      const fontSize = (layer.fontSize ?? 48) * (outW / BASE);
      ctx.font = `${layer.fontStyle ?? "normal"} ${layer.fontWeight ?? "normal"} ${fontSize}px ${layer.fontFamily ?? "Arial"}`;
      ctx.fillStyle = layer.color ?? "#111827";
      ctx.textAlign = (layer.textAlign as CanvasTextAlign) ?? "center";
      ctx.textBaseline = "middle";

      const lines = (layer.content ?? "").split("\n");
      const lineHeight = fontSize * 1.25;
      const startY = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, idx) => {
        ctx.fillText(line, 0, startY + idx * lineHeight);
      });
    } else if (layer.type === "shape") {
      ctx.fillStyle = layer.fill ?? "#2563EB";
      if (layer.stroke && layer.strokeWidth) {
        ctx.strokeStyle = layer.stroke;
        ctx.lineWidth = (layer.strokeWidth / BASE) * outW;
      }

      if (layer.shapeType === "circle") {
        ctx.beginPath();
        ctx.ellipse(0, 0, lw / 2, lh / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (layer.stroke && layer.strokeWidth) ctx.stroke();
      } else if (layer.shapeType === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -lh / 2);
        ctx.lineTo(lw / 2, lh / 2);
        ctx.lineTo(-lw / 2, lh / 2);
        ctx.closePath();
        ctx.fill();
        if (layer.stroke && layer.strokeWidth) ctx.stroke();
      } else if (layer.shapeType === "line") {
        ctx.beginPath();
        ctx.moveTo(-lw / 2, 0);
        ctx.lineTo(lw / 2, 0);
        ctx.strokeStyle = layer.stroke ?? layer.fill ?? "#2563EB";
        ctx.lineWidth = ((layer.strokeWidth ?? 4) / BASE) * outW;
        ctx.lineCap = "round";
        ctx.stroke();
      } else {
        // Rectangle
        ctx.beginPath();
        const r = Math.min((layer.borderRadius ?? 0) * (outW / BASE), lw / 2, lh / 2);
        if (r > 0 && "roundRect" in ctx) {
          (ctx as any).roundRect(-lw / 2, -lh / 2, lw, lh, r);
        } else {
          ctx.rect(-lw / 2, -lh / 2, lw, lh);
        }
        ctx.fill();
        if (layer.stroke && layer.strokeWidth) ctx.stroke();
      }
    } else if (layer.type === "background") {
      ctx.translate(-cx, -cy);
      ctx.fillStyle = layer.fill ?? "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
    }

    ctx.restore();
  }

  ctx.restore(); // document-level transformations restore

  const mime = opts.format === "jpeg" ? "image/jpeg" : "image/png";
  return canvas.toDataURL(mime, opts.quality);
}
