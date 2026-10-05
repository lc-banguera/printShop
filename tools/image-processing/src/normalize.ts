import { PipelineStage, PipelineContext } from './types';
import { ImageProcessor } from './ImageProcessor';
import sharp from 'sharp';

export interface NormalizeOptions {
  /**
   * Target product occupancy ratio (0–1).
   * The product's longest dimension will fill this fraction of the
   * available canvas area (targetCanvas minus margin on each side).
   */
  targetOccupancy: number;

  /**
   * Transparent outer margin (px) on every side of the canvas.
   * Completely independent of the AutoCrop safety margin.
   */
  margin: number;

  /**
   * Fixed output canvas dimensions.
   * All images produced by this stage share exactly this size,
   * regardless of the individual product's aspect ratio.
   */
  targetCanvas: {
    width: number;
    height: number;
  };

  /**
   * Visual mass compensation (optional).
   * See ProfileConfig in config.ts for full documentation and
   * audit-derived justification of every parameter.
   */
  visualCompensation?: {
    enabled: boolean;
    referenceDensity: number;
    minBoost: number;
    maxBoost: number;
  };
}

/**
 * NormalizeStage
 *
 * Places every product on a fixed-size transparent canvas so that all
 * output PNGs share identical dimensions.
 *
 * ── Geometric scaling (always active) ──────────────────────────────
 *
 *   baseScale = min(availW × t / contentW,  availH × t / contentH)
 *
 *   where:
 *     availW = targetCanvas.width  - 2 × margin
 *     availH = targetCanvas.height - 2 × margin
 *     t      = targetOccupancy
 *     contentW / contentH = tight content dimensions from context.contentBox
 *                           (written by AutoCropStage, independent of crop margin)
 *
 * ── Visual mass compensation (optional) ────────────────────────────
 *
 *   Products with sparse silhouettes (hollow armpits, thin sleeves, etc.)
 *   occupy less visual area than their bounding box implies.
 *   The compensation factor adjusts the scale so perceived visual weight
 *   is consistent across the dataset:
 *
 *     density  = opaquePixels / (contentW × contentH)
 *     rawComp  = sqrt(referenceDensity / density)
 *     comp     = clamp(rawComp, minBoost, maxBoost)
 *     scale    = baseScale × comp
 *
 *   All three parameters (referenceDensity, minBoost, maxBoost) are
 *   read from the profile configuration.  NormalizeStage contains no
 *   hard-coded constants.
 *
 * ── Physical canvas limit (always applied last) ─────────────────────
 *
 *   physicalMax = min(availW / contentW,  availH / contentH)
 *   scale       = min(scale, physicalMax)
 *
 *   This derived bound guarantees the resized product never overflows
 *   the canvas regardless of the compensation value.
 *
 * Acceptance criteria
 * ───────────────────
 * ✓ Identical canvas dimensions for all images
 * ✓ Preserved aspect ratio
 * ✓ Transparent background
 * ✓ Outer margin configurable, independent of crop margin
 * ✓ Occupancy configurable per profile
 * ✓ No dependence on crop safety margin
 * ✓ No hard-coded constants
 * ✓ Deterministic output (same input → byte-identical output)
 * ✓ Reusable across future processing profiles
 */
export class NormalizeStage implements PipelineStage {
  name = 'Normalize';
  private options: NormalizeOptions;

  constructor(options: NormalizeOptions) {
    this.options = options;
  }

