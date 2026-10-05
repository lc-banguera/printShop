import path from 'path';

export interface ProfileConfig {
  inputDir: string;
  outputDir: string;
  supportedFormats: string[];
  crop: {
    margin: number;
    backgroundDetection: {
      mode: 'color-tolerance';
      color: { r: number; g: number; b: number; alpha?: number };
      tolerance: number; // 0 to 255
    };
  };
  normalize?: {
    enabled: boolean;
    /** Target product occupancy ratio (0–1). Product fills this fraction of targetCanvas. Default: 0.85 */
    targetOccupancy: number;
    /** Outer transparent margin (px) on all sides of the canvas. Independent of crop margin. */
    margin: number;
    /**
     * Fixed output canvas dimensions.
     * All processed images will share this exact size regardless of product aspect ratio.
     * Required for visually consistent product grids.
     */
    targetCanvas: {
      width: number;
      height: number;
    };
    /**
     * Visual mass compensation.
     *
     * Products with sparse silhouettes (thin sleeves, open armpits, etc.)
     * have fewer opaque pixels than their bounding box implies.
     * Without compensation they appear smaller than denser garments even
     * when both satisfy the same geometric targetOccupancy.
     *
     * The scale factor is adjusted by:
     *   comp = clamp( sqrt(referenceDensity / productDensity),
     *                 minBoost, maxBoost )
     *   finalScale = baseScale × comp
     *
     * where productDensity = opaquePixels / (contentW × contentH).
     */
    visualCompensation?: {
      enabled: boolean;

      /**
       * [CONFIGURABLE — NOT YET MEASURED]
       *
       * The opaque-pixel density of the "neutral" reference garment.
       * Products sparser than this receive a scale boost; products denser
       * receive no reduction (bounded by minBoost ≥ 1.0).
       *
       * How to measure: run `npm run audit`, open summary.md,
       * read the "Opaque Pixel % in BBox" column in the Visual Mass table,
       * then set this field to the MEDIAN of those values (expressed as 0–1).
       *
       * Current value: 0.60
       * Status: initial configuration value chosen by design.
       *   — It is NOT derived from measured pixel counts in the current dataset.
       *   — It reflects a reasonable prior for mid-range athletic garments
       *     (approx. 60% of the bounding box is opaque fabric).
       *   — It must be replaced with the measured median after the next audit run.
       */
      referenceDensity: number;

      /**
       * [DERIVED from audit — measured result]
       *
       * Minimum compensation ratio relative to the geometric base scale.
       * A value below 1.0 would reduce the scale of already-valid products.
       *
       * Derivation (from report.json):
       *   All 10 audited images pass geometric validation at targetOccupancy = 0.85.
       *   No image should be scaled below its geometric baseline.
       *   Therefore minBoost = 1.0 is the correct lower bound.
       *
       * Update criteria: if a future dataset contains images that are
       * already too large at their geometric scale, set minBoost < 1.0.
       */
      minBoost: number;

      /**
       * [CONFIGURABLE — DESIGN CHOICE with audit evidence as lower bound]
       *
       * Maximum compensation ratio relative to the geometric base scale.
       * Prevents very sparse products from overflowing the canvas margin.
       *
       * Audit evidence (report.json, image 18):
       *   contentBox = 379×440 px
       *   baseScale  = 0.453  (measured scale factor)
       *   availW = availH = 267 − 2×20 = 227 px
       *   physicalCanvasLimit = min(227/379, 227/440) = 0.516
       *   maxNeededBoost (worst case in dataset) = 0.516 / 0.453 = 1.139  [MEASURED]
       *
       * Design choice: maxBoost = 1.20
       *   — The measured worst-case maximum is 1.139.
       *   — 1.20 adds ~5% headroom for future dataset additions.
       *   — This is an engineering margin, not a measured value.
       *   — Lower it to 1.14 to be strictly data-driven,
       *     or raise it if future images are sparser than image (18).
       */
      maxBoost: number;
    };
  };
}

export interface AppConfig {
  profiles: Record<string, ProfileConfig>;
  activeProfile: string;
}

const workspaceRoot = path.resolve(__dirname, '../../../');

