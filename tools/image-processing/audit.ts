import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { getActiveProfile } from './src/config';
import { ImageProcessor } from './src/ImageProcessor';
import { AutoCropStage } from './src/crop';
import { NormalizeStage } from './src/normalize';

const TARGET_IMAGES = [
  'Virtualthreads (1).png',
  'Virtualthreads (2).png',
  'Virtualthreads (6).png',
  'Virtualthreads (10).png',
  'Virtualthreads (18).png',
  'Virtualthreads (30).png',
  'Virtualthreads (45).png',
  'Virtualthreads (54).png'
];

async function generateDebugImage(
  inputBuffer: Buffer,
  filename: string,
  box: { left: number; top: number; width: number; height: number },
  finalBox: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
  outDir: string
) {
  const svgOverlay = `
    <svg width="${width}" height="${height}">
      <rect x="${box.left}" y="${box.top}" width="${box.width}" height="${box.height}" fill="none" stroke="red" stroke-width="4" />
      <rect x="${finalBox.left}" y="${finalBox.top}" width="${finalBox.width}" height="${finalBox.height}" fill="none" stroke="blue" stroke-width="2" stroke-dasharray="4" />
    </svg>
  `;
  const debugBuf = await sharp(inputBuffer)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .png()
    .toBuffer();
  await fs.writeFile(path.join(outDir, `debug_${filename}`), debugBuf);
}

async function generateComparisonSheet(
  original: Buffer,
  cropped: Buffer,
  normalized: Buffer,
  filename: string,
  outDir: string
) {
  const origMeta = await sharp(original).metadata();
  const cropMeta = await sharp(cropped).metadata();
  const normMeta = await sharp(normalized).metadata();

  const width = (origMeta.width || 0) + (cropMeta.width || 0) + (normMeta.width || 0) + 20;
  const height = Math.max(origMeta.height || 0, cropMeta.height || 0, normMeta.height || 0);

  const sheet = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 }
    }
  })
  .composite([
    { input: original, left: 0, top: 0 },
    { input: cropped, left: (origMeta.width || 0) + 10, top: 0 },
    { input: normalized, left: (origMeta.width || 0) + (cropMeta.width || 0) + 20, top: 0 }
  ])
  .png()
  .toBuffer();

  await fs.writeFile(path.join(outDir, `comparison_${filename}`), sheet);
}

async function generateVisualMassOverlay(
  inputBuffer: Buffer,
  filename: string,
  contentBox: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
  useAlphaMode: boolean,
  bgRGB: { r: number; g: number; b: number } | null,
  tol: number,
  outDir: string
) {
  const { image } = await ImageProcessor.load(inputBuffer);
  const { data } = await image.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rawChannels = 4;
  const overlayData = Buffer.alloc(width * height * rawChannels);

  const bgR = bgRGB?.r ?? 0;
  const bgG = bgRGB?.g ?? 0;
  const bgB = bgRGB?.b ?? 0;

  const isBackground = (r: number, g: number, b: number, a: number): boolean => {
    if (useAlphaMode) {
      return a <= tol;
    }
    if (a < 10) return true;
    return (
      Math.abs(r - bgR) <= tol &&
      Math.abs(g - bgG) <= tol &&
      Math.abs(b - bgB) <= tol
    );
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * rawChannels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const inBox = (x >= contentBox.left && x < contentBox.left + contentBox.width &&
                     y >= contentBox.top && y < contentBox.top + contentBox.height);

      if (isBackground(r, g, b, a)) {
        overlayData[idx]     = 128;
        overlayData[idx + 1] = 128;
        overlayData[idx + 2] = 128;
        overlayData[idx + 3] = 40;
      } else {
        if (inBox) {
          overlayData[idx]     = Math.min(255, Math.round(r * 0.5));
          overlayData[idx + 1] = Math.min(255, Math.round(g * 0.5 + 127));
          overlayData[idx + 2] = Math.min(255, Math.round(b * 0.5));
          overlayData[idx + 3] = 255;
        } else {
          overlayData[idx]     = 255;
          overlayData[idx + 1] = 255;
          overlayData[idx + 2] = 0;
          overlayData[idx + 3] = 255;
        }
      }
    }
  }

  const svgOverlay = `
    <svg width="${width}" height="${height}">
      <rect x="${contentBox.left}" y="${contentBox.top}" width="${contentBox.width}" height="${contentBox.height}" fill="none" stroke="red" stroke-width="4" />
    </svg>
  `;

  const visualMassBuf = await sharp(overlayData, { raw: { width, height, channels: 4 } })
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .png()
    .toBuffer();

  await fs.writeFile(path.join(outDir, `visual_mass_${filename}`), visualMassBuf);
}