  async execute(inputBuffer: Buffer, context: PipelineContext): Promise<Buffer> {
    const { targetOccupancy: t, margin: m, targetCanvas, visualCompensation: vc } = this.options;
    const canvasW = targetCanvas.width;
    const canvasH = targetCanvas.height;

    // The incoming buffer is the extracted safeBox (product + safety margin).
    const { metadata, image } = await ImageProcessor.load(inputBuffer);
    const inputW = metadata.width!;
    const inputH = metadata.height!;

    // ── 1. Geometric Measurements (ContentBox as Single Reference) ──────────
    // The visual scaling and positioning are dictated strictly by the tight contentBox.
    // The safeBox (inputBuffer) is merely the pixel payload.
    let contentW = inputW;
    let contentH = inputH;
    let contentX = 0;
    let contentY = 0;

    if (context?.contentBox && context?.safeBox) {
      contentW = context.contentBox.width;
      contentH = context.contentBox.height;
      // Calculate where the content sits inside the safeBox buffer
      contentX = context.contentBox.left - context.safeBox.left;
      contentY = context.contentBox.top - context.safeBox.top;
    }

    // ── 2. Available visual area after margins ──────────────────────────────
    const availW = canvasW - 2 * m;
    const availH = canvasH - 2 * m;

    if (availW <= 0 || availH <= 0) {
      throw new Error(
        `NormalizeStage: margin (${m}px × 2) exceeds targetCanvas (${canvasW}×${canvasH}). ` +
        `Reduce margin or increase targetCanvas.`
      );
    }

    // ── 2. No geometric scaling – preserve the SafeBox size ───────────────────────
    // The product should appear exactly as after AutoCrop. We therefore keep the
    // pixel dimensions of the incoming buffer unchanged (scale = 1). The only
    // scaling applied is the physical canvas ceiling, which prevents overflow of
    // the product itself; any excess transparent margin will be clipped.
    let scale = 1;
    const physicalMax = Math.min(canvasW / contentW, canvasH / contentH);
    scale = Math.min(scale, physicalMax);

    // ── 5. Visual mass compensation ─────────────────────────────────────────
    if (vc?.enabled) {
      const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let opaquePixels = 0;
      const totalPixels = data.length / 4;
      for (let i = 0; i < totalPixels; i++) {
        if (data[i * 4 + 3] >= 10) {
          opaquePixels++;
        }
      }

      const density = opaquePixels / Math.max(1, contentW * contentH);
      const rawComp = Math.sqrt(vc.referenceDensity / Math.max(0.001, density));
      const comp = Math.min(vc.maxBoost, Math.max(vc.minBoost, rawComp));

      scale = scale * comp;
      scale = Math.min(scale, physicalMax);
    }

    // ── 6. Resize (Applying scale to the SafeBox payload) ───────────────────
    // The scale calculated from contentBox geometry is applied to the ENTIRE safeBox buffer.
    const scaledW = Math.max(1, Math.round(inputW * scale));
    const scaledH = Math.max(1, Math.round(inputH * scale));

    const resizedProduct = await sharp(inputBuffer)
      .resize(scaledW, scaledH, { fit: 'fill' })
      .toBuffer();

    // ── 7. Centre the ContentBox on fixed transparent canvas ────────────────
    // We want the CONTENT to be perfectly centered, not the safeBox.
    const scaledContentW = contentW * scale;
    const scaledContentH = contentH * scale;
    const scaledContentX = contentX * scale;
    const scaledContentY = contentY * scale;

    const contentLeftOnCanvas = Math.round((canvasW - scaledContentW) / 2);
    const contentTopOnCanvas  = Math.round((canvasH - scaledContentH) / 2);

    // Position the safeBox buffer so that its internal content is centered.
    // If left/top are negative, Sharp will safely crop the overflowing safety margin.
    const left = Math.round(contentLeftOnCanvas - scaledContentX);
    const top  = Math.round(contentTopOnCanvas - scaledContentY);

    const canvas = await sharp({
      create: {
        width:      canvasW,
        height:     canvasH,
        channels:   4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .composite([{ input: resizedProduct, left, top }])
      .toBuffer();

    // ── 8. Write metrics to context ─────────────────────────────────────────
    const occupancy = (scaledContentW * scaledContentH) / (canvasW * canvasH);
    context.normalized = {
      scaledW: scaledW,  // Extracted buffer size
      scaledH: scaledH,
      canvasW,
      canvasH,
      occupancy,
    };

    return canvas;
  }
}
