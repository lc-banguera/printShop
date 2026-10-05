import { getActiveProfile } from './config';
import { Scanner } from './scanner';
import { Pipeline } from './pipeline';
import { AutoCropStage } from './crop';
import { NormalizeStage } from './normalize';

async function main() {
  console.log('==================================================');
  console.log(' PrintShop Image Processing Pipeline ');
  console.log('==================================================\n');

  const profile = getActiveProfile();

  console.log(`[Config] Input Directory : ${profile.inputDir}`);
  console.log(`[Config] Output Directory: ${profile.outputDir}`);
  console.log(`[Config] Crop Margin     : ${profile.crop.margin}px`);
  console.log(`[Config] BG Detection    : ${profile.crop.backgroundDetection.mode} (Tolerance: ${profile.crop.backgroundDetection.tolerance})`);

  if (profile.normalize?.enabled) {
    console.log(`[Config] Normalize       : enabled (targetOccupancy=${profile.normalize.targetOccupancy}, margin=${profile.normalize.margin}px)`);
  } else {
    console.log(`[Config] Normalize       : disabled`);
  }

  console.log('\nScanning...');
  const files = await Scanner.scanDirectory(profile.inputDir, profile.supportedFormats);

  if (files.length === 0) {
    console.log('No supported images found in the input directory.');
    return;
  }

  console.log(`Found ${files.length} image(s) to process.\n`);

  // Build the pipeline
  const pipeline = new Pipeline(profile.outputDir)
    .addStage(new AutoCropStage(profile.crop));

  if (profile.normalize?.enabled) {
    pipeline.addStage(new NormalizeStage({
      targetOccupancy:     profile.normalize.targetOccupancy,
      margin:              profile.normalize.margin,
      targetCanvas:        profile.normalize.targetCanvas,
      visualCompensation:  profile.normalize.visualCompensation,
    }));
  }

  let processedCount = 0;
  let failedCount = 0;
  let totalCropPct = 0;
  let totalOccupancy = 0;

  const startTime = Date.now();

  for (const file of files) {
    process.stdout.write(`[Processing] ${file.filename}... `);
    const result = await pipeline.process(file);

    if (result.success) {
      const stats: string[] = [];

      if (result.originalSize && result.croppedSize) {
        const origArea = result.originalSize.width * result.originalSize.height;
        const cropArea = result.croppedSize.width * result.croppedSize.height;
        const savedPct = ((origArea - cropArea) / origArea) * 100;
        totalCropPct += savedPct;
        stats.push(`crop removed ${savedPct.toFixed(1)}%`);
      }

      if (result.normalizedOccupancy !== undefined) {
        totalOccupancy += result.normalizedOccupancy;
        stats.push(`occupancy ${(result.normalizedOccupancy * 100).toFixed(1)}%`);
      }

      console.log(`✓  [${stats.join(' | ')}]`);
      processedCount++;
    } else {
      console.error(`✗  ${result.error?.message || result.error}`);
      failedCount++;
    }
  }

  const elapsedS = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n==================================================');
  console.log(' PIPELINE STATISTICS ');
  console.log('==================================================');
  console.log(`Total images scanned   : ${files.length}`);
  console.log(`Processed successfully : ${processedCount}`);
  console.log(`Failed images          : ${failedCount}`);

  if (processedCount > 0) {
    console.log(`Avg canvas removed     : ${(totalCropPct / processedCount).toFixed(2)}%`);
    if (profile.normalize?.enabled) {
      console.log(`Avg product occupancy  : ${((totalOccupancy / processedCount) * 100).toFixed(2)}%`);
    }
  }

  console.log(`Total execution time   : ${elapsedS}s`);
  console.log('==================================================\n');
}

main().catch(err => {
  console.error('Fatal Pipeline Error:', err);
  process.exit(1);
});