async function runAudit() {
  const startTime = Date.now();
  const profile = getActiveProfile();
  
  const entries = await fs.readdir(profile.inputDir);
  const images = entries.filter(e => profile.supportedFormats.some(ext => e.toLowerCase().endsWith(ext)));

  const toTest = new Set(TARGET_IMAGES);
  for (const img of images) {
    if (toTest.size >= 10) break;
    toTest.add(img);
  }

  const outDir = path.join(__dirname, 'audit-out');
  await fs.mkdir(outDir, { recursive: true });
  const imagesDir = path.join(outDir, 'images');
  await fs.mkdir(imagesDir, { recursive: true });

  const { backgroundDetection, margin: cropMargin } = profile.crop;
  const cfgColor = backgroundDetection.color;
  const tol = backgroundDetection.tolerance;
  const normalizeOpts = profile.normalize!;

  const results: any[] = [];

  for (const filename of toTest) {
    const filePath = path.join(profile.inputDir, filename);
    let inputBuffer: Buffer;
    try {
      inputBuffer = await fs.readFile(filePath);
    } catch (e: any) {
      results.push({
        filename,
        status: 'error',
        stage: 'Load',
        error: `Could not read file: ${e.message || String(e)}`
      });
      continue;
    }

    let stage = 'Load';
    try {
      // 1. Load stage
      stage = 'Load';
      const { image, metadata } = await ImageProcessor.load(inputBuffer);
      const { width, height, channels, format } = metadata;
      
      // 2. Classification stage
      stage = 'Classification';
      const { data } = await image.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const rawChannels = 4;
      const cornerAlphas = [
        data[3],
        data[(width - 1) * rawChannels + 3],
        data[(height - 1) * width * rawChannels + 3],
        data[((height - 1) * width + width - 1) * rawChannels + 3]
      ];
      const avgCornerAlpha = cornerAlphas.reduce((a, b) => a + b, 0) / 4;
      const useAlphaMode = cfgColor.alpha !== undefined && cfgColor.alpha === 0 && avgCornerAlpha <= tol;

      let bgRGB: { r: number, g: number, b: number } | null = null;
      let classification = "Unknown";
      if (useAlphaMode) {
        classification = "Transparent background";
      } else {
        const corners = [
          { r: data[0], g: data[1], b: data[2] },
          { r: data[(width - 1) * rawChannels], g: data[(width - 1) * rawChannels + 1], b: data[(width - 1) * rawChannels + 2] },
          { r: data[(height - 1) * width * rawChannels], g: data[(height - 1) * width * rawChannels + 1], b: data[(height - 1) * width * rawChannels + 2] },
          { r: data[((height - 1) * width + width - 1) * rawChannels], g: data[((height - 1) * width + width - 1) * rawChannels + 1], b: data[((height - 1) * width + width - 1) * rawChannels + 2] }
        ];
        bgRGB = {
          r: Math.round(corners.reduce((a, c) => a + c.r, 0) / 4),
          g: Math.round(corners.reduce((a, c) => a + c.g, 0) / 4),
          b: Math.round(corners.reduce((a, c) => a + c.b, 0) / 4)
        };
        const maxDiff = Math.max(
          ...corners.map(c => Math.max(Math.abs(c.r - bgRGB!.r), Math.abs(c.g - bgRGB!.g), Math.abs(c.b - bgRGB!.b)))
        );
        classification = maxDiff <= 10 ? "Solid color background" : "Mixed background";
      }

      // Calculate opaque pixels using classification rules
      const bgR = bgRGB?.r ?? 0;
      const bgG = bgRGB?.g ?? 0;
      const bgB = bgRGB?.b ?? 0;
      const isBackgroundPixel = (r: number, g: number, b: number, a: number): boolean => {
        if (useAlphaMode) {
          return a <= tol;
        }
        if (a < 10) return true;
        return (
          Math.abs(r - bgR) <= tol &&
          Math.abs(g - bgG) <= tol &&
          Math.abs(b - bgB) <= tol
        );
      };

      let opaquePixels = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * rawChannels;
          if (!isBackgroundPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) {
            opaquePixels++;
          }
        }
      }

      // 3. AutoCrop stage
      stage = 'AutoCrop';
      const contentBox = await ImageProcessor.detectContentBoundingBox(inputBuffer, profile.crop);
      const safeBox = ImageProcessor.addMarginToBoundingBox(contentBox, cropMargin, width, height);
      
      await generateDebugImage(inputBuffer, filename, contentBox, safeBox, width, height, imagesDir);
      await generateVisualMassOverlay(inputBuffer, filename, contentBox, width, height, useAlphaMode, bgRGB, tol, imagesDir);

      const cropStage = new AutoCropStage(profile.crop);
      const context1: any = {};
      const croppedBuffer1 = await cropStage.execute(inputBuffer, context1);

      // 4. Normalize stage
      stage = 'Normalize';
      const normStage = new NormalizeStage({
        targetOccupancy:    normalizeOpts.targetOccupancy,
        margin:             normalizeOpts.margin,
        targetCanvas:       normalizeOpts.targetCanvas,
        visualCompensation: normalizeOpts.visualCompensation,
      });
      const finalBuffer1 = await normStage.execute(croppedBuffer1, context1);

      // 5. Determinism stage
      stage = 'Determinism';
      const context2: any = {};
      const croppedBuffer2 = await cropStage.execute(inputBuffer, context2);
      const finalBuffer2 = await normStage.execute(croppedBuffer2, context2);

      const isDeterministic = finalBuffer1.equals(finalBuffer2);
      let determinismDetails = "Identical";
      if (!isDeterministic) {
         const m1 = await sharp(finalBuffer1).metadata();
         const m2 = await sharp(finalBuffer2).metadata();
         determinismDetails = `Mismatch: pass1(${m1.width}x${m1.height}) vs pass2(${m2.width}x${m2.height})`;
      }

      const finalBuffer = finalBuffer1;
      
      await fs.writeFile(path.join(imagesDir, `original_${filename}`), inputBuffer);
      await fs.writeFile(path.join(imagesDir, `cropped_${filename}`), croppedBuffer1);
      await fs.writeFile(path.join(imagesDir, `normalized_${filename}`), finalBuffer);
      
      await generateComparisonSheet(inputBuffer, croppedBuffer1, finalBuffer, filename, imagesDir);

      const finalImage = sharp(finalBuffer);
      const finalMeta = await finalImage.metadata();
      const { data: finalData } = await finalImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      
      const normData = context1.normalized!;
      const contBox = context1.contentBox!;
      const scaleFactor = normData.scaledW / contBox.width;

      const bboxArea = contBox.width * contBox.height;
      const canvasArea = normData.canvasW * normData.canvasH;
      const opaquePixelPctInBBox = (opaquePixels / bboxArea) * 100;
      const bboxOccupancy = (normData.scaledW * normData.scaledH) / canvasArea * 100;
      const visualOccupancy = (opaquePixels * scaleFactor * scaleFactor) / canvasArea * 100;
      const occupancyDiff = bboxOccupancy - visualOccupancy;

      results.push({
        filename,
        status: 'success',
        classification,
        determinism: { isDeterministic, details: determinismDetails },
        stage2: { width, height, channels, format, hasAlpha: metadata.hasAlpha },
        stage3: { avgCornerAlpha, useAlphaMode, bgRGB },
        stage4: { originalSize: { width, height }, contentBox, safeBox, margin: cropMargin },
        stage5: { 
          productW: contBox.width, 
          productH: contBox.height, 
          maxDim: Math.max(contBox.width, contBox.height), 
          targetOccupancy: normalizeOpts.targetOccupancy, 
          margin: normalizeOpts.margin, 
          scaleFactor, 
          canvasSize: { w: normData.canvasW, h: normData.canvasH }, 
          finalOutputSize: { w: normData.scaledW, h: normData.scaledH } 
        },
        stage6: { finalDimensions: { w: finalMeta.width, h: finalMeta.height }, finalChannels: finalMeta.channels, finalHasAlpha: finalMeta.hasAlpha, topLeftPixelAlpha: finalData[3] },
        visualMassMetrics: {
          bboxArea,
          opaquePixels,
          opaquePixelPctInBBox,
          bboxOccupancy,
          visualOccupancy,
          occupancyDiff
        }
      });
    } catch (e: any) {
      results.push({
        filename,
        status: 'error',
        stage,
        error: e.message || String(e)
      });
    }
  }

  await fs.writeFile(path.join(outDir, 'report.json'), JSON.stringify(results, null, 2));
  
  const endTime = Date.now();
  const durationMs = endTime - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);

  const imagesProcessed = results.length;
  const imagesPassed = results.filter(r => r.status === 'success').length;
  const imagesFailed = results.filter(r => r.status === 'error').length;

  const countClassification = (type: string) => results.filter(r => r.status === 'success' && r.classification === type).length;
  const transparentCount = countClassification("Transparent background");
  const solidColorCount = countClassification("Solid color background");
  const mixedCount = countClassification("Mixed background");
  const unknownCount = results.filter(r => r.status === 'error' || (r.status === 'success' && r.classification === "Unknown")).length;

  const deterministicPassed = results.every(r => r.status !== 'success' || r.determinism.isDeterministic);
  const determinismResult = deterministicPassed ? "Pass" : "Fail";

  // Build Findings
  let findingsList = "";
  if (imagesFailed > 0) {
    findingsList += `### Processing Failures\n\n`;
    for (const r of results.filter(r => r.status === 'error')) {
      findingsList += `- **File**: \`${r.filename}\` failed at stage **${r.stage}** with error: \`${r.error}\`\n`;
    }
    findingsList += `\n`;
  }
  const nonDeterministicImages = results.filter(r => r.status === 'success' && !r.determinism.isDeterministic);
  if (nonDeterministicImages.length > 0) {
    findingsList += `### Determinism Issues\n\n`;
    for (const r of nonDeterministicImages) {
      findingsList += `- **File**: \`${r.filename}\` failed determinism: \`${r.determinism.details}\`\n`;
    }
    findingsList += `\n`;
  }
  if (findingsList === "") {
    findingsList = "- None detected during automated checks. (To be expanded after manual output inspection)\n";
  }

  // Build Per-Image Visual Mass Metrics Table
  let visualMassTable = `| Image | BBox Area (px) | Opaque Pixels | Opaque Pixel % in BBox | BBox Occupancy % | Visual Occupancy % | Difference % |\n|---|---|---|---|---|---|---|\n`;
  for (const r of results.filter(r => r.status === 'success')) {
    const vm = r.visualMassMetrics;
    visualMassTable += `| \`${r.filename}\` | ${vm.bboxArea} | ${vm.opaquePixels} | ${vm.opaquePixelPctInBBox.toFixed(1)}% | ${vm.bboxOccupancy.toFixed(1)}% | ${vm.visualOccupancy.toFixed(1)}% | ${vm.occupancyDiff.toFixed(1)}% |\n`;
  }

  const summaryMarkdown = `# Image Processing Audit

## Summary

- Images processed: ${imagesProcessed}
- Images passed: ${imagesPassed}
- Images failed: ${imagesFailed}
- Execution time: ${durationSec}s

## Source Asset Classification

- Transparent: ${transparentCount}
- Solid color: ${solidColorCount}
- Mixed: ${mixedCount}
- Unknown: ${unknownCount}

## Determinism

- ${determinismResult}

## Visual Mass vs Geometric Bounding Box

${visualMassTable}

## Findings

${findingsList}

## Rejected Hypotheses

- (None yet. To be populated after complete evidence/report review)

## Recommended Next Steps

1. Run the audit and inspect the generated debug, cropped, and normalized images in the \`audit-out/images/\` folder.
2. Examine the \`visual_mass_*.png\` files to visually compare the bounding box size with the highlighted opaque pixels.
3. Compare the visual occupancy percentages to verify if images with low opaque pixel percentage appear smaller.
`;

  await fs.writeFile(path.join(outDir, 'summary.md'), summaryMarkdown);
  
  console.log("Audit complete. Results written to audit-out/");
}

runAudit().catch(console.error);