export const config: AppConfig = {
  activeProfile: 'landing',
  profiles: {
    landing: {
      inputDir: path.join(workspaceRoot, 'frontend/src/resources/landing_principal/designs'),
      outputDir: path.join(workspaceRoot, 'frontend/src/resources/landing_principal/designs-cropped'),
      supportedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
      crop: {
        margin: 30,
        backgroundDetection: {
          mode: 'color-tolerance',
          // VirtualThreads images use a transparent background (alpha = 0)
          color: { r: 0, g: 0, b: 0, alpha: 0 },
          tolerance: 10
        }
      },
      normalize: {
        enabled: false,
        targetOccupancy: 0.85,
        margin: 20,
        targetCanvas: {
          // 267×267 square canvas — matches the consistent height measured across all
          // audited images and gives every product a uniform, CSS-predictable baseline.
          // Adjust width/height here to change the output format for all images at once.
          width: 267,
          height: 267,
        },
        visualCompensation: {
          enabled: true,

          // referenceDensity: 0.60
          // Status: CONFIGURABLE — INITIAL VALUE, NOT YET MEASURED.
          //
          // This value has NOT been derived from pixel counts in the current dataset.
          // The audit was run before the visual-mass pixel scanner was added,
          // so no opaquePixelPctInBBox measurements exist yet for this profile.
          //
          // The value 0.60 (60%) is an initial configuration value chosen by design:
          //   • Athletic and apparel garments typically fill 50–70% of their bounding box.
          //   • 60% is the midpoint of that design-prior range.
          //   • It activates meaningful compensation for the known outlier (image 18)
          //     without distorting dense garments that already look correct.
          //
          // How to replace this with a measured value:
          //   1. Run `npm run audit`.
          //   2. Open audit-out/summary.md.
          //   3. Read the "Opaque Pixel % in BBox" column.
          //   4. Compute the median and set referenceDensity to that value ÷ 100.
          referenceDensity: 0.60,

          // minBoost: 1.0
          // Status: DERIVED from audit — measured result.
          //
          // Source: report.json, all 10 images.
          // All images pass geometric validation at targetOccupancy = 0.85.
          // No image should be scaled below its geometric baseline.
          // Therefore no reduction is ever applied. minBoost = 1.0.
          minBoost: 1.0,

          // maxBoost: 1.20
          // Status: DESIGN CHOICE with audit evidence as lower bound.
          //
          // Audit evidence (report.json, image 18 — measured):
          //   contentBox    = 379×440 px
          //   baseScale     = 0.453
          //   availW = availH = 227 px  (267 − 2×20)
          //   physicalLimit = min(227/379, 227/440) = 0.516
          //   maxNeededBoost (worst case in dataset) = 0.516 / 0.453 = 1.139
          //
          // Design choice: 1.20 adds ~5% headroom above the measured worst case.
          // This is an engineering margin, not a measured value.
          //   — Set to 1.14 to be strictly data-driven for the current dataset.
          //   — Increase it if future images are sparser than image (18).
          maxBoost: 1.20,
        },
      }
    },
    thumbnail: {
      inputDir: path.join(workspaceRoot, 'frontend/src/resources/thumbnails/raw'),
      outputDir: path.join(workspaceRoot, 'frontend/src/resources/thumbnails/processed'),
      supportedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
      crop: {
        margin: 10,
        backgroundDetection: {
          mode: 'color-tolerance',
          color: { r: 255, g: 255, b: 255 },
          tolerance: 10
        }
      },
      normalize: {
        enabled: false,
        targetOccupancy: 0.85,
        margin: 10,
        targetCanvas: {
          width: 267,
          height: 267
        }
      }
    },
    designer3d: {
      inputDir: path.join(workspaceRoot, 'frontend/src/resources/designer3d/raw'),
      outputDir: path.join(workspaceRoot, 'frontend/src/resources/designer3d/processed'),
      supportedFormats: ['.png'],
      crop: {
        margin: 0,
        backgroundDetection: {
          mode: 'color-tolerance',
          color: { r: 0, g: 0, b: 0, alpha: 0 },
          tolerance: 0
        }
      }
      // No normalize for designer3d — already exact size
    }
  }
};

export const getActiveProfile = (): ProfileConfig => {
  return config.profiles[config.activeProfile];
};
